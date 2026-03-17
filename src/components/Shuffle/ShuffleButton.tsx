import React from 'react';
import ShuffleIcon from '../Icons/ShuffleIcon';
import './ShuffleButton.css';

interface ShuffleButtonProps {
    isShuffle: boolean;
    onToggle: () => void;
    size?: number;
    className?: string; // Additional classes
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ isShuffle, onToggle, size = 24, className }) => {
    return (
        <button
            className={`shuffle-btn ${isShuffle ? 'active' : ''} ${className || ''}`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
            }}
            title={isShuffle ? "Disable Shuffle" : "Enable Shuffle"}
        >
            <ShuffleIcon size={size} color={isShuffle ? "var(--accent-main)" : "currentColor"} />
            {isShuffle && <div className="shuffle-dot-indicator" />}
        </button>
    );
};

export default ShuffleButton;
