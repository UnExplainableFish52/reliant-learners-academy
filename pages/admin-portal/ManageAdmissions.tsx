import React, { useState, useEffect, useRef } from 'react';
// FIX: Add missing PENDING_APPLICATIONS and STUDENTS imports.
import { PENDING_APPLICATIONS, STUDENTS } from '../../constants.ts';
import type { Application, Student } from '../../types.ts';
import AddStudentModal from '../../components/admin-portal/AddStudentModal.tsx';
import ApplicationDetailModal from '../../components/admin-portal/ApplicationDetailModal.tsx';
import { sendWelcomeEmail, DEFAULT_WELCOME_EMAIL_TEMPLATE } from '../../services/emailService.ts';

type Tab = 'Pending' | 'Approved' | 'Rejected';

const EmailEditorModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const [template, setTemplate] = useState(localStorage.getItem('welcomeEmailTemplate') || DEFAULT_WELCOME_EMAIL_TEMPLATE);

    const handleSave = () => {
        localStorage.setItem('welcomeEmailTemplate', template);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-dark">Customize Welcome Email</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Edit the template below. Use the following placeholders to include dynamic student information:
                        <code className="bg-gray-200 text-sm p-1 rounded-md mx-1">{`{{studentName}}`}</code>
                        <code className="bg-gray-200 text-sm p-1 rounded-md mx-1">{`{{studentId}}`}</code>
                        <code className="bg-gray-200 text-sm p-1 rounded-md mx-1">{`{{password}}`}</code>
                    </p>
                    <textarea
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        rows={15}
                        className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm bg-white"
                    />
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Template</button>
                </div>
            </div>
        </div>
    );
};


