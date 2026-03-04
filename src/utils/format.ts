
export const formatDuration = (ms: number): string => {
    if (!ms || isNaN(ms) || ms <= 0) return '0:00';
    return formatSeconds(Math.floor(ms / 1000));
};

export const formatSeconds = (seconds: number): string => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatMonthlyListeners = (listeners: number): string => {
    return (listeners || 0).toLocaleString();
};
