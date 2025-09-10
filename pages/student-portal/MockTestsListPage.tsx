import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../StudentPortalPage.tsx';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission } from '../../types.ts';
import ConfirmModal from '../../components/ConfirmModal.tsx';

const Countdown = ({ targetDate }: { targetDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if (value === undefined || value < 0) return null;
        return (
            <div key={interval} className="text-center">
                <span className="font-bold text-lg">{String(value).padStart(2, '0')}</span>
                <span className="text-xs block">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex justify-center gap-2 p-2 bg-blue-50 text-blue-800 rounded-md">
            {timerComponents.length ? timerComponents : <span>Starting soon...</span>}
        </div>
    );
};


const TestCard = ({ test, submission, onAction }: { test: MockTest; submission: StudentSubmission | undefined; onAction: (testId: number) => void; }) => {
    const [isAvailable, setIsAvailable] = useState(!test.scheduledStartTime || new Date(test.scheduledStartTime) <= new Date());
    
    useEffect(() => {
        if (test.scheduledStartTime) {
            const checkAvailability = () => {
                const now = new Date();
                const startTime = new Date(test.scheduledStartTime!);
                if (now >= startTime) {
                    setIsAvailable(true);
                    clearInterval(interval);
                }
            };
            const interval = setInterval(checkAvailability, 1000);
            checkAvailability(); // Initial check
            return () => clearInterval(interval);
        }
    }, [test.scheduledStartTime]);


    let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
    let actionText = 'Start Test';
    let statusColor = 'bg-gray-200 text-gray-800';
    let buttonColor = 'bg-green-600 hover:bg-green-700';
    let buttonDisabled = test.questions.length === 0 || !isAvailable || !!test.isLocked;

    if (submission) {
        status = submission.status;
        if (status === 'In Progress') {
            actionText = 'Continue Test';
            statusColor = 'bg-yellow-200 text-yellow-800';
            buttonColor = 'bg-yellow-500 hover:bg-yellow-600';
            buttonDisabled = !!test.isLocked;
        } else if (status === 'Completed') {
            actionText = 'Review Results';
            statusColor = 'bg-blue-200 text-blue-800';
            buttonColor = 'bg-blue-600 hover:bg-blue-700';
            buttonDisabled = false; // Can always review
        }
    }
    
    if (test.isLocked) {
        actionText = 'Test Locked';
        buttonColor = 'bg-gray-400';
    } else if (test.questions.length === 0 && status !== 'Completed') {
        actionText = 'Not Ready';
    } else if (!isAvailable && status === 'Not Started') {
        actionText = 'Scheduled';
        buttonColor = 'bg-gray-400';
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow-md border flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-brand-dark mb-1">{test.title}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>{test.isLocked ? 'Locked' : status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{test.paper}</p>
                 {!isAvailable && test.scheduledStartTime && status === 'Not Started' && !test.isLocked ? (
                    <Countdown targetDate={test.scheduledStartTime} />
                ) : (
                    <div className="flex justify-around text-center border-y py-3 my-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-700">{test.questions.length}</p>
                            <p className="text-gray-500">Questions</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">{test.durationMinutes}</p>
                            <p className="text-gray-500">Minutes</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">{test.questions.reduce((sum, q) => sum + q.points, 0)}</p>
                            <p className="text-gray-500">Points</p>
                        </div>
                    </div>
                )}
                 {test.questions.length === 0 && (
                    <p className="text-xs text-center text-yellow-600 bg-yellow-50 p-2 rounded-md mt-4">
                        This test is not ready yet (no questions added).
                    </p>
                )}
            </div>
            <button
                onClick={() => onAction(test.id)}
                disabled={buttonDisabled}
                className={`w-full mt-4 text-white font-bold py-2 px-4 rounded-md transition-colors ${buttonColor} disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
                {actionText}
            </button>
        </div>
    );
};

const MockTestsListPage: React.FC = () => {
    const { student } = useStudent();
    const navigate = useNavigate();

    const [tests, setTests] = useState<MockTest[]>(() => getItems('mockTests', []));
    const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getItems('studentSubmissions', []));
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [testToStartId, setTestToStartId] = useState<number | null>(null);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'mockTests') setTests(getItems('mockTests', []));
            if (e.key === 'studentSubmissions') setSubmissions(getItems('studentSubmissions', []));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const myTests = useMemo(() => {
        const studentPaperCodes = new Set(student.enrolledPapers.map(code => code.trim()));
        return tests.filter(test => {
            if (test.status !== 'Published') return false;
            const testPaperCode = test.paper.split(':')[0].trim();
            return studentPaperCodes.has(testPaperCode);
        });
    }, [tests, student.enrolledPapers]);

    const mySubmissionsMap = useMemo(() => {
        const map = new Map<number, StudentSubmission>();
        submissions.forEach(sub => {
            if (sub.studentId === student.id) {
                map.set(sub.testId, sub);
            }
        });
        return map;
    }, [submissions, student.id]);

    const handleTestAction = (testId: number) => {
        const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
        const existingSubmission = allSubmissions.find(s => s.testId === testId && s.studentId === student.id);

        if (existingSubmission) {
            if (existingSubmission.status === 'In Progress') {
                sessionStorage.setItem('activeSubmission', JSON.stringify(existingSubmission));
                navigate(`/student-portal/take-test/${testId}`);
            } else { // 'Completed'
                navigate(`/student-portal/review-test/${existingSubmission.id}`);
            }
            return;
        }

        setTestToStartId(testId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmStartTest = () => {
        if (testToStartId === null) return;

        const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
        const newSubmission: StudentSubmission = {
            id: Date.now(),
            studentId: student.id,
            testId: testToStartId,
            answers: [],
            startTime: new Date().toISOString(),
            submittedAt: '',
            status: 'In Progress',
        };
        
        saveItems('studentSubmissions', [...allSubmissions, newSubmission]);
        sessionStorage.setItem('activeSubmission', JSON.stringify(newSubmission));
        
        navigate(`/student-portal/take-test/${testToStartId}`);
    };


    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Mock Tests</h1>
            
            {myTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTests.map(test => (
                        <TestCard
                            key={test.id}
                            test={test}
                            submission={mySubmissionsMap.get(test.id)}
                            onAction={handleTestAction}
                        />
                    ))}
                </div>
            ) : (
                 <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <p className="text-gray-500">No mock tests have been published for your enrolled papers yet.</p>
                </div>
            )}
            
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Start Test Confirmation"
                message="Are you sure you want to start this test? The timer will begin immediately and cannot be paused."
                onConfirm={handleConfirmStartTest}
                onCancel={() => {
                    setIsConfirmModalOpen(false);
                    setTestToStartId(null);
                }}
                confirmText="Start Test"
            />
        </div>
    );
};

export default MockTestsListPage;
