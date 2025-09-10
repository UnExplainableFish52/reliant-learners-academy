import React, { useState, useEffect } from 'react';
import { FACULTY_ANNOUNCEMENTS } from '../../constants';
import type { Announcement } from '../../types';
import { useFaculty } from './hooks.ts';

const Announcements: React.FC = () => {
    const { facultyMember } = useFaculty();
    
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
        try {
            const saved = localStorage.getItem(`facultyAnnouncements_${facultyMember.id}`);
            if (saved) return JSON.parse(saved);
        } catch (e) { console.error("Failed to load announcements from localStorage", e); }
        return FACULTY_ANNOUNCEMENTS.filter(a => a.author === facultyMember.name);
    });

    useEffect(() => {
        try {
            localStorage.setItem(`facultyAnnouncements_${facultyMember.id}`, JSON.stringify(announcements));
        } catch (e) { console.error("Failed to save announcements to localStorage", e); }
    }, [announcements, facultyMember.id]);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const initialFormState = {
        title: '',
        content: '',
        audience: [] as string[],
    };
    const [formState, setFormState] = useState(initialFormState);
    
    useEffect(() => {
        if (isFormVisible) {
            if (editingAnnouncement) {
                setFormState({
                    title: editingAnnouncement.title,
                    content: editingAnnouncement.content,
                    audience: editingAnnouncement.audience.split(', '),
                });
            } else {
                setFormState(initialFormState);
            }
        }
    }, [isFormVisible, editingAnnouncement]);
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormState(prev => ({...prev, audience: selectedOptions}));
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const audienceString = formState.audience.join(', ');

        if (editingAnnouncement) {
            const updatedAnnouncement: Announcement = { ...editingAnnouncement, ...formState, audience: audienceString };
            setAnnouncements(prev => prev.map(ann => ann.id === editingAnnouncement.id ? updatedAnnouncement : ann));
        } else {
            const newAnnouncement: Announcement = {
                id: Date.now(),
                title: formState.title,
                content: formState.content,
                audience: audienceString,
                author: facultyMember.name,
                date: new Date().toISOString().split('T')[0],
            };
            setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
        setIsFormVisible(false);
        setEditingAnnouncement(null);
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsFormVisible(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(prev => prev.filter(ann => ann.id !== id));
        }
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingAnnouncement(null);
    };

    const handleCreateClick = () => {
        setEditingAnnouncement(null);
        setIsFormVisible(true);
    };

    if (!facultyMember) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-brand-dark">Announcements</h1>
                {!isFormVisible && (
                    <button
                        onClick={handleCreateClick}
                        className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Create New
                    </button>
                )}
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" id="title" required value={formState.title} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea name="content" id="content" rows={4} required value={formState.content} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"></textarea>
                        </div>
                         <div>
                            <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Target Paper(s)</label>
                            <select name="audience" id="audience" multiple required value={formState.audience} onChange={handleAudienceChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red h-24">
                                {facultyMember.assignedPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple papers.</p>
                        </div>
                        <div className="flex justify-end gap-2">
                             <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                             <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                                {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                             </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-brand-dark">{ann.title}</h3>
                                <p className="text-sm text-gray-500">Posted on {ann.date} for <span className="font-semibold">{ann.audience}</span></p>
                            </div>
                            <div className="space-x-2 flex-shrink-0 ml-4">
                                <button onClick={() => handleEdit(ann)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(ann.id)} className="text-xs font-semibold text-brand-red hover:underline">Delete</button>
                            </div>
                        </div>
                        <p className="text-gray-700 mt-4">{ann.content}</p>
                    </div>
                ))}
                 {announcements.length === 0 && !isFormVisible && (
                    <p className="text-center text-gray-500 py-8">You haven't posted any announcements yet.</p>
                )}
            </div>
        </div>
    );
};

export default Announcements;
