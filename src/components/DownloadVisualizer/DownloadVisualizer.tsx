import React, { useEffect, useState } from 'react';
import './DownloadVisualizer.css';

interface DownloadProgress {
    id: string;
    name: string;
    progress: number;
}

const DownloadVisualizer: React.FC = () => {
    const [downloads, setDownloads] = useState<{ [id: string]: DownloadProgress }>({});

    useEffect(() => {
        const handleProgress = (_event: any, data: DownloadProgress) => {
            setDownloads(prev => {
                const newState = { ...prev };
                newState[data.id] = data;
                
                if (data.progress >= 100) {
                    setTimeout(() => {
                        setDownloads(current => {
                            const updated = { ...current };
                            delete updated[data.id];
                            return updated;
                        });
                        window.dispatchEvent(new Event('lune:download-update'));
                    }, 2500); // 2.5 seconds to fade out successfully
                }
                return newState;
            });
        };

        const { ipcRenderer } = window;
        
        // Remove existing listener to prevent duplicates in React Strict Mode
        if (ipcRenderer && ipcRenderer.removeAllListeners) {
            ipcRenderer.removeAllListeners('download-progress');
        }

        if (ipcRenderer) {
            ipcRenderer.on('download-progress', handleProgress);
        }

        return () => {
            if (ipcRenderer && ipcRenderer.removeAllListeners) {
                ipcRenderer.removeAllListeners('download-progress');
            }
        };
    }, []);

    const activeDownloads = Object.values(downloads);

    if (activeDownloads.length === 0) return null;

    return (
        <div className="download-visualizer-container">
            {activeDownloads.map(dl => (
                <div key={dl.id} className={`download-item ${dl.progress >= 100 ? 'download-complete' : ''}`}>
                    <div className="dl-icon-container">
                        {dl.progress >= 100 ? (
                            <svg className="dl-icon success" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <svg className="dl-icon downloading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M19 12l-7 7-7-7"/>
                            </svg>
                        )}
                    </div>
                    <div className="dl-content">
                        <div className="dl-info">
                            <span className="dl-name">{dl.name}</span>
                            <span className="dl-percent">{dl.progress >= 100 ? 'Done' : `${Math.round(Math.max(0, Math.min(100, dl.progress)))}%`}</span>
                        </div>
                        <div className="dl-progress-bar-bg">
                            <div 
                                className="dl-progress-bar-fill" 
                                style={{ width: `${Math.max(0, Math.min(100, dl.progress))}%` }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DownloadVisualizer;
