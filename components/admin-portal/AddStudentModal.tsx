import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Application } from '../../types';
import { COURSES } from '../../constants';
import { compressImage } from '../../services/imageCompressionService';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddStudent: (newApplication: Application, password: string) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onAddStudent }) => {
    const initialState = {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        socialMediaUrl: '',
        program: COURSES[0].title,
        password: '',
        studentId: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
    const [studentIdError, setStudentIdError] = useState('');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const studentIdRegex = /^S\d{5}$/;

    const selectedCourse = useMemo(() => {
        return COURSES.find(c => c.title === formData.program);
    }, [formData.program]);

    useEffect(() => {
        setSelectedPapers([]);
    }, [formData.program]);

    const validateStudentId = (id: string) => {
        if (!id) {
            setStudentIdError('Student ID is required.');
            return false;
        }
        if (!studentIdRegex.test(id)) {
            setStudentIdError("Student ID must start with 'S' followed by 5 digits (e.g., S12345).");
            return false;
        }
        setStudentIdError('');
        return true;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setFormData(initialState); // Reset form when modal opens
            setSelectedPapers([]);
            setStudentIdError('');
            setDocumentFile(null);
            setPhotoFile(null);
            setPhotoPreviewUrl(null);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, initialState]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'studentId') {
            validateStudentId(value);
        }
    };

    const handlePaperSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        
        if (selectedCourse?.options && selectedCourse?.maxOptions) {
            const currentOptions = selectedPapers.filter(p => selectedCourse.options!.includes(p));
             if (checked && currentOptions.length >= selectedCourse.maxOptions) {
                e.preventDefault();
                return;
            }
        }

        setSelectedPapers(prev => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter(p => p !== value);
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'document') {
            setDocumentFile(e.target.files ? e.target.files[0] : null);
        } else if (e.target.name === 'photo') {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setPhotoFile(file);
                setPhotoPreviewUrl(URL.createObjectURL(file));
            } else {
                setPhotoFile(null);
                setPhotoPreviewUrl(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateStudentId(formData.studentId)) {
            return;
        }

        const { password, ...applicationData } = formData;

        const photoUrl = photoFile
            ? await compressImage(photoFile, { maxWidth: 200, maxHeight: 200, quality: 0.8 })
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random&color=fff`;
        
        const newApplication: Application = {
            id: Date.now(),
            fullName: applicationData.fullName,
            email: applicationData.email,
            phone: applicationData.phone,
            address: applicationData.address,
            dob: applicationData.dob,
            socialMediaUrl: applicationData.socialMediaUrl,
            program: applicationData.program,
            selectedPapers: selectedPapers,
            studentId: applicationData.studentId,
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'Approved',
            documentUrl: documentFile ? '#' : undefined, // Placeholder URL
            photoUrl: photoUrl
        };
        onAddStudent(newApplication, password);
    };
    
    const maxOptionsReached = useMemo(() => {
        if (!selectedCourse?.options || !selectedCourse?.maxOptions) return false;
        const currentOptions = selectedPapers.filter(p => selectedCourse.options!.includes(p));
        return currentOptions.length >= selectedCourse.maxOptions;
    }, [selectedPapers, selectedCourse]);

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
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b">
                        <h2 className="text-2xl font-bold text-brand-dark">Manual Student Admission</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input 
                                type="text" 
                                name="fullName" 
                                id="fullName" 
                                required 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>

                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                id="studentId"
                                required
                                value={formData.studentId}
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none bg-white ${
                                    studentIdError
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-brand-red focus:border-brand-red'
                                }`}
                                aria-invalid={!!studentIdError}
                                aria-describedby="studentId-error"
                            />
                            {studentIdError && <p id="studentId-error" className="mt-2 text-sm text-red-600">{studentIdError}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                required 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
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
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                required 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>
                         <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea name="address" id="address" rows={2} required value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"></textarea>
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" name="dob" id="dob" required value={formData.dob} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="socialMediaUrl" className="block text-sm font-medium text-gray-700">Social Media URL (Optional)</label>
                            <input type="url" name="socialMediaUrl" id="socialMediaUrl" value={formData.socialMediaUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" placeholder="https://www.linkedin.com/in/..."/>
                        </div>
                        <div>
                            <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
                            <select 
                                name="program" 
                                id="program" 
                                required 
                                value={formData.program}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                            >
                                {COURSES.map(course => (
                                    <option key={course.id} value={course.title}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                        {selectedCourse?.papers && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Papers</label>
                                <div className="mt-2 border p-3 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
                                    {selectedCourse.options && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-600 mb-2">
                                                Select Papers {selectedCourse.maxOptions ? `(Choose up to ${selectedCourse.maxOptions})` : ''}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {selectedCourse.options.map(paper => (
                                                    <label key={paper} className={`flex items-center space-x-2 ${maxOptionsReached && !selectedPapers.includes(paper) ? 'cursor-not-allowed text-gray-400' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            value={paper}
                                                            checked={selectedPapers.includes(paper)}
                                                            onChange={handlePaperSelection}
                                                            disabled={maxOptionsReached && !selectedPapers.includes(paper)}
                                                            className="rounded border-gray-300 text-brand-red shadow-sm focus:border-brand-red focus:ring focus:ring-offset-0 focus:ring-red-200 focus:ring-opacity-50 disabled:bg-gray-200"
                                                        />
                                                        <span>{paper}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!selectedCourse.essentials && !selectedCourse.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedCourse.papers.map(paper => (
                                                <label key={paper} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        value={paper}
                                                        checked={selectedPapers.includes(paper)}
                                                        onChange={handlePaperSelection}
                                                        className="rounded border-gray-300 text-brand-red shadow-sm"
                                                    />
                                                    <span>{paper}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Student Photo</label>
                            <div className="mt-1 flex items-center gap-4">
                                <img src={photoPreviewUrl || 'https://via.placeholder.com/100'} alt="Photo preview" className="w-20 h-20 rounded-full object-cover border" />
                                <input 
                                    type="file" 
                                    name="photo" 
                                    id="photo"
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Transcript/Certificate (Optional)</label>
                            <input 
                                type="file" 
                                name="document" 
                                id="document" 
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Admit Student</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;