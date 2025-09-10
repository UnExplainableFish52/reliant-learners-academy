import React, { useState, useEffect, useRef } from 'react';
import type { Course } from '../../types';

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newCourse: Course) => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSave }) => {
    const initialCourseState: Omit<Course, 'id' | 'studentIds' | 'facultyIds'> = {
        title: '',
        level: 'Applied Knowledge',
        description: '',
        duration: '',
        eligibility: '',
        papers: [],
        syllabus: [{ topic: '', details: '' }],
        learningOutcomes: [],
    };

    const [formData, setFormData] = useState<Omit<Course, 'id' | 'studentIds' | 'facultyIds'>>(initialCourseState);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialCourseState);
        }
    }, [isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'papers' | 'learningOutcomes') => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value.split('\n').filter(line => line.trim() !== '') }));
    };

    const handleSyllabusChange = (index: number, field: 'topic' | 'details', value: string) => {
        const newSyllabus = [...formData.syllabus];
        newSyllabus[index] = { ...newSyllabus[index], [field]: value };
        setFormData(prev => ({ ...prev, syllabus: newSyllabus }));
    };

    const addSyllabusItem = () => {
        setFormData(prev => ({ ...prev, syllabus: [...prev.syllabus, { topic: '', details: '' }] }));
    };

    const removeSyllabusItem = (index: number) => {
        setFormData(prev => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== index) }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCourse: Course = {
            ...formData,
            id: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            studentIds: [],
            facultyIds: [],
        };
        onSave(newCourse);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">Add New Course</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Level</label>
                            <select name="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
                                <option>Applied Knowledge</option>
                                <option>Applied Skills</option>
                                <option>Strategic Professional</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Duration</label>
                            <input name="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Eligibility</label>
                            <input name="eligibility" value={formData.eligibility} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Papers (one per line)</label>
                            <textarea value={formData.papers.join('\n')} onChange={e => handleListChange(e, 'papers')} rows={5} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Learning Outcomes (one per line)</label>
                            <textarea value={formData.learningOutcomes.join('\n')} onChange={e => handleListChange(e, 'learningOutcomes')} rows={5} className="mt-1 block w-full p-2 border rounded-md bg-white" required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Syllabus</label>
                        <div className="space-y-2 mt-1 border p-2 rounded-md max-h-48 overflow-y-auto">
                            {formData.syllabus.map((item, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                                    <div className="flex-grow">
                                        <input value={item.topic} onChange={e => handleSyllabusChange(index, 'topic', e.target.value)} placeholder="Topic" className="block w-full p-1 border rounded text-sm bg-white" required/>
                                        <textarea value={item.details} onChange={e => handleSyllabusChange(index, 'details', e.target.value)} placeholder="Details" rows={2} className="mt-1 block w-full p-1 border rounded text-sm bg-white" required/>
                                    </div>
                                    <button type="button" onClick={() => removeSyllabusItem(index)} className="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addSyllabusItem} className="mt-2 text-sm text-blue-600 font-semibold hover:underline">Add Syllabus Item</button>
                    </div>
                </form>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add Course</button>
                </div>
            </div>
        </div>
    );
};

export default AddCourseModal;