const ManageAdmissions: React.FC = () => {
    const [allStudents, setAllStudents] = useState<Student[]>(() => {
        try {
            const saved = localStorage.getItem('students');
            return saved ? JSON.parse(saved) : STUDENTS;
        } catch {
            return STUDENTS;
        }
    });

    const [pending, setPending] = useState<Application[]>(() => {
        try {
            const saved = localStorage.getItem('pendingApplications');
            const savedApps: Application[] = saved ? JSON.parse(saved) : [];
            const combined = [...savedApps];
            const savedIds = new Set(savedApps.map(app => app.id));
            PENDING_APPLICATIONS.forEach(app => {
                if (!savedIds.has(app.id)) {
                    combined.push(app);
                }
            });
            return combined;
        } catch {
            return PENDING_APPLICATIONS;
        }
    });
    
    const [approved, setApproved] = useState<Application[]>(() => {
        try {
            const saved = localStorage.getItem('approvedApplications');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [rejected, setRejected] = useState<Application[]>(() => {
        try {
            const saved = localStorage.getItem('rejectedApplications');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);


     useEffect(() => {
        localStorage.setItem('pendingApplications', JSON.stringify(pending));
    }, [pending]);
    
    useEffect(() => {
        localStorage.setItem('approvedApplications', JSON.stringify(approved));
    }, [approved]);

    useEffect(() => {
        localStorage.setItem('rejectedApplications', JSON.stringify(rejected));
    }, [rejected]);
    
    const getNextStudentId = (): string => {
        const studentIds = allStudents
            .map(s => s.studentId)
            .filter(id => id && id.startsWith('S'))
            .map(id => parseInt(id.substring(1), 10))
            .filter(num => !isNaN(num));

        if (studentIds.length === 0) {
            return 'S12348'; // Fallback starting number
        }

        const maxId = Math.max(...studentIds);
        return `S${(maxId + 1).toString().padStart(5, '0')}`;
    };

    const handleConfirmApproval = async (appId: number, studentId: string, password: string) => {
        const application = pending.find(app => app.id === appId);
        if (!application) return;

        setSelectedApplication(null); // Close modal immediately for better UX

        const enrollmentDate = new Date();
        const dueDate = new Date(enrollmentDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        const newStudent: Student = {
            id: allStudents.length > 0 ? Math.max(...allStudents.map(s => s.id)) + 1 : 1,
            name: application.fullName,
            avatarUrl: application.photoUrl || `https://ui-avatars.com/api/?name=${application.fullName.replace(' ', '+')}`,
            studentId: studentId,
            password: password,
            email: application.email,
            phone: application.phone || 'N/A',
            address: application.address || 'N/A',
            dob: application.dob || 'N/A',
            socialMediaUrl: application.socialMediaUrl,
            enrollmentDate: enrollmentDate.toISOString().split('T')[0],
            currentLevel: application.program.includes('Knowledge') ? 'Applied Knowledge' : application.program.includes('Skills') ? 'Applied Skills' : 'Strategic Professional',
            enrolledPapers: application.selectedPapers?.map(p => p.split(':')[0].trim()) || [],
            totalFee: 0,
            discount: 0,
            grades: {},
            attendance: {},
            paymentHistory: [],
            dueDate: dueDate.toISOString().split('T')[0],
        };

        try {
            const emailResponse = await sendWelcomeEmail({
                studentName: newStudent.name,
                studentEmail: newStudent.email,
                studentId: newStudent.studentId,
                password: password,
            });

            if (emailResponse.success) {
                const updatedStudents = [...allStudents, newStudent];
                setAllStudents(updatedStudents);
                localStorage.setItem('students', JSON.stringify(updatedStudents));
    
                setPending(prev => prev.filter(app => app.id !== appId));
                setApproved(prev => [{ ...application, status: 'Approved', studentId }, ...prev]);
                
                setNotification({ type: 'success', message: `Student account for ${newStudent.name} created. ${emailResponse.message}` });
                setActiveTab('Approved');
            } else {
                 setNotification({ type: 'error', message: `Student not created. Failed to send welcome email. Please try again.` });
            }
        } catch (error) {
            console.error("Error sending welcome email:", error);
            setNotification({ type: 'error', message: `An error occurred while sending the email. Student not created.` });
        } finally {
             setTimeout(() => setNotification(null), 6000); // Hide notification after 6 seconds
        }
    };

    const handleReject = (id: number) => {
        const application = pending.find(app => app.id === id);
        if (application) {
            setPending(pending.filter(app => app.id !== id));
            setRejected(prev => [{ ...application, status: 'Rejected' }, ...prev]);
        }
        setSelectedApplication(null);
    };

    const handleDeleteApplication = (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this application? This cannot be undone.')) {
            if (activeTab === 'Pending') {
                setPending(prev => prev.filter(app => app.id !== id));
            } else if (activeTab === 'Approved') {
                setApproved(prev => prev.filter(app => app.id !== id));
            } else if (activeTab === 'Rejected') {
                setRejected(prev => prev.filter(app => app.id !== id));
            }
        }
    };

    const handleAddStudent = async (newApplication: Application, password: string) => {
        const { studentId } = newApplication;
        
        setIsAddModalOpen(false); // Close modal immediately

        const enrollmentDate = new Date();
        const dueDate = new Date(enrollmentDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        const newStudent: Student = {
            id: allStudents.length > 0 ? Math.max(...allStudents.map(s => s.id)) + 1 : 1,
            name: newApplication.fullName,
            avatarUrl: newApplication.photoUrl || `https://ui-avatars.com/api/?name=${newApplication.fullName.replace(' ', '+')}`,
            studentId: studentId!,
            password: password,
            email: newApplication.email,
            phone: newApplication.phone || 'N/A',
            address: newApplication.address || 'N/A',
            dob: newApplication.dob || 'N/A',
            socialMediaUrl: newApplication.socialMediaUrl,
            enrollmentDate: enrollmentDate.toISOString().split('T')[0],
            currentLevel: newApplication.program.includes('Knowledge') ? 'Applied Knowledge' : newApplication.program.includes('Skills') ? 'Applied Skills' : 'Strategic Professional',
            enrolledPapers: newApplication.selectedPapers?.map(p => p.split(':')[0].trim()) || [],
            totalFee: 0,
            discount: 0,
            grades: {},
            attendance: {},
            paymentHistory: [],
            dueDate: dueDate.toISOString().split('T')[0],
        };
       
        try {
            const emailResponse = await sendWelcomeEmail({
                studentName: newStudent.name,
                studentEmail: newStudent.email,
                studentId: newStudent.studentId,
                password: password,
            });

            if (emailResponse.success) {
                const updatedStudents = [...allStudents, newStudent];
                setAllStudents(updatedStudents);
                localStorage.setItem('students', JSON.stringify(updatedStudents));
                setApproved(prev => [newApplication, ...prev]);
                setNotification({ type: 'success', message: `Manual admission for ${newStudent.name} successful. ${emailResponse.message}` });
                setActiveTab('Approved');
            } else {
                setNotification({ type: 'error', message: `Student created, but failed to send welcome email.` });
            }
        } catch (error) {
            console.error("Error sending welcome email for manual admission:", error);
            setNotification({ type: 'error', message: `Student created, but an error occurred sending the email.` });
        } finally {
            setTimeout(() => setNotification(null), 6000);
        }
    };

    const tabs: { name: Tab, count: number }[] = [
        { name: 'Pending', count: pending.length },
        { name: 'Approved', count: approved.length },
        { name: 'Rejected', count: rejected.length },
    ];
    
    const currentList = {
        Pending: pending,
        Approved: approved,
        Rejected: rejected
    }[activeTab];

    return (
         <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Manage Admissions</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
                    >
                        Customize Welcome Email
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors w-full md:w-auto"
                    >
                        Manual Admission
                    </button>
                </div>
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-md text-sm transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
                    <p className="font-bold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
                    <p>{notification.message}</p>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="border-b border-gray-200 mb-4 overflow-x-auto">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`${
                                    activeTab === tab.name
                                        ? 'border-brand-red text-brand-red'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab.name} <span className="bg-gray-200 text-gray-800 ml-2 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Applicant</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Contact</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Program</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Submitted On</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentList.length > 0 ? currentList.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium flex items-center">
                                         <img src={app.photoUrl || 'https://via.placeholder.com/40'} alt={app.fullName} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                        {app.fullName}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div>{app.email}</div>
                                        <div className="font-mono text-xs text-gray-600">{app.phone || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 text-sm">{app.program}</td>
                                    <td className="p-4 text-sm font-mono">{app.submittedDate}</td>
                                    <td className="p-4 text-center space-x-2 whitespace-nowrap">
                                        {app.status === 'Pending' ? (
                                            <button onClick={() => setSelectedApplication(app)} className="text-sm font-semibold text-blue-600 hover:underline">
                                                View Details
                                            </button>
                                        ) : (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {app.status}
                                            </span>
                                        )}
                                        <button onClick={() => handleDeleteApplication(app.id)} className="text-sm font-semibold text-brand-red hover:underline ml-2">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">No applications in this category.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddStudent={handleAddStudent}
            />
            {selectedApplication && (
                <ApplicationDetailModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onConfirmApproval={handleConfirmApproval}
                    onReject={() => handleReject(selectedApplication.id)}
                    suggestedStudentId={getNextStudentId()}
                />
            )}
            {isEmailModalOpen && <EmailEditorModal onClose={() => setIsEmailModalOpen(false)} />}
        </div>
    );
};

export default ManageAdmissions;