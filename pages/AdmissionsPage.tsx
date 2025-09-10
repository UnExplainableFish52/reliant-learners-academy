import React, { useState, useMemo, useEffect } from 'react';
import type { Application } from '../types.ts';
import { COURSES } from '../constants.ts';
import { compressImage } from '../services/imageCompressionService.ts';
import AnimatedSection from '../components/AnimatedSection.tsx';
import { getItems, saveItems } from '../services/dataService.ts';

const AdmissionsPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        socialMediaUrl: '',
        program: 'ACCA Applied Knowledge',
        selectedPapers: [] as string[],
        document: null as File | null,
        photo: null as File | null,
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCourse = useMemo(() => {
        return COURSES.find(c => c.title === formData.program);
    }, [formData.program]);

    useEffect(() => {
        // When program changes, reset selected papers.
        setFormData(prev => ({
            ...prev,
            selectedPapers: []
        }));
    }, [formData.program]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaperSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        
        const currentOptions = formData.selectedPapers.filter(p => selectedCourse?.options?.includes(p));

        if (checked && selectedCourse?.maxOptions && currentOptions.length >= selectedCourse.maxOptions) {
            e.preventDefault(); // Prevent checking
            return;
        }

        setFormData(prev => {
            const papers = prev.selectedPapers;
            if (checked) {
                return { ...prev, selectedPapers: [...papers, value] };
            } else {
                return { ...prev, selectedPapers: papers.filter(p => p !== value) };
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const fileToBase64 = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
        };

        const photoUrl = formData.photo ? await compressImage(formData.photo, { maxWidth: 200, maxHeight: 200, quality: 0.8 }) : undefined;
        const documentUrl = formData.document ? await fileToBase64(formData.document) : undefined;
        
        const newApplication: Application = {
            id: Date.now(),
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            dob: formData.dob,
            socialMediaUrl: formData.socialMediaUrl,
            program: formData.program,
            selectedPapers: formData.selectedPapers,
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            photoUrl,
            documentUrl,
            documentName: formData.document?.name,
        };
        
        const existingApplications = getItems<Application[]>('pendingApplications', []);
        saveItems('pendingApplications', [newApplication, ...existingApplications]);

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const selectedOptionalPapersCount = formData.selectedPapers.filter(p => selectedCourse?.options?.includes(p)).length;
    const maxOptionsReached = selectedCourse?.maxOptions ? selectedOptionalPapersCount >= selectedCourse.maxOptions : false;

    return (
        <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Admissions</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">Start your journey with Reliant Learners Academy today.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <AnimatedSection className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-red mb-6">Online Application Form</h2>
                        {isSubmitted ? (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                                <p className="font-bold">Application Submitted!</p>
                                <p>Thank you for applying. Our admissions team will review your application. If approved, you will receive an email with your new Student ID and a temporary password to log in to the Student Portal.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" name="fullName" id="fullName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} />
                                </div>
                                 <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea name="address" id="address" rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="dob" id="dob" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="socialMediaUrl" className="block text-sm font-medium text-gray-700">Social Media Profile URL (Optional)</label>
                                    <input type="url" name="socialMediaUrl" id="socialMediaUrl" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" onChange={handleChange} placeholder="https://www.linkedin.com/in/..."/>
                                </div>
                                <div>
                                    <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program of Interest</label>
                                    <select name="program" id="program" required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red" onChange={handleChange} value={formData.program}>
                                        {COURSES.map(course => <option key={course.id}>{course.title}</option>)}
                                    </select>
                                </div>

                                {selectedCourse?.papers && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Papers</label>
                                        <div className="mt-2 border p-3 rounded-md bg-gray-50">
                                            {selectedCourse.essentials && (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Essentials (Compulsory)</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {selectedCourse.essentials.map(paper => (
                                                            <label key={paper} className="flex items-center space-x-2 text-gray-500">
                                                                <input type="checkbox" checked readOnly className="rounded border-gray-300 text-brand-red shadow-sm focus:ring-brand-red" />
                                                                <span>{paper}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {selectedCourse.options && (
                                                <div>
                                                     <h4 className="font-semibold text-sm text-gray-600 mb-2">
                                                        Select Papers {selectedCourse.maxOptions ? `(Choose up to ${selectedCourse.maxOptions})` : ''}
                                                     </h4>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {selectedCourse.options.map(paper => (
                                                            <label key={paper} className={`flex items-center space-x-2 ${maxOptionsReached && !formData.selectedPapers.includes(paper) ? 'cursor-not-allowed text-gray-400' : ''}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    value={paper}
                                                                    checked={formData.selectedPapers.includes(paper)}
                                                                    onChange={handlePaperSelection}
                                                                    disabled={maxOptionsReached && !formData.selectedPapers.includes(paper)}
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
                                                                checked={formData.selectedPapers.includes(paper)}
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
                                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Upload Your Photo</label>
                                    <input type="file" name="photo" id="photo" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" onChange={handleFileChange} />
                                </div>
                                <div>
                                    <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Transcript/Certificate</label>
                                    <input type="file" name="document" id="document" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" onChange={handleFileChange} />
                                </div>
                                <div>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-red text-white py-3 px-4 rounded-md font-semibold hover:bg-opacity-80 transition-colors disabled:bg-red-300">
                                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                     <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-6">Admission Process</h2>
                        <ol className="space-y-4">
                            <li className="flex items-start">
                                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold">Submit Application</h4>
                                    <p className="text-gray-600 text-base">Fill out the online application form with all the required details and upload your documents.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold">Application Review</h4>
                                    <p className="text-gray-600 text-base">Our admissions team will review your application to ensure all criteria are met.</p>
                                </div>
                            </li>
                             <li className="flex items-start">
                                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold">Receive Offer Letter</h4>
                                    <p className="text-gray-600 text-base">Successful candidates will receive an offer letter via email with details for the next steps.</p>
                                </div>
                            </li>
                             <li className="flex items-start">
                                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                                <div>
                                    <h4 className="font-bold">Pay Admission Fee</h4>
                                    <p className="text-gray-600 text-base">Secure your place by paying the admission fee through our online portal.</p>
                                </div>
                            </li>
                        </ol>
                        <div className="mt-8 bg-brand-beige p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Important Dates</h3>
                            <p><strong>September Intake Deadline:</strong> August 15, {new Date().getFullYear()}</p>
                            <p><strong>Classes Begin:</strong> September 5, {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
};

export default AdmissionsPage;