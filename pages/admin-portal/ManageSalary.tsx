

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FACULTY_MEMBERS } from '../../constants';
import type { FacultyMember, SalaryRequest, SalaryPayment } from '../../types';
import { getItems, saveItems } from '../../services/dataService';
import ConfirmModal from '../../components/ConfirmModal.tsx';

const SalaryManagementModal: React.FC<{
    facultyMember: FacultyMember;
    onClose: () => void;
    onSave: (updatedFaculty: FacultyMember) => void;
}> = ({ facultyMember, onClose, onSave }) => {
    const [facultyData, setFacultyData] = useState<FacultyMember>(facultyMember);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        method: 'Bank Transfer' as SalaryPayment['method'],
        notes: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Salary' as SalaryPayment['category'],
        otherCategory: ''
    });
    const modalRef = useRef<HTMLDivElement>(null);
    const [paymentToRevert, setPaymentToRevert] = useState<SalaryPayment | null>(null);

    const handleSave = () => {
        onSave(facultyData);
        onClose();
    };
    
    const handleRecordPayment = () => {
        const amount = parseFloat(newPayment.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        if (newPayment.category === 'Other' && !newPayment.otherCategory.trim()) {
            alert('Please specify the category for "Other".');
            return;
        }

        const payment: SalaryPayment = {
            id: `SAL-${Date.now()}`,
            date: newPayment.date,
            amount: amount,
            method: newPayment.method,
            category: newPayment.category,
            otherCategory: newPayment.category === 'Other' ? newPayment.otherCategory.trim() : undefined,
            notes: newPayment.notes.trim(),
            processedBy: 'Admin',
        };

        setFacultyData(prev => ({
            ...prev,
            salaryHistory: [payment, ...(prev.salaryHistory || [])],
        }));
        setNewPayment({ amount: '', method: 'Bank Transfer', notes: '', date: new Date().toISOString().split('T')[0], category: 'Salary', otherCategory: '' });
    };

    const handleRevertClick = (payment: SalaryPayment) => {
        setPaymentToRevert(payment);
    };

    const handleConfirmRevert = () => {
        if (!paymentToRevert) return;
        setFacultyData(prev => ({
            ...prev,
            salaryHistory: prev.salaryHistory?.filter(p => p.id !== paymentToRevert.id) || [],
        }));
        setPaymentToRevert(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">Manage Salary for {facultyData.name}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Base Salary (NPR)</label>
                        <input
                            type="number"
                            value={facultyData.baseSalary}
                            onChange={e => setFacultyData({ ...facultyData, baseSalary: parseInt(e.target.value, 10) || 0 })}
                            className="mt-1 block w-full p-2 border rounded-md bg-white"
                        />
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold mb-2">Record New Payment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Amount" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="p-2 border rounded-md bg-white"/>
                            <select value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value as SalaryPayment['method']})} className="p-2 border rounded-md bg-white">
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>Cheque</option>
                            </select>
                             <select value={newPayment.category} onChange={e => setNewPayment({...newPayment, category: e.target.value as SalaryPayment['category']})} className="p-2 border rounded-md bg-white col-span-2">
                                <option>Salary</option>
                                <option>Tuition Fee</option>
                                <option>Other</option>
                            </select>
                            {newPayment.category === 'Other' && (
                                <input type="text" placeholder="Specify 'Other' Category" value={newPayment.otherCategory} onChange={e => setNewPayment({...newPayment, otherCategory: e.target.value})} className="p-2 border rounded-md bg-white col-span-2"/>
                            )}
                            <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="p-2 border rounded-md bg-white col-span-2"/>
                            <input type="text" placeholder="Notes (e.g., July Salary)" value={newPayment.notes} onChange={e => setNewPayment({...newPayment, notes: e.target.value})} className="p-2 border rounded-md bg-white col-span-2"/>
                        </div>
                        <button onClick={handleRecordPayment} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Add Payment to History</button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                        <div className="max-h-60 overflow-y-auto border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Category</th><th className="p-2">Method</th><th className="p-2">Notes</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {facultyData.salaryHistory?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                        <tr key={p.id} className="border-b">
                                            <td className="p-2">{p.date}</td>
                                            <td className="p-2">NPR {p.amount.toLocaleString()}</td>
                                            <td className="p-2">{p.category}{p.otherCategory ? ` (${p.otherCategory})`: ''}</td>
                                            <td className="p-2">{p.method}</td>
                                            <td className="p-2">{p.notes}</td>
                                            <td className="p-2 text-center">
                                                <button type="button" onClick={() => handleRevertClick(p)} className="text-red-600 hover:underline font-semibold text-xs" title="Revert this payment record">Revert</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-brand-red text-white px-4 py-2 rounded-md">Save Changes</button>
                </div>
                <ConfirmModal
                    isOpen={!!paymentToRevert}
                    title="Revert Salary Payment"
                    message={`Are you sure you want to revert the payment of NPR ${paymentToRevert?.amount.toLocaleString()}? This action cannot be undone.`}
                    onConfirm={handleConfirmRevert}
                    onCancel={() => setPaymentToRevert(null)}
                    confirmText="Yes, Revert"
                    cancelText="Cancel"
                />
            </div>
        </div>
    );
};

