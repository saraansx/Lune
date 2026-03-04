import { ipcMain } from 'electron';
import { getLogs, clearLogs, addToLog } from '../logger.js';

export function registerLoggingHandlers() {
    ipcMain.handle('get-logs', () => {
        return getLogs();
    });

    ipcMain.handle('clear-logs', () => {
        clearLogs();
        return true;
    });

    ipcMain.handle('add-log', (_event, type: 'info' | 'error', message: string) => {
        addToLog(type, message);
        return true;
    });
}
