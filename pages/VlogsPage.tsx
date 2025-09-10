import React from 'react';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { VLOGS } from '../constants.ts';
import type { Vlog } from '../types';
import { getItems } from '../services/dataService';

const VideoPlayerModal: React.FC<{ vlog: Vlog; onClose: () => void }> = ({ vlog, onClose }) => {
    // Determine if the video is from a local upload or a URL
    const videoSrc = vlog.sourceType === 'upload' ? vlog.localVideoSrc : vlog.videoUrl;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-4xl bg-black" onClick={e => e.stopPropagation()}>
                <div className="aspect-video">
                    {vlog.sourceType === 'upload' ? (
                        <video src={videoSrc} controls autoPlay className="w-full h-full object-contain" />
                    ) : (
                         <iframe 
                            src={videoSrc} 
                            title={vlog.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    )}
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors" aria-label="Close video player">&times;</button>
        </div>
    );
};

const VlogsPage: React.FC = () => {
    const [vlogs, setVlogs] = React.useState<Vlog[]>(() => getItems('vlogs', VLOGS));
    const [selectedVlog, setSelectedVlog] = React.useState<Vlog | null>(null);

     React.useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'vlogs') {
                setVlogs(getItems('vlogs', VLOGS));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);


    return (
        <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Vlogs</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">See what life is like at Learners Academy. Explore campus tours, student stories, and special events.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vlogs.map((vlog) => (
                        <div 
                            key={vlog.id} 
                            className="overflow-hidden rounded-lg shadow-lg group cursor-pointer border"
                            onClick={() => setSelectedVlog(vlog)}
                        >
                            <div className="relative">
                                <img 
                                    src={vlog.thumbnailUrl} 
                                    alt={vlog.title} 
                                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <h3 className="font-bold text-lg text-brand-dark group-hover:text-brand-red transition-colors">{vlog.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{new Date(vlog.publicationDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {selectedVlog && (
                <VideoPlayerModal vlog={selectedVlog} onClose={() => setSelectedVlog(null)} />
            )}
        </div>
    );
};

export default VlogsPage;