const ManageSalary: React.FC = () => {
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => getItems('faculty', FACULTY_MEMBERS));
    const [requests, setRequests] = useState<SalaryRequest[]>(() => getItems('salaryRequests', []));
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('All');
    const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved'>('Pending');

    useEffect(() => {
        saveItems('faculty', faculty);
    }, [faculty]);

    useEffect(() => {
        saveItems('salaryRequests', requests);
    }, [requests]);

    const handleResolveRequest = (id: number) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved', resolvedDate: new Date().toISOString().split('T')[0] } : r));
    };

    const handleDeleteRequest = (id: number) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleSaveFaculty = (updatedFaculty: FacultyMember) => {
        setFaculty(prev => prev.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
    };

    const pendingRequests = useMemo(() => requests.filter(r => r.status === 'Pending'), [requests]);
    const resolvedRequests = useMemo(() => requests.filter(r => r.status === 'Resolved'), [requests]);
    const currentRequestList = activeTab === 'Pending' ? pendingRequests : resolvedRequests;
    
    const monthOptions = useMemo(() => {
        const options = [];
        const date = new Date();
        for (let i = 0; i < 12; i++) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const value = `${year}-${month}`;
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value, label });
            date.setMonth(date.getMonth() - 1);
        }
        return options;
    }, []);

    const filteredFaculty = useMemo(() => {
        return faculty
            .filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(member => {
                if (monthFilter === 'All') return true;
                // Check if any payment was made in the selected month
                return member.salaryHistory?.some(payment => payment.date.startsWith(monthFilter));
            });
    }, [faculty, searchTerm, monthFilter]);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-brand-dark">Manage Faculty Salary</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('Pending')} className={`py-2 px-1 border-b-2 font-semibold text-sm ${activeTab === 'Pending' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Pending Requests <span className="bg-yellow-200 text-yellow-800 ml-2 py-0.5 px-2 rounded-full text-xs">{pendingRequests.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('Resolved')} className={`py-2 px-1 border-b-2 font-semibold text-sm ${activeTab === 'Resolved' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Resolved Requests <span className="bg-gray-200 text-gray-800 ml-2 py-0.5 px-2 rounded-full text-xs">{resolvedRequests.length}</span>
                        </button>
                    </nav>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto">
                    {currentRequestList.length > 0 ? currentRequestList.map(req => (
                        <div key={req.id} className="p-4 border rounded-lg flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{req.facultyName}</p>
                                <p className="text-sm text-gray-700 mt-1">{req.message}</p>
                                <p className="text-xs text-gray-500 mt-2">Requested on: {req.requestDate}</p>
                            </div>
                            <div className="flex-shrink-0 space-x-2">
                                {req.status === 'Pending' && <button onClick={() => handleResolveRequest(req.id)} className="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-green-700">Resolve</button>}
                                <button onClick={() => handleDeleteRequest(req.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-500 py-4">No {activeTab.toLowerCase()} requests.</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Faculty Salary Overview</h2>
                 <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search-faculty" className="block text-sm font-medium text-gray-700">Search by Name</label>
                            <input
                                id="search-faculty"
                                type="text"
                                placeholder="e.g., Kabin Pyakurel"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700">Filter by Payment Month</label>
                            <select
                                id="month-filter"
                                value={monthFilter}
                                onChange={e => setMonthFilter(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
                            >
                                <option value="All">All Months</option>
                                {monthOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="self-end">
                            <button
                                onClick={() => { setSearchTerm(''); setMonthFilter('All'); }}
                                className="w-full bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-semibold text-sm">Faculty</th>
                                <th className="p-3 font-semibold text-sm">Base Salary (NPR)</th>
                                <th className="p-3 font-semibold text-sm">Total Paid</th>
                                <th className="p-3 font-semibold text-sm">Last Paid</th>
                                <th className="p-3 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredFaculty.map(member => {
                                const sortedHistory = member.salaryHistory?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
                                const lastPayment = sortedHistory[0];
                                const totalPaid = member.salaryHistory?.reduce((acc, p) => acc + p.amount, 0) || 0;
                                return (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium flex items-center gap-3">
                                        <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover"/>
                                        {member.name}
                                    </td>
                                    <td className="p-3 font-mono">{member.baseSalary.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-green-600 font-semibold">{totalPaid.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-xs">{lastPayment ? `${lastPayment.date} (NPR ${lastPayment.amount.toLocaleString()})` : 'N/A'}</td>
                                    <td className="p-3"><button onClick={() => setSelectedFaculty(member)} className="text-sm font-semibold text-blue-600 hover:underline">Manage</button></td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredFaculty.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No faculty members match the current filters.</p>
                    )}
                </div>
            </div>

            {selectedFaculty && (
                <SalaryManagementModal
                    facultyMember={selectedFaculty}
                    onClose={() => setSelectedFaculty(null)}
                    onSave={handleSaveFaculty}
                />
            )}
        </div>
    );
};

export default ManageSalary;