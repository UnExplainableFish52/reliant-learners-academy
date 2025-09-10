import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Student, Announcement, LiveClass, CalendarEvent, MockTest, StudentSubmission, StudentAttendanceRecord } from '../../types.ts';
import { useStudent } from '../StudentPortalPage.tsx';
import { getItems, saveItems } from '../../services/dataService.ts';
import { GLOBAL_ANNOUNCEMENTS, FACULTY_ANNOUNCEMENTS, COURSES, LIVE_CLASSES, STUDENT_ATTENDANCE_LOG } from '../../constants.ts';
import RatingModal from '../../components/student-portal/RatingModal.tsx';

const StatCard = ({ title, value, colorClass = 'text-green-600', icon }: {title: string, value: string | number, colorClass?: string, icon: React.ReactNode}) => (
     <div className="bg-white p-6 rounded-2xl shadow-md flex items-center transition-all hover:shadow-lg hover:scale-105">
        <div className={`mr-4 p-4 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className={`text-3xl font-black mt-1 ${colorClass}`}>{value}</p>
        </div>
    </div>
);

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const UpcomingSchedule = ({ student }: { student: Student }) => {
    const navigate = useNavigate();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ teacherName: string; classTopic: string } | null>(null);
    const [agendaItems, setAgendaItems] = useState<any[]>([]);

    const parseTime = (timeStr: string): Date => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);
        return classTime;
    };
    
    useEffect(() => {
        const updateAgenda = () => {
            const liveClasses: LiveClass[] = getItems('liveClasses', []);
            const calendarEvents: CalendarEvent[] = getItems('calendarEvents', []);
            const mockTests: MockTest[] = getItems('mockTests', []);
            
            const studentPaperCodes = new Set(student.enrolledPapers);
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const sevenDaysFromNow = new Date(today);
            sevenDaysFromNow.setDate(today.getDate() + 7);

            const classes = liveClasses
                .filter(cls => studentPaperCodes.has(cls.paper.split(':')[0].trim()))
                .map(cls => ({
                    id: `class-${cls.id}`,
                    type: 'class' as const,
                    title: cls.topic,
                    paper: cls.paper,
                    time: cls.startTime,
                    dateTime: parseTime(cls.startTime),
                    status: cls.status,
                    joinLink: cls.joinLink,
                    instructor: cls.instructor
                }));

            const deadlines = calendarEvents
                .filter(event => event.type === 'deadline' && event.paper && studentPaperCodes.has(event.paper.split(':')[0].trim()))
                .map(event => ({
                    id: `deadline-${event.id}`,
                    type: 'deadline' as const,
                    title: event.title,
                    paper: event.paper,
                    time: 'All Day',
                    dateTime: new Date(event.date + 'T23:59:59')
                }));

            const exams = mockTests
                .filter(test => test.status === 'Published' && test.scheduledStartTime && studentPaperCodes.has(test.paper.split(':')[0].trim()))
                .map(test => ({
                    id: `exam-${test.id}`,
                    type: 'exam' as const,
                    title: test.title,
                    paper: test.paper,
                    time: new Date(test.scheduledStartTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    dateTime: new Date(test.scheduledStartTime!),
                    isLocked: test.isLocked
                }));
            
            const combined = [...classes, ...deadlines, ...exams]
                .filter(item => item.dateTime >= today && item.dateTime <= sevenDaysFromNow);
                
            combined.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
            setAgendaItems(combined);
        };
        
        updateAgenda();
        const interval = setInterval(updateAgenda, 30 * 1000);
        window.addEventListener('storage', updateAgenda);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', updateAgenda);
        };
    }, [student]);

    const handleJoinClass = (classId: number, joinLink: string, instructor: string, topic: string) => {
        const attendanceLog = getItems<StudentAttendanceRecord[]>('studentAttendanceLog', []);
        const alreadyAttended = attendanceLog.some(log => log.classId === classId && log.studentId === student.id);

        if (!alreadyAttended) {
            const newRecord: StudentAttendanceRecord = {
                classId,
                studentId: student.id,
                joinTime: new Date().toISOString(),
            };
            saveItems('studentAttendanceLog', [...attendanceLog, newRecord]);
        }

        handleOpenRatingModal(instructor, topic);
        window.open(joinLink, '_blank', 'noopener,noreferrer');
    };

    const handleOpenRatingModal = (teacherName: string, classTopic: string) => {
        setRatingTarget({ teacherName, classTopic });
        setIsRatingModalOpen(true);
    };

    const handleRatingSubmit = (rating: number, feedback: string) => {
        console.log(`Submitted rating: ${rating} stars. Feedback: "${feedback}"`, ratingTarget);
    };
    
    const eventIcons = {
        class: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>,
        exam: <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
        deadline: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    };

    const groupedByDate = agendaItems.reduce((acc, item) => {
        const dateKey = item.dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, typeof agendaItems>);


    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold text-xl text-brand-dark mb-4">Upcoming Schedule (Next 7 Days)</h3>
            <div className="space-y-6 max-h-[30rem] overflow-y-auto pr-2">
                {/* FIX: Explicitly typed the 'items' variable in the map function to resolve a TypeScript error where it was being inferred as 'unknown', preventing the use of the .map() method. */}
                {Object.keys(groupedByDate).length > 0 ? Object.entries(groupedByDate).map(([date, items]: [string, any[]]) => (
                    <div key={date}>
                        <h4 className="font-semibold text-brand-red mb-2 sticky top-0 bg-white py-1">{date}</h4>
                        <div className="space-y-3">
                        {items.map(item => {
                            const now = new Date();
                            const isLive = item.type === 'class' && item.status === 'Live';
                            const isUpcoming = (item.type === 'class' || item.type === 'exam') && item.dateTime > now;
                            const isExamAvailable = item.type === 'exam' && now >= item.dateTime;

                            return (
                                <div key={item.id} className={`p-3 border rounded-lg flex items-center gap-4 transition-all ${isLive ? 'bg-red-50 border-brand-red' : 'bg-gray-50'}`}>
                                    {eventIcons[item.type]}
                                    <div className="flex-grow">
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.paper} - {item.time}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isLive && (
                                            <span className="flex items-center text-sm font-bold text-brand-red animate-pulse">
                                                <span className="relative flex h-3 w-3 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span></span>
                                                LIVE
                                            </span>
                                        )}
                                        {item.type === 'class' && (
                                            <button onClick={() => handleJoinClass(item.id.replace('class-',''), item.joinLink, item.instructor, item.title)} disabled={!isLive} className={`font-semibold text-sm px-4 py-2 rounded-md transition-colors ${isLive ? 'bg-brand-red text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                                                {isLive ? 'Join Now' : 'Upcoming'}
                                            </button>
                                        )}
                                        {item.type === 'exam' && (
                                            <button onClick={() => navigate('/student-portal/mock-tests')} disabled={!isExamAvailable || item.isLocked} className={`font-semibold text-sm px-4 py-2 rounded-md transition-colors ${isExamAvailable && !item.isLocked ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                                                {item.isLocked ? 'Locked' : isExamAvailable ? 'Go to Test' : 'Upcoming'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-8">No events scheduled for the next 7 days.</p>}
            </div>
             {ratingTarget && (
                <RatingModal isOpen={isRatingModalOpen} onClose={() => { setIsRatingModalOpen(false); setRatingTarget(null); }} onSubmit={handleRatingSubmit} teacherName={ratingTarget.teacherName} classTopic={ratingTarget.classTopic}/>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { student } = useStudent();
    
    const allPapersMap = useMemo(() => {
        const map = new Map<string, string>();
        COURSES.forEach(course => {
            [...course.papers, ...(course.options || [])].forEach(paperName => {
                const paperCode = paperName.split(':')[0].trim();
                map.set(paperCode, paperName);
            });
        });
        return map;
    }, []);

    const recentAnnouncements = useMemo(() => {
        if (!student) return [];
        const globalAnnouncements = getItems<Announcement[]>('globalAnnouncements', GLOBAL_ANNOUNCEMENTS);
        const facultyAnnouncements = getItems<Announcement[]>('facultyAnnouncements', FACULTY_ANNOUNCEMENTS);
        
        const studentPaperFullNames = new Set(student.enrolledPapers.map(code => allPapersMap.get(code)));
        
        return [...globalAnnouncements, ...facultyAnnouncements]
            .filter(ann => {
                if (ann.audience === 'All Students' || ann.audience === 'All Students & Faculty') return true;
                return ann.audience.split(', ').some(paperName => studentPaperFullNames.has(paperName));
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
    }, [student, allPapersMap]);

    const { overallAttendance, testsTaken, classesJoined } = useMemo(() => {
        if (!student) return { overallAttendance: 'N/A', testsTaken: 0, classesJoined: 0 };

        const allLiveClasses = getItems<LiveClass[]>('liveClasses', LIVE_CLASSES);
        const availableClassesForStudent = allLiveClasses.filter(cls => {
            const classPaperCode = cls.paper.split(':')[0].trim();
            return student.enrolledPapers.includes(classPaperCode);
        }).length;
        
        const attendanceLog = getItems<StudentAttendanceRecord[]>('studentAttendanceLog', STUDENT_ATTENDANCE_LOG);
        const joined = attendanceLog.filter(log => log.studentId === student.id).length;
        const attendancePercentage = availableClassesForStudent > 0 ? ((joined / availableClassesForStudent) * 100).toFixed(1) + '%' : 'N/A';
        
        const submissions = getItems<StudentSubmission[]>('studentSubmissions', []).filter(s => s.studentId === student.id).length;
        
        return { overallAttendance: attendancePercentage, testsTaken: submissions, classesJoined: joined };
    }, [student]);
    
    const overallScore = useMemo(() => {
        if (!student?.grades || Object.keys(student.grades).length === 0) return 'N/A';
        const allGrades = Object.values(student.grades).flat();
        if (allGrades.length === 0) return 'N/A';
        const avg = allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length;
        return `${avg.toFixed(1)}%`;
    }, [student]);


    if (!student) {
        return <div>Student not found.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-brand-dark">{getGreeting()}, {student.name.split(' ')[0]}!</h1>
                <p className="text-gray-600 mt-1">Let's have a productive day.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Overall Attendance" value={overallAttendance} icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                 <StatCard title="Overall Score" value={overallScore} colorClass="text-yellow-600" icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>} />
                 <StatCard title="Tests Taken" value={testsTaken} colorClass="text-blue-600" icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>} />
                 <StatCard title="Classes Joined" value={classesJoined} colorClass="text-purple-600" icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <UpcomingSchedule student={student} />
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="font-bold text-xl text-brand-dark mb-4">Recent Announcements</h3>
                         {recentAnnouncements.length > 0 ? (
                            <ul className="space-y-4">
                                {recentAnnouncements.map(ann => (
                                    <li key={ann.id} className="border-l-4 border-brand-red pl-4">
                                        <p className="font-semibold">{ann.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{ann.content}</p>
                                        <p className="text-xs text-gray-400 mt-1">Posted by {ann.author} on {ann.date}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-center text-gray-500 py-4">No recent announcements.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;