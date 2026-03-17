import React, { useState, useRef, useEffect } from 'react';
import './PlaybackSpeed.css';
import { usePlayback } from '../../context/PlaybackContext';
import { useLanguage } from '../../context/LanguageContext';

const PlaybackSpeed: React.FC = () => {
    const { playbackSpeed, setPlaybackSpeed } = usePlayback();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="playback-speed-container" ref={dropdownRef}>
            <button 
                className={`speed-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={t('playback.speed')}
            >
                <span>{playbackSpeed}x</span>
            </button>

            {isOpen && (
                <div className="speed-dropdown">
                    {speeds.map((speed) => (
                        <div 
                            key={speed}
                            className={`speed-item ${playbackSpeed === speed ? 'selected' : ''}`}
                            onClick={() => {
                                setPlaybackSpeed(speed);
                                setIsOpen(false);
                            }}
                        >
                            {speed}x
                            {playbackSpeed === speed && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaybackSpeed;
