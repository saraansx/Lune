import React, { useState, useEffect } from 'react';

// Singleton to hold the current downloading state so we don't have 100 IPC listeners
const downloadStateObj: {
    downloading: { [id: string]: number },
    downloaded: Set<string>,
    listeners: Set<() => void>
} = {
    downloading: {},
    downloaded: new Set(),
    listeners: new Set()
};

const notifyListeners = () => {
    downloadStateObj.listeners.forEach(listener => listener());
};

// Initialize the IPC listener ONCE outside of React components
let initialized = false;
const initDownloadState = () => {
    if (initialized) return;
    initialized = true;

    const fetchDownloaded = async () => {
        try {
            const tracks = await window.ipcRenderer.invoke('get-downloads');
            downloadStateObj.downloaded = new Set((tracks || []).map((t: any) => t.id));
            
            Object.keys(downloadStateObj.downloading).forEach(id => {
                if (downloadStateObj.downloaded.has(id)) {
                    delete downloadStateObj.downloading[id];
                }
            });

            notifyListeners();
        } catch (err) {
            console.error('Failed to fetch downloads in DownloadIndicator', err);
        }
    };
    fetchDownloaded();

    const handleUpdate = () => {
        fetchDownloaded();
    };

    window.addEventListener('lune:download-update', handleUpdate);

    const ipcRenderer = window.ipcRenderer;
    if (ipcRenderer) {
        ipcRenderer.on('download-progress', (_event: any, data: { id: string, progress: number }) => {
            if (data.progress === -1) {
                delete downloadStateObj.downloading[data.id];
                notifyListeners();
                return;
            }

            downloadStateObj.downloading[data.id] = data.progress;
            
            if (data.progress >= 100) {
                setTimeout(() => {
                    delete downloadStateObj.downloading[data.id];
                    downloadStateObj.downloaded.add(data.id);
                    notifyListeners();
                }, 500);
            }
            notifyListeners();
        });

        ipcRenderer.on('lune:download-status-changed', handleUpdate); // Updated to use handleUpdate
    }
};

export const useDownloadsState = () => {
    const [state, setState] = useState({
        downloading: { ...downloadStateObj.downloading },
        downloaded: new Set(downloadStateObj.downloaded)
    });

    useEffect(() => {
        initDownloadState();
        
        const handleChange = () => {
            setState({
                downloading: { ...downloadStateObj.downloading },
                downloaded: new Set(downloadStateObj.downloaded)
            });
        };
        
        downloadStateObj.listeners.add(handleChange);
        // Initial sync
        handleChange();
        
        return () => {
            downloadStateObj.listeners.delete(handleChange);
        };
    }, []);

    return state;
};

export const useTrackDownloadState = (trackId: string) => {
    const [state, setState] = useState(() => ({
        progress: downloadStateObj.downloading[trackId],
        isDownloaded: downloadStateObj.downloaded.has(trackId)
    }));

    useEffect(() => {
        initDownloadState();
        
        const handleChange = () => {
            const newProgress = downloadStateObj.downloading[trackId];
            const newIsDownloaded = downloadStateObj.downloaded.has(trackId);
            setState(prev => {
                if (prev.progress === newProgress && prev.isDownloaded === newIsDownloaded) {
                    return prev;
                }
                return { progress: newProgress, isDownloaded: newIsDownloaded };
            });
        };
        
        downloadStateObj.listeners.add(handleChange);
        handleChange();
        
        return () => {
            downloadStateObj.listeners.delete(handleChange);
        };
    }, [trackId]);

    return state;
};

export const DownloadIndicator: React.FC<{ trackId: string }> = React.memo(({ trackId }) => {
    const { progress: currentProgress, isDownloaded } = useTrackDownloadState(trackId);

    // If it's downloaded and we have a stale progress, prioritize the downloaded state
    if (isDownloaded) {
        return (
            <div title="Downloaded" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '18px', 
                height: '18px', 
                marginLeft: '12px', 
                verticalAlign: 'middle',
                flexShrink: 0,
                position: 'relative'
            }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                    <circle cx="9" cy="9" r="8.5" fill="rgba(var(--accent-rgb), 0.2)" stroke="rgba(var(--accent-rgb), 0.5)" strokeWidth="1" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-main)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 2px rgba(var(--accent-rgb), 0.5))' }}>
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>
        );
    }

    if (currentProgress === undefined) return null;

    // Default to 0 to prevent NaN in strokeDashoffset
    const progress = currentProgress || 0; 
    const isInitializing = progress > 0 && progress < 1;
    
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div 
            title={isInitializing ? "Requesting..." : `Downloading... ${Math.round(progress)}%`} 
            className={isInitializing ? "download-pulse" : ""}
            style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '20px', 
            height: '20px', 
            marginLeft: '12px', 
            position: 'relative', 
            verticalAlign: 'middle',
            flexShrink: 0
        }}>
            {/* Background ring */}
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="10" cy="10" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <circle 
                    cx="10" cy="10" r={radius} 
                    fill="none" 
                    stroke="var(--accent-main)" 
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ 
                        transition: 'stroke-dashoffset 0.1s linear',
                        filter: 'drop-shadow(0 0 3px rgba(var(--accent-rgb), 0.5))'
                    }}
                />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v14M19 11l-7 7-7-7"/>
                </svg>
            </div>
        </div>
    );
});
