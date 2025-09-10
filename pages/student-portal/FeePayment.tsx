

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { STUDENTS } from '../../constants.ts';
import type { Student, PaymentHistoryItem, PaymentQRCode } from '../../types.ts';
import { useStudent } from '../StudentPortalPage.tsx';
import { compressImage } from '../../services/imageCompressionService.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';


const paymentMethods: PaymentHistoryItem['method'][] = ['eSewa', 'Khalti', 'Mobile Banking', 'ConnectIPS'];

const getStudentsFromStorage = (): Student[] => {
    try {
        const stored = localStorage.getItem('students');
        return stored ? JSON.parse(stored) : STUDENTS;
    } catch {
        return STUDENTS;
    }
};

const FeeSummaryCard = ({ student }: { student: Student }) => {
    const { totalFee, discount, paidAmount, outstandingBalance } = useMemo(() => {
        if (!student) return { totalFee: 0, discount: 0, paidAmount: 0, outstandingBalance: 0 };
        const total = student.totalFee || 0;
        const disc = student.discount || 0;
        const netFee = total - disc;
        const paid = student.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
        return { totalFee: total, discount: disc, paidAmount: paid, outstandingBalance: netFee - paid };
    }, [student]);

    const netFee = totalFee - discount;
    const paidPercentage = netFee > 0 ? Math.min(100, (paidAmount / netFee) * 100) : 100;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Your Fee Summary</h2>
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Fee</span>
                    <span className="font-medium">NPR {totalFee.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">- NPR {discount.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                    <span>Net Payable</span>
                    <span>NPR {netFee.toLocaleString()}</span>
                </div>

                <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${paidPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>Paid: NPR {paidAmount.toLocaleString()}</span>
                        <span>{paidPercentage.toFixed(1)}%</span>
                    </div>
                </div>
                 <div className="bg-red-50 p-4 rounded-lg text-center mt-4">
                    <p className="text-sm font-medium text-brand-red">Outstanding Balance</p>
                    <p className="text-3xl font-black text-brand-red">NPR {outstandingBalance.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500">Next Due Date</p>
                    <p className="font-semibold text-gray-800">{student.dueDate}</p>
                </div>
                {student.feeRemarks && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-500">Admin Remarks:</p>
                        <p className="text-sm text-gray-700 italic">"{student.feeRemarks}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const FeePayment: React.FC = () => {
    const { student: loggedInStudent } = useStudent();
    
    const [allStudents, setAllStudents] = useState<Student[]>(getStudentsFromStorage);
    const [activePaymentTab, setActivePaymentTab] = useState<'qr' | 'proof'>('qr');
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [paymentQRCodes] = useLocalStorage<PaymentQRCode[]>('paymentQRCodes', []);
    const [onlinePaymentsEnabled] = useLocalStorage<boolean>('onlinePaymentsEnabled', true);

    useEffect(() => {
        localStorage.setItem('students', JSON.stringify(allStudents));
    }, [allStudents]);

    const student = useMemo(() => allStudents.find(s => s.id === loggedInStudent.id), [allStudents, loggedInStudent.id]);

    const outstandingBalance = useMemo(() => {
        if (!student) return 0;
        const netFee = (student.totalFee || 0) - (student.discount || 0);
        const paidAmount = student.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
        return netFee - paidAmount;
    }, [student]);

    useEffect(() => {
        if (outstandingBalance > 0) {
            setAmount(outstandingBalance.toString());
        } else {
            setAmount('');
        }
    }, [outstandingBalance]);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setScreenshot(file);
        if (screenshotPreview) {
            URL.revokeObjectURL(screenshotPreview);
        }
        if (file) {
            setScreenshotPreview(URL.createObjectURL(file));
        } else {
            setScreenshotPreview(null);
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid payment amount.' });
            return;
        }
        if (!screenshot) {
            setMessage({ type: 'error', text: 'Please upload a payment screenshot for verification.' });
            return;
        }

        const screenshotUrl = await compressImage(screenshot, { maxWidth: 800, maxHeight: 800, quality: 0.7 });

        const newPayment: PaymentHistoryItem = {
            invoiceId: `INV-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: paymentAmount,
            status: 'Pending Verification',
            method: 'eSewa', // Defaulting as we are using QR
            remarks: remarks.trim() || 'Online payment via QR.',
            screenshotUrl,
        };

        setAllStudents(prev => prev.map(s => 
            s.id === loggedInStudent.id ? { ...s, paymentHistory: [newPayment, ...(s.paymentHistory || [])] } : s
        ));

        setMessage({ type: 'success', text: `Your payment of NPR ${paymentAmount.toLocaleString()} has been submitted for verification.` });
        setAmount('');
        setRemarks('');
        setScreenshot(null);
        setScreenshotPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!student) return <div>Error: Student not found.</div>;
    
    const isOnlinePaymentAvailable = onlinePaymentsEnabled && paymentQRCodes.length > 0;

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Fee Payment</h1>
            {message && (
                <div className={`mb-6 p-4 text-sm rounded-md ${
                    message.type === 'success' ? 'bg-green-100 text-green-800' :
                    message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {message.text}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     {isOnlinePaymentAvailable ? (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">Make a Payment</h2>
                            <div className="border-b mb-4">
                                <button onClick={() => setActivePaymentTab('qr')} className={`py-2 px-4 font-semibold ${activePaymentTab === 'qr' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}>1. Pay with QR</button>
                                <button onClick={() => setActivePaymentTab('proof')} className={`py-2 px-4 font-semibold ${activePaymentTab === 'proof' ? 'border-b-2 border-brand-red text-brand-red' : 'text-gray-500'}`}>2. Submit Proof</button>
                            </div>
                            {activePaymentTab === 'qr' && (
                                <div className="text-center">
                                    <p className="mb-4 text-gray-600">Scan a QR code below using your preferred payment app.</p>
                                    <div className="flex justify-center flex-wrap gap-8">
                                        {paymentQRCodes.map(qr => (
                                            <div key={qr.id} className="p-4 border rounded-lg">
                                                <img src={qr.imageUrl} alt={`${qr.title} QR Code`} className="w-40 h-40"/>
                                                <p className="font-bold mt-2">{qr.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 font-semibold text-brand-red">After payment, please go to the "Submit Proof" tab to upload your screenshot.</p>
                                </div>
                            )}
                            {activePaymentTab === 'proof' && (
                                <form onSubmit={handleSubmitPayment} className="space-y-4">
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount Paid (NPR)</label>
                                        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">Upload Screenshot</label>
                                        <input type="file" id="screenshot" ref={fileInputRef} onChange={handleScreenshotChange} required accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                                    </div>
                                    {screenshotPreview && (
                                        <div className="mt-2 p-2 border rounded-lg">
                                            <p className="text-xs font-semibold mb-1">Preview:</p>
                                            <img src={screenshotPreview} alt="Screenshot preview" className="max-h-40 rounded"/>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
                                        <textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white" placeholder="e.g., Payment for August installment"></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-brand-red text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700">
                                        Submit for Verification
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">Make a Payment</h2>
                            <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg text-center">
                                <h3 className="font-bold text-lg">Online Payments Unavailable</h3>
                                <p>Online payments are currently disabled. Please contact the administration office for alternative payment methods.</p>
                            </div>
                        </div>
                    )}
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-brand-dark mb-4">Payment History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm">Date</th>
                                        <th className="p-3 font-semibold text-sm">Amount (NPR)</th>
                                        <th className="p-3 font-semibold text-sm">Status</th>
                                        <th className="p-3 font-semibold text-sm">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {student.paymentHistory && student.paymentHistory.length > 0 ? student.paymentHistory.map(item => (
                                        <tr key={item.invoiceId} className="hover:bg-gray-50 text-sm">
                                            <td className="p-3">{item.date}</td>
                                            <td className="p-3 font-mono">{item.amount.toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    item.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{item.status}</span>
                                            </td>
                                            <td className="p-3">
                                                <p>{item.method} - {item.remarks || 'No remarks'}</p>
                                                <div className="flex items-center gap-4 mt-1 text-xs">
                                                    {item.screenshotUrl && <a href={item.screenshotUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">View Proof</a>}
                                                    {item.status === 'Paid' && <button className="font-semibold text-gray-600 hover:underline">Download Invoice</button>}
                                                </div>
                                                {item.rejectionReason && <p className="text-xs text-red-600 mt-1 italic">Reason: {item.rejectionReason}</p>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="text-center p-8 text-gray-500">No payment history found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <FeeSummaryCard student={student} />
                </div>
            </div>
        </div>
    );
};

export default FeePayment;