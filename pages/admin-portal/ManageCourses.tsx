import React, { useState, useEffect } from 'react';
import { COURSES } from '../../constants.ts';
import { Link } from 'react-router-dom';
import type { Course } from '../../types.ts';
import CourseEditModal from '../../components/admin-portal/CourseEditModal.tsx';
import AddCourseModal from '../../components/admin-portal/AddCourseModal.tsx';
import ConfirmModal from '../../components/ConfirmModal.tsx';

const ManageCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>(() => {
        try {
            const saved = localStorage.getItem('courses');
            return saved ? JSON.parse(saved) : COURSES;
        } catch {
            return COURSES;
        }
    });

    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    useEffect(() => {
        localStorage.setItem('courses', JSON.stringify(courses));
    }, [courses]);

    const handleDeleteClick = (course: Course) => {
        setCourseToDelete(course);
    };
    
    const handleConfirmDelete = () => {
        if (courseToDelete) {
            setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
            setNotification(`Course "${courseToDelete.title}" has been deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setCourseToDelete(null);
        }
    };

    const handleSaveCourse = (updatedCourse: Course) => {
        if (editingCourse) {
             setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        }
        setEditingCourse(null);
    };

    const handleAddNewCourse = (newCourse: Course) => {
        setCourses(prev => [newCourse, ...prev]);
        setIsAddModalOpen(false);
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Manage Courses</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors w-full md:w-auto"
                >
                    Add New Course
                </button>
            </div>
            
            {notification && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md transition-opacity duration-300">
                    {notification}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Course Title</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Level</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Papers</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Enrolled</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {courses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <p className="font-medium">{course.title}</p>
                                    </td>
                                    <td className="p-4 text-sm">{course.level}</td>
                                    <td className="p-4 text-sm">{course.papers.length}</td>
                                    <td className="p-4 text-center font-mono">{course.studentIds.length}</td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-blue-600 hover:underline">View</Link>
                                        <button onClick={() => setEditingCourse(course)} className="text-sm font-semibold text-yellow-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteClick(course)} className="text-sm font-semibold text-brand-red hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {editingCourse && (
                <CourseEditModal
                    isOpen={!!editingCourse}
                    onClose={() => setEditingCourse(null)}
                    courseToEdit={editingCourse}
                    onSave={handleSaveCourse}
                />
            )}
            <AddCourseModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddNewCourse}
            />
             <ConfirmModal
                isOpen={!!courseToDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete the course "${courseToDelete?.title}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setCourseToDelete(null)}
                confirmText="Delete"
            />
        </div>
    );
};

export default ManageCourses;