import React, { useState, useEffect, useRef } from 'react';
import type { CourseMaterial, RecordedLecture } from '../../types';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (resources: ((CourseMaterial | RecordedLecture) & { id?: number })[]) => void;
    paper: string;
    resourceToEdit?: CourseMaterial | RecordedLecture | null;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, onSave, paper, resourceToEdit }) => {
    type ResourceType = 'Notes' | 'PDF' | 'Assignment' | 'Recorded Lecture';
    
    const isEditing = !!resourceToEdit;

    const [resourceType, setResourceType] = useState<ResourceType>('PDF');
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [videoUrl, setVideoUrl] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
             if (resourceToEdit) { // If editing, populate form
                const isLecture = 'videoUrl' in resourceToEdit;
                setResourceType(isLecture ? 'Recorded Lecture' : (resourceToEdit as CourseMaterial).type);
                setTitle(isLecture ? (resourceToEdit as RecordedLecture).topic : (resourceToEdit as CourseMaterial).title);
                setVideoUrl(isLecture ? (resourceToEdit as RecordedLecture).videoUrl : '');
                setFiles([]); // File uploads need to be re-selected by user for security
            } else { // If adding new, reset form
                setResourceType('PDF');
                setTitle('');
                setFiles([]);
                setVideoUrl('');
            }
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, resourceToEdit, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (resourceType === 'Recorded Lecture') {
            const lecture: (RecordedLecture & { id?: number }) = {
                id: isEditing ? resourceToEdit!.id : undefined,
                paper: paper,
                topic: title,
                date: isEditing ? (resourceToEdit as RecordedLecture).date : new Date().toISOString().split('T')[0],
                videoUrl: videoUrl,
            };
            onSave([lecture]);
        } else {
             if (isEditing) {
                const material: (CourseMaterial & { id?: number }) = {
                    id: resourceToEdit!.id,
                    paper,
                    title,
                    type: resourceType,
                    uploadDate: (resourceToEdit as CourseMaterial).uploadDate,
                    downloadLink: files.length > 0 ? '#' : (resourceToEdit as CourseMaterial).downloadLink, // Update link if new file
                };
                onSave([material]);
            } else {
                if (files.length === 0) return alert('Please select at least one file to upload.');
                
                const newMaterials: CourseMaterial[] = files.map((file, index) => ({
                    id: Date.now() + index, // Add index to ensure unique ID
                    paper,
                    title: files.length > 1 ? file.name.replace(/\.[^/.]+$/, "") : title,
                    type: resourceType,
                    uploadDate: new Date().toISOString().split('T')[0],
                    downloadLink: '#', // Placeholder for actual download link
                }));
                onSave(newMaterials);
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-dark">{isEditing ? 'Edit Resource' : 'Upload New Resource'} for {paper}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type</label>
                            <select id="resourceType" value={resourceType} onChange={e => setResourceType(e.target.value as ResourceType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red">
                                <option>PDF</option>
                                <option>Notes</option>
                                <option>Assignment</option>
                                <option>Recorded Lecture</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">{resourceType === 'Recorded Lecture' ? 'Lecture Topic' : 'Title'}</label>
                            <input 
                                type="text" 
                                id="title" 
                                required 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                disabled={!isEditing && files.length > 1} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white disabled:bg-gray-100"
                            />
                            {!isEditing && files.length > 1 && <p className="text-xs text-gray-500 mt-1">Title will be taken from the filename for multiple uploads.</p>}
                        </div>
                        
                        {resourceType === 'Recorded Lecture' ? (
                            <div>
                                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">YouTube/Vimeo Embed URL</label>
                                <input 
                                    type="url" 
                                    id="videoUrl" 
                                    required 
                                    value={videoUrl} 
                                    onChange={e => setVideoUrl(e.target.value)} 
                                    placeholder="https://www.youtube.com/embed/..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white" 
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">File(s)</label>
                                <input 
                                    type="file" 
                                    id="file" 
                                    multiple={!isEditing} 
                                    onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"
                                />
                                {isEditing && <p className="text-xs text-gray-500 mt-1">Uploading a new file will replace the existing one.</p>}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">
                            {isEditing ? 'Save Changes' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceModal;