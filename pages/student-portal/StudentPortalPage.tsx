import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import StudentSidebar from '../../components/student-portal/StudentSidebar.tsx';
import Dashboard from './student-portal/Dashboard.tsx';
import MyCourses from './student-portal/MyCourses.tsx';
import Results from './student-portal/Results.tsx';
import Profile from './student-portal/Profile.tsx';
import Community from './student-portal/Community.tsx';
import LiveClasses from './student-portal/LiveClasses.tsx';
import FeePayment from './student-portal/FeePayment.tsx';
import SchedulePage from './student-portal/SchedulePage.tsx';
import type { Notification, Announcement, Student, MockTest, LiveClass, StudentSubmission } from '../../types.ts';
import { GLOBAL_ANNOUNCEMENTS, LIVE_CLASSES } from '../../constants.ts';
import AnnouncementPopup from '../../components/AnnouncementPopup.tsx';
import { getLoggedInUser } from '../../services/authService.ts';
import { getItems, saveItems } from '../../services/dataService.ts';
import MockTestsListPage from './student-portal/MockTestsListPage.tsx';
import TakeTestPage from './student-portal/TakeTestPage.tsx';
import TestReviewPage from './student-portal/TestReviewPage.tsx';
import LiveDateTime from '../../components/LiveDateTime.tsx';

const StudentPortalLayout = () => {
    const [student, setStudent] = useState<Student | null>(null);
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
        if (role === 'student' && user) {
            setStudent(user as Student);
        } else {
            navigate('/login?role=student', { replace: true });
        }

        const impersonatorStr = sessionStorage.getItem('impersonator');
        if (impersonatorStr) {
            setImpersonator(JSON.parse(impersonatorStr));
        }
    }, [navigate]);

    useEffect(() => {
        if (!student) return;

        try {
            // --- Step 1: Handle Announcement Popups ---
            const storedAnnouncements: Announcement[] = getItems('globalAnnouncements', GLOBAL_ANNOUNCEMENTS);
            const studentAnnouncements = storedAnnouncements.filter(
                ann => ann.audience === 'All Students' || ann.audience === 'All Students & Faculty'
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const seenPopups: number[] = JSON.parse(localStorage.getItem('seenAnnouncementPopups') || '[]');
            const unseen = studentAnnouncements.filter(ann => !seenPopups.includes(ann.id));
            setUnseenAnnouncements(unseen);

            // --- Step 2: Build Base Notifications ---
            const announcementNotifications: Notification[] = studentAnnouncements.map(ann => ({
                id: ann.id,
                type: 'announcement',
                title: ann.title,
                message: ann.content,
                timestamp: new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                read: false,
            }));
            
            // Generate notifications for newly graded tests
            const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
            const mySubmissions = allSubmissions.filter(s => s.studentId === student.id);
            const notifiedSubmissionsKey = `notifiedSubmissions_${student.id}`;
            const notifiedSubmissionIds: number[] = getItems(notifiedSubmissionsKey, []);
            const newNotifiedIds = [...notifiedSubmissionIds];

            const gradeNotifications: Notification[] = [];
            mySubmissions.forEach(sub => {
                if (sub.isGraded && !notifiedSubmissionIds.includes(sub.id)) {
                    const allTests = getItems<MockTest[]>('mockTests', []);
                    const test = allTests.find(t => t.id === sub.testId);
                    gradeNotifications.push({
                        id: 1000000 + sub.id, // Create a unique ID to avoid clashes
                        type: 'grade',
                        title: 'New Grade Posted!',
                        message: `Your results for the "${test?.title || 'a mock test'}" are available.`,
                        timestamp: 'Just now',
                        read: false,
                    });
                    newNotifiedIds.push(sub.id);
                }
            });
            
            if (newNotifiedIds.length > notifiedSubmissionIds.length) {
                saveItems(notifiedSubmissionsKey, newNotifiedIds);
            }

            // Combine and set initial notifications
            const initialNotifications = [...gradeNotifications, ...announcementNotifications]
                .sort((a, b) => {
                    if (a.timestamp === 'Just now' && b.timestamp !== 'Just now') return -1;
                    if (b.timestamp === 'Just now' && a.timestamp !== 'Just now') return 1;
                    try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); } catch { return 0; }
                });
            const uniqueNotifications = Array.from(new Map(initialNotifications.map(item => [item.id, item])).values());
            setNotifications(uniqueNotifications);

        } catch (error) {
            console.error("Failed to process announcements and notifications:", error);
        }
    }, [student]);

    // Effect to manage showing the announcement popups one by one
    useEffect(() => {
        if (unseenAnnouncements.length > 0 && !announcementPopup) {
            setAnnouncementPopup(unseenAnnouncements[0]);
        }
    }, [unseenAnnouncements, announcementPopup]);
    
    // Automatic Test Reminders
    useEffect(() => {
        if (!student) return;

        const checkTestReminders = () => {
            const allTests = getItems<MockTest[]>('mockTests', []);
            const studentPaperCodes = new Set(student.enrolledPapers.map(code => code.trim()));
            const myScheduledTests = allTests.filter(test =>
                test.status === 'Published' &&
                !test.isLocked &&
                test.scheduledStartTime &&
                studentPaperCodes.has(test.paper.split(':')[0].trim())
            );

            myScheduledTests.forEach(test => {
                const startTime = new Date(test.scheduledStartTime!).getTime();
                const now = new Date().getTime();
                const diffMinutes = (startTime - now) / (1000 * 60);

                const fiveMinKey = `notified-5min-${test.id}`;
                const twoMinKey = `notified-2min-${test.id}`;

                if (diffMinutes <= 5 && diffMinutes > 2 && !sessionStorage.getItem(fiveMinKey)) {
                    setNotifications(prev => [{
                        id: Date.now() + Math.random(),
                        type: 'deadline',
                        title: 'Test Starting Soon!',
                        message: `Your test "${test.title}" will begin in 5 minutes.`,
                        timestamp: 'Just now',
                        read: false,
                    }, ...prev]);
                    sessionStorage.setItem(fiveMinKey, 'true');
                }
                
                 if (diffMinutes <= 2 && diffMinutes > 0 && !sessionStorage.getItem(twoMinKey)) {
                    setNotifications(prev => [{
                        id: Date.now() + Math.random(),
                        type: 'deadline',
                        title: 'Test Starting Now!',
                        message: `Your test "${test.title}" will begin in 2 minutes. Go to Mock Tests page.`,
                        timestamp: 'Just now',
                        read: false,
                    }, ...prev]);
                    sessionStorage.setItem(twoMinKey, 'true');
                }
            });
        };
        
        const interval = setInterval(checkTestReminders, 30 * 1000); // Check every 30 seconds
        return () => clearInterval(interval);

    }, [student]);

    // Automatic Class Reminders
    useEffect(() => {
        if (!student) return;

        const parseTime = (timeStr: string): Date => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier === 'PM' && hours !== 12) {
                hours += 12;
            }
            if (modifier === 'AM' && hours === 12) {
                hours = 0;
            }
            const classTime = new Date();
            classTime.setHours(hours, minutes, 0, 0);
            return classTime;
        };

        const checkClassReminders = () => {
            const allLiveClasses = getItems<LiveClass[]>('liveClasses', LIVE_CLASSES);
            
            const myLiveClasses = allLiveClasses.filter(cls => {
                const classPaperCode = cls.paper.split(':')[0].trim();
                return student.enrolledPapers.includes(classPaperCode);
            });

            myLiveClasses.forEach(cls => {
                const classTime = parseTime(cls.startTime);
                const now = new Date().getTime();
                const diffMinutes = (classTime.getTime() - now) / (1000 * 60);

                const reminderPoints = [10, 5, 2];
                reminderPoints.forEach(point => {
                    const key = `notified-${point}min-class-${cls.id}`;
                    if (diffMinutes <= point && diffMinutes > point - 1 && !sessionStorage.getItem(key)) {
                         setNotifications(prev => [{
                            id: Date.now() + Math.random(),
                            type: 'deadline',
                            title: `Class Starting in ${point} Minutes!`,
                            message: `Your class "${cls.topic}" for ${cls.paper} is starting soon.`,
                            timestamp: 'Just now',
                            read: false,
                        }, ...prev]);
                        sessionStorage.setItem(key, 'true');
                    }
                });
            });
        };

        const interval = setInterval(checkClassReminders, 30 * 1000); // Check every 30 seconds
        return () => clearInterval(interval);

    }, [student]);


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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
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

    if (!student) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>; // Or a spinner
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <StudentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} student={student} />
            <div className="flex-1 flex flex-col lg:ml-64">
                {impersonator && (
                    <div className="bg-yellow-400 text-black p-2 text-center text-sm font-semibold flex items-center justify-center gap-4 sticky top-0 z-50">
                        <p>
                            Viewing as <strong>{student?.name}</strong>.
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
                    <ReactRouterDOM.Outlet context={{ student }} />
                </main>
                {announcementPopup && <AnnouncementPopup announcement={announcementPopup} onClose={handleClosePopup} />}
            </div>
        </div>
    );
};

