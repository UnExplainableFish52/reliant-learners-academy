import React, { useState } from 'react';
import type { DownloadItem } from '../../types.ts';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes * k) / Math.log(k));
    return parseFloat(((bytes * k) / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const DownloadProgressItem: React.FC<{
    item: DownloadItem;
    onPause: (id: number) => void;
    onResume: (id: number) => void;
    onCancel: (id: number) => void;
}> = ({ item, onPause, onResume, onCancel }) => {
    const downloadedSize = (item.size * item.progress) / 100;
    
    return (
        <div className="p-3 border-b last:border-b-0">
            <p className="text-sm font-semibold truncate text-gray-800">{item.title}</p>
            <div className="flex items-center my-1.5">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-200 ${item.status === 'completed' ? 'bg-green-500' : 'bg-brand-red'}`} 
                        style={{ width: `${item.progress}%`}}
                    ></div>
                </div>
                <span className="text-xs font-mono w-12 text-right">{Math.round(item.progress)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
                <p>
                    {item.status === 'completed' 
                        ? `${formatBytes(item.size)}`
                        : `${formatBytes(downloadedSize)} / ${formatBytes(item.size)}`
                    }
                    <span className="capitalize ml-2">{item.status}...</span>
                </p>
                <div className="flex items-center space-x-2">
                     {item.status === 'downloading' && (
                        <button onClick={() => onPause(item.id)} title="Pause" className="hover:text-brand-dark">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        </button>
                    )}
                    {item.status === 'paused' && (
                        <button onClick={() => onResume(item.id)} title="Resume" className="hover:text-brand-dark">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                        </button>
                    )}
                    {item.status !== 'completed' && (
                         <button onClick={() => onCancel(item.id)} title="Cancel" className="hover:text-brand-red">
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const DownloadManager: React.FC<{
    queue: DownloadItem[];
    onPause: (id: number) => void;
    onResume: (id: number) => void;
    onCancel: (id: number) => void;
    onClearCompleted: () => void;
}> = ({ queue, onPause, onResume, onCancel, onClearCompleted }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const activeDownloads = queue.filter(item => item.status !== 'completed' && item.status !== 'canceled').length;

    if (queue.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border z-50">
            <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-full flex justify-between items-center p-3 bg-brand-dark text-white rounded-t-lg cursor-pointer"
            >
                <h3 className="font-bold text-md">
                    {isMinimized ? `Downloads (${activeDownloads} active)` : 'Download Manager'}
                </h3>
                 <div className="flex items-center space-x-2">
                    {activeDownloads > 0 && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red"></span></span>}
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMinimized ? 'max-h-0' : 'max-h-96'}`}>
                <div className="max-h-64 overflow-y-auto">
                   {queue.map(item => (
                       <DownloadProgressItem 
                            key={item.id} 
                            item={item} 
                            onPause={onPause} 
                            onResume={onResume} 
                            onCancel={onCancel} 
                        />
                   ))}
                </div>
                <div className="p-2 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClearCompleted} className="w-full text-center text-sm font-semibold text-gray-600 hover:text-brand-red py-1">
                        Clear Completed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadManager;