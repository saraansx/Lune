import React, { useState } from 'react';
import './Cache.css';
import { useLanguage } from '../../context/LanguageContext';

const Cache: React.FC = () => {
    const { t } = useLanguage();
    const [isClearing, setIsClearing] = useState(false);
    const [justCleared, setJustCleared] = useState(false);

    return (
        <div className="cache-card settings-language-card" style={{ position: 'relative' }}>
            <div className="settings-account-header">
                <h2 className="settings-account-title">{t('cache.title')}</h2>
                <p className="settings-account-description">{t('cache.sub')}</p>
            </div>

            <div className="language-content">
                <div className="settings-row">
                    <div className="row-info">
                        <span className="row-label">{t('cache.clear')}</span>
                        <span className="row-sub">{t('cache.clearSub')}</span>
                    </div>
                    <button 
                        className={`dropdown-trigger ${justCleared ? 'success' : 'danger'}`} 
                        disabled={isClearing || justCleared}
                        onClick={async () => {
                            setIsClearing(true);
                            const res = await window.ipcRenderer.invoke('clear-cache');
                            setIsClearing(false);
                            if (res.success) {
                                setJustCleared(true);
                                setTimeout(() => setJustCleared(false), 2000);
                            }
                        }}
                        style={{ width: 'auto', minWidth: '140px', justifyContent: 'center' }}
                    >
                        <span>
                            {isClearing ? '...' : (justCleared ? '✓' : t('cache.clear'))}
                        </span>
                    </button>
                </div>

                <div className="settings-row">
                    <div className="row-info">
                        <span className="row-label">{t('cache.open')}</span>
                        <span className="row-sub">{t('cache.openSub')}</span>
                    </div>
                    <button 
                        className="dropdown-trigger" 
                        onClick={() => window.ipcRenderer.invoke('open-cache-folder')}
                        style={{ width: 'auto', minWidth: '140px', justifyContent: 'center' }}
                    >
                        <span>{t('cache.open')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cache;
