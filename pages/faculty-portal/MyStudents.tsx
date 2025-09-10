import React, { useState, useMemo, useEffect } from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { STUDENTS } from '../../constants.ts';
import type { Student } from '../../types';
import StudentDetailModal from '../../components/faculty-portal/StudentDetailModal.tsx';
import { useFaculty } from './hooks.ts';

const MyStudents: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedPaper, setSelectedPaper] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        const loadStudents = () => {
            const storedStudents = localStorage.getItem('students');
            setStudents(storedStudents ? JSON.parse(storedStudents) : STUDENTS);
        };

        loadStudents();
        window.addEventListener('storage', loadStudents);
        return () => window.removeEventListener('storage', loadStudents);
    }, []);

    const studentsForPaper = useMemo(() => {
        if (selectedPaper === 'All') {
            const facultyPaperCodes = facultyMember.assignedPapers.map(p => p.split(':')[0].trim());
            return students.filter(student =>
                student.enrolledPapers.some(studentPaperCode => facultyPaperCodes.includes(studentPaperCode))
            );
        }
        const paperCode = selectedPaper.split(':')[0].trim();
        return students.filter(student =>
            student.enrolledPapers.includes(paperCode)
        );
    }, [selectedPaper, facultyMember.assignedPapers, students]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return studentsForPaper;
        return studentsForPaper.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [studentsForPaper, searchTerm]);

    if (!facultyMember) return null;

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">My Students</h1>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow">
                    <label htmlFor="paperSelect" className="block text-sm font-medium text-gray-700">Viewing Students For</label>
                    <select 
                        id="paperSelect"
                        value={selectedPaper}
                        onChange={(e) => setSelectedPaper(e.target.value)}
                        className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm rounded-md shadow-sm bg-white"
                    >
                        <option value="All">All My Papers</option>
                        {facultyMember.assignedPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Student</label>
                    <input 
                        type="text" 
                        id="search"
                        placeholder="By name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Student</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Student ID</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Email</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center">
                                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                        <span className="font-medium">{student.name}</span>
                                    </td>
                                    <td className="p-4 font-mono">{student.studentId}</td>
                                    <td className="p-4">{student.email}</td>
                                    <td className="p-4">
                                        <button onClick={() => setSelectedStudent(student)} className="text-sm font-semibold text-blue-600 hover:underline">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No students found for this paper.</p>
                    )}
                </div>
            </div>

            {selectedStudent && (
                <StudentDetailModal 
                    isOpen={!!selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                    student={selectedStudent} 
                    facultyPapers={facultyMember.assignedPapers} 
                />
            )}
        </div>
    );
};

export default MyStudents;