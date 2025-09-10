import React, { useState, useEffect, useRef } from 'react';
import type { FacultyMember, Course } from '../../types.ts';
import { COURSES } from '../../constants.ts';
import { compressImage } from '../../services/imageCompressionService.ts';

interface AddFacultyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFaculty: (newFaculty: FacultyMember) => void;
}

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({ isOpen, onClose, onAddFaculty }) => {
    // FIX: Added 'baseSalary' to the initial state to match the 'FacultyMember' type.
    const initialState = {
        name: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        socialMediaUrl: '',
        qualification: '',
        bio: '',
        password: '',
        baseSalary: 0,
    };
    const [formData, setFormData] = useState(initialState);
    const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedCourses = localStorage.getItem('courses');
        setAllCourses(storedCourses ? JSON.parse(storedCourses) : COURSES);
    }, [isOpen]);

    const allPapers = allCourses.flatMap(course => course.papers);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Reset form state when modal opens
            setFormData(initialState);
            setSelectedPapers([]);
            setProfilePic(null);
            setPreviewUrl(null);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, initialState]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // FIX: Ensured 'baseSalary' is parsed as a number to maintain correct data typing.
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'baseSalary' ? (parseInt(value, 10) || 0) : value });
    };

    const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setSelectedPapers(value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePic(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Creating faculty ${formData.name} with password: ${formData.password}`); // Handle password securely in a real app

        const imageUrl = profilePic
            ? await compressImage(profilePic, { maxWidth: 400, maxHeight: 400, quality: 0.8 })
            : `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '')}/400/400`;

        const newFaculty: FacultyMember = {
            id: Date.now(),
            ...formData,
            imageUrl: imageUrl,
            assignedPapers: selectedPapers,
        };
        onAddFaculty(newFaculty);
    };

    if (!isOpen) return null;

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
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">Register New Faculty</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" name="username" id="username" required value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                    </div>
                    {/* FIX: Replaced single input with a grid to include 'Base Salary'. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
                            <input type="text" name="qualification" id="qualification" required value={formData.qualification} onChange={handleChange} placeholder="e.g., PhD, FCCA" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700">Base Salary (NPR)</label>
                            <input type="number" name="baseSalary" id="baseSalary" required value={formData.baseSalary} onChange={handleChange} placeholder="e.g., 80000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea name="address" id="address" rows={2} required value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" name="dob" id="dob" required value={formData.dob} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="socialMediaUrl" className="block text-sm font-medium text-gray-700">Social Media URL (Optional)</label>
                            <input type="url" name="socialMediaUrl" id="socialMediaUrl" value={formData.socialMediaUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" placeholder="https://www.linkedin.com/in/..."/>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">Set Initial Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            required 
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biography</label>
                        <textarea name="bio" id="bio" rows={3} required value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"></textarea>
                    </div>
                     <div>
                        <label htmlFor="assignedPapers" className="block text-sm font-medium text-gray-700">Assign Papers</label>
                        <select 
                            id="assignedPapers" 
                            name="assignedPapers"
                            multiple 
                            required
                            value={selectedPapers}
                            onChange={handlePaperChange}
                            className="mt-1 block w-full h-32 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                        >
                            {allPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple papers.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                        <div className="mt-1 flex items-center gap-4">
                            <img src={previewUrl || 'https://via.placeholder.com/100'} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border" />
                            <input type="file" name="profilePic" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                        </div>
                    </div>
                </form>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add Faculty Member</button>
                </div>
            </div>
        </div>
    );
};

export default AddFacultyModal;