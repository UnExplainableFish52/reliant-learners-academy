import React, { useState, useEffect } from 'react';

interface ScheduleTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (scheduledTime: string) => void;
    testTitle: string;
}

// Helper to get YYYY-MM-DD from a Date object in local timezone
const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ScheduleTestModal: React.FC<ScheduleTestModalProps> = ({ isOpen, onClose, onSchedule, testTitle }) => {
    const [date, setDate] = useState(getLocalDateString(new Date()));
    const [time, setTime] = useState('09:00');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            const now = new Date();
            now.setMinutes(now.getMinutes() + 10); // Default to 10 mins in the future
            setDate(getLocalDateString(now));
            setTime(now.toTimeString().substring(0, 5));
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const scheduledDateTime = new Date(`${date}T${time}`);
        if (scheduledDateTime < new Date()) {
            setError('Scheduled time must be in the future.');
            return;
        }
        setError('');
        onSchedule(scheduledDateTime.toISOString());
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">Schedule Test</h2>
                    <p className="text-sm text-gray-500">{testTitle}</p>
                </div>
                <div className="p-6 space-y-4">
                     {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            id="schedule-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={getLocalDateString(new Date())}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700">Time</label>
                         <input
                            type="time"
                            id="schedule-time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Students will be able to see this test, but the "Start" button will only become active at the scheduled time.</p>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit} 
                        className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        Set Schedule & Publish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleTestModal;
