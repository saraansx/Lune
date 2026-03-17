import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import mainLogo from '../../assets/Main.png';
import './About.css';

interface AboutModalProps {
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const [version, setVersion] = useState('1.0.0');

    useEffect(() => {
        const getVersion = async () => {
            if (window.ipcRenderer) {
                const v = await window.ipcRenderer.invoke('get-app-version');
                if (v) setVersion(v);
            }
        };
        getVersion();

        // Close on Escape key
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-glass" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="about-modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="about-modal-logo-wrap">
                    <img src={mainLogo} alt="Lune" className="about-modal-logo" />
                </div>

                {/* App name + version */}
                <h2 className="about-modal-name">Lune</h2>
                <span className="about-modal-version">v{version}</span>

                <p className="about-modal-desc">
                    {t('about.description') || 'A next-generation music player designed for performance, privacy, and the ultimate listening experience.'}
                </p>

                <div className="about-modal-divider" />

                <div className="about-modal-meta">
                    <span className="about-meta-label">License</span>
                    <span className="about-meta-value">GPL-3.0</span>
                </div>

                <div className="about-modal-meta">
                    <span className="about-meta-label">Built with</span>
                    <span className="about-meta-value">Electron · React · Vite</span>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
