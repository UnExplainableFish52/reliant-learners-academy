import React, { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../../types';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveEvent: (eventData: CalendarEvent) => void;
    assignedPapers: string[];
    eventToEdit: CalendarEvent | null;
    defaultDate: Date;
}

// Helper to get YYYY-MM-DD from a Date object in local timezone
const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSaveEvent, assignedPapers, eventToEdit, defaultDate }) => {
    const [formData, setFormData] = useState<Omit<CalendarEvent, 'id' | 'instructor'>>({
        type: 'class',
        paper: assignedPapers[0] || '',
        title: '',
        date: getLocalDateString(new Date()),
        startTime: '09:00',
        endTime: '11:00',
        joinLink: '',
    });
    
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                 setFormData({
                    type: eventToEdit.type,
                    paper: eventToEdit.paper || assignedPapers[0] || '',
                    title: eventToEdit.title,
                    date: eventToEdit.date,
                    startTime: eventToEdit.startTime || '',
                    endTime: eventToEdit.endTime || '',
                    joinLink: eventToEdit.joinLink || '',
                });
            } else {
                 setFormData({
                    type: 'class',
                    paper: assignedPapers[0] || '',
                    title: '',
                    date: getLocalDateString(defaultDate),
                    startTime: '09:00',
                    endTime: '11:00',
                    joinLink: '',
                });
            }
        }
    }, [isOpen, eventToEdit, assignedPapers, defaultDate]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            // Start with the latest state and apply the current change
            const newState = { ...prev, [name]: value };

            // If the type was changed, apply additional logic
            if (name === 'type') {
                if (value === 'deadline' || value === 'exam') {
                    newState.joinLink = ''; // Reset link for non-class events
                }
                if (value === 'deadline') {
                    // Deadlines are all-day events
                    newState.startTime = '';
                    newState.endTime = '';
                }
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveEvent({
            ...formData,
            id: eventToEdit?.id || Date.now(),
        });
    };

    if (!isOpen) return null;

    const todayString = getLocalDateString(new Date());

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
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">{eventToEdit ? 'Edit Event' : 'Schedule New Event'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
                            <select 
                                name="type" 
                                id="type" 
                                required 
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                            >
                                <option value="class">Class</option>
                                <option value="exam">Exam</option>
                                <option value="deadline">Deadline</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Paper</label>
                            <select 
                                name="paper" 
                                id="paper" 
                                required 
                                value={formData.paper}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"
                            >
                                {assignedPapers.map(paper => (
                                    <option key={paper} value={paper}>{paper}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title / Topic</label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                required 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input 
                                type="date" 
                                name="date" 
                                id="date" 
                                required 
                                value={formData.date} 
                                onChange={handleChange}
                                min={!eventToEdit ? todayString : undefined}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                            />
                        </div>

                        {formData.type === 'class' && (
                            <div>
                                <label htmlFor="joinLink" className="block text-sm font-medium text-gray-700">Zoom/Meeting Link (Optional)</label>
                                <input 
                                    type="url" 
                                    name="joinLink" 
                                    id="joinLink" 
                                    value={formData.joinLink} 
                                    onChange={handleChange} 
                                    placeholder="https://zoom.us/j/..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                                />
                            </div>
                        )}
                        
                        {(formData.type === 'class' || formData.type === 'exam') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input 
                                        type="time" 
                                        name="startTime" 
                                        id="startTime" 
                                        required={formData.type === 'class'} 
                                        value={formData.startTime} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input 
                                        type="time" 
                                        name="endTime" 
                                        id="endTime" 
                                        required={formData.type === 'class'} 
                                        value={formData.endTime} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">{eventToEdit ? 'Update Event' : 'Schedule Event'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;