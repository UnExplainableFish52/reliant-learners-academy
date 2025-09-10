
import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { STUDENTS, COURSES } from '../../constants.ts';
import type { Student, PaymentHistoryItem, PaymentQRCode } from '../../types';
import { getItems, saveItems } from '../../services/dataService';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { imageFileToDataUrl } from '../../services/imageCompressionService.ts';
import ConfirmModal from '../../components/ConfirmModal.tsx';


// Storage helper
const getStudentsFromStorage = (): Student[] => {
    try {
        const stored = localStorage.getItem('students');
        return stored ? JSON.parse(stored) : STUDENTS;
    } catch {
        return STUDENTS;
    }
};

// Fee calculation helper
const calculateFeeDetails = (student: Student | null) => {
    if (!student) return { paidAmount: 0, outstandingBalance: 0, isOverdue: false, lastPaymentDate: 'N/A' };
    const netFee = (student.totalFee || 0) - (student.discount || 0);
    const paidAmount = student.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
    const outstandingBalance = netFee - paidAmount;
    
    let isOverdue = false;
    if (outstandingBalance > 0 && student.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        isOverdue = new Date(student.dueDate) < today;
    }

    const lastPayment = student.paymentHistory?.filter(p => p.status === 'Paid').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return { paidAmount, outstandingBalance, isOverdue, lastPaymentDate: lastPayment?.date || 'N/A' };
};

