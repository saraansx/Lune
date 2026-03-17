import React from 'react';
import './Settings.css';
import Account from '../account/Account';
import Language from '../language/Language';
import Appearance from '../appearance/Appearance';
import Playback from '../playback/Playback';
import Downloads from '../downloads/Downloads';
import Cache from '../cache/Cache';
import Desktop from '../desktop/Desktop';
import Developer from '../developer/Developer';
import Updates from '../updates/Updates';
import About from '../about/About';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsProps {
    accessToken: string;
    cookies: any[];
}

const Settings: React.FC<SettingsProps> = ({ accessToken, cookies }) => {
    const { t } = useLanguage();
    return (
        <div className="settings-container">
            <div className="settings-content">
                <div className="settings-header">
                    <h1>{t('settings.settings')}</h1>
                </div>
                
                <Account accessToken={accessToken} cookies={cookies} />
                <Language />
                <Appearance />
                <Playback />
                <Downloads />
                <Cache />
                <Desktop />
                <Developer />
                <Updates />
                <About />
            </div>
        </div>
    );
};

export default Settings;
