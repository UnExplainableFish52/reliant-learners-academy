import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFaculty } from './hooks.ts';
import { getItems, saveItems } from '../../services/dataService.ts';
import type { MockTest } from '../../types';

const ManageMockTests: React.FC = () => {
    const { facultyMember } = useFaculty();
    const navigate = useNavigate();
    const [tests, setTests] = useState<MockTest[]>(() => getItems('mockTests', []));

    useEffect(() => {
        saveItems('mockTests', tests);
    }, [tests]);

    const myTests = useMemo(() => {
        return tests.filter(test => test.createdByFacultyId === facultyMember.id)
            .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));
    }, [tests, facultyMember.id]);

    const handleDelete = (testId: number) => {
        if (window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
            setTests(prev => prev.filter(t => t.id !== testId));
        }
    };
    
    const handleToggleLock = (testId: number) => {
        setTests(prevTests => {
            const updatedTests = prevTests.map(t =>
                t.id === testId ? { ...t, isLocked: !t.isLocked } : t
            );
            // This save will trigger the 'storage' event for any active students
            saveItems('mockTests', updatedTests);
            return updatedTests;
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-brand-dark">Manage Mock Tests</h1>
                <button
                    onClick={() => navigate('/faculty-portal/create-edit-test')}
                    className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    + Create New Test
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-semibold text-sm">Title</th>
                                <th className="p-3 font-semibold text-sm">Paper</th>
                                <th className="p-3 font-semibold text-sm">Status</th>
                                <th className="p-3 font-semibold text-sm">Availability</th>
                                <th className="p-3 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {myTests.map(test => (
                                <tr key={test.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{test.title}</td>
                                    <td className="p-3 text-sm">{test.paper}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${test.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{test.status}</span>
                                    </td>
                                    <td className="p-3 text-sm">
                                        {test.scheduledStartTime ? new Date(test.scheduledStartTime).toLocaleString() : 'Available Now'}
                                    </td>
                                    <td className="p-3 space-x-2 whitespace-nowrap">
                                        <Link to={`/faculty-portal/create-edit-test/${test.id}`} className="text-sm font-semibold text-blue-600 hover:underline">Edit</Link>
                                        <button onClick={() => handleDelete(test.id)} className="text-sm font-semibold text-brand-red hover:underline">Delete</button>
                                         {test.status === 'Published' && (
                                            <label htmlFor={`lock-${test.id}`} className="inline-flex items-center cursor-pointer">
                                                <span className="text-sm font-semibold mr-2">{test.isLocked ? 'Locked' : 'Unlocked'}</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id={`lock-${test.id}`}
                                                        className="sr-only peer"
                                                        checked={test.isLocked}
                                                        onChange={() => handleToggleLock(test.id)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                                                </div>
                                            </label>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {myTests.length === 0 && (
                        <p className="text-center py-8 text-gray-500">You have not created any mock tests yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageMockTests;
