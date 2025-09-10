import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission, Student, Question, MCQOption, StudentAnswer, GradeEntry } from '../../types.ts';
import { STUDENTS, MOCK_TESTS } from '../../constants.ts';

const GradeSubmissionPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<MockTest | null>(null);
    const [submission, setSubmission] = useState<StudentSubmission | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [gradedAnswers, setGradedAnswers] = useState<StudentAnswer[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const numericSubmissionId = Number(submissionId);
        if (isNaN(numericSubmissionId)) return;

        const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
        const currentSubmission = allSubmissions.find(s => s.id === numericSubmissionId);

        if (currentSubmission) {
            setSubmission(currentSubmission);
            setGradedAnswers(currentSubmission.answers);

            const allTests = getItems<MockTest[]>('mockTests', MOCK_TESTS);
            setTest(allTests.find(t => t.id === currentSubmission.testId) || null);

            const allStudents = getItems<Student[]>('students', STUDENTS);
            setStudent(allStudents.find(s => s.id === currentSubmission.studentId) || null);
        }
    }, [submissionId]);

    const handlePointsChange = (questionId: number, points: number) => {
        const question = test?.questions.find(q => q.id === questionId);
        if (!question) return;

        const awardedPoints = Math.max(0, Math.min(question.points, points));

        setGradedAnswers(prev => {
            const existingIndex = prev.findIndex(a => a.questionId === questionId);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], awardedPoints };
                return updated;
            }
            return [...prev, { questionId, awardedPoints }];
        });
    };
    
    const handleSuggestionChange = (questionId: number, suggestion: string) => {
        setGradedAnswers(prev => {
            const existingIndex = prev.findIndex(a => a.questionId === questionId);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], suggestion };
                return updated;
            }
            return [...prev, { questionId, suggestion }];
        });
    };

    const calculateTotalScore = useCallback(() => {
        if (!test) return 0;
        let total = 0;
        test.questions.forEach(q => {
            const answer = gradedAnswers.find(a => a.questionId === q.id);
            if (q.type === 'MCQ') {
                const correctOption = q.mcqOptions?.find(opt => opt.isCorrect);
                if (answer?.selectedOptionId === correctOption?.id) {
                    total += q.points;
                }
            } else if (q.type === 'Theoretical') {
                total += answer?.awardedPoints || 0;
            }
        });
        return total;
    }, [test, gradedAnswers]);

    const handleSaveGrades = () => {
        if (!submission || !test) return;
        setIsSaving(true);
        
        const totalAwardedPoints = calculateTotalScore();

        const updatedSubmission: StudentSubmission = {
            ...submission,
            answers: gradedAnswers,
            isGraded: true,
            totalAwardedPoints
        };

        const allSubmissions = getItems<StudentSubmission[]>('studentSubmissions', []);
        const updatedList = allSubmissions.map(s => s.id === submission.id ? updatedSubmission : s);
        saveItems('studentSubmissions', updatedList);

        // --- Update Student's Main Grade Record ---
        const allStudents = getItems<Student[]>('students', STUDENTS);
        const studentToUpdate = allStudents.find(s => s.id === submission.studentId);
        if (studentToUpdate) {
            const paperCode = test.paper.split(':')[0].trim();
            
            const newGrade: GradeEntry = {
                score: totalAwardedPoints,
                date: new Date().toISOString().split('T')[0],
                examType: 'Mock',
            };
            
            const existingGradesForPaper = studentToUpdate.grades?.[paperCode] || [];
            const updatedGradesForPaper = [...existingGradesForPaper, newGrade];

            const updatedStudent: Student = {
                ...studentToUpdate,
                grades: {
                    ...studentToUpdate.grades,
                    [paperCode]: updatedGradesForPaper,
                }
            };
            
            const finalStudentList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
            saveItems('students', finalStudentList);
        }

        setTimeout(() => {
            setIsSaving(false);
            navigate('/faculty-portal/submissions');
        }, 1000); // Simulate network delay
    };

    const totalPossiblePoints = useMemo(() => test?.questions.reduce((sum, q) => sum + q.points, 0) || 0, [test]);
    const currentTotalScore = calculateTotalScore();

    if (!test || !submission || !student) {
        return <div className="p-8 text-center">Loading submission...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-white p-4 rounded-lg shadow-md sticky top-0 z-10">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark">Grading: {test.title}</h1>
                        <p className="text-gray-500">Student: {student.name} ({student.studentId})</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                             <p className="text-sm font-semibold text-gray-500">Total Score</p>
                             <p className="text-2xl font-bold text-brand-red">{currentTotalScore} / {totalPossiblePoints}</p>
                        </div>
                        <button
                            onClick={handleSaveGrades}
                            disabled={isSaving}
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {isSaving ? 'Saving...' : 'Save Grades'}
                        </button>
                    </div>
                </div>
            </header>
            
            {test.questions.map((q, index) => {
                const studentAnswer = gradedAnswers.find(a => a.questionId === q.id);
                return (
                    <div key={q.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                             <p className="font-semibold text-gray-500">Question {index + 1} ({q.points} points)</p>
                              {q.type === 'Theoretical' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={studentAnswer?.awardedPoints ?? ''}
                                        onChange={e => handlePointsChange(q.id, Number(e.target.value))}
                                        className="w-20 p-1 border rounded-md text-center font-bold bg-white"
                                        max={q.points}
                                        min={0}
                                    />
                                    <span className="font-semibold text-gray-600">/ {q.points}</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-lg text-gray-800 whitespace-pre-wrap">{q.questionText}</p>
                        <div className="mt-4">
                            {q.type === 'MCQ' && q.mcqOptions && (
                                <>
                                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Student's Answer:</h4>
                                    <div className="space-y-3">
                                        {q.mcqOptions.map(opt => {
                                            const isSelected = studentAnswer?.selectedOptionId === opt.id;
                                            const isCorrect = opt.isCorrect;
                                            let optionClass = 'bg-white border-gray-300';
                                            if (isCorrect) optionClass = 'bg-green-100 border-green-400 text-green-800 font-semibold';
                                            else if (isSelected) optionClass = 'bg-red-100 border-red-400 text-red-800';

                                            return (
                                                <div key={opt.id} className={`flex items-start p-3 border rounded-lg ${optionClass}`}>
                                                    <span className="font-bold mr-3 text-lg">
                                                        {isCorrect ? '✔' : (isSelected ? '✖' : '◦')}
                                                    </span>
                                                    <p>{opt.text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {q.type === 'Theoretical' && (
                                <>
                                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Student's Answer:</h4>
                                    <div className="bg-gray-50 p-4 border rounded-md min-h-[100px]">
                                        <p className="text-gray-800 whitespace-pre-wrap">{studentAnswer?.answerText || <span className="italic text-gray-400">Not answered</span>}</p>
                                    </div>
                                </>
                            )}
                        </div>
                         <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                            <label className="text-sm font-semibold text-gray-700">Feedback / Suggestion for Student</label>
                            <textarea
                                value={studentAnswer?.suggestion || ''}
                                onChange={e => handleSuggestionChange(q.id, e.target.value)}
                                rows={2}
                                className="w-full mt-1 p-2 border rounded-md focus:ring-brand-red focus:border-brand-red bg-white"
                                placeholder="Provide feedback on the student's answer..."
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GradeSubmissionPage;