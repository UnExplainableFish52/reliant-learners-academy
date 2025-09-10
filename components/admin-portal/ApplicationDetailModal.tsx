import React, { useState, useEffect, useRef } from 'react';
import type { Application } from '../../types';

interface ApplicationDetailModalProps {
    application: Application;
    onClose: () => void;
    onConfirmApproval: (appId: number, studentId: string, password: string) => void;
    onReject: () => void;
    suggestedStudentId: string;
}

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-md text-gray-900">{value || 'N/A'}</p>
    </div>
);

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose, onConfirmApproval, onReject, suggestedStudentId }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [studentId, setStudentId] = useState(suggestedStudentId);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [idError, setIdError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const studentIdRegex = /^S\d{5}$/;

    const validateStudentId = (id: string) => {
        if (!studentIdRegex.test(id)) {
            setIdError("ID must be 'S' followed by 5 digits (e.g., S12345).");
            return false;
        }
        setIdError('');
        return true;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        // Reset form state when modal opens or application changes
        setIsCreatingAccount(false);
        setStudentId(suggestedStudentId);
        setPassword('');
        setConfirmPassword('');
        setIdError('');
        setPasswordError('');
    }, [application, suggestedStudentId]);

    const handleConfirm = () => {
        const isIdValid = validateStudentId(studentId);
        let isPasswordValid = false;

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
        } else if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
        } else {
            setPasswordError('');
            isPasswordValid = true;
        }

        if (isIdValid && isPasswordValid) {
            onConfirmApproval(application.id, studentId, password);
        }
    };

    const handleApproveClick = () => {
        setIsCreatingAccount(true);
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
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-dark">{isCreatingAccount ? 'Create Student Account' : 'Application Details'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {isCreatingAccount ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Set the official Student ID and a temporary password for <span className="font-bold">{application.fullName}</span>. They will be notified to change it upon first login.
                            </p>
                            <div>
                                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                                <input
                                    type="text"
                                    id="studentId"
                                    value={studentId}
                                    onChange={(e) => {
                                        setStudentId(e.target.value);
                                        validateStudentId(e.target.value);
                                    }}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none bg-white ${idError ? 'border-red-500' : 'border-gray-300 focus:ring-brand-red focus:border-brand-red'}`}
                                />
                                {idError && <p className="mt-1 text-xs text-red-600">{idError}</p>}
                            </div>
                             <div>
                                <label htmlFor="password"className="block text-sm font-medium text-gray-700">Initial Password</label>
                                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                            </div>
                             <div>
                                <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                                {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-1/3 text-center">
                                <img src={application.photoUrl || 'https://via.placeholder.com/150'} alt={application.fullName} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-brand-red" />
                                {application.documentUrl && (
                                    <a href={application.documentUrl} download={application.documentName || 'document'} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
                                        View Attached Document
                                    </a>
                                )}
                            </div>
                            <div className="sm:w-2/3">
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                    <DetailRow label="Full Name" value={application.fullName} />
                                    <DetailRow label="Submitted Date" value={application.submittedDate} />
                                    <DetailRow label="Email" value={application.email} />
                                    <DetailRow label="Phone" value={application.phone} />
                                    <DetailRow label="Date of Birth" value={application.dob} />
                                    <DetailRow label="Program" value={application.program} />
                                    <div className="md:col-span-2">
                                        <DetailRow label="Address" value={application.address} />
                                    </div>
                                    {application.socialMediaUrl && (
                                         <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500">Social Media</p>
                                            <a href={application.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-md text-brand-red hover:underline break-all">{application.socialMediaUrl}</a>
                                        </div>
                                    )}
                                    {application.selectedPapers && application.selectedPapers.length > 0 && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500">Selected Papers</p>
                                            <ul className="mt-1 text-md text-gray-900 list-disc list-inside bg-gray-50 p-2 rounded-md">
                                                {application.selectedPapers.map(paper => <li key={paper}>{paper}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    {isCreatingAccount ? (
                        <>
                            <button onClick={() => setIsCreatingAccount(false)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Back</button>
                            <button onClick={handleConfirm} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700">Confirm and Send Email</button>
                        </>
                    ) : (
                        <>
                            <button onClick={onReject} className="bg-red-100 text-red-800 font-semibold px-4 py-2 rounded-md hover:bg-red-200">Reject</button>
                            <button onClick={handleApproveClick} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Approve</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;