
import './Login.css';

import { useState, useEffect } from 'react';
import mainLogo from '../../assets/Main.png';
import { useLanguage } from '../../context/LanguageContext';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [appVersion, setAppVersion] = useState('1.0.0');
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        window.ipcRenderer.invoke('get-app-version').then((v: any) => {
            if (v?.version) setAppVersion(v.version);
        });
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await window.ipcRenderer.invoke('spotify-login');
            if (res) {
                onLoginSuccess();
            } else {
                setError(t('login.failed'));
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || t('login.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-scene">
            {/* Subtle static gradient background */}
            <div className="scene-bg" />

            {/* Centered content */}
            <div className="login-center">
                {/* Moon icon */}
                <div className="moon-icon">
                    <img src={mainLogo} alt="Lune" className="moon-img" draggable={false} />
                </div>

                {/* Branding */}
                <h1 className="brand-title">Lune</h1>
                <p className="brand-tagline">{t('login.tagline')}</p>
                <p className="brand-description">
                    {t('login.description')}
                </p>

                {/* Separator */}
                <div className="line-sep" />

                {/* Connect button */}
                <button
                    className={`connect-btn ${isLoading ? 'loading' : ''} ${error ? 'has-error' : ''}`}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288" />
                        </svg>
                    )}
                    <span>{isLoading ? t('login.connecting') : t('login.continueWithSpotify')}</span>
                </button>

                {error && (
                    <div className="login-error-msg">
                        {error}
                    </div>
                )}
            </div>

            {/* Version Footer */}
            <div className="login-footer">
                <span>V{appVersion}</span>
            </div>
        </main>
    );
};

export default Login;
