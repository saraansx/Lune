export interface LuneTrack {
    id: string;
    queueId?: string; // Unique instance ID for queue management
    name: string;
    artist: string; // Comma-separated string of artist names
    artists: { 
        name: string; 
        id: string | null;
    }[];
    albumName?: string;
    albumArt: string;
    durationMs: number;
    addedAt?: string | number;
    downloadedAt?: string | number;
}

const ALBUM_PLACEHOLDER = 'https://via.placeholder.com/300';

/**
 * Converts a Spotify internal image URI (spotify:image:HASH) to a proper
 * i.scdn.co HTTPS URL. Leaves regular HTTPS URLs unchanged.
 */
export const resolveSpotifyImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('spotify:image:')) {
        return `https://i.scdn.co/image/${url.replace('spotify:image:', '')}`;
    }
    return url;
};

/**
 * Normalizes various track object shapes from Spotify API and local database
 * into a single consistent LuneTrack interface.
 */
export const normalizeTrack = (track: any, lowDataMode: boolean = false): LuneTrack => {
    if (!track) {
        return {
            id: '',
            name: 'Unknown Track',
            artist: 'Unknown Artist',
            artists: [{ name: 'Unknown Artist', id: null }],
            albumArt: ALBUM_PLACEHOLDER,
            durationMs: 0
        };
    }

    // 1. Handle ID (Spotify ID, TrackId from DB, or URI)
    const id = track.id || track.trackId || (track.uri?.startsWith('spotify:track:') ? track.uri.split(':').pop() : track.uri) || '';

    // 2. Handle Name
    const name = track.name || track.trackName || 'Unknown Track';

    // 3. Handle Artists (Complex because of different API formats)
    let artists: { name: string; id: string | null }[] = [];
    
    // Multiple sources for artists
    const rawArtists = track.artists?.items || track.artists || track.firstArtist?.items || track.artist;

    if (Array.isArray(rawArtists)) {
        artists = rawArtists.map((a: any) => {
            if (typeof a === 'string') return { name: a, id: null };
            return {
                name: a.profile?.name || a.name || 'Unknown Artist',
                id: a.id || (a.uri?.startsWith('spotify:artist:') ? a.uri.split(':').pop() : a.uri) || null
            };
        });
    } else if (rawArtists && typeof rawArtists === 'object') {
        const a = rawArtists;
        artists = [{
            name: a.profile?.name || a.name || 'Unknown Artist',
            id: a.id || (a.uri?.startsWith('spotify:artist:') ? a.uri.split(':').pop() : a.uri) || null
        }];
    } else if (typeof rawArtists === 'string') {
        artists = rawArtists.split(', ').map(n => ({ name: n, id: null }));
    }

    if (artists.length === 0) {
        artists = [{ name: 'Unknown Artist', id: null }];
    }

    const artist = artists.map(a => a.name).join(', ');

    // 4. Handle Album Art
    // Spotify and other sources often provide images in multiple sizes
    const images = (track.images || track.album?.images || track.albumOfTrack?.coverArt?.sources || track.album?.coverArt?.sources || []);
    
    let rawArt = track.albumArt || ALBUM_PLACEHOLDER;
    if (images.length > 0) {
        if (lowDataMode) {
            // Select the smallest image (usually the last one in the array)
            rawArt = images[images.length - 1].url || images[images.length - 1].uri || rawArt;
        } else {
            // Select the best image (usually the first one)
            rawArt = images[0].url || images[0].uri || rawArt;
        }
    }

    const albumArt = resolveSpotifyImageUrl(rawArt);

    // 5. Handle Album Name
    const albumName = track.albumName 
        || track.album?.name 
        || track.albumOfTrack?.name 
        || '';

    // 6. Handle Duration
    const durationMs = track.durationMs 
        || track.duration_ms 
        || track.duration?.totalMilliseconds 
        || track.trackDuration?.totalMilliseconds 
        || 0;

    // 7. Handle AddedAt / DownloadedAt
    const addedAt = track.addedAt?.isoString || track.added_at || track.addedAt || '';
    const downloadedAt = track.downloadedAt || '';

    return {
        id,
        name,
        artist,
        artists,
        albumName,
        albumArt,
        durationMs,
        addedAt,
        downloadedAt
    };
};
