
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_SLIDES, GALLERY_IMAGES, VLOGS, BLOG_POSTS, NEWS_TICKER_MESSAGES, FACULTY_MEMBERS, POPUP_NOTIFICATION, STUDENTS, TESTIMONIALS, HIGH_ACHIEVERS, DEFAULT_CONTACT_DETAILS, FAQ_DATA } from '../../constants.ts';
import type { HeroSlide, GalleryImage, Vlog, BlogPost, PopupNotification, Testimonial, Student, FacultyMember, HighAchiever, ContactDetails, SocialMediaLink, FAQItem } from '../../types.ts';
import { compressImage, imageFileToDataUrl } from '../../services/imageCompressionService.ts';

type Tab = 'Banners' | 'Gallery' | 'Vlogs' | 'Blogs' | 'News Ticker' | 'Popup' | 'Testimonials' | 'High Achievers' | 'Contact & Socials' | 'FAQ';

// Helper to create a unique ID for new items
const generateId = () => Date.now();
const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const calculateTimeToRead = (htmlContent: string): number => {
    if (!htmlContent) return 0;
    const text = htmlContent.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
    const words = text.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
    return Math.ceil(words.length / 200); // Average reading speed is 200 WPM
};

// ==========================================================
// File to Base64 Converter (for non-image files like videos)
// ==========================================================
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// ==========================================================
// Reusable Modal Component
// ==========================================================
const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void, size?: 'lg' | '2xl' | '3xl' }> = ({ children, title, onClose, size = '2xl' }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const sizeClass = {
        'lg': 'max-w-lg',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl'
    }[size];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div ref={modalRef} className={`bg-white rounded-lg shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// ==========================================================
// Banners Components
// ==========================================================
const BannerForm = ({ banner, onSave, onCancel }: { banner: HeroSlide | null, onSave: (data: Omit<HeroSlide, 'id'>, imageFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(banner || { url: '', alt: '', title: { main: '', highlighted: '' }, subtitle: '', buttons: [] });
    const [imageFile, setImageFile] = useState<File | null>(null);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <input type="hidden" value={formState.url} />
                <div>
                    <label className="block text-sm font-medium">Main Title</label>
                    <input value={formState.title.main} onChange={e => setFormState({...formState, title: {...formState.title, main: e.target.value}})} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Highlighted Title</label>
                    <input value={formState.title.highlighted} onChange={e => setFormState({...formState, title: {...formState.title, highlighted: e.target.value}})} className="mt-1 block w-full p-2 border rounded-md bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Subtitle</label>
                    <textarea value={formState.subtitle} onChange={e => setFormState({...formState, subtitle: e.target.value})} rows={2} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Background Image</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Banner</button>
            </div>
        </form>
    );
};

const ManageBanners = ({ banners, onUpdate }: { banners: HeroSlide[], onUpdate: (data: HeroSlide[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<HeroSlide | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<HeroSlide | null>(null);

    const handleDragSort = () => {
        const bannersCopy = [...banners];
        const draggedItemContent = bannersCopy.splice(dragItem.current!, 1)[0];
        bannersCopy.splice(dragOverItem.current!, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onUpdate(bannersCopy);
    };

    const handleDeleteClick = (banner: HeroSlide) => {
        setItemToDelete(banner);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(banners.filter(item => item.id !== itemToDelete.id));
            setNotification(`Banner "${itemToDelete.title.main}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };
    
    const handleAddNew = () => {
        setEditingBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner: HeroSlide) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<HeroSlide, 'id'>, imageFile: File | null) => {
        let imageUrl = formData.url;
        if (imageFile) {
            imageUrl = await compressImage(imageFile, { maxWidth: 1920, maxHeight: 1080, quality: 0.8 });
        }
        const finalData = { ...formData, url: imageUrl };

        if (editingBanner) {
            onUpdate(banners.map(b => b.id === editingBanner.id ? { ...editingBanner, ...finalData } : b));
        } else {
            onUpdate([...banners, { ...finalData, id: generateId() }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
             {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New Banner</button>
            </div>
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-4 border p-2 rounded-lg cursor-grab active:cursor-grabbing bg-white"
                >
                    <img src={banner.url} alt={banner.alt} className="w-24 h-16 object-cover rounded" />
                    <div className="flex-grow">
                        <p className="font-bold">{banner.title.main} <span className="text-brand-red">{banner.title.highlighted}</span></p>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(banner)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(banner)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingBanner ? 'Edit Banner' : 'Add New Banner'} onClose={() => setIsModalOpen(false)}>
                    <BannerForm banner={editingBanner} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the banner titled "{itemToDelete.title.main}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// Gallery Components
// ==========================================================
const GalleryForm = ({ item, onSave, onCancel }: { item: GalleryImage | null, onSave: (data: Omit<GalleryImage, 'id'>, imageFiles: File[]) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState<Omit<GalleryImage, 'id'>>(() => {
        if (item) {
            const { id, ...rest } = item;
            return rest;
        }
        return { type: 'image', src: '', alt: '', category: 'Campus' };
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFiles); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Type</label>
                        <select value={formState.type} onChange={e => setFormState({...formState, type: e.target.value as 'image' | 'video'})} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium">Category</label>
                        <select value={formState.category} onChange={e => setFormState({...formState, category: e.target.value as GalleryImage['category']})} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option>Campus</option>
                            <option>Events</option>
                            <option>Classrooms</option>
                            <option>Students</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Alt Text / Title</label>
                    <input value={formState.alt} onChange={e => setFormState({...formState, alt: e.target.value})} disabled={imageFiles.length > 1} className="mt-1 block w-full p-2 border rounded-md bg-white disabled:bg-gray-100" required />
                    {imageFiles.length > 1 && <p className="text-xs text-gray-500 mt-1">Alt text will be generated from filenames.</p>}
                </div>

                {formState.type === 'video' && (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                         <p className="text-sm text-gray-600">Only YouTube embed URLs are supported for gallery videos to ensure optimal performance and avoid storage issues.</p>
                         <div>
                            <label className="block text-sm font-medium">YouTube Embed URL</label>
                            <input value={formState.videoUrl || ''} onChange={e => setFormState({...formState, videoUrl: e.target.value, localVideoSrc: undefined })} className="mt-1 block w-full p-2 border rounded-md bg-white" placeholder="https://www.youtube.com/embed/..." required={!item?.videoUrl} />
                        </div>
                    </div>
                )}
                
                {formState.type === 'image' ? (
                     <div>
                        <label className="block text-sm font-medium">Image File(s)</label>
                        <input type="file" multiple={!item} accept="image/*" onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" required={!item} />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium">Thumbnail Image</label>
                        <input type="file" accept="image/*" onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" required={!item || !item.src} />
                        {item?.src && imageFiles.length === 0 && <img src={item.src} alt="current thumbnail" className="w-20 h-20 object-cover mt-2 rounded-md" />}
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Item</button>
            </div>
        </form>
    );
};

const ManageGallery = ({ gallery, onUpdate }: { gallery: GalleryImage[], onUpdate: (data: GalleryImage[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<GalleryImage | null>(null);

    const handleDragSort = () => {
        const galleryCopy = [...gallery];
        const draggedItemContent = galleryCopy.splice(dragItem.current!, 1)[0];
        galleryCopy.splice(dragOverItem.current!, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onUpdate(galleryCopy);
    };


    const handleDeleteClick = (item: GalleryImage) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(gallery.filter(item => item.id !== itemToDelete.id));
            setNotification(`Gallery item "${itemToDelete.alt}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: GalleryImage) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<GalleryImage, 'id'>, imageFiles: File[]) => {
        if (editingItem) {
            // Logic to edit a single item
            let newSrc = formData.src;
            if (imageFiles[0]) {
                newSrc = await compressImage(imageFiles[0], { maxWidth: 800, maxHeight: 600, quality: 0.8 });
            }
            const updatedItemData = { ...formData, src: newSrc, localVideoSrc: undefined };
            onUpdate(gallery.map(g => g.id === editingItem.id ? { ...updatedItemData, id: editingItem.id } : g));
        } else {
            // Logic to add new items
            if (formData.type === 'image' && imageFiles.length > 0) {
                const newItems: GalleryImage[] = await Promise.all(
                    imageFiles.map(async file => {
                        const src = await compressImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8 });
                        const alt = imageFiles.length > 1 ? file.name.replace(/\.[^/.]+$/, "") : formData.alt;
                        return {
                            id: generateId(),
                            type: 'image' as 'image',
                            src,
                            alt,
                            category: formData.category,
                        };
                    })
                );
                onUpdate([...gallery, ...newItems]);
            } else if (formData.type === 'video' && imageFiles[0]) {
                const thumbnailSrc = await compressImage(imageFiles[0], { maxWidth: 600, maxHeight: 400, quality: 0.7 });
                const newItem: GalleryImage = {
                    ...formData,
                    id: generateId(),
                    src: thumbnailSrc,
                    localVideoSrc: undefined,
                };
                onUpdate([...gallery, newItem]);
            }
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
             {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New Item</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((item, index) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleDragSort}
                        onDragOver={(e) => e.preventDefault()}
                        className="relative group border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                    >
                        <img src={item.src} alt={item.alt} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                             <button onClick={() => handleEdit(item)} className="text-white opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-600 rounded text-xs">Edit</button>
                             <button onClick={() => handleDeleteClick(item)} className="text-white opacity-0 group-hover:opacity-100 px-2 py-1 bg-brand-red rounded text-xs">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
             {isModalOpen && (
                <Modal title={editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'} onClose={() => setIsModalOpen(false)}>
                    <GalleryForm item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
             {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the gallery item "{itemToDelete.alt}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// Vlogs Components
// ==========================================================
const VlogForm = ({ vlog, onSave, onCancel }: { vlog: Vlog | null, onSave: (data: Omit<Vlog, 'id' | 'publicationDate'>, thumbnailFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(vlog || { title: '', description: '', sourceType: 'url' as const, videoUrl: '', thumbnailUrl: '' });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    
    useEffect(() => {
        if (formState.sourceType !== 'url') {
            setFormState(prev => ({ ...prev, sourceType: 'url', localVideoSrc: undefined }));
        }
    }, [formState.sourceType]);

    return (
         <form onSubmit={(e) => { e.preventDefault(); onSave(formState, thumbnailFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <input type="hidden" value={formState.sourceType}/>
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} rows={3} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">Note: For stability and performance, all vlogs must be hosted on a service like YouTube. Please provide the embed URL below.</p>
                <div>
                    <label className="block text-sm font-medium">YouTube Embed URL</label>
                    <input value={formState.videoUrl} onChange={e => setFormState({...formState, videoUrl: e.target.value, localVideoSrc: undefined, sourceType: 'url'})} className="mt-1 block w-full p-2 border rounded-md bg-white" placeholder="https://www.youtube.com/embed/..." required />
                </div>
                 
                <div>
                    <label className="block text-sm font-medium">Thumbnail Image</label>
                    <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" required={!vlog || !vlog.thumbnailUrl} />
                     {vlog?.thumbnailUrl && !thumbnailFile && <img src={vlog.thumbnailUrl} alt="current thumbnail" className="w-20 h-20 object-cover mt-2 rounded-md" />}
                </div>
            </div>
             <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Vlog</button>
            </div>
        </form>
    );
 };

const ManageVlogs = ({ vlogs, onUpdate }: { vlogs: Vlog[], onUpdate: (data: Vlog[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVlog, setEditingVlog] = useState<Vlog | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<Vlog | null>(null);

    const handleDeleteClick = (vlog: Vlog) => {
        setItemToDelete(vlog);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(vlogs.filter(item => item.id !== itemToDelete.id));
            setNotification(`Vlog "${itemToDelete.title}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };
    
     const handleAddNew = () => {
        setEditingVlog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (vlog: Vlog) => {
        setEditingVlog(vlog);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<Vlog, 'id' | 'publicationDate'>, thumbnailFile: File | null) => {
        let thumbnailUrl = formData.thumbnailUrl;

        if (thumbnailFile) {
            thumbnailUrl = await compressImage(thumbnailFile, { maxWidth: 600, maxHeight: 400, quality: 0.7 });
        }

        const finalData = { ...formData, thumbnailUrl, sourceType: 'url' as const, localVideoSrc: undefined };

        if (editingVlog) {
            onUpdate(vlogs.map(v => v.id === editingVlog.id ? { ...editingVlog, ...finalData } : v));
        } else {
            onUpdate([...vlogs, { ...finalData, id: generateId(), publicationDate: new Date().toISOString().split('T')[0] }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New Vlog</button>
            </div>
            {vlogs.map(vlog => (
                <div key={vlog.id} className="flex items-center gap-4 border p-2 rounded-lg">
                    <img src={vlog.thumbnailUrl} alt={vlog.title} className="w-24 h-16 object-cover rounded" />
                    <div className="flex-grow">
                        <p className="font-bold">{vlog.title}</p>
                        <p className="text-xs text-gray-500 truncate">{vlog.sourceType === 'url' ? vlog.videoUrl : 'Uploaded Video'}</p>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(vlog)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(vlog)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingVlog ? 'Edit Vlog' : 'Add New Vlog'} onClose={() => setIsModalOpen(false)}>
                    <VlogForm vlog={editingVlog} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the vlog "{itemToDelete.title}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// Blogs Components
// ==========================================================
const BlogForm = ({ blog, onSave, onCancel }: { blog: BlogPost | null, onSave: (data: Omit<BlogPost, 'id'|'publicationDate'>, imageFile: File | null) => void, onCancel: () => void }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);

    useEffect(() => {
        const storedStudents = localStorage.getItem('students');
        setStudents(storedStudents ? JSON.parse(storedStudents) : STUDENTS);

        const storedFaculty = localStorage.getItem('faculty');
        setFaculty(storedFaculty ? JSON.parse(storedFaculty) : FACULTY_MEMBERS);
    }, []);

    const [formState, setFormState] = useState(() => {
        if (blog) {
            const { id, publicationDate, ...editableData } = blog;
            return editableData;
        }

        // Safely determine the initial author
        let initialAuthorId: number = 0;
        let initialAuthorType: 'faculty' | 'student' = 'faculty';

        const facultyFromStorage = localStorage.getItem('faculty');
        const allFaculty = facultyFromStorage ? JSON.parse(facultyFromStorage) : FACULTY_MEMBERS;
        
        const studentsFromStorage = localStorage.getItem('students');
        const allStudents = studentsFromStorage ? JSON.parse(studentsFromStorage) : STUDENTS;


        if (allFaculty.length > 0) {
            initialAuthorId = allFaculty[0].id;
            initialAuthorType = 'faculty';
        } else if (allStudents.length > 0) {
            initialAuthorId = allStudents[0].id;
            initialAuthorType = 'student';
        }
        
        const initialState: Omit<BlogPost, 'id' | 'publicationDate'> = {
            title: '',
            authorId: initialAuthorId,
            authorType: initialAuthorType,
            excerpt: '',
            content: '',
            imageUrl: '',
            tags: [],
            status: 'Published',
            isFeatured: false,
            timeToRead: 0,
        };
        return initialState;
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(blog?.imageUrl || null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setImageFile(file);
        if (file) {
            const base64 = await fileToBase64(file);
            setPreviewUrl(base64);
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Author</label>
                        <select 
                            value={`${formState.authorType}-${formState.authorId}`} 
                            onChange={e => {
                                const [type, id] = e.target.value.split('-');
                                setFormState({
                                    ...formState, 
                                    authorType: type as 'faculty' | 'student',
                                    authorId: Number(id)
                                });
                            }} 
                            className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <optgroup label="Faculty">
                                {faculty.map(f => <option key={`faculty-${f.id}`} value={`faculty-${f.id}`}>{f.name}</option>)}
                            </optgroup>
                            <optgroup label="Students">
                                {students.map(s => <option key={`student-${s.id}`} value={`student-${s.id}`}>{s.name} ({s.studentId})</option>)}
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Excerpt</label>
                    <textarea value={formState.excerpt} onChange={e => setFormState({...formState, excerpt: e.target.value})} rows={3} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Content</label>
                    <textarea value={formState.content} onChange={e => setFormState({...formState, content: e.target.value})} rows={8} className="mt-1 block w-full p-2 border rounded-md bg-white font-mono text-sm" required />
                     <p className="text-xs text-gray-500 mt-1">HTML is allowed. You can paste formatted content from editors like MS Word or Google Docs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Tags (comma-separated)</label>
                        <input value={Array.isArray(formState.tags) ? formState.tags.join(', ') : ''} onChange={e => setFormState({...formState, tags: e.target.value.split(',').map(t => t.trim())})} className="mt-1 block w-full p-2 border rounded-md bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as 'Published' | 'Draft'})} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="isFeatured" checked={formState.isFeatured} onChange={e => setFormState({...formState, isFeatured: e.target.checked})} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm font-medium">Mark as Featured Post</label>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Featured Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 w-48 h-auto rounded-md shadow-sm" />}
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Post</button>
            </div>
        </form>
    );
};

const ManageBlogs = ({ blogs, onUpdate }: { blogs: BlogPost[], onUpdate: (data: BlogPost[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<BlogPost | null>(null);

    const handleDeleteClick = (blog: BlogPost) => {
        setItemToDelete(blog);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(blogs.filter(item => item.id !== itemToDelete.id));
            setNotification(`Blog post "${itemToDelete.title}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };
    
    const handleAddNew = () => {
        setEditingBlog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (blog: BlogPost) => {
        setEditingBlog(blog);
        setIsModalOpen(true);
    };
    
    const handleSave = async (formData: Omit<BlogPost, 'id' | 'publicationDate'>, imageFile: File | null) => {
        let imageUrl = formData.imageUrl;
        if (imageFile) {
            imageUrl = await compressImage(imageFile, { maxWidth: 1200, maxHeight: 800, quality: 0.8 });
        }

        const timeToRead = calculateTimeToRead(formData.content);
        const finalData = { ...formData, imageUrl, timeToRead };
        
        if (editingBlog) {
            onUpdate(blogs.map(b => b.id === editingBlog.id ? { ...editingBlog, ...finalData } : b));
        } else {
            onUpdate([{ 
                ...finalData, 
                id: generateSlug(finalData.title), 
                publicationDate: new Date().toISOString().split('T')[0] 
            }, ...blogs]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
             {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Create New Post</button>
            </div>
            {blogs.map(blog => (
                <div key={blog.id} className="flex items-center gap-4 border p-2 rounded-lg bg-white">
                    <img src={blog.imageUrl} alt={blog.title} className="w-24 h-16 object-cover rounded" />
                    <div className="flex-grow">
                        <p className="font-bold">{blog.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                             <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${blog.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                {blog.status}
                            </span>
                            {blog.isFeatured && (
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(blog)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(blog)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingBlog ? 'Edit Blog Post' : 'Create New Post'} onClose={() => setIsModalOpen(false)}>
                    <BlogForm blog={editingBlog} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
             {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the blog post "{itemToDelete.title}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// News Ticker Component
// ==========================================================
const ManageNewsTicker = ({ messages, onUpdate }: { messages: string[], onUpdate: (data: string[]) => void }) => {
    const [newMessage, setNewMessage] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [notification, setNotification] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onUpdate([...messages, newMessage.trim()]);
            setNewMessage('');
            setNotification('Message added successfully.');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    const handleDelete = (index: number) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            onUpdate(messages.filter((_, i) => i !== index));
            setNotification('Message deleted successfully.');
            setTimeout(() => setNotification(''), 3000);
        }
    };
    
    const handleEdit = (index: number, text: string) => {
        setEditingIndex(index);
        setEditingText(text);
    };

    const handleSaveEdit = (index: number) => {
        const updatedMessages = [...messages];
        updatedMessages[index] = editingText;
        onUpdate(updatedMessages);
        setEditingIndex(null);
        setEditingText('');
    };

    return (
        <div className="space-y-4">
             {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
             <form onSubmit={handleAdd} className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Add new message..." className="flex-grow p-2 border rounded-md bg-white"/>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add</button>
            </form>
            <div className="space-y-2">
            {messages.map((msg, index) => (
                <div key={index} className="flex items-center gap-2 border p-2 rounded-lg">
                    {editingIndex === index ? (
                        <input value={editingText} onChange={e => setEditingText(e.target.value)} className="flex-grow p-1 border rounded bg-white" />
                    ) : (
                        <p className="flex-grow">{msg}</p>
                    )}
                    <div className="text-sm space-x-2 flex-shrink-0">
                         {editingIndex === index ? (
                            <button onClick={() => handleSaveEdit(index)} className="text-green-600 hover:underline">Save</button>
                        ) : (
                            <button onClick={() => handleEdit(index, msg)} className="text-blue-600 hover:underline">Edit</button>
                        )}
                        <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
};

// ==========================================================
// Popup Components
// ==========================================================
const PopupForm = ({ popup, onSave, onCancel }: { popup: PopupNotification | null, onSave: (data: Omit<PopupNotification, 'id'>, imageFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(popup || { title: '', content: '', imageUrl: '', isActive: true, link: '', linkText: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <input type="hidden" value={String(formState.isActive)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input type="text" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Link Text</label>
                        <input type="text" value={formState.linkText} onChange={e => setFormState({ ...formState, linkText: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Content</label>
                    <textarea value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} rows={3} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Link URL (e.g., /admissions)</label>
                    <input type="text" value={formState.link} onChange={e => setFormState({ ...formState, link: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Image</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Popup</button>
            </div>
        </form>
    );
};

const ManagePopup = ({ popups, onUpdate }: { popups: PopupNotification[], onUpdate: (data: PopupNotification[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<PopupNotification | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<PopupNotification | null>(null);

    const handleToggleActive = (id: number) => {
        onUpdate(popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const handleDeleteClick = (popup: PopupNotification) => {
        setItemToDelete(popup);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(popups.filter(p => p.id !== itemToDelete.id));
            setNotification(`Popup "${itemToDelete.title}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };

    const handleEdit = (popup: PopupNotification) => {
        setEditingPopup(popup);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingPopup(null);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<PopupNotification, 'id'>, imageFile: File | null) => {
        let imageUrl = formData.imageUrl;
        if (imageFile) {
            imageUrl = await compressImage(imageFile, { maxWidth: 600, maxHeight: 400, quality: 0.7 });
        }

        const finalData = { ...formData, imageUrl };

        if (editingPopup) {
            onUpdate(popups.map(p => p.id === editingPopup.id ? { ...editingPopup, ...finalData } : p));
        } else {
            onUpdate([...popups, { ...finalData, id: generateId() }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New Popup</button>
            </div>
            {popups.map(p => (
                <div key={p.id} className="flex items-center gap-4 border p-2 rounded-lg">
                    <img src={p.imageUrl} alt={p.title} className="w-24 h-16 object-cover rounded" />
                    <div className="flex-grow">
                        <p className="font-bold">{p.title}</p>
                        <p className="text-xs text-gray-500 truncate">{p.content}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={p.isActive} onChange={() => handleToggleActive(p.id)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                        </label>
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline text-sm">Edit</button>
                        <button onClick={() => handleDeleteClick(p)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingPopup ? 'Edit Popup' : 'Add New Popup'} onClose={() => setIsModalOpen(false)}>
                    <PopupForm popup={editingPopup} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
             {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the popup "{itemToDelete.title}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// Testimonials Components
// ==========================================================
const TestimonialForm = ({ testimonial, onSave, onCancel }: { testimonial: Testimonial | null, onSave: (data: Omit<Testimonial, 'id'>, imageFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(testimonial || { name: '', program: '', quote: '', imageUrl: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Student Name</label>
                    <input name="name" value={formState.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Program (e.g., ACCA Strategic Professional)</label>
                    <input name="program" value={formState.program} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Quote</label>
                    <textarea name="quote" value={formState.quote} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Student Photo</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    {formState.imageUrl && !imageFile && <img src={formState.imageUrl} alt="current photo" className="w-20 h-20 object-cover mt-2 rounded-full" />}
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Testimonial</button>
            </div>
        </form>
    );
};

const ManageTestimonials = ({ testimonials, onUpdate }: { testimonials: Testimonial[], onUpdate: (data: Testimonial[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);


    const handleDeleteClick = (testimonial: Testimonial) => {
        setItemToDelete(testimonial);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(testimonials.filter(item => item.id !== itemToDelete.id));
            setNotification(`Testimonial from "${itemToDelete.name}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };

    const handleAddNew = () => {
        setEditingTestimonial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<Testimonial, 'id'>, imageFile: File | null) => {
        let imageUrl = formData.imageUrl;
        if (imageFile) {
            imageUrl = await compressImage(imageFile, { maxWidth: 200, maxHeight: 200, quality: 0.8 });
        } else if (!editingTestimonial) {
            imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
        }

        const finalData = { ...formData, imageUrl };

        if (editingTestimonial) {
            onUpdate(testimonials.map(t => t.id === editingTestimonial.id ? { ...editingTestimonial, ...finalData } : t));
        } else {
            onUpdate([{ ...finalData, id: generateId() }, ...testimonials]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New Testimonial</button>
            </div>
            {testimonials.map(testimonial => (
                <div key={testimonial.id} className="flex items-center gap-4 border p-2 rounded-lg bg-white">
                    <img src={testimonial.imageUrl} alt={testimonial.name} className="w-16 h-16 object-cover rounded-full" />
                    <div className="flex-grow">
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.program}</p>
                        <p className="text-xs text-gray-600 italic mt-1 line-clamp-1">"{testimonial.quote}"</p>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(testimonial)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(testimonial)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'} onClose={() => setIsModalOpen(false)}>
                    <TestimonialForm testimonial={editingTestimonial} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the testimonial from "{itemToDelete.name}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================
// High Achievers Components
// ==========================================================
const HighAchieverForm = ({ highAchiever, onSave, onCancel }: { highAchiever: HighAchiever | null, onSave: (data: Omit<HighAchiever, 'id'>, imageFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(highAchiever || { name: '', achievement: '', avatarUrl: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, imageFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Student Name</label>
                    <input name="name" value={formState.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Achievement (e.g., Nepal Topper in FR)</label>
                    <input name="achievement" value={formState.achievement} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Student Photo</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    {formState.avatarUrl && !imageFile && <img src={formState.avatarUrl} alt="current photo" className="w-20 h-20 object-cover mt-2 rounded-full" />}
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Achiever</button>
            </div>
        </form>
    );
};

const ManageHighAchievers = ({ highAchievers, onUpdate }: { highAchievers: HighAchiever[], onUpdate: (data: HighAchiever[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAchiever, setEditingAchiever] = useState<HighAchiever | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [notification, setNotification] = useState('');
    const [itemToDelete, setItemToDelete] = useState<HighAchiever | null>(null);

    const handleDragSort = () => {
        const achieversCopy = [...highAchievers];
        const draggedItemContent = achieversCopy.splice(dragItem.current!, 1)[0];
        achieversCopy.splice(dragOverItem.current!, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onUpdate(achieversCopy);
    };

    const handleDeleteClick = (achiever: HighAchiever) => {
        setItemToDelete(achiever);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(highAchievers.filter(item => item.id !== itemToDelete.id));
            setNotification(`High achiever "${itemToDelete.name}" deleted successfully.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };

    const handleAddNew = () => {
        setEditingAchiever(null);
        setIsModalOpen(true);
    };

    const handleEdit = (achiever: HighAchiever) => {
        setEditingAchiever(achiever);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Omit<HighAchiever, 'id'>, imageFile: File | null) => {
        let avatarUrl = formData.avatarUrl;
        if (imageFile) {
            avatarUrl = await compressImage(imageFile, { maxWidth: 200, maxHeight: 200, quality: 0.8 });
        } else if (!editingAchiever) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
        }

        const finalData = { ...formData, avatarUrl };

        if (editingAchiever) {
            onUpdate(highAchievers.map(a => a.id === editingAchiever.id ? { ...editingAchiever, ...finalData } : a));
        } else {
            onUpdate([{ ...finalData, id: generateId() }, ...highAchievers]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
             {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add High Achiever</button>
            </div>
            {highAchievers.map((achiever, index) => (
                <div
                    key={achiever.id}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-4 border p-2 rounded-lg bg-white cursor-grab active:cursor-grabbing"
                >
                    <img src={achiever.avatarUrl} alt={achiever.name} className="w-16 h-16 object-cover rounded-full" />
                    <div className="flex-grow">
                        <p className="font-bold">{achiever.name}</p>
                        <p className="text-sm text-gray-600">{achiever.achievement}</p>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(achiever)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(achiever)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingAchiever ? 'Edit High Achiever' : 'Add New High Achiever'} onClose={() => setIsModalOpen(false)}>
                    <HighAchieverForm highAchiever={editingAchiever} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
             {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the high achiever "{itemToDelete.name}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// ==========================================================
// Contact Info Components
// ==========================================================
const SocialLinkForm = ({ social, onSave, onCancel }: { social: SocialMediaLink | null, onSave: (data: Omit<SocialMediaLink, 'id'>, iconFile: File | null) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(social || { name: '', url: '', iconUrl: '' });
    const [iconFile, setIconFile] = useState<File | null>(null);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState, iconFile); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name (e.g., Facebook)</label>
                    <input name="name" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Full URL</label>
                    <input name="url" type="url" value={formState.url} onChange={e => setFormState({...formState, url: e.target.value})} placeholder="https://www.facebook.com/..." className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Icon Image (PNG)</label>
                    <input type="file" accept="image/png" onChange={e => setIconFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100" />
                    {formState.iconUrl && !iconFile && <img src={formState.iconUrl} alt="current icon" className="w-10 h-10 object-contain mt-2 p-1 border rounded-md" />}
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save Link</button>
            </div>
        </form>
    );
};

const ManageContactInfo = ({ details, onUpdate }: { details: ContactDetails, onUpdate: (data: ContactDetails) => void }) => {
    const [formState, setFormState] = useState(details);
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [editingSocial, setEditingSocial] = useState<SocialMediaLink | null>(null);
    const [notification, setNotification] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...formState.phones];
        newPhones[index] = value;
        setFormState({ ...formState, phones: newPhones });
    };

    const addPhone = () => {
        setFormState({ ...formState, phones: [...formState.phones, ''] });
    };

    const removePhone = (index: number) => {
        setFormState({ ...formState, phones: formState.phones.filter((_, i) => i !== index) });
    };

    const handleSaveSocial = async (data: Omit<SocialMediaLink, 'id'>, iconFile: File | null) => {
        let iconUrl = data.iconUrl;
        if (iconFile) {
            iconUrl = await imageFileToDataUrl(iconFile, { maxWidth: 64, maxHeight: 64, quality: 0.9 });
        }
        
        const finalData = { ...data, iconUrl };

        if (editingSocial) {
            setFormState({ ...formState, socials: formState.socials.map(s => s.id === editingSocial.id ? { ...editingSocial, ...finalData } : s) });
        } else {
            setFormState({ ...formState, socials: [...formState.socials, { ...finalData, id: generateId() }] });
        }
        setIsSocialModalOpen(false);
    };

    const handleEditSocial = (social: SocialMediaLink) => {
        setEditingSocial(social);
        setIsSocialModalOpen(true);
    };
    
    const handleDeleteSocial = (id: number) => {
        if (window.confirm('Are you sure you want to delete this social link?')) {
            setFormState({ ...formState, socials: formState.socials.filter(s => s.id !== id) });
        }
    };

    const handleSaveChanges = () => {
        onUpdate(formState);
        setNotification('Contact details updated successfully!');
        setTimeout(() => setNotification(''), 3000);
    };

    return (
        <div className="space-y-6">
            {notification && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border space-y-4">
                    <h3 className="font-bold text-lg">Contact Details</h3>
                    <div><label className="text-sm">Email</label><input name="email" value={formState.email} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white"/></div>
                    <div><label className="text-sm">Address</label><textarea name="address" value={formState.address} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border rounded-md bg-white"/></div>
                    <div><label className="text-sm">Office Hours</label><input name="officeHours" value={formState.officeHours} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white"/></div>
                    <div>
                        <label className="text-sm">Phone Numbers</label>
                        {formState.phones.map((phone, index) => (
                            <div key={index} className="flex items-center gap-2 mt-1">
                                <input value={phone} onChange={e => handlePhoneChange(index, e.target.value)} className="flex-grow p-2 border rounded-md bg-white"/>
                                <button onClick={() => removePhone(index)} className="text-red-500 font-bold text-xl">&times;</button>
                            </div>
                        ))}
                        <button onClick={addPhone} className="text-sm text-blue-600 mt-2 hover:underline">+ Add Phone</button>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg border space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Social Media Links</h3>
                        <button onClick={() => { setEditingSocial(null); setIsSocialModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-3 py-1 text-sm rounded-md hover:bg-blue-700">Add New</button>
                    </div>
                    {formState.socials.map(social => (
                        <div key={social.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border hover:shadow-sm transition-shadow">
                            <img src={social.iconUrl} alt={social.name} className="w-10 h-10 object-contain flex-shrink-0"/>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-brand-dark">{social.name}</p>
                                <p className="text-sm text-gray-500 truncate">{social.url}</p>
                            </div>
                            <div className="ml-auto flex-shrink-0 space-x-2">
                                <button onClick={() => handleEditSocial(social)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteSocial(social.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-right">
                <button onClick={handleSaveChanges} className="bg-brand-red text-white font-bold px-8 py-3 rounded-md hover:bg-red-700">Save All Changes</button>
            </div>
             {isSocialModalOpen && (
                <Modal title={editingSocial ? 'Edit Social Link' : 'Add New Social Link'} onClose={() => setIsSocialModalOpen(false)} size="lg">
                    <SocialLinkForm social={editingSocial} onSave={handleSaveSocial} onCancel={() => setIsSocialModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};


// ==========================================================
// FAQ Components
// ==========================================================
const FaqForm = ({ item, onSave, onCancel }: { item: FAQItem | null, onSave: (data: FAQItem) => void, onCancel: () => void }) => {
    const [formState, setFormState] = useState(item || { question: '', answer: '' });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formState); }} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Question</label>
                    <input value={formState.question} onChange={e => setFormState({ ...formState, question: e.target.value })} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Answer</label>
                    <textarea value={formState.answer} onChange={e => setFormState({ ...formState, answer: e.target.value })} rows={5} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Save FAQ</button>
            </div>
        </form>
    );
};

const ManageFaq = ({ items, onUpdate }: { items: FAQItem[], onUpdate: (data: FAQItem[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<FAQItem | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [notification, setNotification] = useState('');

    const handleDragSort = () => {
        const itemsCopy = [...items];
        const draggedItemContent = itemsCopy.splice(dragItem.current!, 1)[0];
        itemsCopy.splice(dragOverItem.current!, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onUpdate(itemsCopy);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: FAQItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: FAQItem) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onUpdate(items.filter(item => item.question !== itemToDelete.question)); // Assuming question is unique enough for keying
            setNotification(`FAQ starting with "${itemToDelete.question.substring(0, 20)}..." deleted.`);
            setTimeout(() => setNotification(''), 3000);
            setItemToDelete(null);
        }
    };

    const handleSave = (formData: FAQItem) => {
        if (editingItem) {
            onUpdate(items.map(item => item.question === editingItem.question ? formData : item));
        } else {
            onUpdate([...items, formData]);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="space-y-4">
            {notification && <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{notification}</div>}
            <div className="text-right">
                <button onClick={handleAddNew} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Add New FAQ</button>
            </div>
            {items.map((item, index) => (
                <div
                    key={index}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-4 border p-3 rounded-lg cursor-grab active:cursor-grabbing bg-white"
                >
                    <div className="flex-grow">
                        <p className="font-bold">{item.question}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{item.answer}</p>
                    </div>
                    <div className="text-sm space-x-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
            {isModalOpen && (
                <Modal title={editingItem ? 'Edit FAQ' : 'Add New FAQ'} onClose={() => setIsModalOpen(false)}>
                    <FaqForm item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            {itemToDelete && (
                <Modal title="Confirm Deletion" onClose={() => setItemToDelete(null)}>
                    <div className="p-6">
                        <p>Are you sure you want to delete the FAQ: "{itemToDelete.question}"?</p>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
                        <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleConfirmDelete} className="bg-brand-red text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// ==========================================================
// Main Component
// ==========================================================
const ManageContentPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Banners');

    const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (e) {
            console.error(`Failed to load ${key} from localStorage`, e);
        }
        return defaultValue;
    };

    const [banners, setBanners] = useState<HeroSlide[]>(() => loadFromLocalStorage('banners', HERO_SLIDES));
    const [gallery, setGallery] = useState<GalleryImage[]>(() => loadFromLocalStorage('gallery', GALLERY_IMAGES));
    const [vlogs, setVlogs] = useState<Vlog[]>(() => loadFromLocalStorage('vlogs', VLOGS));
    const [blogs, setBlogs] = useState<BlogPost[]>(() => loadFromLocalStorage('blogs', BLOG_POSTS));
    const [newsTicker, setNewsTicker] = useState<string[]>(() => loadFromLocalStorage('newsTicker', NEWS_TICKER_MESSAGES));
    const [popups, setPopups] = useState<PopupNotification[]>(() => loadFromLocalStorage('popups', POPUP_NOTIFICATION));
    const [testimonials, setTestimonials] = useState<Testimonial[]>(() => loadFromLocalStorage('testimonials', TESTIMONIALS));
    const [highAchievers, setHighAchievers] = useState<HighAchiever[]>(() => loadFromLocalStorage('highAchievers', HIGH_ACHIEVERS));
    const [contactDetails, setContactDetails] = useState<ContactDetails>(() => loadFromLocalStorage('contactDetails', DEFAULT_CONTACT_DETAILS));
    const [faqItems, setFaqItems] = useState<FAQItem[]>(() => loadFromLocalStorage('faqData', FAQ_DATA));

    const createStorageEffect = <T,>(key: string, value: T) => {
        useEffect(() => {
            try { 
                const valueToStore = JSON.stringify(value);
                localStorage.setItem(key, valueToStore); 
                window.dispatchEvent(new StorageEvent('storage', { key, newValue: valueToStore }));
            } catch (e) { 
                console.error(`Failed to save ${key} to localStorage`, e); 
            }
        }, [value, key]);
    };

    createStorageEffect('banners', banners);
    createStorageEffect('gallery', gallery);
    createStorageEffect('vlogs', vlogs);
    createStorageEffect('blogs', blogs);
    createStorageEffect('newsTicker', newsTicker);
    createStorageEffect('popups', popups);
    createStorageEffect('testimonials', testimonials);
    createStorageEffect('highAchievers', highAchievers);
    createStorageEffect('contactDetails', contactDetails);
    createStorageEffect('faqData', faqItems);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Banners': return <ManageBanners banners={banners} onUpdate={setBanners} />;
            case 'Gallery': return <ManageGallery gallery={gallery} onUpdate={setGallery} />;
            case 'Vlogs': return <ManageVlogs vlogs={vlogs} onUpdate={setVlogs} />;
            case 'Blogs': return <ManageBlogs blogs={blogs} onUpdate={setBlogs} />;
            case 'News Ticker': return <ManageNewsTicker messages={newsTicker} onUpdate={setNewsTicker} />;
            case 'Popup': return <ManagePopup popups={popups} onUpdate={setPopups} />;
            case 'Testimonials': return <ManageTestimonials testimonials={testimonials} onUpdate={setTestimonials} />;
            case 'High Achievers': return <ManageHighAchievers highAchievers={highAchievers} onUpdate={setHighAchievers} />;
            case 'Contact & Socials': return <ManageContactInfo details={contactDetails} onUpdate={setContactDetails} />;
            case 'FAQ': return <ManageFaq items={faqItems} onUpdate={setFaqItems} />;
            default: return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">Manage Site Content</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        {(['Banners', 'Gallery', 'Vlogs', 'Blogs', 'News Ticker', 'Popup', 'Testimonials', 'High Achievers', 'Contact & Socials', 'FAQ'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-brand-red text-brand-red'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ManageContentPage;
