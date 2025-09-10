import React from 'react';
import type { MockTest } from '../../types';

interface TestQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    test: MockTest | null;
}

const TestQuestionsModal: React.FC<TestQuestionsModalProps> = ({ isOpen, onClose, test }) => {
    if (!isOpen || !test) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-dark">{test.title}</h2>
                        <p className="text-sm text-gray-500">{test.paper}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {test.questions.map((q, index) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                            <p className="font-semibold text-gray-600">Question {index + 1} ({q.points} points)</p>
                            <p className="mt-1 text-gray-800">{q.questionText}</p>
                            {q.type === 'MCQ' && q.mcqOptions && (
                                <div className="mt-3 space-y-2 text-sm">
                                    {q.mcqOptions.map(opt => (
                                        <div key={opt.id} className={`flex items-start p-2 border rounded-md ${opt.isCorrect ? 'bg-green-100 border-green-300' : 'bg-white'}`}>
                                            <span className="font-bold mr-2">{opt.isCorrect ? '✔' : '◦'}</span>
                                            <p>{opt.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {test.questions.length === 0 && (
                        <p className="text-center text-gray-500 py-8">This test has no questions yet.</p>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-brand-dark text-white font-semibold px-6 py-2 rounded-md hover:bg-black">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestQuestionsModal;