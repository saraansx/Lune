import axios from 'axios';
import { generateTOTP, generateSpotifyUserAgent } from './utils.js';
import type { Nuance, SpotifyTokenResponse } from './types.js';

export class SpotifyAuthCore {
    private nuanceUrl = 'https://gist.githubusercontent.com/saraansx/a622d4c1a12c36afdcf701201e9482a3/raw/9afe2c9c7d1a5eb3f7a05d0002a94f45b73682d0/nuance.json';

    /**
     * Fetches the latest "nuance" (secret and version) from the remote repository.
     */
    async getLatestNuance(): Promise<Nuance> {
        const response = await axios.get(this.nuanceUrl);
        const data = response.data;
        if (!Array.isArray(data)) throw new Error('Invalid nuances.json format');
        data.sort((a: any, b: any) => b.v - a.v);
        return data[0];
    }

    /**
     * Fetches the current Spotify server time.
     */
    async getServerTime(): Promise<number> {
        const response = await axios.get('https://open.spotify.com/api/server-time');
        return response.data.serverTime;
    }

    /**
     * Exchanges an `sp_dc` cookie for an access token.
     */
    async getAccessToken(spDc: string): Promise<SpotifyTokenResponse> {
        const nuance = await this.getLatestNuance();
        const serverTime = await this.getServerTime();

        // Generate TOTP using the secret from nuance and server time
        const totp = generateTOTP(nuance.s, serverTime * 1000);

        const url = new URL('https://open.spotify.com/api/token');
        url.searchParams.set('reason', 'transport');
        url.searchParams.set('productType', 'web-player');
        url.searchParams.set('totp', totp);
        url.searchParams.set('totpServer', totp);
        url.searchParams.set('totpVer', nuance.v.toString());
        url.searchParams.set('ts', Date.now().toString());
        const userAgent = generateSpotifyUserAgent();

        const response = await axios.get(url.toString(), {
            headers: {
                'Cookie': `sp_dc=${spDc}`,
                'User-Agent': userAgent
            }
        });

        if (!response.data || !response.data.accessToken) {
            throw new Error('Failed to retrieve access token from Spotify');
        }

        return {
            accessToken: response.data.accessToken,
            accessTokenExpirationTimestampMs: response.data.accessTokenExpirationTimestampMs,
            isAnonymous: response.data.isAnonymous,
            clientId: response.data.clientId
        };
    }
}
