import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import FacultySidebar from '../components/faculty-portal/FacultySidebar.tsx';
import Dashboard from './faculty-portal/Dashboard';
import MyClasses from './faculty-portal/MyClasses.tsx';
import Announcements from './faculty-portal/Announcements.tsx';
import Schedule from './faculty-portal/Schedule.tsx';
import Profile from './faculty-portal/Profile.tsx';
import StudentQuestions from './faculty-portal/StudentQuestions.tsx';
import AnnouncementPopup from '../components/AnnouncementPopup.tsx';
import type { Notification, Announcement, FacultyMember, TeacherQuestion, StudentSubmission, MockTest } from '../types.ts';
import { GLOBAL_ANNOUNCEMENTS } from '../constants.ts';
import MyStudents from './faculty-portal/MyStudents.tsx';
import { getLoggedInUser } from '../services/authService.ts';
import SalaryPage from './faculty-portal/SalaryPage.tsx';
import ManageMockTests from './faculty-portal/ManageMockTests.tsx';
import CreateEditTest from './faculty-portal/CreateEditTest.tsx';
import FacultySubmissionsPage from './faculty-portal/FacultySubmissionsPage.tsx';
import GradeSubmissionPage from './faculty-portal/GradeSubmissionPage.tsx';
import LiveDateTime from '../components/LiveDateTime.tsx';
import { getItems, saveItems } from '../services/dataService.ts';
import ContactAdminPage from './faculty-portal/ContactAdminPage.tsx';


const FacultyPortalLayout = () => {
    const [facultyMember, setFacultyMember] = useState<FacultyMember | null>(null);
    const navigate = ReactRouterDOM.useNavigate();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [announcementPopup, setAnnouncementPopup] = useState<Announcement | null>(null);
    const [unseenAnnouncements, setUnseenAnnouncements] = useState<Announcement[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [impersonator, setImpersonator] = useState<any | null>(null);

    useEffect(() => {
        const { user, role } = getLoggedInUser();
        if (role === 'faculty' && user) {
            setFacultyMember(user as FacultyMember);
        } else {
            navigate('/login?role=faculty', { replace: true });
        }

        const impersonatorStr = sessionStorage.getItem('impersonator');
        if (impersonatorStr) {
            setImpersonator(JSON.parse(impersonatorStr));
        }
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!facultyMember) return;
        try {
            // --- Step 1: Handle Announcement Popups ---
            const storedAnnouncements: Announcement[] = getItems('globalAnnouncements', GLOBAL_ANNOUNCEMENTS);
            const facultyAnnouncements = storedAnnouncements.filter(
                ann => ann.audience === 'All Faculty' || ann.audience === 'All Students & Faculty'
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const seenPopups: number[] = JSON.parse(localStorage.getItem('seenAnnouncementPopups') || '[]');
            const unseen = facultyAnnouncements.filter(ann => !seenPopups.includes(ann.id));
            setUnseenAnnouncements(unseen);

            // --- Step 2: Build Base Notifications ---
            const announcementNotifications: Notification[] = facultyAnnouncements.map(ann => ({
                id: ann.id,
                type: 'announcement',
                title: ann.title,
                message: ann.content,
                timestamp: new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                read: false,
            }));
            
            const notifiedQuestionsKey = `notifiedQuestions_${facultyMember.id}`;
            const notifiedQuestionIds: number[] = getItems(notifiedQuestionsKey, []);
            const newNotifiedQuestionIds = [...notifiedQuestionIds];
            const allQuestions = getItems<TeacherQuestion[]>('teacherQuestions', []);
            const questionNotifications: Notification[] = [];
            allQuestions.forEach(q => {
                if(q.status === 'Pending' && !notifiedQuestionIds.includes(q.id)) {
                    questionNotifications.push({
                        id: 2000000 + q.id, // Unique ID namespace
                        type: 'material', // Re-using an icon type
                        title: 'New Student Question',
                        message: `A question was asked in ${q.paper} by ${q.studentName}.`,
                        timestamp: 'Just now',
                        read: false,
                    });
                    newNotifiedQuestionIds.push(q.id);
                }
            });
             if(newNotifiedQuestionIds.length > notifiedQuestionIds.length) {
                saveItems(notifiedQuestionsKey, newNotifiedQuestionIds);
            }

            const notifiedSubmissionsKey = `notifiedSubmissions_faculty_${facultyMember.id}`;
            const notifiedSubmissionIds: number[] = getItems(notifiedSubmissionsKey, []);
            const newNotifiedSubmissionIds = [...notifiedSubmissionIds];
            const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
            const allTests = getItems<MockTest[]>('mockTests', []);
            const myTestIds = new Set(allTests.filter(t => t.createdByFacultyId === facultyMember.id).map(t => t.id));
            const submissionNotifications: Notification[] = [];

            allSubmissions.forEach(sub => {
                if (myTestIds.has(sub.testId) && sub.status === 'Completed' && !sub.isGraded && !notifiedSubmissionIds.includes(sub.id)) {
                    submissionNotifications.push({
                        id: 3000000 + sub.id, // Unique ID namespace
                        type: 'deadline', // Re-using an icon type
                        title: 'New Submission to Grade',
                        message: `A student submitted a test that needs grading.`,
                        timestamp: 'Just now',
                        read: false,
                    });
                    newNotifiedSubmissionIds.push(sub.id);
                }
            });
             if(newNotifiedSubmissionIds.length > notifiedSubmissionIds.length) {
                saveItems(notifiedSubmissionsKey, newNotifiedSubmissionIds);
            }

            const initialNotifications = [...questionNotifications, ...submissionNotifications, ...announcementNotifications];
            const uniqueNotifications = Array.from(new Map(initialNotifications.map(item => [item.id, item])).values());
            setNotifications(uniqueNotifications);


        } catch (error) {
            console.error("Failed to process announcements and notifications for faculty:", error);
        }
    }, [facultyMember]);
    
    // Effect to manage showing the announcement popups one by one
    useEffect(() => {
        if (unseenAnnouncements.length > 0 && !announcementPopup) {
            setAnnouncementPopup(unseenAnnouncements[0]);
        }
    }, [unseenAnnouncements, announcementPopup]);

    const handleClosePopup = () => {
        if (announcementPopup) {
            try {
                const seenPopups: number[] = JSON.parse(localStorage.getItem('seenAnnouncementPopups') || '[]');
                if (!seenPopups.includes(announcementPopup.id)) {
                    localStorage.setItem('seenAnnouncementPopups', JSON.stringify([...seenPopups, announcementPopup.id]));
                }
                setUnseenAnnouncements(prev => prev.filter(ann => ann.id !== announcementPopup.id));
                setAnnouncementPopup(null);
            } catch (error) {
                console.error("Failed to update seen popups:", error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const handleNotificationClick = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleReturnToAdmin = () => {
        const impersonatorStr = sessionStorage.getItem('impersonator');
        if (impersonatorStr) {
            const { user, role } = JSON.parse(impersonatorStr);
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            sessionStorage.setItem('userRole', role);
            sessionStorage.removeItem('impersonator');
            navigate('/admin-portal/dashboard', { replace: true });
        }
    };

    if (!facultyMember) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>; // Or a spinner
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <FacultySidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} facultyMember={facultyMember} />
            <div className="flex-1 flex flex-col lg:ml-64">
                {impersonator && (
                    <div className="bg-yellow-400 text-black p-2 text-center text-sm font-semibold flex items-center justify-center gap-4 sticky top-0 z-50">
                        <p>
                            Viewing as <strong>{facultyMember?.name}</strong>.
                        </p>
                        <button onClick={handleReturnToAdmin} className="bg-black text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700">
                            Return to Admin Portal
                        </button>
                    </div>
                )}
                <header className={`bg-white shadow-sm p-4 flex justify-between items-center sticky z-20 border-b ${impersonator ? 'top-[36px]' : 'top-0'}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-brand-red">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                        <LiveDateTime />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setIsNotificationsOpen(prev => !prev)}
                                className="text-gray-500 hover:text-brand-red relative" 
                                aria-label="View notifications"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                                 {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-red text-white text-xs items-center justify-center">{unreadCount}</span>
                                    </span>
                                )}
                            </button>
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30 animate-fade-in-down">
                                    <div className="p-3 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Notifications</h3>
                                        <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-brand-red font-semibold hover:underline">Mark all as read</button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? notifications.map(notification => (
                                            <div 
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification.id)}
                                                className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${!notification.read ? 'bg-red-50' : ''}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${!notification.read ? 'bg-brand-red' : 'bg-gray-300'}`}></div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{notification.title}</p>
                                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                                                </div>
                                            </div>
                                        )) : <p className="p-4 text-center text-gray-500">No new notifications.</p>}
                                    </div>
                                    <div className="p-2 border-t text-center bg-gray-50 rounded-b-lg">
                                        <ReactRouterDOM.Link to="#" className="text-sm font-semibold text-brand-red hover:underline">View all</ReactRouterDOM.Link>
                                    </div>
                                    <style>{`
                                        @keyframes fade-in-down {
                                            0% { opacity: 0; transform: translateY(-10px); }
                                            100% { opacity: 1; transform: translateY(0); }
                                        }
                                        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
                                    `}</style>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
                    <ReactRouterDOM.Outlet context={{ facultyMember }} />
                </main>
                 {announcementPopup && <AnnouncementPopup announcement={announcementPopup} onClose={handleClosePopup} />}
            </div>
        </div>
    );
};

