
import React from 'react';
import type { Announcement } from '../types';

interface AnnouncementPopupProps {
    announcement: Announcement;
    onClose: () => void;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ announcement, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-3xl font-light" aria-label="Close modal">&times;</button>
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.277 0 7.423-4.586 6.357-8.455A4.002 4.002 0 0118 4v6c0 .635-.21 1.223-.592 1.699l-2.147 6.15a1.76 1.76 0 01-3.417-.592V5.882z"></path></svg>
                    <h2 className="text-2xl font-bold text-brand-dark mt-4 mb-2">{announcement.title}</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-center max-h-60 overflow-y-auto">{announcement.content}</p>
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="bg-brand-dark text-white font-semibold px-6 py-2 rounded-md hover:bg-black transition-colors">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementPopup;
