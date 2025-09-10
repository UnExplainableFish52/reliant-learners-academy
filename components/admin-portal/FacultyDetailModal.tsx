import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { FacultyMember, CalendarEvent, TeacherRating } from '../../types';
import { CALENDAR_EVENTS, TEACHER_RATINGS, COURSES } from '../../constants';
import { compressImage } from '../../services/imageCompressionService';
import { getItems } from '../../services/dataService';

interface FacultyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    faculty: FacultyMember;
    onSave: (updatedFaculty: FacultyMember) => void;
}

type Tab = 'Overview' | 'Teaching Schedule' | 'Student Reviews';

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

const FacultyDetailModal: React.FC<FacultyDetailModalProps> = ({ isOpen, onClose, faculty, onSave }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<FacultyMember>(faculty);
    const modalRef = useRef<HTMLDivElement>(null);

    const [teachingSchedule, setTeachingSchedule] = useState<CalendarEvent[]>([]);
    const [studentReviews, setStudentReviews] = useState<TeacherRating[]>([]);

    const allPapers = useMemo(() => COURSES.flatMap(course => course.papers), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setFormData(faculty);
            setIsEditing(false);
            setActiveTab('Overview');

            // Load dynamic data from localStorage
            const allCalendarEvents = getItems<CalendarEvent[]>('calendarEvents', CALENDAR_EVENTS);
            setTeachingSchedule(
                allCalendarEvents
                    .filter(event => event.instructor === faculty.name && event.type === 'class')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            );

            const allTeacherRatings = getItems<TeacherRating[]>('teacherRatings', TEACHER_RATINGS);
            setStudentReviews(
                allTeacherRatings
                    .filter(rating => rating.teacherId === faculty.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            );
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, faculty, onClose]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
            setFormData(prev => ({ ...prev, imageUrl: base64 }));
        }
    };

    const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedPapers: selectedOptions }));
    };

    const handleSaveClick = () => {
        onSave(formData);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setFormData(faculty);
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
                                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                                <input name="qualification" value={formData.qualification} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
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
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input name="dob" type="date" value={formData.dob || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Social Media URL</label>
                                <input name="socialMediaUrl" type="url" value={formData.socialMediaUrl || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleFormChange} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Biography</label>
                            <textarea name="bio" value={formData.bio} onChange={handleFormChange} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assigned Papers</label>
                            <select multiple value={formData.assignedPapers} onChange={handlePaperChange} className="mt-1 block w-full h-32 p-2 border rounded-md bg-white">
                                {allPapers.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple faculty.</p>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <DetailRow label="Full Name" value={faculty.name} />
                            <DetailRow label="Qualification" value={faculty.qualification} />
                            <DetailRow label="Email Address" value={faculty.email} />
                            <DetailRow label="Phone Number" value={faculty.phone} />
                            <DetailRow label="Date of Birth" value={faculty.dob || 'N/A'} />
                            <DetailRow label="Address" value={faculty.address} />
                             {faculty.socialMediaUrl && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Social Media</dt>
                                    <dd className="mt-1 text-md text-gray-900">
                                        <a href={faculty.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline break-all">
                                            {faculty.socialMediaUrl}
                                        </a>
                                    </dd>
                                </div>
                             )}
                        </dl>
                        <div>
                             <h3 className="font-semibold text-lg mb-2 text-brand-dark border-b pb-2">Biography</h3>
                             <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{faculty.bio}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg mb-2 text-brand-dark border-b pb-2">Assigned Papers</h3>
                            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
                                {faculty.assignedPapers.map(paper => <li key={paper}>{paper}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            case 'Teaching Schedule':
                return (
                     <div>
                        {teachingSchedule.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left font-semibold">Date</th>
                                            <th className="p-3 text-left font-semibold">Time</th>
                                            <th className="p-3 text-left font-semibold">Paper</th>
                                            <th className="p-3 text-left font-semibold">Topic</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {teachingSchedule.map(event => (
                                            <tr key={event.id}>
                                                <td className="p-3 font-mono">{event.date}</td>
                                                <td className="p-3">{event.startTime} - {event.endTime}</td>
                                                <td className="p-3">{event.paper}</td>
                                                <td className="p-3">{event.title}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No classes found in the schedule.</p>
                        )}
                    </div>
                );
            case 'Student Reviews':
                return (
                     <div>
                        {studentReviews.length > 0 ? (
                            <div className="space-y-4">
                                {studentReviews.map(review => (
                                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-brand-dark">Feedback from {review.studentName}</p>
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
                            <p className="text-center text-gray-500 py-8">No feedback submitted for this faculty member yet.</p>
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
                        <img src={isEditing ? formData.imageUrl : faculty.imageUrl} alt={faculty.name} className="w-16 h-16 rounded-full border-2 border-brand-red object-cover" />
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark">{faculty.name}</h2>
                            <p className="text-gray-500">{faculty.qualification}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {(['Overview', 'Teaching Schedule', 'Student Reviews'] as Tab[]).map(tab => (
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

export default FacultyDetailModal;