export function useFaculty() {
    return ReactRouterDOM.useOutletContext<{ facultyMember: FacultyMember }>();
}

const FacultyPortalPage: React.FC = () => {
    return (
        <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route element={<FacultyPortalLayout />}>
                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="dashboard" replace />} />
                <ReactRouterDOM.Route path="dashboard" element={<Dashboard />} />
                <ReactRouterDOM.Route path="classes" element={<MyClasses />} />
                <ReactRouterDOM.Route path="my-students" element={<MyStudents />} />
                <ReactRouterDOM.Route path="announcements" element={<Announcements />} />
                <ReactRouterDOM.Route path="schedule" element={<Schedule />} />
                <ReactRouterDOM.Route path="salary" element={<SalaryPage />} />
                <ReactRouterDOM.Route path="profile" element={<Profile />} />
                <ReactRouterDOM.Route path="student-questions" element={<StudentQuestions />} />
                <ReactRouterDOM.Route path="mock-tests" element={<ManageMockTests />} />
                <ReactRouterDOM.Route path="submissions" element={<FacultySubmissionsPage />} />
                <ReactRouterDOM.Route path="grade-submission/:submissionId" element={<GradeSubmissionPage />} />
                <ReactRouterDOM.Route path="create-edit-test" element={<CreateEditTest />} />
                <ReactRouterDOM.Route path="create-edit-test/:testId" element={<CreateEditTest />} />
                <ReactRouterDOM.Route path="contact-admin" element={<ContactAdminPage />} />
            </ReactRouterDOM.Route>
        </ReactRouterDOM.Routes>
    );
};

export default FacultyPortalPage;