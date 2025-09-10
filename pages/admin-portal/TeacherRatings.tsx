import React, { useState, useEffect } from 'react';
import { TEACHER_RATINGS, FACULTY_MEMBERS } from '../../constants';
import { getItems, saveItems } from '../../services/dataService';
import type { TeacherRating } from '../../types';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const TeacherRatings: React.FC = () => {
    const [ratings, setRatings] = useState<TeacherRating[]>(() => getItems('teacherRatings', TEACHER_RATINGS));

    useEffect(() => {
        saveItems('teacherRatings', ratings);
    }, [ratings]);

    const handleDeleteRating = (id: number) => {
        if (window.confirm('Are you sure you want to delete this student feedback?')) {
            setRatings(prev => prev.filter(r => r.id !== id));
        }
    };

    const facultyRatings = FACULTY_MEMBERS.map(faculty => {
        const facultySpecificRatings = ratings.filter(r => r.teacherId === faculty.id);
        const average = facultySpecificRatings.length > 0 ? facultySpecificRatings.reduce((acc, r) => acc + r.rating, 0) / facultySpecificRatings.length : 0;
        return {
            ...faculty,
            averageRating: average,
            reviewCount: facultySpecificRatings.length
        };
    });

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Teacher Ratings & Reviews</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {facultyRatings.map(faculty => (
                     <div key={faculty.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-3">
                             <img src={faculty.imageUrl} alt={faculty.name} className="w-12 h-12 rounded-full mr-4" />
                            <div>
                                <h3 className="font-bold text-lg text-brand-dark">{faculty.name}</h3>
                                <p className="text-sm text-gray-500">{faculty.qualification}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             <StarRating rating={faculty.averageRating} />
                            <span className="font-bold text-lg">{faculty.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({faculty.reviewCount} reviews)</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Recent Student Feedback</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Teacher</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Class Topic</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Rating</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Feedback</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Date</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ratings.slice().reverse().map(rating => (
                                <tr key={rating.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium whitespace-nowrap">{rating.teacherName}</td>
                                    <td className="p-4 text-sm">{rating.classTopic}</td>
                                    <td className="p-4 text-center">
                                        <StarRating rating={rating.rating} />
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 max-w-sm">{rating.feedback}</td>
                                    <td className="p-4 text-sm font-mono whitespace-nowrap">{rating.date}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDeleteRating(rating.id)} className="text-sm font-semibold text-brand-red hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherRatings;