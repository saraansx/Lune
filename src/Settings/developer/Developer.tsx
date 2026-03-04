import React, { useState } from 'react';
import './Developer.css';
import { useLanguage } from '../../context/LanguageContext';
import LogsModal from './LogsModal';

const Developer: React.FC = () => {
    const { t } = useLanguage();
    const [showLogs, setShowLogs] = useState(false);

    return (
        <div className="settings-language-card developer-card">
            <div className="settings-account-header">
                <h2 className="settings-account-title">{t('developer.title') || 'Developers'}</h2>
                <p className="settings-account-description">{t('developer.sub') || 'Advanced tools and application logging for debugging.'}</p>
            </div>

            <div className="language-content">
                <div className="settings-row">
                    <div className="row-info">
                        <span className="row-label">{t('developer.logsLabel') || 'Application Logs'}</span>
                        <span className="row-sub">{t('developer.logsSub') || 'View real-time system logs and debug information.'}</span>
                    </div>
                    <button 
                        className="lune-btn-secondary" 
                        onClick={() => setShowLogs(true)}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        {t('developer.openLogs') || 'Open Logs'}
                    </button>
                </div>
            </div>

            {showLogs && <LogsModal onClose={() => setShowLogs(false)} />}
        </div>
    );
};

export default Developer;
