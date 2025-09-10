import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission, Question, MCQOption } from '../../types.ts';

const TestReviewPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();

    const [test, setTest] = useState<MockTest | null>(null);
    const [submission, setSubmission] = useState<StudentSubmission | null>(null);

    useEffect(() => {
        const numericSubmissionId = Number(submissionId);
        if (isNaN(numericSubmissionId)) return;

        const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
        const currentSubmission = allSubmissions.find(s => s.id === numericSubmissionId);
        setSubmission(currentSubmission || null);

        if (currentSubmission) {
            const allTests = getItems<MockTest[]>('mockTests', []);
            const currentTest = allTests.find(t => t.id === currentSubmission.testId);
            setTest(currentTest || null);
        }
    }, [submissionId]);

    const { totalScore, maxScore, mcqScore, hasTheoretical } = useMemo(() => {
        if (!test || !submission) return { totalScore: 0, maxScore: 0, mcqScore: 0, hasTheoretical: false };

        const max = test.questions.reduce((sum, q) => sum + q.points, 0);
        let mcq = 0;
        let hasTheo = false;

        test.questions.forEach(question => {
            if (question.type === 'Theoretical') {
                hasTheo = true;
            } else if (question.type === 'MCQ') {
                const answer = submission.answers.find(a => a.questionId === question.id);
                const correctOption = question.mcqOptions?.find(opt => opt.isCorrect);
                if (correctOption && answer?.selectedOptionId === correctOption.id) {
                    mcq += question.points;
                }
            }
        });
        
        // Use the final graded score if available, otherwise just show MCQ score
        const finalScore = submission.isGraded ? submission.totalAwardedPoints ?? 0 : mcq;

        return { totalScore: finalScore, maxScore: max, mcqScore: mcq, hasTheoretical: hasTheo };
    }, [test, submission]);

    if (!test || !submission) {
        return <div className="flex h-screen items-center justify-center bg-gray-100"><p className="text-lg font-semibold">Loading your results...</p></div>;
    }
    
    const getOptionClass = (option: MCQOption, question: Question) => {
        const studentAnswer = submission.answers.find(a => a.questionId === question.id);
        const isSelected = studentAnswer?.selectedOptionId === option.id;
        const isCorrect = option.isCorrect;

        if (isCorrect) return 'bg-green-100 border-green-400 text-green-800 font-semibold';
        if (isSelected && !isCorrect) return 'bg-red-100 border-red-400 text-red-800';
        return 'bg-white border-gray-300';
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <header className="bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark">Review: {test.title}</h1>
                        <p className="text-gray-500">{test.paper}</p>
                    </div>
                     <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-4">
                        <div className="text-center sm:text-right">
                             <p className="text-sm text-gray-500">{submission.isGraded ? 'Final Score' : 'MCQ Score'}</p>
                            <p className="text-2xl font-bold text-brand-red">
                                {totalScore} / {maxScore}
                            </p>
                             {!submission.isGraded && hasTheoretical && (
                                <p className="text-xs text-yellow-600">Theoretical questions pending review</p>
                            )}
                        </div>
                        <Link to="/student-portal/mock-tests" className="bg-brand-dark text-white font-semibold px-4 py-2 rounded-md hover:bg-black w-full sm:w-auto text-center">
                            &larr; Back to Tests
                        </Link>
                    </div>
                </div>
            </header>

            <main className="space-y-6">
                {test.questions.map((q, index) => {
                    const studentAnswer = submission.answers.find(a => a.questionId === q.id);
                    return (
                        <div key={q.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-500">Question {index + 1} ({q.points} points)</p>
                                {submission.isGraded && q.type === 'Theoretical' && (
                                    <p className="font-bold text-lg text-blue-600">
                                        Score: {studentAnswer?.awardedPoints ?? 0} / {q.points}
                                    </p>
                                )}
                            </div>
                            <p className="mt-2 text-lg text-gray-800 whitespace-pre-wrap">{q.questionText}</p>
                            <div className="mt-4">
                                {q.type === 'MCQ' && q.mcqOptions && (
                                    <div className="space-y-3">
                                        {q.mcqOptions.map(opt => {
                                            const isSelected = studentAnswer?.selectedOptionId === opt.id;
                                            return (
                                                <div key={opt.id} className={`flex items-start p-3 border rounded-lg ${getOptionClass(opt, q)}`}>
                                                    <span className="font-bold mr-3 text-lg">
                                                        {opt.isCorrect ? '✔' : (isSelected ? '✖' : '◦')}
                                                    </span>
                                                    <p>{opt.text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {q.type === 'Theoretical' && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Your Answer:</h4>
                                        <div className="bg-gray-50 p-4 border rounded-md min-h-[100px]">
                                            <p className="text-gray-800 whitespace-pre-wrap">{studentAnswer?.answerText || <span className="italic text-gray-400">Not answered</span>}</p>
                                        </div>
                                         {!submission.isGraded && (
                                            <p className="text-xs text-center mt-2 text-yellow-600 bg-yellow-50 p-2 rounded-md">This question is pending review by your instructor.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            {studentAnswer?.suggestion && (
                                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                    <p className="font-bold text-sm text-blue-800">Teacher's Feedback:</p>
                                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{studentAnswer.suggestion}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default TestReviewPage;