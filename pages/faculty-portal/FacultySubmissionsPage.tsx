import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission, Student } from '../../types';
import { useFaculty } from './hooks.ts';
import { STUDENTS } from '../../constants.ts';

const FacultySubmissionsPage: React.FC = () => {
    const { facultyMember } = useFaculty();
    const navigate = useNavigate();

    const [tests, setTests] = useState<MockTest[]>(() => getItems('mockTests', []));
    const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getItems('studentSubmissions', []));
    const [students, setStudents] = useState<Student[]>(() => getItems('students', STUDENTS));
    const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    
    const myTests = useMemo(() => {
        return tests.filter(test => test.createdByFacultyId === facultyMember.id)
            .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));
    }, [tests, facultyMember.id]);

    const submissionsForSelectedTest = useMemo(() => {
        if (!selectedTest) return [];
        return submissions.filter(s => s.testId === selectedTest.id)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [selectedTest, submissions]);

    const handleGradeAction = (submission: StudentSubmission) => {
        navigate(`/faculty-portal/grade-submission/${submission.id}`);
    };

    useEffect(() => {
        if (!selectedTest && myTests.length > 0) {
            setSelectedTest(myTests[0]);
        }
    }, [myTests, selectedTest]);

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Test Submissions & Grading</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4">My Tests</h2>
                    <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                        {myTests.map(test => (
                            <li key={test.id}>
                                <button
                                    onClick={() => setSelectedTest(test)}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                        selectedTest?.id === test.id
                                            ? 'bg-red-50 border-brand-red'
                                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="font-bold">{test.title}</p>
                                    <p className="text-sm text-gray-500">{test.paper}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    {selectedTest ? (
                        <div>
                             <h2 className="text-2xl font-bold text-brand-dark mb-4">Submissions for "{selectedTest.title}"</h2>
                             <div className="max-h-[70vh] overflow-y-auto pr-2">
                                {submissionsForSelectedTest.length > 0 ? (
                                    <ul className="divide-y">
                                        {submissionsForSelectedTest.map(sub => {
                                            const student = studentMap.get(sub.studentId);
                                            return (
                                                <li key={sub.id} className="py-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <img src={student?.avatarUrl || 'https://via.placeholder.com/40'} alt={student?.name || 'Student'} className="w-10 h-10 rounded-full object-cover" />
                                                            <div>
                                                                <p className="font-semibold">{student?.name || 'Unknown Student'}</p>
                                                                <p className="text-xs text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.isGraded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {sub.isGraded ? 'Graded' : 'Pending'}
                                                            </span>
                                                            <button onClick={() => handleGradeAction(sub)} className="text-sm font-semibold text-blue-600 hover:underline">
                                                                {sub.isGraded ? 'View' : 'Grade'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No students have submitted this test yet.</p>
                                )}
                             </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select one of your tests to view submissions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultySubmissionsPage;
