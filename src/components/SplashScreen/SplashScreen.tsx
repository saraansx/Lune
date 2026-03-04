import { useState, useEffect } from 'react';
import './SplashScreen.css';
import splashLogo from '../../assets/Splash.png';

interface SplashScreenProps {
    onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show splash for 2 seconds, then start fade-out
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 2000);

        // After fade-out animation completes (~600ms), signal finished
        const finishTimer = setTimeout(() => {
            onFinished();
        }, 2600);

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinished]);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-logo-container">
                <img 
                    src={splashLogo} 
                    alt="Lune Logo" 
                    className="splash-logo" 
                    draggable={false} 
                />
                <h1 className="splash-title">LUNE</h1>
            </div>
            <div className="splash-loader">
                <div className="splash-loader-dot" />
                <div className="splash-loader-dot" />
                <div className="splash-loader-dot" />
            </div>
        </div>
    );
};

export default SplashScreen;
