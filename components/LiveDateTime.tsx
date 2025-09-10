import React, { useState, useEffect } from 'react';

const LiveDateTime: React.FC = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="hidden sm:flex flex-col items-start text-left">
            <div className="font-semibold text-base text-gray-700">{formatDate(dateTime)}</div>
            <div className="text-sm text-gray-500 font-mono">{formatTime(dateTime)}</div>
        </div>
    );
};

export default LiveDateTime;