import React, { useState, useEffect } from 'react';
// FIX: Add missing VLOGS import.
import { GALLERY_IMAGES, VLOGS } from '../constants.ts';
import type { GalleryImage, Vlog } from '../types.ts';
import AnimatedSection from '../components/AnimatedSection.tsx';
import { getItems } from '../services/dataService.ts';

const MediaModal: React.FC<{
    item: GalleryImage;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}> = ({ item, onClose, onPrev, onNext }) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext]);

    const handlePrevClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPrev();
    };

    const handleNextClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNext();
    };

    // Prioritize localVideoSrc for uploaded content. This ensures <video> tag is used.
    const isUploadedVideo = !!item.localVideoSrc;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-black" onClick={e => e.stopPropagation()}>
                 {item.type === 'image' ? (
                    <img 
                        src={item.src.includes('data:image') ? item.src : item.src.replace('600/400', '1200/800')}
                        alt={item.alt} 
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="aspect-video w-full">
                        {isUploadedVideo ? (
                            <video src={item.localVideoSrc} controls autoPlay className="w-full h-full object-contain" />
                        ) : (
                            <iframe 
                                src={item.videoUrl} 
                                title={item.alt}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        )}
                    </div>
                )}
            </div>
             {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors" aria-label="Close image viewer">&times;</button>

            {/* Prev Button */}
            <button onClick={handlePrevClick} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full text-3xl hover:bg-opacity-75 transition-colors" aria-label="Previous image">&#8249;</button>

            {/* Next Button */}
            <button onClick={handleNextClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full text-3xl hover:bg-opacity-75 transition-colors" aria-label="Next image">&#8250;</button>
        </div>
    );
};


const GalleryPage: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [allMedia, setAllMedia] = useState<GalleryImage[]>([]);

    useEffect(() => {
        const galleryData = getItems('gallery', GALLERY_IMAGES);
        const vlogsData = getItems('vlogs', VLOGS);

        const vlogsAsGalleryItems: GalleryImage[] = vlogsData.map((vlog: Vlog, index: number) => ({
            id: galleryData.length + index + 1, // Create unique IDs
            type: 'video',
            src: vlog.thumbnailUrl,
            alt: vlog.title,
            category: 'Vlogs',
            videoUrl: vlog.sourceType === 'upload' ? vlog.localVideoSrc : vlog.videoUrl,
            localVideoSrc: vlog.sourceType === 'upload' ? vlog.localVideoSrc : undefined,
        }));
        
        // Combine all gallery items (images and videos) with vlogs.
        setAllMedia([...galleryData, ...vlogsAsGalleryItems]);
    }, []);


    const categories = ['All', ...Array.from(new Set(allMedia.map(item => item.category)))];
    
    const filteredMedia = filter === 'All' ? allMedia : allMedia.filter(item => item.category === filter);

    const handleOpenModal = (item: GalleryImage) => {
        const index = filteredMedia.findIndex(mediaItem => mediaItem.id === item.id);
        setSelectedItemIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedItemIndex(null);
    };

    const handleNext = () => {
        if (selectedItemIndex === null) return;
        setSelectedItemIndex((prevIndex) => (prevIndex! + 1) % filteredMedia.length);
    };
    
    const handlePrev = () => {
        if (selectedItemIndex === null) return;
        setSelectedItemIndex((prevIndex) => (prevIndex! - 1 + filteredMedia.length) % filteredMedia.length);
    };
    

    return (
         <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Gallery & Vlogs</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">A glimpse into life at Learners Academy through photos, videos, and vlogs.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                {/* Filter Buttons */}
                <AnimatedSection className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
                                filter === category 
                                ? 'bg-brand-red text-white shadow-md' 
                                : 'bg-gray-200 text-brand-dark hover:bg-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </AnimatedSection>

                <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMedia.map((item) => (
                        <div 
                            key={item.id} 
                            className="overflow-hidden rounded-lg shadow-lg group cursor-pointer relative"
                            onClick={() => handleOpenModal(item)}
                        >
                            <img 
                                src={item.src} 
                                alt={item.alt} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 aspect-[3/2]"
                            />
                             {item.type === 'video' && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {item.category === 'Vlogs' && (
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                    <h3 className="text-white font-semibold text-sm truncate">{item.alt}</h3>
                                </div>
                            )}
                        </div>
                    ))}
                </AnimatedSection>
            </div>
            {selectedItemIndex !== null && (
                <MediaModal 
                    item={filteredMedia[selectedItemIndex]}
                    onClose={handleCloseModal}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            )}
        </div>
    );
};

export default GalleryPage;
