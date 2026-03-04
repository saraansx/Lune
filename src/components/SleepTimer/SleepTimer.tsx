import React, { useState, useEffect, useRef } from 'react';
import './SleepTimer.css';
import { usePlayer } from '../../context/PlayerContext';
import { useLanguage } from '../../context/LanguageContext';

type TimerMode = 'off' | '15m' | '30m' | '60m' | 'track';

const SleepTimer: React.FC = () => {
    const { setIsPlaying, currentTrack } = usePlayer();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<TimerMode>('off');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [targetTrackId, setTargetTrackId] = useState<string | null>(null);

    // Handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Timer logic
    useEffect(() => {
        if (mode === 'off') {
            setTimeLeft(null);
            setTargetTrackId(null);
            return;
        }

        if (mode === 'track') {
            if (!targetTrackId && currentTrack) {
                setTargetTrackId(currentTrack.id);
            } else if (targetTrackId && currentTrack && targetTrackId !== currentTrack.id) {
                // Track changed = ended
                setIsPlaying(false);
                setMode('off');
            }
            return;
        }

        // Time-based modes
        let minutes = 0;
        if (mode === '15m') minutes = 15;
        if (mode === '30m') minutes = 30;
        if (mode === '60m') minutes = 60;

        const targetTime = Date.now() + minutes * 60 * 1000;
        setTimeLeft(minutes * 60);

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                setIsPlaying(false);
                setMode('off');
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [mode, currentTrack?.id, setIsPlaying]); // Watch currentTrack to trigger "track" mode check

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (newMode: TimerMode) => {
        setMode(newMode);
        setIsOpen(false);
        // Reset target track so it rebinds to whatever is playing *now*
        if (newMode === 'track' && currentTrack) {
             setTargetTrackId(currentTrack.id);
        } else {
             setTargetTrackId(null);
        }
    };

    const safeT = (key: string, fallback: string) => {
        const result = t(key);
        return result === key ? fallback : result;
    };

    const options: { id: TimerMode, label: string }[] = [
        { id: 'off', label: safeT('sleep.off', 'Off') },
        { id: '15m', label: `15 ${safeT('sleep.minutes', 'Minutes')}` },
        { id: '30m', label: `30 ${safeT('sleep.minutes', 'Minutes')}` },
        { id: '60m', label: `1 ${safeT('sleep.hour', 'Hour')}` },
        { id: 'track', label: safeT('sleep.endOfTrack', 'End of Track') },
    ];

    return (
        <div className="sleep-timer-container" ref={dropdownRef}>
            <button 
                className={`sleep-trigger ${mode !== 'off' ? 'active timer-on' : ''} ${isOpen ? 'dropdown-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={safeT('sleep.title', 'Sleep Timer')}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                {mode !== 'off' && mode !== 'track' && timeLeft !== null && (
                    <span className="sleep-timer-badge">{formatTime(timeLeft)}</span>
                )}
                {mode === 'track' && (
                    <span className="sleep-timer-badge track-badge">1</span>
                )}
            </button>

            {isOpen && (
                <div className="sleep-dropdown">
                    {options.map((opt) => (
                        <div 
                            key={opt.id}
                            className={`sleep-item ${mode === opt.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(opt.id)}
                        >
                            {opt.label}
                            {mode === opt.id && (
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

export default SleepTimer;
