import React, { useState, useRef, useEffect } from 'react';
import './Equalizer.css';
import { usePlayback } from '../../context/PlaybackContext';

const PRESETS: Record<string, number[]> = {
    'Flat': [0, 0, 0, 0, 0],
    'Bass Boost': [6, 4, 0, -2, -4],
    'Electronic': [4, 3, -2, 2, 5],
    'Acoustic': [2, 1, 3, 2, 4],
    'Vocal Boost': [-2, 0, 4, 3, 1],
    'Rock': [5, 3, -1, 3, 5]
};

const FREQUENCIES = [
    { label: 'Bass', freq: '60Hz' },
    { label: 'Mid-Bass', freq: '230Hz' },
    { label: 'Mid', freq: '910Hz' },
    { label: 'Vocal', freq: '3.6kHz' },
    { label: 'Treble', freq: '14kHz' }
];

const Equalizer: React.FC = () => {
    const { eqEnabled, setEqEnabled, eqBands, setEqBands } = usePlayback();
    const [isOpen, setIsOpen] = useState(false);
    const [isPresetOpen, setIsPresetOpen] = useState(false);
    const [activePreset, setActivePreset] = useState<string>('Custom');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const presetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (presetRef.current && !presetRef.current.contains(event.target as Node)) {
                setIsPresetOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsPresetOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSliderChange = (index: number, value: number) => {
        const newBands = [...eqBands];
        newBands[index] = value;
        setEqBands(newBands);
        setActivePreset('Custom');
    };

    const applyPreset = (presetName: string) => {
        setEqBands(PRESETS[presetName]);
        setActivePreset(presetName);
        setIsPresetOpen(false);
    };

    return (
        <div className="eq-container" ref={dropdownRef}>
            <button 
                className={`eq-trigger ${eqEnabled ? 'active' : ''} ${isOpen ? 'dropdown-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Equalizer"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
            </button>

            {isOpen && (
                <div className="eq-dropdown">
                    <div className="eq-header">
                        <span className="eq-title">Equalizer</span>
                        <label className="eq-toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={eqEnabled} 
                                onChange={(e) => setEqEnabled(e.target.checked)} 
                            />
                            <span className="eq-toggle-slider"></span>
                        </label>
                    </div>

                    <div className={`eq-body ${!eqEnabled ? 'disabled' : ''}`}>
                        <div className="eq-presets-custom" ref={presetRef}>
                            <div 
                                className={`eq-preset-active ${!eqEnabled ? 'disabled' : ''} ${isPresetOpen ? 'open' : ''}`}
                                onClick={() => eqEnabled && setIsPresetOpen(!isPresetOpen)}
                            >
                                <span>{activePreset}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPresetOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                            
                            {isPresetOpen && eqEnabled && (
                                <div className="eq-preset-list">
                                    {Object.keys(PRESETS).map(preset => (
                                        <div 
                                            key={preset}
                                            className={`eq-preset-option ${activePreset === preset ? 'selected' : ''}`}
                                            onClick={() => applyPreset(preset)}
                                        >
                                            {preset}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="eq-sliders-container">
                            {eqBands.map((bandValue, index) => (
                                <div key={index} className="eq-band">
                                    <span className="eq-band-value">{bandValue > 0 ? `+${bandValue}` : bandValue}</span>
                                    <input
                                        type="range"
                                        min="-15"
                                        max="15"
                                        step="1"
                                        value={bandValue}
                                        onChange={(e) => handleSliderChange(index, parseFloat(e.target.value))}
                                        className="eq-slider-input vertical"
                                        disabled={!eqEnabled}
                                    />
                                    <span className="eq-band-label">{FREQUENCIES[index].label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Equalizer;
