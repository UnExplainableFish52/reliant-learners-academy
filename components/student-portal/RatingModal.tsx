import React, { useState, useEffect } from 'react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, feedback: string) => void;
    teacherName: string;
    classTopic: string;
}

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }: { filled: boolean; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void; }) => (
    <svg
        className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, teacherName, classTopic }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            // Reset state on open
            setRating(0);
            setFeedback('');
            setIsSubmitted(false);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = () => {
        onSubmit(rating, feedback);
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 2000); // Close modal after 2 seconds
    };
    
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                
                {isSubmitted ? (
                     <div className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-2xl font-bold text-brand-dark mt-4">Thank You!</h2>
                        <p className="text-gray-600 mt-2">Your feedback has been submitted.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-brand-dark">Rate Your Class</h2>
                            <p className="text-gray-600 mt-1">How was your experience with <span className="font-semibold">{teacherName}</span> for <span className="font-semibold">{classTopic}</span>?</p>
                        </div>

                        <div className="flex justify-center my-6 space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    filled={(hoverRating || rating) >= star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>

                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Additional Feedback (Optional)</label>
                            <textarea
                                id="feedback"
                                rows={3}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="What went well? What could be improved?"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                            ></textarea>
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0}
                                className="w-full sm:w-auto bg-brand-red text-white py-2 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                Submit Feedback
                            </button>
                             <button
                                onClick={onClose}
                                className="w-full sm:w-auto bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingModal;