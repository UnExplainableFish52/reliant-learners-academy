import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { PopupNotification } from '../types';
import { getItems } from '../services/dataService';

const PopupNotificationModal: React.FC<{ notification: PopupNotification; onClose: () => void; }> = ({ notification, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <img src={notification.imageUrl} alt={notification.title} className="w-full h-56 object-cover" />
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-brand-dark mb-2">{notification.title}</h2>
                    <p className="text-gray-600 mb-6">{notification.content}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {notification.link && notification.linkText && (
                             <ReactRouterDOM.Link to={notification.link} onClick={onClose} className="bg-brand-red text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 transition-transform hover:scale-105 shadow-lg">
                                {notification.linkText}
                            </ReactRouterDOM.Link>
                        )}
                        <button onClick={onClose} className="bg-gray-200 text-brand-dark px-8 py-3 rounded-md font-semibold hover:bg-gray-300 transition-transform hover:scale-105 shadow-lg">
                            Close
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const PopupNotificationManager: React.FC = () => {
    const [notification, setNotification] = useState<PopupNotification | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const popups = getItems<PopupNotification[]>('popups', []);
        const activePopups = popups.filter(p => p.isActive);

        if (activePopups.length > 0) {
            const seenPopupIds: number[] = JSON.parse(sessionStorage.getItem('seenPopupIds') || '[]');
            const nextPopupToShow = activePopups.find(p => !seenPopupIds.includes(p.id));
            
            if (nextPopupToShow) {
                setNotification(nextPopupToShow);
                setTimeout(() => setIsVisible(true), 1500);
            }
        }
    }, []);

    const handleClose = () => {
        if (notification) {
            setIsVisible(false);
            const seenPopupIds: number[] = JSON.parse(sessionStorage.getItem('seenPopupIds') || '[]');
            sessionStorage.setItem('seenPopupIds', JSON.stringify([...seenPopupIds, notification.id]));
        }
    };

    if (!isVisible || !notification) {
        return null;
    }

    return <PopupNotificationModal notification={notification} onClose={handleClose} />;
};

export default PopupNotificationManager;