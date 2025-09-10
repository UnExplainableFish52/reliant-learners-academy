import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDENTS, LIVE_CLASSES, TEACHER_QUESTIONS, MOCK_TESTS, STUDENT_SUBMISSIONS, CALENDAR_EVENTS } from '../../constants.ts';
import { useFaculty } from './hooks.ts';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { TeacherQuestion, MockTest, StudentSubmission, Student, CalendarEvent, LiveClass } from '../../types.ts';

const StatCard = ({ title, value, colorClass = 'text-green-600', linkTo, linkText, icon }: {title: string, value: string | number, colorClass?: string, linkTo?: string, linkText?: string, icon: React.ReactNode}) => (
     <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
                <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
                {icon}
            </div>
        </div>
        {linkTo && <Link to={linkTo} className="text-sm font-semibold text-brand-red hover:underline mt-4 inline-block">{linkText || 'View All'} &rarr;</Link>}
    </div>
);


const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const Dashboard: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => getItems('liveClasses', LIVE_CLASSES));

    const data = useMemo(() => {
        const allStudents: Student[] = getItems('students', STUDENTS);
        const allQuestions: TeacherQuestion[] = getItems('teacherQuestions', TEACHER_QUESTIONS);
        const allTests: MockTest[] = getItems('mockTests', MOCK_TESTS);
        const allSubmissions: StudentSubmission[] = getItems('studentSubmissions', STUDENT_SUBMISSIONS);
        const allCalendarEvents: CalendarEvent[] = getItems('calendarEvents', CALENDAR_EVENTS);
        
        const myPaperCodes = new Set(facultyMember.assignedPapers.map(p => p.split(':')[0].trim()));
        
        const myStudentIds = new Set<number>();
        allStudents.forEach(student => {
            if (student.enrolledPapers.some(sp => myPaperCodes.has(sp))) {
                myStudentIds.add(student.id);
            }
        });
        
        const todayStr = new Date().toISOString().split('T')[0];
        const myClassesToday = allCalendarEvents.filter(event =>
            event.instructor === facultyMember.name &&
            event.date === todayStr &&
            event.type === 'class'
        ).sort((a,b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));

        const myPendingQuestions = allQuestions.filter(q => 
            q.status === 'Pending' && facultyMember.assignedPapers.includes(q.paper)
        ).sort((a,b) => new Date(b.askedDate).getTime() - new Date(a.askedDate).getTime());

        const myTestIds = new Set(allTests.filter(t => t.createdByFacultyId === facultyMember.id).map(t => t.id));
        
        const myPendingSubmissions = allSubmissions.filter(s => 
            myTestIds.has(s.testId) && !s.isGraded
        ).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        return {
            totalStudents: myStudentIds.size,
            classesToday: myClassesToday,
            pendingQuestions: myPendingQuestions,
            pendingSubmissions: myPendingSubmissions,
        };
    }, [facultyMember]);
    
    const handleStartClass = (event: CalendarEvent) => {
        const liveClassesList = getItems<LiveClass[]>('liveClasses', LIVE_CLASSES);

        const existingClassIndex = liveClassesList.findIndex(lc => lc.id === event.id);
        let updatedClasses;

        if (existingClassIndex > -1) {
            updatedClasses = [...liveClassesList];
            updatedClasses[existingClassIndex].status = 'Live';
        } else {
            const newLiveClass: LiveClass = {
                id: Number(event.id),
                paper: event.paper || 'N/A',
                topic: event.title,
                instructor: facultyMember.name,
                startTime: event.startTime || 'N/A',
                status: 'Live',
                joinLink: event.joinLink || '#',
            };
            updatedClasses = [...liveClassesList, newLiveClass];
        }
        setLiveClasses(updatedClasses);
        saveItems('liveClasses', updatedClasses);
        alert(`Class "${event.title}" has been started and is now live for students.`);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-2">{getGreeting()}, {facultyMember.name.split(' ')[0]}!</h1>
            <p className="text-gray-600 mb-8">Here is your teaching summary for today.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <StatCard title="Assigned Papers" value={facultyMember.assignedPapers.length} colorClass="text-blue-600" icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
                 <StatCard title="Total Students" value={data.totalStudents} colorClass="text-purple-600" icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                 <StatCard title="Pending Questions" value={data.pendingQuestions.length} colorClass="text-yellow-600" linkTo="/faculty-portal/student-questions" icon={<svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
                 <StatCard title="Submissions to Grade" value={data.pendingSubmissions.length} colorClass="text-red-600" linkTo="/faculty-portal/submissions" icon={<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-bold text-xl text-brand-dark mb-4">Today's Schedule</h3>
                    {data.classesToday.length > 0 ? (
                        <ul className="space-y-3">
                            {data.classesToday.map(event => {
                                const liveClassStatus = liveClasses.find(lc => lc.id === event.id)?.status;
                                const isLive = liveClassStatus === 'Live';
                                return (
                                    <li key={event.id} className={`flex justify-between items-center p-3 rounded-md ${isLive ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <div>
                                            <p className="font-semibold">{event.paper}: <span className="font-normal">{event.title}</span></p>
                                            <p className={`text-sm font-bold ${isLive ? 'text-green-600' : 'text-gray-500'}`}>{isLive ? 'Live' : `Scheduled for ${event.startTime}`}</p>
                                        </div>
                                        <button
                                            onClick={() => handleStartClass(event)}
                                            disabled={isLive}
                                            className={`text-sm font-semibold px-4 py-2 rounded-md transition-colors ${
                                                isLive ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-brand-red text-white hover:bg-red-700'
                                            }`}
                                        >
                                            {isLive ? 'Live' : 'Start Now'}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-4">No classes scheduled for today.</p>}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="font-bold text-xl text-brand-dark mb-4">Recent Student Questions</h3>
                      {data.pendingQuestions.length > 0 ? (
                        <ul className="space-y-3">
                            {data.pendingQuestions.slice(0, 3).map(q => (
                                 <li key={q.id} className="p-3 bg-gray-50 rounded-md">
                                    <p className="font-semibold text-sm truncate">{q.question}</p>
                                    <p className="text-xs text-gray-500">From {q.studentName} for {q.paper}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-4">No pending questions.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;