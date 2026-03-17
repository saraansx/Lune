
import React, { useEffect, useState, useRef } from 'react';
import './LyricsView.css';
import { usePlayer } from '../../context/PlayerContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchLyrics, parseSyncedLyrics } from '../../services/lyricsService';

const LyricsView: React.FC = () => {
    const { 
        currentTrack, 
        showLyrics, 
        setShowLyrics 
    } = usePlayer();
    const { t } = useLanguage();
    
    const [lyrics, setLyrics] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch lyrics when track changes
    useEffect(() => {
        if (!currentTrack) return;

        const getLyrics = async () => {
            setLoading(true);
            setError(null);
            setLyrics([]);
            
            const data = await fetchLyrics(
                currentTrack.name, 
                currentTrack.artist, 
                currentTrack.durationMs / 1000
            );

            if (data) {
                if (data.plainLyrics) {
                    setLyrics(data.plainLyrics.split('\n'));
                } else if (data.syncedLyrics) {
                    // Fallback: strip timestamps from synced lyrics
                    const lines = parseSyncedLyrics(data.syncedLyrics).map(l => l.text);
                    setLyrics(lines);
                } else {
                    setError(t('lyrics.notFound'));
                }
            } else {
                setError(t('lyrics.notFound'));
            }
            setLoading(false);
        };

        getLyrics();
    }, [currentTrack?.id]);

    if (!showLyrics) return null;

    return (
        <div className={`lyrics-view-overlay ${showLyrics ? 'active' : ''}`}>
            <div 
                className="lyrics-background-blur" 
                style={{ backgroundImage: `url(${currentTrack?.albumArt})` }}
            />
            
            <div className="lyrics-header">
                <div className="track-info">
                    <img src={currentTrack?.albumArt} alt="" className="mini-art" />
                    <div className="text">
                        <span className="name">{currentTrack?.name}</span>
                        <span className="artist">{currentTrack?.artist}</span>
                    </div>
                </div>
                <button className="close-lyrics-btn" onClick={() => setShowLyrics(false)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="lyrics-content" ref={scrollContainerRef}>
                {loading && <div className="lyrics-status">{t('lyrics.searching')}</div>}
                {error && <div className="lyrics-status">{error}</div>}
                
                {lyrics.length > 0 && (
                    <div className="lyrics-container">
                        {lyrics.map((line, index) => (
                            <div key={index} className="lyric-line-static">
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="lyrics-footer-gradient" />
        </div>
    );
};

export default LyricsView;
