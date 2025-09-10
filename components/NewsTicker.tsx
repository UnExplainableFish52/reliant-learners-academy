import React, { useState, useEffect } from 'react';
import { NEWS_TICKER_MESSAGES } from '../constants.ts';
import { getItems } from '../services/dataService.ts';

const NewsTicker: React.FC = () => {
    const [messages, setMessages] = useState<string[]>(() => getItems('newsTicker', NEWS_TICKER_MESSAGES));
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'newsTicker') {
                setMessages(getItems('newsTicker', NEWS_TICKER_MESSAGES));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (messages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 5000); // Change message every 5 seconds

        return () => clearInterval(interval);
    }, [messages]);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="bg-brand-dark text-white py-3 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="relative h-6">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`absolute w-full transition-transform duration-1000 ease-in-out ${
                                index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                            }`}
                        >
                            <p className="text-center font-medium truncate">{message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;