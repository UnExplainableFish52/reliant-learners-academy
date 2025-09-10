import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Student } from '../../types';
import { COURSES, TEACHER_RATINGS } from '../../constants';

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onSave: (updatedStudent: Student) => void;
}

type Tab = 'Overview' | 'Academics' | 'Finances' | 'Reviews';

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-md text-gray-900">{value}</dd>
    </div>
);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student, onSave }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Student>(student);
    const modalRef = useRef<HTMLDivElement>(null);

    const feeSummary = useMemo(() => {
        const totalFee = student.totalFee || 0;
        const discount = student.discount || 0;
        const netFee = totalFee - discount;
        const paidAmount = student.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
        const outstanding = netFee - paidAmount;
        return { totalFee, discount, netFee, paidAmount, outstanding };
    }, [student]);


    const allPapersMap = useMemo(() => {
        const map = new Map<string, string>();
        COURSES.forEach(course => {
            course.papers.forEach(paper => {
                const code = paper.split(':')[0].trim();
                map.set(code, paper);
            });
        });
        return map;
    }, []);

    const getFullPaperName = (paperCode: string) => {
        return allPapersMap.get(paperCode) || paperCode;
    };
    
    const overallAttendance = useMemo(() => {
        if (!student.attendance || Object.keys(student.attendance).length === 0) {
            return 'N/A';
        }
        const attendanceValues = Object.values(student.attendance);
        const total = attendanceValues.reduce((sum, current) => sum + current, 0);
        const average = total / attendanceValues.length;
        return `${average.toFixed(1)}%`;
    }, [student.attendance]);

    const studentReviews = useMemo(() => {
        return TEACHER_RATINGS.filter(rating => rating.studentId === student.id);
    }, [student.id]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setFormData(student);
            setIsEditing(false);
            setActiveTab('Overview'); 
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, student, onClose]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = () => {
        onSave(formData);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setFormData(student);
        setIsEditing(false);
    };
    

    if (!isOpen) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return isEditing ? (
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input name="name" value={formData.name} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                <input name="studentId" value={formData.studentId} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input name="phone" type="tel" value={formData.phone} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input name="address" value={formData.address} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Social Media URL</label>
                                <input type="url" name="socialMediaUrl" value={formData.socialMediaUrl || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Level</label>
                                <select name="currentLevel" value={formData.currentLevel} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option>Applied Knowledge</option>
                                    <option>Applied Skills</option>
                                    <option>Strategic Professional</option>
                                </select>
                            </div>
                        </div>
                    </form>
                ) : (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                        <DetailRow label="Full Name" value={student.name} />
                        <DetailRow label="Student ID" value={student.studentId} />
                        <DetailRow label="Email Address" value={student.email} />
                        <DetailRow label="Phone Number" value={student.phone} />
                        <DetailRow label="Date of Birth" value={student.dob} />
                        <DetailRow label="Address" value={student.address} />
                         {student.socialMediaUrl && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Social Media</dt>
                                <dd className="mt-1 text-md text-gray-900">
                                    <a href={student.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline break-all">
                                        {student.socialMediaUrl}
                                    </a>
                                </dd>
                            </div>
                        )}
                        <DetailRow label="Enrollment Date" value={student.enrollmentDate} />
                        <DetailRow label="Current Level" value={student.currentLevel} />
                        <DetailRow label="Overall Attendance" value={overallAttendance} />
                    </dl>
                );
            case 'Academics':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-brand-dark">Enrolled Papers</h3>
                            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md">
                                {student.enrolledPapers.map(code => <li key={code}>{getFullPaperName(code)}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-brand-dark">Mock Exam Results History</h3>
                            <div className="border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Paper</th>
                                            <th className="p-2 text-center">Score</th>
                                            <th className="p-2 text-center">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(student.grades || {}).length > 0 ? (
                                            Object.entries(student.grades || {}).flatMap(([code, grades]) => 
                                                grades.map((grade, index) => (
                                                    <tr key={`${code}-${index}`}>
                                                        <td className="p-2">{getFullPaperName(code)}</td>
                                                        <td className="p-2 text-center font-mono">{grade.score}</td>
                                                        <td className="p-2 text-center font-mono">{grade.date}</td>
                                                    </tr>
                                                ))
                                            ).sort((a,b) => new Date(b.props.children[2].props.children).getTime() - new Date(a.props.children[2].props.children).getTime())
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-gray-500">No mock results recorded.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Finances':
                return (
                    <div className="space-y-6">
                        <div className="bg-brand-beige p-4 rounded-lg shadow-inner">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-1"><DetailRow label="Total Fee" value={`NPR ${feeSummary.totalFee.toLocaleString()}`}/></div>
                                <div className="col-span-1"><DetailRow label="Discount" value={`NPR ${feeSummary.discount.toLocaleString()}`}/></div>
                                <div className="col-span-2"><DetailRow label="Net Payable" value={`NPR ${feeSummary.netFee.toLocaleString()}`}/></div>
                                <div className="col-span-2"><DetailRow label="Amount Paid" value={`NPR ${feeSummary.paidAmount.toLocaleString()}`}/></div>
                                <div className="col-span-2"><p className="text-sm font-medium text-gray-500">Outstanding</p><p className="mt-1 text-2xl font-bold text-brand-red">NPR {feeSummary.outstanding.toLocaleString()}</p></div>
                            </div>
                            {student.feeRemarks && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-medium text-gray-500">Admin Remarks</p>
                                    <p className="text-sm text-gray-700 italic">"{student.feeRemarks}"</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-brand-dark">Payment History</h3>
                             <div className="border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Date</th>
                                            <th className="p-2 text-left">Method</th>
                                            <th className="p-2 text-right">Amount</th>
                                            <th className="p-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {student.paymentHistory && student.paymentHistory.length > 0 ? (
                                            student.paymentHistory.map(p => (
                                                <tr key={p.invoiceId}>
                                                    <td className="p-2 font-mono">{p.date}</td>
                                                    <td className="p-2">{p.method}</td>
                                                    <td className="p-2 text-right font-mono">NPR {p.amount.toLocaleString()}</td>
                                                    <td className="p-2 text-center">
                                                         <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : p.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                                                         {p.rejectionReason && <p className="text-xs text-red-600 mt-1 italic">{p.rejectionReason}</p>}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No payment history.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                );
            case 'Reviews':
                 return (
                    <div>
                        {studentReviews.length > 0 ? (
                            <div className="space-y-4">
                                {studentReviews.map(review => (
                                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-brand-dark">Feedback for {review.teacherName}</p>
                                                <p className="text-sm text-gray-500">{review.classTopic}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <StarRating rating={review.rating} />
                                                <p className="text-xs text-gray-400 mt-1 font-mono">{review.date}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-gray-700 italic">"{review.feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No feedback submitted by this student.</p>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full border-2 border-brand-red" />
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark">{student.name}</h2>
                            <p className="text-gray-500 font-mono">{student.studentId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {(['Overview', 'Academics', 'Finances', 'Reviews'] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${
                                        activeTab === tab
                                            ? 'border-brand-red text-brand-red'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        {renderTabContent()}
                    </div>
                </div>
                
                 {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSaveClick} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700">Save Changes</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} disabled={activeTab !== 'Overview'} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Edit Details</button>
                            <button onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Close</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;