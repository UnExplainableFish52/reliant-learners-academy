import React, { useState, useEffect, useMemo } from 'react';
import { useFaculty } from './hooks.ts';
import type { SalaryRequest, FacultyMember } from '../../types';
import { getItems, saveItems } from '../../services/dataService';
import { FACULTY_MEMBERS } from '../../constants';

const SalaryPage: React.FC = () => {
    const { facultyMember: loggedInFaculty } = useFaculty();

    const [facultyDetails, setFacultyDetails] = useState<FacultyMember | null>(null);
    const [requests, setRequests] = useState<SalaryRequest[]>(() => getItems('salaryRequests', []));
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        // Load the most up-to-date faculty details from storage
        const allFaculty = getItems<FacultyMember[]>('faculty', FACULTY_MEMBERS);
        const currentFacultyDetails = allFaculty.find(f => f.id === loggedInFaculty.id);
        if (currentFacultyDetails) {
            setFacultyDetails(currentFacultyDetails);
        }
    }, [loggedInFaculty.id, requests]); // Re-fetch details if requests change (in case admin updates salary)

    const totalSalaryReceived = useMemo(() => {
        return facultyDetails?.salaryHistory?.reduce((acc, payment) => acc + payment.amount, 0) || 0;
    }, [facultyDetails]);

    const myRequests = requests.filter(r => r.facultyId === loggedInFaculty.id)
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);

        const newRequest: SalaryRequest = {
            id: Date.now(),
            facultyId: loggedInFaculty.id,
            facultyName: loggedInFaculty.name,
            message: message.trim(),
            status: 'Pending',
            requestDate: new Date().toISOString().split('T')[0],
        };

        const updatedRequests = [newRequest, ...requests];
        setRequests(updatedRequests);
        saveItems('salaryRequests', updatedRequests);
        
        setMessage('');
        setIsSubmitting(false);
        setNotification('Your request has been sent to the administration.');
        setTimeout(() => setNotification(''), 3000);
    };

    if (!facultyDetails) {
        return <div>Loading salary details...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-brand-dark">My Salary</h1>
            {notification && <div className="p-3 bg-green-100 text-green-700 rounded-md">{notification}</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Current Base Salary</p>
                            <p className="text-3xl font-bold text-gray-800">NPR {facultyDetails.baseSalary.toLocaleString()}</p>
                        </div>
                         <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500">Total Received To Date</p>
                            <p className="text-3xl font-bold text-green-600">NPR {totalSalaryReceived.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Contact Administration</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message/Request</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                                    placeholder="e.g., I would like to inquire about the salary slip for last month."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-brand-red text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Request'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Payment History</h2>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Date</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Amount (NPR)</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Category</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Method</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {facultyDetails.salaryHistory && facultyDetails.salaryHistory.length > 0 ? (
                                [...facultyDetails.salaryHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                                    <tr key={payment.id}>
                                        <td className="p-3 font-mono text-sm">{payment.date}</td>
                                        <td className="p-3 font-mono text-sm">{payment.amount.toLocaleString()}</td>
                                        <td className="p-3 text-sm">
                                            <span className="font-semibold">{payment.category}</span>
                                            {payment.category === 'Other' && payment.otherCategory && ` (${payment.otherCategory})`}
                                        </td>
                                        <td className="p-3 text-sm">{payment.method}</td>
                                        <td className="p-3 text-sm text-gray-600 italic">{payment.notes}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payment history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4">My Requests</h2>
                 <div className="space-y-4 max-h-72 overflow-y-auto">
                    {myRequests.length > 0 ? (
                        myRequests.map(req => (
                            <div key={req.id} className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: req.status === 'Pending' ? '#FBBF24' : '#10B981' }}>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500">Requested on: {req.requestDate}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{req.status}</span>
                                </div>
                                <p className="mt-2 text-gray-700">{req.message}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">You have not made any requests.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default SalaryPage;
