import { BrowserWindow, session } from 'electron';
import { SpotifyAuthCore } from './spotify-auth-core.js';
import type { SpotifyCredentials } from './types.js';
import path from 'node:path';

export class ElectronSpotifyAuth {
    private core: SpotifyAuthCore;

    constructor() {
        this.core = new SpotifyAuthCore();
    }

    /**
     * Opens a login window to Spotify and captures the 'sp_dc' cookie.
     * Resolves with the credentials (token and cookies).
     */
    async login(): Promise<SpotifyCredentials> {
        return new Promise((resolve, reject) => {
            const loginWindow = new BrowserWindow({
                width: 800,
                height: 700,
                title: 'Login to Spotify',
                icon: path.join(process.env.VITE_PUBLIC, 'Lune.png'),
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            loginWindow.loadURL('https://accounts.spotify.com/');

            const handleNavigation = async (url: string) => {
                if (url.includes('accounts.spotify.com') && url.includes('/status')) {
                    const cookies = await session.defaultSession.cookies.get({ domain: 'spotify.com' });
                    const spDcCookie = cookies.find(c => c.name === 'sp_dc');

                    if (spDcCookie) {
                        try {
                            const tokenData = await this.core.getAccessToken(spDcCookie.value);

                            const credentials: SpotifyCredentials = {
                                cookies: cookies,
                                accessToken: tokenData.accessToken,
                                expiration: tokenData.accessTokenExpirationTimestampMs
                            };

                            loginWindow.close();
                            resolve(credentials);
                        } catch (err) {
                            reject(err);
                        }
                    }
                }
            };

            loginWindow.webContents.on('did-navigate', (_event, url) => handleNavigation(url));
            loginWindow.webContents.on('did-redirect-navigation', (_event, url) => handleNavigation(url));

            loginWindow.on('closed', () => {
                reject(new Error('Login window was closed before completion'));
            });
        });
    }

    /**
     * Refreshes the access token using the provided 'sp_dc' value.
     */
    async refresh(spDc: string): Promise<Pick<SpotifyCredentials, 'accessToken' | 'expiration'>> {
        const tokenData = await this.core.getAccessToken(spDc);
        return {
            accessToken: tokenData.accessToken,
            expiration: tokenData.accessTokenExpirationTimestampMs
        };
    }
}
