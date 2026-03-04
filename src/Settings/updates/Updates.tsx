import React, { useState, useEffect } from 'react';
import './Updates.css';
import { useLanguage } from '../../context/LanguageContext';

const Updates: React.FC = () => {
    const { t } = useLanguage();
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [autoUpdateYtdlp, setAutoUpdateYtdlp] = useState(true);

    // Load initial settings
    useEffect(() => {
        const loadSettings = async () => {
            if (window.ipcRenderer) {
                const appSetting = await window.ipcRenderer.invoke('get-setting', 'autoUpdateApp');
                const ytdlpSetting = await window.ipcRenderer.invoke('get-setting', 'autoUpdateYtdlp');
                
                if (appSetting !== undefined) setAutoUpdate(appSetting);
                if (ytdlpSetting !== undefined) setAutoUpdateYtdlp(ytdlpSetting);
            }
        };
        loadSettings();
    }, []);

    // Save app auto-update setting
    const handleToggle = (newValue: boolean) => {
        setAutoUpdate(newValue);
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('set-setting', 'autoUpdateApp', newValue);
        }
    };

    // Save ytdlp auto-update setting
    const handleYtdlpToggle = (newValue: boolean) => {
        setAutoUpdateYtdlp(newValue);
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('set-setting', 'autoUpdateYtdlp', newValue);
        }
    };

    return (
        <div className="settings-language-card about-card">
            <div className="settings-account-header">
                <h2 className="settings-account-title">{t('updates.title') || 'Updates'}</h2>
                <p className="settings-account-description">{t('updates.sub') || 'Manage application updates and playback system optimizations.'}</p>
            </div>

            <div className="language-content">
                {/* App Update Section */}
                <div className="settings-row" onClick={() => handleToggle(!autoUpdate)} style={{ cursor: 'pointer' }}>
                    <div className="row-info">
                        <span className="row-label">{t('updates.autoUpdateLabel') || 'Auto-Update Lune'}</span>
                        <span className="row-sub">{t('updates.autoUpdateSub') || 'Automatically download and install updates in the background.'}</span>
                    </div>
                    <label className="about-switch" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            checked={autoUpdate}
                            onChange={(e) => handleToggle(e.target.checked)}
                        />
                        <span className="about-switch-slider"></span>
                    </label>
                </div>

                <div 
                    className={`settings-row ${autoUpdate ? 'disabled' : ''}`}
                    onClick={() => {
                        if (!autoUpdate) {
                            window.ipcRenderer.invoke('check-app-update');
                        }
                    }} 
                    style={{ 
                        cursor: autoUpdate ? 'default' : 'pointer', 
                        marginTop: '12px', 
                        borderTop: '1px solid rgba(255,255,255,0.04)', 
                        paddingTop: '12px',
                        opacity: autoUpdate ? 0.4 : 1
                    }}
                >
                    <div className="row-info">
                        <span className="row-label" style={{ color: autoUpdate ? 'var(--text-dim)' : 'var(--accent)', fontWeight: 500 }}>
                            {t('updates.checkUpdate') || 'Check for Updates'}
                        </span>
                        <span className="row-sub">
                            {autoUpdate 
                                ? (t('updates.managedByAuto') || 'Updates are managed automatically.')
                                : (t('updates.checkUpdateSub') || 'Manually check if a new version is available.')
                            }
                        </span>
                    </div>
                </div>

                {/* Ytdlp Driver Update Section */}
                <div 
                    className="settings-row" 
                    onClick={() => handleYtdlpToggle(!autoUpdateYtdlp)} 
                    style={{ cursor: 'pointer', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}
                >
                    <div className="row-info">
                        <span className="row-label">{t('updates.ytdlpLabel') || 'Update Playback Drivers'}</span>
                        <span className="row-sub">{t('updates.ytdlpSub') || 'Automatically keep the playback system optimized.'}</span>
                    </div>
                    <label className="about-switch" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            checked={autoUpdateYtdlp}
                            onChange={(e) => handleYtdlpToggle(e.target.checked)}
                        />
                        <span className="about-switch-slider"></span>
                    </label>
                </div>

                <div 
                    className={`settings-row ${autoUpdateYtdlp ? 'disabled' : ''}`}
                    onClick={() => {
                        if (!autoUpdateYtdlp) {
                            window.ipcRenderer.send('check-ytdlp-update');
                        }
                    }} 
                    style={{ 
                        cursor: autoUpdateYtdlp ? 'default' : 'pointer', 
                        marginTop: '12px', 
                        borderTop: '1px solid rgba(255,255,255,0.04)', 
                        paddingTop: '12px',
                        opacity: autoUpdateYtdlp ? 0.4 : 1
                    }}
                >
                    <div className="row-info">
                        <span className="row-label" style={{ color: autoUpdateYtdlp ? 'var(--text-dim)' : 'var(--accent)', fontWeight: 500 }}>
                            {t('updates.checkYtdlp') || 'Check for Driver Updates'}
                        </span>
                        <span className="row-sub">
                            {autoUpdateYtdlp 
                                ? (t('updates.managedByAuto') || 'Updates are managed automatically.')
                                : (t('updates.checkYtdlpSub') || 'Ensure your playback engine is running the latest version.')
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Updates;
