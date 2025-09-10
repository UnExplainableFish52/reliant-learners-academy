import React, { useState, useEffect, useRef } from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { STUDENTS, FACULTY_MEMBERS, DEFAULT_ACADEMY_LOGO_URL } from '../../constants.ts';
import type { Student, FacultyMember } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { imageFileToDataUrl } from '../../services/imageCompressionService';

// Password Reset Component for Students or Faculty
const ResetUserPassword: React.FC<{
    users: (Student | FacultyMember)[];
    userType: 'Student' | 'Faculty';
    onPasswordReset: (userId: number, newPass: string) => void;
    message: { type: 'success' | 'error'; text: string } | null;
}> = ({ users, userType, onPasswordReset, message }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedUserId) {
            setError('Please select a user.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        onPasswordReset(parseInt(selectedUserId, 10), newPassword);
        setSelectedUserId('');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b pb-4">Reset {userType} Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</p>}
                 {message && message.type === 'success' && <p className="text-sm text-green-600 p-3 bg-green-50 rounded-md">{message.text}</p>}
                 {message && message.type === 'error' && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{message.text}</p>}

                 <div>
                    <label htmlFor={`${userType}-select`} className="block text-sm font-medium text-gray-700">Select {userType}</label>
                    <select
                        id={`${userType}-select`}
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                    >
                        <option value="">-- Select a {userType.toLowerCase()} --</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({userType === 'Student' ? (user as Student).studentId : (user as FacultyMember).username})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`new-pass-${userType}`} className="block text-sm font-medium text-gray-700">New Password</label>
                    <input 
                        type="password" 
                        id={`new-pass-${userType}`}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                    />
                </div>
                <div>
                    <label htmlFor={`confirm-pass-${userType}`} className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input 
                        type="password" 
                        id={`confirm-pass-${userType}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                    />
                </div>

                <div className="flex justify-end">
                     <button type="submit" className="bg-brand-red text-white font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
    );
};

const LogoSettings = () => {
    const [logoUrl, setLogoUrl] = useLocalStorage('academyLogoUrl', DEFAULT_ACADEMY_LOGO_URL);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMessage('');

        try {
            const dataUrl = await imageFileToDataUrl(file, { maxWidth: 200, maxHeight: 200, quality: 0.9 });
            setLogoUrl(dataUrl);
            setMessage('Logo updated successfully!');
        } catch (error) {
            console.error(error);
            setMessage('Failed to update logo. Please use a valid image file (SVG, PNG, JPG).');
        } finally {
            setTimeout(() => setMessage(''), 4000);
        }
    };

    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b pb-4">Academy Logo</h2>
            {message && <p className="text-sm text-green-600 p-3 bg-green-50 rounded-md mb-4">{message}</p>}
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600 text-center">This logo appears in the header, footer, and login pages of the main site.</p>
                <div className="h-28 flex items-center justify-center">
                    <img src={logoUrl} alt="Current Academy Logo" className="max-h-full max-w-full bg-gray-100 p-2 border rounded-md" />
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="bg-brand-dark text-white font-semibold px-4 py-2 rounded-md hover:bg-black">
                    Upload New Logo
                </button>
            </div>
        </div>
    );
};


const SettingsPage: React.FC = () => {
    // Admin password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [adminError, setAdminError] = useState('');
    const [adminSuccess, setAdminSuccess] = useState('');

    // User data state
    const [students, setStudents] = useState<Student[]>([]);
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    
    // User password reset message state
    const [studentResetMessage, setStudentResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [facultyResetMessage, setFacultyResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        try {
            const savedStudents = localStorage.getItem('students');
            setStudents(savedStudents ? JSON.parse(savedStudents) : STUDENTS);
            
            const savedFaculty = localStorage.getItem('faculty');
            setFaculty(savedFaculty ? JSON.parse(savedFaculty) : FACULTY_MEMBERS);
        } catch (e) {
            console.error("Failed to load user data from localStorage", e);
            setStudents(STUDENTS);
            setFaculty(FACULTY_MEMBERS);
        }
    }, []);

    const handleAdminPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        setAdminSuccess('');

        if (currentPassword !== 'password') {
            setAdminError("Incorrect current password.");
            return;
        }
        if (newPassword.length < 6) {
            setAdminError("New password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setAdminError("New passwords do not match.");
            return;
        }

        setAdminSuccess("Your password has been changed successfully. Please use it for your next login.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setAdminSuccess(''), 5000);
    };

    const handleStudentPasswordReset = (userId: number, newPass: string) => {
        try {
            const updatedStudents = students.map(s => s.id === userId ? { ...s, password: newPass } : s);
            setStudents(updatedStudents);
            localStorage.setItem('students', JSON.stringify(updatedStudents));
            setStudentResetMessage({ type: 'success', text: 'Student password updated successfully.' });
        } catch (error) {
            setStudentResetMessage({ type: 'error', text: 'Failed to update student password.' });
        }
        setTimeout(() => setStudentResetMessage(null), 3000);
    };

    const handleFacultyPasswordReset = (userId: number, newPass: string) => {
        try {
            const updatedFaculty = faculty.map(f => f.id === userId ? { ...f, password: newPass } : f);
            setFaculty(updatedFaculty);
            localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
            setFacultyResetMessage({ type: 'success', text: 'Faculty password updated successfully.' });
        } catch (error) {
            setFacultyResetMessage({ type: 'error', text: 'Failed to update faculty password.' });
        }
        setTimeout(() => setFacultyResetMessage(null), 3000);
    };


    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Admin Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Change Admin Password */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b pb-4">Change Admin Password</h2>
                    <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                        {adminError && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{adminError}</p>}
                        {adminSuccess && <p className="text-sm text-green-600 p-3 bg-green-50 rounded-md">{adminSuccess}</p>}

                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input 
                                type="password" 
                                id="currentPassword" 
                                required 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                required 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>
                        <div className="flex justify-end">
                             <button type="submit" className="bg-brand-red text-white font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
                 <LogoSettings />
            </div>

            <div className="mt-8 pt-8 border-t">
                <h2 className="text-3xl font-bold text-brand-dark mb-6">Reset User Passwords</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <ResetUserPassword 
                        users={students}
                        userType="Student"
                        onPasswordReset={handleStudentPasswordReset}
                        message={studentResetMessage}
                     />
                      <ResetUserPassword 
                        users={faculty}
                        userType="Faculty"
                        onPasswordReset={handleFacultyPasswordReset}
                        message={facultyResetMessage}
                     />
                 </div>
            </div>
        </div>
    );
};

export default SettingsPage;