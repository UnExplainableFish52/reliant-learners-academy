import React, { useState, useMemo, useEffect } from 'react';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest, StudentSubmission, FacultyMember, Student } from '../../types';
import TestQuestionsModal from '../../components/admin-portal/TestQuestionsModal.tsx';
import AdminSubmissionReviewModal from '../../components/admin-portal/AdminSubmissionReviewModal.tsx';

const MockTestsSubmissions: React.FC = () => {
    const [tests, setTests] = useState<MockTest[]>(() => getItems('mockTests', []));
    const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getItems('studentSubmissions', []));
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => getItems('faculty', []));
    const [students, setStudents] = useState<Student[]>(() => getItems('students', []));
    const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
    const [viewingQuestionsOfTest, setViewingQuestionsOfTest] = useState<MockTest | null>(null);
    const [viewingSubmission, setViewingSubmission] = useState<StudentSubmission | null>(null);

    useEffect(() => {
        saveItems('studentSubmissions', submissions);
    }, [submissions]);

    const facultyMap = useMemo(() => new Map(faculty.map(f => [f.id, f.name])), [faculty]);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    const submissionsForSelectedTest = useMemo(() => {
        if (!selectedTest) return [];
        return submissions.filter(s => s.testId === selectedTest.id);
    }, [selectedTest, submissions]);
    
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'mockTests') setTests(getItems('mockTests', []));
            if (e.key === 'studentSubmissions') setSubmissions(getItems('studentSubmissions', []));
            if (e.key === 'students') setStudents(getItems('students', []));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleViewSubmission = (submission: StudentSubmission) => {
        setViewingSubmission(submission);
    };

    const handleDeleteSubmission = (submissionId: number) => {
        if (window.confirm("Are you sure you want to permanently delete this student's submission? This action cannot be undone.")) {
            setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        }
    };

    const selectedTestForModal = viewingSubmission ? tests.find(t => t.id === viewingSubmission.testId) : null;
    const studentNameForModal = viewingSubmission ? studentMap.get(viewingSubmission.studentId) || 'Unknown Student' : '';


    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Mock Tests & Submissions</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4">All Mock Tests</h2>
                    <div className="overflow-x-auto max-h-[70vh] pr-2">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold text-sm">Test Title</th>
                                    <th className="p-3 font-semibold text-sm">Paper</th>
                                    <th className="p-3 font-semibold text-sm">Status</th>
                                    <th className="p-3 font-semibold text-sm">Submissions</th>
                                    <th className="p-3 font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tests.map(test => (
                                    <tr key={test.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{test.title}</td>
                                        <td className="p-3 text-sm">{test.paper}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${test.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{test.status}</span>
                                        </td>
                                        <td className="p-3 text-center">{submissions.filter(s => s.testId === test.id).length}</td>
                                        <td className="p-3 space-x-2 whitespace-nowrap">
                                            <button onClick={() => setSelectedTest(test)} className="text-sm font-semibold text-blue-600 hover:underline">Submissions</button>
                                            <button onClick={() => setViewingQuestionsOfTest(test)} className="text-sm font-semibold text-green-600 hover:underline">Questions</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {selectedTest ? (
                        <div>
                             <h2 className="text-2xl font-bold text-brand-dark mb-4">Submissions for "{selectedTest.title}"</h2>
                             <div className="max-h-[70vh] overflow-y-auto pr-2">
                                {submissionsForSelectedTest.length > 0 ? (
                                    <ul className="divide-y">
                                        {submissionsForSelectedTest.map(sub => (
                                            <li key={sub.id} className="py-3">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold">{studentMap.get(sub.studentId) || 'Unknown Student'}</p>
                                                        <p className="text-xs text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.isGraded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {sub.isGraded ? 'Graded' : 'Pending'}
                                                        </span>
                                                        <button onClick={() => handleViewSubmission(sub)} className="text-sm font-semibold text-blue-600 hover:underline">
                                                            View
                                                        </button>
                                                        <button onClick={() => handleDeleteSubmission(sub.id)} className="text-sm font-semibold text-red-600 hover:underline">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No students have submitted this test yet.</p>
                                )}
                             </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a test to view submissions.</p>
                        </div>
                    )}
                </div>
            </div>
             <TestQuestionsModal
                isOpen={!!viewingQuestionsOfTest}
                onClose={() => setViewingQuestionsOfTest(null)}
                test={viewingQuestionsOfTest}
            />
            <AdminSubmissionReviewModal
                isOpen={!!viewingSubmission}
                onClose={() => setViewingSubmission(null)}
                submission={viewingSubmission}
                test={selectedTestForModal}
                studentName={studentNameForModal}
            />
        </div>
    );
};

export default MockTestsSubmissions;