// Get student status for badge
const getStudentFeeStatus = (student: Student) => {
    if (!student.totalFee || student.totalFee === 0) {
        return { text: 'Fee Not Set', color: 'bg-gray-100 text-gray-800' };
    }
    if (student.paymentHistory?.some(p => p.status === 'Pending Verification')) {
        return { text: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800' };
    }
    const { outstandingBalance, isOverdue } = calculateFeeDetails(student);
    if (outstandingBalance > 0) {
        return { text: isOverdue ? 'Overdue' : 'Outstanding', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Paid', color: 'bg-green-100 text-green-800' };
};

// Get student status for filter logic
const getStudentFeeStatusForFilter = (student: Student): string => {
    if (!student.totalFee || student.totalFee === 0) return 'Fee Not Set';
    if (student.paymentHistory?.some(p => p.status === 'Pending Verification')) return 'Pending Verification';
    const { outstandingBalance } = calculateFeeDetails(student);
    if (outstandingBalance > 0) return 'Outstanding';
    return 'Paid';
};

const ScreenshotViewer: React.FC<{ imageUrl: string; onClose: () => void; }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
            <img src={imageUrl} alt="Payment Screenshot" className="max-w-full max-h-full object-contain rounded-lg" />
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75">&times;</button>
        </div>
    </div>
);


// Modal Component
const FeeManagementModal: React.FC<{ student: Student; onClose: () => void; onSave: (s: Student) => void; }> = ({ student: initialStudent, onClose, onSave }) => {
    const [student, setStudent] = useState<Student>(initialStudent);
    const [activeTab, setActiveTab] = useState('Fee Structure');
    const [newCharge, setNewCharge] = useState({ amount: '', remarks: '' });
    const [cashPayment, setCashPayment] = useState({ amount: '', remarks: '', date: new Date().toISOString().split('T')[0] });
    const [rejectionReason, setRejectionReason] = useState('');
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
    const [paymentToRevert, setPaymentToRevert] = useState<PaymentHistoryItem | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialStudent) {
            if (!initialStudent.feeItems || initialStudent.feeItems.length === 0) {
                setStudent({
                    ...initialStudent,
                    feeItems: [{ description: 'Base Fee', amount: initialStudent.totalFee || 0 }]
                });
            } else {
                setStudent(initialStudent);
            }
        }
    }, [initialStudent]);

    const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = name === 'discount';
        setStudent(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleFeeItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
        const newFeeItems = [...(student.feeItems || [])];
        newFeeItems[index] = { ...newFeeItems[index], [field]: field === 'amount' ? (typeof value === 'number' ? value : parseFloat(value)) || 0 : value };
        const newTotalFee = newFeeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setStudent(prev => ({ ...prev, feeItems: newFeeItems, totalFee: newTotalFee }));
    };

    const addFeeItem = () => {
        setStudent(prev => ({ ...prev, feeItems: [...(prev.feeItems || []), { description: '', amount: 0 }] }));
    };

    const removeFeeItem = (index: number) => {
        const newFeeItems = (student.feeItems || []).filter((_, i) => i !== index);
        const newTotalFee = newFeeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setStudent(prev => ({ ...prev, feeItems: newFeeItems, totalFee: newTotalFee }));
    };

    const handleAddCharge = () => {
        const amount = parseFloat(newCharge.amount);
        if (isNaN(amount) || amount <= 0 || !newCharge.remarks.trim()) {
            alert('Please enter a valid amount and remark for the charge.');
            return;
        }
        setStudent(prev => ({
            ...prev,
            totalFee: (prev.totalFee || 0) + amount,
            feeRemarks: `${prev.feeRemarks || ''}\n[${new Date().toISOString().split('T')[0]}] Charge Added: ${newCharge.remarks} - NPR ${amount.toLocaleString()}`.trim(),
        }));
        setNewCharge({ amount: '', remarks: '' });
        alert('Charge added. Remember to save changes.');
    };
    
    const handleRecordCashPayment = () => {
        const amount = parseFloat(cashPayment.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount for the cash payment.');
            return;
        }
        
        const newPayment: PaymentHistoryItem = {
            invoiceId: `CASH-${Date.now()}`,
            date: cashPayment.date,
            amount: amount,
            status: 'Paid',
            method: 'Cash',
            remarks: cashPayment.remarks.trim() || 'Cash payment received.',
            verifiedBy: 'Admin',
            verificationDate: new Date().toISOString().split('T')[0]
        };

        setStudent(prev => ({
            ...prev,
            paymentHistory: [newPayment, ...(prev.paymentHistory || [])],
        }));

        setCashPayment({ amount: '', remarks: '', date: new Date().toISOString().split('T')[0] });
        alert('Cash payment recorded. Please Save Changes to finalize.');
    };

    const handlePaymentStatus = (invoiceId: string, newStatus: 'Paid' | 'Rejected') => {
        if(newStatus === 'Rejected' && !rejectionReason.trim()){
            alert('Please provide a reason for rejection.');
            return;
        }
        setStudent(prev => ({
            ...prev,
            paymentHistory: prev.paymentHistory?.map(p => 
                p.invoiceId === invoiceId ? { 
                    ...p, 
                    status: newStatus, 
                    rejectionReason: newStatus === 'Rejected' ? rejectionReason : undefined,
                    verifiedBy: newStatus === 'Paid' ? 'Admin' : undefined,
                    verificationDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
                 } : p
            ) || [],
        }));
        setRejectionReason('');
    };

    const handleRevertClick = (payment: PaymentHistoryItem) => {
        setPaymentToRevert(payment);
    };

    const handleConfirmRevert = () => {
        if (!paymentToRevert) return;
        setStudent(prev => ({
            ...prev,
            paymentHistory: prev.paymentHistory?.filter(p => p.invoiceId !== paymentToRevert.invoiceId) || []
        }));
        setPaymentToRevert(null);
    };
    
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'Fee Structure':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Fee Breakdown</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {(student.feeItems || []).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={item.description} onChange={(e) => handleFeeItemChange(index, 'description', e.target.value)} placeholder="Fee Description (e.g., Tuition)" className="flex-grow p-2 border rounded-md bg-white"/>
                                    <input type="number" value={item.amount} onChange={(e) => handleFeeItemChange(index, 'amount', e.target.value)} placeholder="Amount" className="w-32 p-2 border rounded-md bg-white"/>
                                    <button type="button" onClick={() => removeFeeItem(index)} className="text-red-500 hover:text-red-700 font-bold p-1 text-xl flex-shrink-0">&times;</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addFeeItem} className="text-sm font-semibold text-blue-600 hover:underline">+ Add Fee Item</button>
                        
                        <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="flex justify-between items-center text-md">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">NPR {(student.totalFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="discount" className="text-gray-600">Discount (NPR)</label>
                                <input id="discount" type="number" name="discount" value={student.discount} onChange={handleGenericChange} className="w-32 p-2 border rounded-md text-right bg-white"/>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                                <span>Total Payable</span>
                                <span>NPR {((student.totalFee || 0) - (student.discount || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                            <label className="block text-sm font-medium mb-1">Due Date</label>
                            <input type="date" name="dueDate" value={student.dueDate} onChange={handleGenericChange} className="w-full p-2 border rounded-md bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fee Remarks</label>
                            <textarea name="feeRemarks" value={student.feeRemarks} onChange={handleGenericChange} rows={2} className="w-full p-2 border rounded-md bg-white"/>
                        </div>
                    </div>
                );
            case 'Add Charge':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Add ad-hoc charges like exam fees, book fees, or late penalties.</p>
                        <div><label className="text-sm font-medium">Charge Amount (NPR)</label><input type="number" value={newCharge.amount} onChange={(e) => setNewCharge({...newCharge, amount: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white"/></div>
                        <div><label className="text-sm font-medium">Remarks for Charge</label><input type="text" value={newCharge.remarks} onChange={(e) => setNewCharge({...newCharge, remarks: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white"/></div>
                        <button onClick={handleAddCharge} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add Charge to Total</button>
                    </div>
                );
            case 'Record Cash Payment':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Manually record a cash payment received from the student.</p>
                        <div><label className="text-sm font-medium">Amount Received (NPR)</label><input type="number" value={cashPayment.amount} onChange={(e) => setCashPayment({...cashPayment, amount: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white"/></div>
                        <div><label className="text-sm font-medium">Payment Date</label><input type="date" value={cashPayment.date} onChange={(e) => setCashPayment({...cashPayment, date: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white"/></div>
                        <div><label className="text-sm font-medium">Remarks</label><textarea value={cashPayment.remarks} onChange={(e) => setCashPayment({...cashPayment, remarks: e.target.value})} rows={2} className="mt-1 w-full p-2 border rounded-md bg-white"/></div>
                        <button onClick={handleRecordCashPayment} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Record Payment</button>
                    </div>
                );
            case 'Verify Payments':
                return (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {student.paymentHistory?.filter(p => p.status === 'Pending Verification').length > 0 ? student.paymentHistory?.filter(p => p.status === 'Pending Verification').map(p => (
                            <div key={p.invoiceId} className="p-4 border rounded-lg bg-yellow-50">
                                <p><strong>Date:</strong> {p.date} | <strong>Amount:</strong> NPR {p.amount.toLocaleString()}</p>
                                <p><strong>Method:</strong> {p.method} | <strong>Remarks:</strong> {p.remarks}</p>
                                {p.screenshotUrl && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold mb-1">Payment Proof:</p>
                                        <img 
                                            src={p.screenshotUrl} 
                                            alt="Payment Proof Screenshot" 
                                            className="max-h-40 rounded-md border bg-white p-1 cursor-pointer hover:opacity-80 transition-opacity" 
                                            onClick={() => setViewingScreenshot(p.screenshotUrl!)}
                                        />
                                    </div>
                                )}
                                <div className="mt-4 space-y-2">
                                   <div className="flex gap-2 items-center">
                                    <input type="text" placeholder="Rejection reason (if any)" onChange={e=>setRejectionReason(e.target.value)} className="flex-grow p-1 border rounded bg-white" />
                                    <button onClick={()=>handlePaymentStatus(p.invoiceId, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                                    <button onClick={()=>handlePaymentStatus(p.invoiceId, 'Paid')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Verify</button>
                                   </div>
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No payments pending verification.</p>}
                    </div>
                );
            case 'History':
                return (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100"><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Remarks</th><th className="p-2">Proof</th><th className="p-2">Actions</th></tr></thead>
                            <tbody>
                            {student.paymentHistory && student.paymentHistory.length > 0 ? [...student.paymentHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                <tr key={p.invoiceId} className="border-b">
                                    <td className="p-2">{p.date}</td>
                                    <td className="p-2">NPR {p.amount.toLocaleString()}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            p.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            p.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{p.status}</span>
                                    </td>
                                    <td className="p-2 italic text-gray-600">{p.remarks}</td>
                                    <td className="p-2">
                                        {p.screenshotUrl ? (
                                            <button onClick={() => setViewingScreenshot(p.screenshotUrl!)} className="text-blue-600 hover:underline font-semibold">View</button>
                                        ) : p.method === 'Cash' ? (
                                            <span className="text-gray-400">Cash</span>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <button onClick={() => handleRevertClick(p)} className="text-red-600 hover:underline font-semibold text-xs">Revert</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={6} className="text-center p-4">No history.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        {viewingScreenshot && <ScreenshotViewer imageUrl={viewingScreenshot} onClose={() => setViewingScreenshot(null)} />}
        <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-brand-dark">Manage Fees: {student.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="border-b mb-4">
              {['Fee Structure', 'Add Charge', 'Record Cash Payment', 'Verify Payments', 'History'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-4 font-semibold ${activeTab === tab ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}>{tab}</button>
              ))}
            </div>
            <div>
                {renderActiveTab()}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
            <button onClick={() => { onSave(student); onClose(); }} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Changes</button>
          </div>
        </div>
        <ConfirmModal
            isOpen={!!paymentToRevert}
            title="Revert Transaction"
            message={`Are you sure you want to revert this payment of NPR ${paymentToRevert?.amount.toLocaleString()}? This will remove the payment record and increase the student's outstanding balance. This action cannot be undone.`}
            onConfirm={handleConfirmRevert}
            onCancel={() => setPaymentToRevert(null)}
            confirmText="Yes, Revert"
            cancelText="Cancel"
        />
      </div>
    );
};

const ManagePaymentMethods = () => {
    const [qrs, setQrs] = useLocalStorage<PaymentQRCode[]>('paymentQRCodes', []);
    const [isEnabled, setIsEnabled] = useLocalStorage<boolean>('onlinePaymentsEnabled', true);
    
    const [newTitle, setNewTitle] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [qrToDelete, setQrToDelete] = useState<PaymentQRCode | null>(null);

    const handleAddQr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newImageFile) {
            alert('Please provide a title and select a QR code image.');
            return;
        }

        try {
            const imageUrl = await imageFileToDataUrl(newImageFile, { maxWidth: 300, maxHeight: 300, quality: 0.9 });
            const newQr: PaymentQRCode = {
                id: Date.now(),
                title: newTitle.trim(),
                imageUrl,
            };
            setQrs([...qrs, newQr]);
            setNewTitle('');
            setNewImageFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
            setMessage('New payment method added successfully.');
        } catch (error) {
            setMessage('Error adding new method. Please try again.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteClick = (qr: PaymentQRCode) => {
        setQrToDelete(qr);
    };

    const handleConfirmDelete = () => {
        if (qrToDelete) {
            const updatedQrs = qrs.filter(qr => qr.id !== qrToDelete.id);
            setQrs(updatedQrs);
            setMessage('Payment method deleted.');
            setTimeout(() => setMessage(''), 3000);
            setQrToDelete(null);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-bold text-brand-dark">Online Payment Status</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isEnabled} onChange={() => setIsEnabled(!isEnabled)} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{isEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
            </div>

            <div>
                <h3 className="text-lg font-bold text-brand-dark mb-4">Current Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {qrs.map(qr => (
                        <div key={qr.id} className="p-4 border rounded-lg text-center relative group">
                             <img src={qr.imageUrl} alt={qr.title} className="w-32 h-32 mx-auto border p-1 rounded-md bg-white mb-2" />
                             <p className="font-semibold">{qr.title}</p>
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                                <button 
                                    onClick={() => handleDeleteClick(qr)} 
                                    className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Delete
                                </button>
                             </div>
                        </div>
                    ))}
                    {qrs.length === 0 && <p className="text-gray-500 md:col-span-3 text-center">No payment methods have been added.</p>}
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Add New Payment Method</h3>
                {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
                <form onSubmit={handleAddQr} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium">Payment Method Title</label>
                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g., Fonepay" className="mt-1 w-full p-2 border rounded-md bg-white"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">QR Code Image</label>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={e => setNewImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 h-10">Add Method</button>
                </form>
            </div>
            
            <ConfirmModal
                isOpen={!!qrToDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the payment method "${qrToDelete?.title}"? This cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setQrToDelete(null)}
                confirmText="Delete"
            />
        </div>
    );
};

const ManageFees: React.FC = () => {
    const [students, setStudents] = useState<Student[]>(getStudentsFromStorage);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        saveItems('students', students);
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students
            .filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(student =>
                statusFilter === 'All' || getStudentFeeStatusForFilter(student) === statusFilter
            );
    }, [students, searchTerm, statusFilter]);

    const handleSaveStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
        setSelectedStudent(null);
    };

    const handleViewDetails = (student: Student) => {
        setSelectedStudent(student);
    };

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Fee Management</h1>
            
             <div className="border-b mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('Overview')} className={`py-2 px-1 border-b-2 font-semibold text-sm ${activeTab === 'Overview' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500'}`}>
                        Student Fee Overview
                    </button>
                    <button onClick={() => setActiveTab('PaymentMethods')} className={`py-2 px-1 border-b-2 font-semibold text-sm ${activeTab === 'PaymentMethods' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500'}`}>
                        Manage Payment Methods
                    </button>
                </nav>
            </div>

            {activeTab === 'Overview' && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Student Name/ID</label>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Filter by Status</label>
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Outstanding">Outstanding</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                    <option value="Fee Not Set">Fee Not Set</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm">Student</th>
                                        <th className="p-3 font-semibold text-sm">Outstanding Balance</th>
                                        <th className="p-3 font-semibold text-sm">Last Payment</th>
                                        <th className="p-3 font-semibold text-sm">Status</th>
                                        <th className="p-3 font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredStudents.map(student => {
                                        const { outstandingBalance, lastPaymentDate } = calculateFeeDetails(student);
                                        const status = getStudentFeeStatus(student);
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium flex items-center">
                                                    <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3 object-cover"/>
                                                    <div>
                                                        {student.name}
                                                        <p className="text-xs text-gray-500 font-mono">{student.studentId}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3 font-mono">NPR {outstandingBalance.toLocaleString()}</td>
                                                <td className="p-3 font-mono text-xs">{lastPaymentDate}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${status.color}`}>{status.text}</span>
                                                </td>
                                                <td className="p-3">
                                                    <button onClick={() => handleViewDetails(student)} className="text-sm font-semibold text-blue-600 hover:underline">Manage</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'PaymentMethods' && <ManagePaymentMethods />}
            
            {selectedStudent && (
                <FeeManagementModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    onSave={handleSaveStudent}
                />
            )}
        </div>
    );
};

export default ManageFees;