export function useStudent() {
    return ReactRouterDOM.useOutletContext<{ student: Student }>();
}

const StudentPortalPage: React.FC = () => {
    return (
        <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route path="/" element={<StudentPortalLayout />}>
                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="dashboard" replace />} />
                <ReactRouterDOM.Route path="dashboard" element={<Dashboard />} />
                <ReactRouterDOM.Route path="courses" element={<MyCourses />} />
                <ReactRouterDOM.Route path="classes" element={<LiveClasses />} />
                <ReactRouterDOM.Route path="schedule" element={<SchedulePage />} />
                <ReactRouterDOM.Route path="fee-payment" element={<FeePayment />} />
                <ReactRouterDOM.Route path="results" element={<Results />} />
                <ReactRouterDOM.Route path="profile" element={<Profile />} />
                <ReactRouterDOM.Route path="community" element={<Community />} />
                <ReactRouterDOM.Route path="mock-tests" element={<MockTestsListPage />} />
            </ReactRouterDOM.Route>
            {/* Standalone routes without the main layout */}
            <ReactRouterDOM.Route path="take-test/:testId" element={<TakeTestPage />} />
            <ReactRouterDOM.Route path="review-test/:submissionId" element={<TestReviewPage />} />
        </ReactRouterDOM.Routes>
    );
};

export default StudentPortalPage;