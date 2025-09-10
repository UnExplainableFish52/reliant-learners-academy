import React, { useState } from 'react';
import { STUDENTS } from '../../constants.ts';
import type { Student, GradeEntry } from '../../types.ts';
import { useFaculty } from './hooks.ts';

const Grading: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [selectedPaper, setSelectedPaper] = useState(facultyMember.assignedPapers[0]);
    
    const [allStudents, setAllStudents] = useState<Student[]>(() => {
        try {
            const savedStudents = localStorage.getItem('students');
            return savedStudents ? JSON.parse(savedStudents) : STUDENTS;
        } catch (e) {
            console.error('Failed to load students from localStorage', e);
            return STUDENTS;
        }
    });

    const [newScores, setNewScores] = useState<{ [studentId: number]: string }>({});
    const [message, setMessage] = useState('');

    const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const paper = e.target.value;
        setSelectedPaper(paper);
    };
    
    const paperCode = selectedPaper.split(':')[0].trim();

    const handleSaveChanges = () => {
        const updatedStudents = allStudents.map(student => {
            const newScoreValue = newScores[student.id];
            if (newScoreValue && newScoreValue.trim() !== '') {
                const score = parseInt(newScoreValue, 10);
                if (!isNaN(score) && score >= 0 && score <= 100) {
                    const newGradeEntry: GradeEntry = {
                        score,
                        date: new Date().toISOString().split('T')[0],
                        examType: 'Mock',
                    };
                    const existingGrades = student.grades?.[paperCode] || [];
                    const updatedGradesForPaper = [...existingGrades, newGradeEntry];
                    return {
                        ...student,
                        grades: {
                            ...student.grades,
                            [paperCode]: updatedGradesForPaper,
                        },
                    };
                }
            }
            return student;
        });

        setAllStudents(updatedStudents);
        setNewScores({}); // Clear the input fields

        try {
            localStorage.setItem('students', JSON.stringify(updatedStudents));
            setMessage('Grades have been saved successfully!');
        } catch (error) {
            console.error("Failed to save grades to localStorage:", error);
            setMessage('Error: Could not save grades.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const studentsForPaper = allStudents.filter(student => 
        student.enrolledPapers.some(p => selectedPaper.startsWith(p.split(':')[0].trim()))
    );
    
    if (!facultyMember) return null;

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Grading &amp; Results</h1>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <label htmlFor="paperSelect" className="block text-sm font-medium text-gray-700">Select Paper</label>
                    <select
                        id="paperSelect"
                        value={selectedPaper}
                        onChange={handlePaperChange}
                        className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm rounded-md shadow-sm bg-white"
                    >
                        {facultyMember.assignedPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                    </select>
                </div>
                 {message && <div className="p-2 text-sm bg-green-100 text-green-700 rounded-md">{message}</div>}
                <button
                    onClick={handleSaveChanges}
                    className="bg-brand-red text-white font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                    Save Changes
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Student Name</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Student ID</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center w-48">Mock Exam Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {studentsForPaper.map(student => {
                                const latestScoreEntry = student.grades?.[paperCode]?.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                                return (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center">
                                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3" />
                                        <span className="font-medium">{student.name}</span>
                                    </td>
                                    <td className="p-4 font-mono text-sm">{student.studentId}</td>
                                    <td className="p-4">
                                         <div className="flex flex-col items-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newScores[student.id] || ''}
                                                onChange={(e) => setNewScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                className="w-full p-2 border border-gray-300 rounded-md text-center focus:ring-brand-red focus:border-brand-red bg-white"
                                                placeholder="Enter new score"
                                            />
                                            {latestScoreEntry && (
                                                <span className="text-xs text-gray-500 mt-1">
                                                    Last: {latestScoreEntry.score} ({latestScoreEntry.date})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Grading;