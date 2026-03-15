import React from 'react';
import { LoopIcon } from '../Icons/LoopIcon';
import './LoopButton.css';

interface LoopButtonProps {
    isLoop: 'none' | 'all' | 'one';
    onToggle: () => void;
    size?: number;
    className?: string;
}

const LoopButton: React.FC<LoopButtonProps> = ({ isLoop, onToggle, size = 18, className }) => {
    const isActive = isLoop !== 'none';
    const title = isLoop === 'none' ? "Enable Loop All" : isLoop === 'all' ? "Enable Loop One" : "Disable Loop";

    return (
        <button
            className={`loop-btn ${isActive ? 'active' : ''} ${className || ''}`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
            }}
            title={title}
        >
            <LoopIcon size={size} color={isActive ? "var(--accent-main)" : "currentColor"} showOne={isLoop === 'one'} />
            {isActive && <div className="loop-dot-indicator" />}
        </button>
    );
};

export default LoopButton;
