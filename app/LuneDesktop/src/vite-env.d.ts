/// <reference types="vite/client" />

import { IpcRenderer } from './types/ipc';

declare global {
    interface Window {
        ipcRenderer: IpcRenderer;
        webkitAudioContext: typeof AudioContext;
    }
    interface HTMLAudioElement {
        setSinkId(deviceId: string): Promise<void>;
    }
}
