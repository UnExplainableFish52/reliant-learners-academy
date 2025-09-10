import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission, StudentAnswer, Student } from '../../types.ts';
import { getLoggedInUser } from '../../services/authService.ts';
import ConfirmModal from '../../components/ConfirmModal.tsx';

// FIX: The component was incomplete, causing multiple errors. It has been fully reconstructed.
const TakeTestPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<MockTest | null>(null);
    const [submission, setSubmission] = useState<StudentSubmission | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const autoSubmitTriggered = useRef(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const finishTest = useCallback((reason: 'timeout' | 'manual' | 'cheating' | 'locked') => {
        if (autoSubmitTriggered.current) return;
        autoSubmitTriggered.current = true;

        if(reason === 'cheating') {
            alert("Test automatically submitted. You are not allowed to switch tabs or copy/paste during the exam.");
        }
        if (reason === 'locked') {
            alert("The test has been locked by the instructor. Your answers have been submitted automatically.");
        }

        setSubmission(prev => {
            if (!prev) return null;
            const updatedSubmission = {
                ...prev,
                status: 'Completed' as const,
                submittedAt: new Date().toISOString()
            };

            const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
            const updatedList = allSubmissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s);
            saveItems('studentSubmissions', updatedList);
            
            navigate(`/student-portal/review-test/${updatedSubmission.id}`, { replace: true });

            return updatedSubmission;
        });
    }, [navigate]);

    useEffect(() => {
        const loadTestSession = () => {
            const { user: student } = getLoggedInUser() as { user: Student | null };
            const numericTestId = Number(testId);
            
            if (!student || isNaN(numericTestId)) {
                navigate('/student-portal/mock-tests', { replace: true });
                return;
            }
    
            const allTests = getItems<MockTest[]>('mockTests', []);
            const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
    
            let activeSubmission: StudentSubmission | undefined;
    
            const activeSubmissionStr = sessionStorage.getItem('activeSubmission');
            if (activeSubmissionStr) {
                try {
                    const parsedSubmission = JSON.parse(activeSubmissionStr);
                    if (parsedSubmission && parsedSubmission.testId === numericTestId) {
                        activeSubmission = parsedSubmission;
                    }
                } catch (e) {
                    console.error("Error parsing submission from sessionStorage", e);
                }
                sessionStorage.removeItem('activeSubmission');
            }
    
            if (!activeSubmission) {
                activeSubmission = allSubmissions.find(s => 
                    s.testId === numericTestId && 
                    s.studentId === student.id && 
                    s.status === 'In Progress'
                );
            }
            
            if (activeSubmission) {
                const correspondingTest = allTests.find(t => t.id === activeSubmission!.testId);
    
                if (correspondingTest) {
                    if (activeSubmission.status === 'Completed') {
                        navigate(`/student-portal/review-test/${activeSubmission.id}`, { replace: true });
                        return;
                    } else {
                        setTest(correspondingTest);
                        setSubmission(activeSubmission);
                        return;
                    }
                }
            }
            
            console.error(`Could not find a valid test session for test ID ${numericTestId}.`);
            alert("There was an error loading your test. It might have been completed or is no longer available. Please try again from the test list.");
            navigate('/student-portal/mock-tests', { replace: true });
        };
        
        loadTestSession();
    }, [testId, navigate]);

    useEffect(() => {
        if (test && submission) {
            const startTime = new Date(submission.startTime).getTime();
            const endTime = startTime + test.durationMinutes * 60 * 1000;
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            setIsLoading(false);
        }
    }, [test, submission]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            if (!autoSubmitTriggered.current) {
                finishTest('timeout');
            }
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(t => (t ? t - 1 : 0));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, finishTest]);

    const handleAnswerChange = (questionId: number, answer: Partial<StudentAnswer>) => {
        setSubmission(prev => {
            if (!prev) return null;
            const existingAnswerIndex = prev.answers.findIndex(a => a.questionId === questionId);
            let newAnswers;
            if (existingAnswerIndex > -1) {
                newAnswers = [...prev.answers];
                newAnswers[existingAnswerIndex] = { ...newAnswers[existingAnswerIndex], ...answer };
            } else {
                newAnswers = [...prev.answers, { questionId, ...answer }];
            }
            return { ...prev, answers: newAnswers };
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (submission && submission.status === 'In Progress') {
                const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
                const updatedList = allSubmissions.map(s => s.id === submission.id ? submission : s);
                saveItems('studentSubmissions', updatedList);
            }
        }, 15000); // Auto-save every 15 seconds
        return () => clearInterval(interval);
    }, [submission]);


    if (isLoading || !test || !submission || timeLeft === null) {
        return <div className="flex h-screen items-center justify-center bg-gray-100"><p className="text-lg font-semibold">Preparing your test...</p></div>;
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = submission.answers.find(a => a.questionId === currentQuestion.id);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const answeredCount = submission.answers.filter(a => a.answerText || a.selectedOptionId).length;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark">{test.title}</h1>
                        <p className="text-sm text-gray-500">{test.paper}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">Time Remaining</p>
                        <p className={`text-2xl font-bold font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-brand-dark'}`}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-semibold text-gray-600">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                        <p className="font-bold text-brand-red">{currentQuestion.points} points</p>
                    </div>
                    <p className="text-lg text-gray-800 whitespace-pre-wrap">{currentQuestion.questionText}</p>
                    <div className="mt-6 border-t pt-6">
                        {currentQuestion.type === 'MCQ' && (
                            <div className="space-y-3">
                                {currentQuestion.mcqOptions?.map(option => (
                                    <label key={option.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestion.id}`}
                                            checked={currentAnswer?.selectedOptionId === option.id}
                                            onChange={() => handleAnswerChange(currentQuestion.id, { selectedOptionId: option.id })}
                                            className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"
                                        />
                                        <span className="ml-3 text-gray-700">{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {currentQuestion.type === 'Theoretical' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                                <textarea
                                    value={currentAnswer?.answerText || ''}
                                    onChange={e => handleAnswerChange(currentQuestion.id, { answerText: e.target.value })}
                                    rows={8}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-white p-4 shadow-inner sticky bottom-0 z-20">
                <div className="container mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="font-semibold px-6 py-2 rounded-md border disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <div className="text-sm text-gray-600">
                        {answeredCount} / {test.questions.length} Answered
                    </div>
                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="font-semibold px-6 py-2 rounded-md bg-brand-dark text-white"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsConfirmModalOpen(true)}
                            className="font-semibold px-6 py-2 rounded-md bg-brand-red text-white"
                        >
                            Finish Test
                        </button>
                    )}
                </div>
            </footer>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Finish Test"
                message="Are you sure you want to submit your answers? You will not be able to change them after submission."
                onConfirm={() => finishTest('manual')}
                onCancel={() => setIsConfirmModalOpen(false)}
                confirmText="Submit Answers"
            />
        </div>
    );
};

export default TakeTestPage;
