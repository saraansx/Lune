export interface SpotifyTokenResponse {
    accessToken: string;
    accessTokenExpirationTimestampMs: number;
    isAnonymous: boolean;
    clientId: string;
}

export interface SpotifyCredentials {
    cookies: any[];
    spDcValue?: string;
    accessToken: string;
    expiration: number;
}

export interface Nuance {
    s: string;
    v: number;
}

export interface SpotifyImage {
    url: string;
    height?: number;
    width?: number;
}
