import React, { useState, useRef, useEffect } from 'react';
import { FACULTY_MEMBERS } from '../../constants';
import type { FacultyMember } from '../../types';
import { useFaculty } from './hooks.ts';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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
        if (currentPassword !== 'password123') { 
            setError("Incorrect current password.");
            return;
        }

        console.log("Password updated successfully!");
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
    const { facultyMember } = useFaculty();

    const [facultyInfo, setFacultyInfo] = useState<FacultyMember | null>(null);
    const [formData, setFormData] = useState<FacultyMember | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        let allFaculty: FacultyMember[] = FACULTY_MEMBERS;
        try {
            const saved = localStorage.getItem('faculty');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    allFaculty = parsed;
                }
            }
        } catch (e) {
            console.error(`Failed to load faculty from localStorage`, e);
        }
        const currentFaculty = allFaculty.find(f => f.id === facultyMember.id);
        setFacultyInfo(currentFaculty || null);
    }, [facultyMember]);
    
    const handleEditClick = () => {
        setFormData(facultyInfo);
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(null);
        setIsEditing(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (formData) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && formData) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setFormData({ ...formData, imageUrl: base64 });
        }
    };

    const handleSaveChanges = () => {
        if (!formData) return;

        let allFaculty: FacultyMember[] = [];
        try {
            const saved = localStorage.getItem('faculty');
            allFaculty = saved ? JSON.parse(saved) : FACULTY_MEMBERS;
        } catch (e) {
             allFaculty = FACULTY_MEMBERS;
        }

        const updatedFacultyList = allFaculty.map(f => f.id === facultyMember.id ? formData : f);
        localStorage.setItem('faculty', JSON.stringify(updatedFacultyList));
        
        setFacultyInfo(formData);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    if (!facultyInfo) {
        return <div>Loading profile...</div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">My Profile</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6 border-b pb-6">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="relative mb-4 md:mb-0 md:mr-6">
                            <img src={isEditing && formData ? formData.imageUrl : facultyInfo.imageUrl} alt={facultyInfo.name} className="w-32 h-32 rounded-full border-4 border-brand-red object-cover" />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-brand-dark text-white rounded-full p-2 hover:bg-opacity-80"
                                    aria-label="Change profile picture"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </button>
                            )}
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            {isEditing && formData ? (
                                <input name="name" value={formData.name} onChange={handleFormChange} className="text-3xl font-bold p-1 border rounded-md w-full bg-white"/>
                            ) : (
                                <h2 className="text-3xl font-bold">{facultyInfo.name}</h2>
                            )}
                            {isEditing && formData ? (
                                <input name="qualification" value={formData.qualification} onChange={handleFormChange} className="text-brand-red font-semibold p-1 border rounded-md mt-1 w-full bg-white"/>
                            ) : (
                                <p className="text-brand-red font-semibold">{facultyInfo.qualification}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        {!isEditing ? (
                            <button onClick={handleEditClick} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">Edit Profile</button>
                        ) : (
                             <div className="flex gap-2">
                                <button onClick={handleCancelClick} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                                <button onClick={handleSaveChanges} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save</button>
                            </div>
                        )}
                    </div>
                </div>

                {message && <p className="text-sm text-green-600 mb-4 bg-green-50 p-3 rounded-md">{message}</p>}

                {isEditing && formData ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input name="phone" type="tel" value={formData.phone} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input name="dob" type="date" value={formData.dob || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Social Media URL</label>
                                <input name="socialMediaUrl" type="url" value={formData.socialMediaUrl || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Biography</label>
                            <textarea name="bio" value={formData.bio} onChange={handleFormChange} rows={5} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                        </div>
                    </div>
                ) : (
                     <div className="space-y-6">
                         <div>
                            <h3 className="text-xl font-bold text-brand-dark mb-2">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <p><span className="font-semibold">Email:</span> {facultyInfo.email}</p>
                                <p><span className="font-semibold">Phone:</span> {facultyInfo.phone}</p>
                                <p><span className="font-semibold">Date of Birth:</span> {facultyInfo.dob || 'N/A'}</p>
                                {facultyInfo.socialMediaUrl && (
                                    <p><span className="font-semibold">Social Media:</span> <a href={facultyInfo.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline break-all">{facultyInfo.socialMediaUrl}</a></p>
                                )}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-brand-dark mb-2">Biography</h3>
                            <p className="text-gray-700 leading-relaxed">{facultyInfo.bio}</p>
                        </div>
                    </div>
                )}
                
                 <div className="mt-8 border-t pt-6">
                     <h3 className="text-xl font-bold text-brand-dark mb-4">Assigned Papers</h3>
                     <p className="text-xs text-gray-500 mb-2">Assigned papers can only be modified by an administrator.</p>
                     <ul className="space-y-2">
                        {facultyInfo.assignedPapers.map(paper => (
                            <li key={paper} className="p-3 bg-brand-beige rounded-md font-medium">{paper}</li>
                        ))}
                     </ul>
                 </div>
            </div>
            <ChangePasswordCard />
        </div>
    );
};

export default Profile;
