import React from 'react';
import { useState, useRef } from 'react';
import { useStudent } from '../StudentPortalPage.tsx';
import type { Student } from '../../types.ts';

const ProfileInfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const ChangePasswordCard = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        // In a real app, you'd verify the current password against a server.
        if (currentPassword !== 'password123') { // MOCK: Check against mock password
            setError("Incorrect current password.");
            return;
        }

        console.log("Password updated successfully!"); // In a real app, update this in the backend/localStorage
        setSuccessMessage("Your password has been changed successfully.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-4">Change Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</p>}
                 {successMessage && <p className="text-sm text-green-600 p-3 bg-green-50 rounded-md">{successMessage}</p>}
                <div>
                    <label htmlFor="currentPassword"className="block text-sm font-medium text-gray-700">Current Password</label>
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
                    <label htmlFor="newPassword"className="block text-sm font-medium text-gray-700">New Password</label>
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
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">Confirm New Password</label>
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
                     <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};


const Profile: React.FC = () => {
    const { student } = useStudent();
    const [updateMessage, setUpdateMessage] = useState('');
    const [studentInfo, setStudentInfo] = useState<Student>(student);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateRequest = () => {
        setUpdateMessage('Your update request has been sent to the administration office.');
        setTimeout(() => setUpdateMessage(''), 5000);
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newImageFile = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setStudentInfo(prev => ({ ...prev, avatarUrl: reader.result as string }));
                // In a real app, you would save this change.
            };
            reader.readAsDataURL(newImageFile);
        }
    };

    if (!studentInfo) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="relative w-32 h-32 mx-auto">
                             <img src={studentInfo.avatarUrl} alt={studentInfo.name} className="w-32 h-32 rounded-full border-4 border-brand-red object-cover" />
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-brand-dark text-white rounded-full p-2 hover:bg-opacity-80 transition-colors"
                                aria-label="Change profile picture"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <h2 className="text-2xl font-bold mt-4">{studentInfo.name}</h2>
                        <p className="text-gray-500">{studentInfo.studentId}</p>
                        <p className="mt-2 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full inline-block">
                            Academic Standing: Good
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold">Personal Information</h2>
                             <button onClick={handleUpdateRequest} className="text-sm font-semibold text-blue-600 hover:underline">
                                Request to Update
                            </button>
                        </div>
                         {updateMessage && <p className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">{updateMessage}</p>}
                        <dl className="divide-y divide-gray-200">
                           <ProfileInfoRow label="Full Name" value={studentInfo.name} />
                           <ProfileInfoRow label="Email Address" value={studentInfo.email} />
                           <ProfileInfoRow label="Phone Number" value={studentInfo.phone} />
                           <ProfileInfoRow label="Date of Birth" value={studentInfo.dob} />
                            {studentInfo.socialMediaUrl && (
                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Social Media</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <a href={studentInfo.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline break-all">
                                            {studentInfo.socialMediaUrl}
                                        </a>
                                    </dd>
                                </div>
                            )}
                           <ProfileInfoRow label="Address" value={studentInfo.address} />
                           <ProfileInfoRow label="Emergency Contact" value="Jane Doe (Mother) - +977 9807654321" />
                           <ProfileInfoRow label="Enrolled Since" value={studentInfo.enrollmentDate} />
                           <ProfileInfoRow label="Current Level" value={studentInfo.currentLevel} />
                        </dl>
                    </div>
                </div>
            </div>
             <ChangePasswordCard />
        </div>
    );
};

export default Profile;