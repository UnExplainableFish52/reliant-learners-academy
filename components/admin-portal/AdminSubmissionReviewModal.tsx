import React from 'react';
import type { MockTest, StudentSubmission, Question, MCQOption } from '../../types';

interface AdminSubmissionReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: StudentSubmission | null;
    test: MockTest | null;
    studentName: string;
}

const AdminSubmissionReviewModal: React.FC<AdminSubmissionReviewModalProps> = ({ isOpen, onClose, submission, test, studentName }) => {
    if (!isOpen || !test || !submission) return null;

    const { totalScore, maxScore } = (() => {
        if (!test || !submission) return { totalScore: 0, maxScore: 0 };
        const max = test.questions.reduce((sum, q) => sum + q.points, 0);
        return { totalScore: submission.totalAwardedPoints ?? 0, maxScore: max };
    })();

    const getOptionClass = (option: MCQOption, question: Question) => {
        const studentAnswer = submission.answers.find(a => a.questionId === question.id);
        const isSelected = studentAnswer?.selectedOptionId === option.id;
        const isCorrect = option.isCorrect;

        if (isCorrect) return 'bg-green-100 border-green-400 text-green-800 font-semibold';
        if (isSelected && !isCorrect) return 'bg-red-100 border-red-400 text-red-800';
        return 'bg-white border-gray-300';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark">Review: {test.title}</h2>
                            <p className="text-gray-500">Submission by: {studentName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Final Score</p>
                            <p className="text-2xl font-bold text-brand-red">{totalScore} / {maxScore}</p>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {test.questions.map((q, index) => {
                        const studentAnswer = submission.answers.find(a => a.questionId === q.id);
                        return (
                            <div key={q.id} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-600">Question {index + 1} ({q.points} points)</p>
                                    {submission.isGraded && q.type === 'Theoretical' && (
                                        <p className="font-bold text-lg text-blue-600">
                                            Score: {studentAnswer?.awardedPoints ?? 0} / {q.points}
                                        </p>
                                    )}
                                </div>
                                <p className="mt-2 text-gray-800 whitespace-pre-wrap">{q.questionText}</p>
                                <div className="mt-4">
                                    {q.type === 'MCQ' && q.mcqOptions && (
                                        <div className="space-y-3">
                                            {q.mcqOptions.map(opt => (
                                                <div key={opt.id} className={`flex items-start p-3 border rounded-lg ${getOptionClass(opt, q)}`}>
                                                    <span className="font-bold mr-3 text-lg">{opt.isCorrect ? '✔' : (studentAnswer?.selectedOptionId === opt.id ? '✖' : '◦')}</span>
                                                    <p>{opt.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {q.type === 'Theoretical' && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Student's Answer:</h4>
                                            <div className="bg-white p-4 border rounded-md min-h-[80px]">
                                                <p className="text-gray-800 whitespace-pre-wrap">{studentAnswer?.answerText || <span className="italic text-gray-400">Not answered</span>}</p>
                                            </div>
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
                <footer className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-brand-dark text-white font-semibold px-6 py-2 rounded-md hover:bg-black">Close</button>
                </footer>
            </div>
        </div>
    );
};

export default AdminSubmissionReviewModal;