import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LIVE_CLASSES, RECORDED_LECTURES, COURSE_MATERIALS, COURSES } from '../../constants.ts';
import type { CourseMaterial, DownloadItem, LiveClass, RecordedLecture } from '../../types.ts';
import DownloadManager from '../../components/student-portal/DownloadManager.tsx';
import RatingModal from '../../components/student-portal/RatingModal.tsx';
import { useStudent } from '../StudentPortalPage.tsx';
import { getItems } from '../../services/dataService.ts';

type ResourceType = 'lectures' | 'notes' | 'assignments';

const resourceIcons: { [key in ResourceType | 'PDF' | 'Notes' | 'Assignment']: JSX.Element } = {
    lectures: <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    notes: <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    assignments: <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
    'PDF': <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    'Notes': <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    'Assignment': <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
};

const LiveClasses: React.FC = () => {
    const { student } = useStudent();
    const [searchParams] = useSearchParams();
    
    const allStudentPapers = useMemo(() => {
        const paperMap = new Map<string, string>();
        COURSES.forEach(course => {
            const allCoursePapers = [...course.papers, ...(course.options || [])];
            allCoursePapers.forEach(paperName => {
                const paperCode = paperName.split(':')[0].trim();
                if (student.enrolledPapers.includes(paperCode)) {
                    paperMap.set(paperName, paperCode);
                }
            });
        });
        return Array.from(paperMap.keys());
    }, [student.enrolledPapers]);
    
    const initialPaper = searchParams.get('paper') || allStudentPapers[0] || '';
    const [selectedPaper, setSelectedPaper] = useState(initialPaper);
    
    const [downloadQueue, setDownloadQueue] = useState<DownloadItem[]>([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ teacherName: string; classTopic: string } | null>(null);
    const [now, setNow] = useState(new Date());
    const [activeResourceTab, setActiveResourceTab] = useState<ResourceType>('lectures');
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => getItems('liveClasses', LIVE_CLASSES));

    const [materials, setMaterials] = useState<CourseMaterial[]>(() => {
        const baseMaterials = getItems('courseMaterials', COURSE_MATERIALS);
        const customMaterials = getItems<CourseMaterial[]>('customMaterials', []);
        const baseIds = new Set(baseMaterials.map(m => m.id));
        const uniqueCustom = customMaterials.filter(m => !baseIds.has(m.id));
        return [...baseMaterials, ...uniqueCustom];
    });

    const [lectures, setLectures] = useState<RecordedLecture[]>(() => {
        const baseLectures = getItems('recordedLectures', RECORDED_LECTURES);
        const customLectures = getItems<RecordedLecture[]>('customLectures', []);
        const baseIds = new Set(baseLectures.map(l => l.id));
        const uniqueCustom = customLectures.filter(l => !baseIds.has(l.id));
        return [...baseLectures, ...uniqueCustom];
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'liveClasses' && e.newValue) {
                setLiveClasses(JSON.parse(e.newValue));
            }
            if (e.key === 'customMaterials') {
                const baseMaterials = getItems('courseMaterials', COURSE_MATERIALS);
                const customMaterials = getItems<CourseMaterial[]>('customMaterials', []);
                const baseIds = new Set(baseMaterials.map(m => m.id));
                const uniqueCustom = customMaterials.filter(m => !baseIds.has(m.id));
                setMaterials([...baseMaterials, ...uniqueCustom]);
            }
            if (e.key === 'customLectures') {
                const baseLectures = getItems('recordedLectures', RECORDED_LECTURES);
                const customLectures = getItems<RecordedLecture[]>('customLectures', []);
                const baseIds = new Set(baseLectures.map(l => l.id));
                const uniqueCustom = customLectures.filter(l => !baseIds.has(l.id));
                setLectures([...baseLectures, ...uniqueCustom]);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30 * 1000); // Update time every 30 seconds
        return () => clearInterval(timer);
    }, []);

    const { recordedLecturesForPaper, notesForPaper, assignmentsForPaper } = useMemo(() => {
        const paperCode = selectedPaper.split(':')[0].trim();
        const lecturesForPaper = lectures.filter(l => l.paper === paperCode);
        const materialsForPaper = materials.filter(m => m.paper === paperCode);
        const notes = materialsForPaper.filter(m => m.type === 'Notes' || m.type === 'PDF');
        const assignments = materialsForPaper.filter(m => m.type === 'Assignment');
        return { recordedLecturesForPaper: lecturesForPaper, notesForPaper: notes, assignmentsForPaper: assignments };
    }, [selectedPaper, lectures, materials]);


    const parseTime = (timeStr: string): Date => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);
        return classTime;
    };

    const { startingSoonOrLive, upcoming } = useMemo(() => {
        const liveClassesForPaper = liveClasses.filter((c: LiveClass) => c.paper === selectedPaper);
        const startingSoonOrLive: LiveClass[] = [];
        const upcoming: LiveClass[] = [];

        liveClassesForPaper.forEach((cls: LiveClass) => {
            if (cls.status === 'Live') {
                startingSoonOrLive.push(cls);
                return;
            }

            const classTime = parseTime(cls.startTime);
            const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);
            
            if (diffMinutes < -120) return; // Hide class if it ended more than 2 hours ago

            if (cls.status === 'Upcoming' && diffMinutes <= 10) {
                startingSoonOrLive.push(cls);
            } else if (cls.status === 'Upcoming' && diffMinutes > 10) {
                upcoming.push(cls);
            }
        });

        const sortClasses = (a: LiveClass, b: LiveClass) => parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime();
        startingSoonOrLive.sort(sortClasses);
        upcoming.sort(sortClasses);

        return { startingSoonOrLive, upcoming };
    }, [now, selectedPaper, liveClasses]);
    
    const handleDownload = (item: CourseMaterial | RecordedLecture) => {
        const id = item.id;
        if (downloadQueue.some(d => d.id === id)) return;
        
        const newItem: DownloadItem = {
            id,
            title: 'videoUrl' in item ? item.topic : item.title,
            progress: 0,
            status: 'queued',
            size: Math.floor(Math.random() * (20000 - 2000) + 2000),
        };
        setDownloadQueue(prev => [...prev, newItem]);
    };
    
    useEffect(() => {
        const activeDownload = downloadQueue.find(d => d.status === 'queued');
        if (activeDownload) {
            setDownloadQueue(prev => prev.map(d => d.id === activeDownload.id ? { ...d, status: 'downloading' } : d));

            const intervalId = setInterval(() => {
                setDownloadQueue(prevQueue => {
                    const currentItem = prevQueue.find(i => i.id === activeDownload.id);
                    if (!currentItem || currentItem.status !== 'downloading') {
                        clearInterval(intervalId);
                        return prevQueue;
                    }
                    if (currentItem.progress >= 100) {
                        clearInterval(intervalId);
                        return prevQueue.map(d => d.id === activeDownload.id ? { ...d, status: 'completed' } : d);
                    }
                    const newProgress = currentItem.progress + 5;
                    return prevQueue.map(d => d.id === activeDownload.id ? { ...d, progress: Math.min(newProgress, 100) } : d);
                });
            }, 500);
            
            setDownloadQueue(prev => prev.map(d => d.id === activeDownload.id ? { ...d, intervalId } : d));
        }
    }, [downloadQueue]);

    const handlePauseDownload = (id: number) => {
        const item = downloadQueue.find(d => d.id === id);
        if (item && item.intervalId) {
            clearInterval(item.intervalId);
            setDownloadQueue(prev => prev.map(d => d.id === id ? { ...d, status: 'paused', intervalId: undefined } : d));
        }
    };
    
    const handleResumeDownload = (id: number) => {
        setDownloadQueue(prev => prev.map(d => d.id === id ? { ...d, status: 'queued' } : d));
    };

    const handleCancelDownload = (id: number) => {
        const item = downloadQueue.find(d => d.id === id);
        if (item && item.intervalId) {
            clearInterval(item.intervalId);
        }
        setDownloadQueue(prev => prev.filter(d => d.id !== id));
    };

    const handleClearCompleted = () => {
        setDownloadQueue(prev => prev.filter(d => d.status !== 'completed'));
    };
    
    const handleOpenRatingModal = (teacherName: string, classTopic: string) => {
        setRatingTarget({ teacherName, classTopic });
        setIsRatingModalOpen(true);
    };

    const handleRatingSubmit = (rating: number, feedback: string) => {
        console.log(`Submitted rating: ${rating} stars. Feedback: "${feedback}"`, ratingTarget);
    };
    
    const renderResourceList = (items: (RecordedLecture | CourseMaterial)[], emptyMessage: string) => {
        if (items.length === 0) {
            return <p className="text-gray-500 text-center py-8">{emptyMessage}</p>;
        }
        return (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {items.map(item => {
                    const isLecture = 'videoUrl' in item;
                    const itemTitle = isLecture ? item.topic : item.title;
                    const itemDate = isLecture ? item.date : item.uploadDate;
                    const itemType = isLecture ? 'lectures' : (item as CourseMaterial).type;

                    return (
                        <div key={item.id} className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors">
                            {resourceIcons[itemType]}
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{itemTitle}</p>
                                <p className="text-xs text-gray-500">
                                    {isLecture ? `Date: ${itemDate}` : `Uploaded: ${itemDate}`}
                                </p>
                            </div>
                            <div className="space-x-2">
                                {isLecture ? (
                                    <a href={(item as RecordedLecture).videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline">
                                        View on YouTube
                                    </a>
                                ) : (
                                    <>
                                        <a href={(item as CourseMaterial).downloadLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-green-600 hover:underline">
                                            View
                                        </a>
                                        <button onClick={() => handleDownload(item)} className="text-xs font-semibold text-blue-600 hover:underline">
                                            Download
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };


    return (
        <div>
            <style>{`
                @keyframes pulse-slow {
                  50% {
                    opacity: .85;
                  }
                }
                .animate-pulse-slow {
                  animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Classes & Resources</h1>
            
            <div className="mb-6">
                <label htmlFor="paperSelect" className="block text-sm font-medium text-gray-700">Select a Paper</label>
                <select 
                    id="paperSelect"
                    value={selectedPaper}
                    onChange={(e) => setSelectedPaper(e.target.value)}
                    className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm rounded-md shadow-sm bg-white"
                >
                    {allStudentPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                </select>
            </div>

            {startingSoonOrLive.length > 0 && (
                <div className="bg-red-50 border-2 border-brand-red p-6 rounded-lg shadow-lg mb-8 animate-pulse-slow">
                    <h2 className="text-2xl font-bold text-brand-red mb-4">Live & Starting Soon</h2>
                    <div className="space-y-4">
                        {startingSoonOrLive.map(cls => {
                            const isLive = cls.status === 'Live';
                            return (
                                <div key={cls.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                                    <div>
                                        <p className="font-bold">{cls.topic}</p>
                                        <p className="text-sm text-gray-500">{cls.instructor} - {cls.startTime}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isLive && (
                                            <span className="flex items-center text-sm font-bold text-brand-red">
                                                <span className="relative flex h-3 w-3 mr-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                                                </span>
                                                LIVE
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => {
                                                handleOpenRatingModal(cls.instructor, cls.topic);
                                                window.open(cls.joinLink, '_blank', 'noopener,noreferrer');
                                            }}
                                            disabled={!isLive}
                                            className={`font-semibold text-sm px-4 py-2 rounded-md transition-colors ${
                                                isLive ? 'bg-brand-red text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}>
                                            {isLive ? 'Join Now' : 'Starting Soon'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Upcoming Classes</h2>
                <div className="space-y-4">
                    {upcoming.length > 0 ? upcoming.map(cls => (
                        <div key={cls.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                            <div>
                                <p className="font-bold">{cls.topic}</p>
                                <p className="text-sm text-gray-500">{cls.instructor} - {cls.startTime}</p>
                            </div>
                            <button disabled className="bg-gray-200 text-gray-500 cursor-not-allowed font-semibold text-sm px-4 py-2 rounded-md">
                                Upcoming
                            </button>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">No other classes scheduled for this paper today.</p>
                    )}
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Class Resources</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveResourceTab('lectures')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeResourceTab === 'lectures' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Recorded Lectures
                        </button>
                         <button onClick={() => setActiveResourceTab('notes')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeResourceTab === 'notes' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Notes &amp; PDFs
                        </button>
                         <button onClick={() => setActiveResourceTab('assignments')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeResourceTab === 'assignments' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Assignments
                        </button>
                    </nav>
                </div>
                <div className="py-4">
                    {activeResourceTab === 'lectures' && renderResourceList(recordedLecturesForPaper, 'No recorded lectures available for this paper yet.')}
                    {activeResourceTab === 'notes' && renderResourceList(notesForPaper, 'No notes or PDFs available for this paper yet.')}
                    {activeResourceTab === 'assignments' && renderResourceList(assignmentsForPaper, 'No assignments available for this paper yet.')}
                </div>
            </div>

            <DownloadManager queue={downloadQueue} onPause={handlePauseDownload} onResume={handleResumeDownload} onCancel={handleCancelDownload} onClearCompleted={handleClearCompleted} />
            
            {ratingTarget && (
                <RatingModal
                    isOpen={isRatingModalOpen}
                    onClose={() => {
                        setIsRatingModalOpen(false);
                        setRatingTarget(null);
                    }}
                    onSubmit={handleRatingSubmit}
                    teacherName={ratingTarget.teacherName}
                    classTopic={ratingTarget.classTopic}
                />
            )}
        </div>
    );
};

export default LiveClasses;
