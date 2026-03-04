
export interface LyricLine {
    time: number;
    text: string;
}

export interface LyricData {
    id: number;
    name: string;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string;
    syncedLyrics: string;
}



/**
 * LRCLib Service for fetching synced and plain lyrics.
 */
export const fetchLyrics = async (trackName: string, artistName: string, duration?: number): Promise<LyricData | null> => {
    // 1. Clean track name (remove common suffixes that break exact matching)
    const cleanTrackName = trackName
        .replace(/\(feat\..*?\)/gi, '')
        .replace(/\(with.*?\)/gi, '')
        .replace(/\(remastered.*?\)/gi, '')
        .replace(/\(deluxe.*?\)/gi, '')
        .replace(/\(explicit.*?\)/gi, '')
        .replace(/\[explicit\]/gi, '')
        .replace(/\(official.*?\)/gi, '')
        .replace(/\[official.*?\]/gi, '')
        .replace(/\(video.*?\)/gi, '')
        .replace(/\[video.*?\]/gi, '')
        .replace(/\(lyric.*?\)/gi, '')
        .replace(/\[lyric.*?\]/gi, '')
        .replace(/- Single Version/gi, '')
        .replace(/- Remastered/gi, '')
        .replace(/- Radio Edit/gi, '')
        .replace(/- Original Mix/gi, '')
        .replace(/- .*? Mix$/gi, '')
        .replace(/\s+-\s+.*$/i, '') 
        .trim();

    // 2. Primary artist only for exact match
    const primaryArtist = artistName.split(',')[0].split('&')[0].trim();

    const tryFetch = async (useDuration: boolean): Promise<LyricData | null> => {
        try {
            const params = new URLSearchParams({
                track_name: cleanTrackName,
                artist_name: primaryArtist,
            });
            
            if (useDuration && duration) {
                params.append('duration', Math.round(duration).toString());
            }

            const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {}
        return null;
    };

    try {
        console.log(`[Lyrics] Trying exact match for: ${cleanTrackName} by ${primaryArtist}`);
        
        // Try Stage 1: Exact match with duration (if provided)
        let data = await tryFetch(true);
        
        // Try Stage 2: Exact match WITHOUT duration (if stage 1 failed or no duration)
        if (!data && duration) {
            console.log(`[Lyrics] Duration match failed, trying without duration...`);
            data = await tryFetch(false);
        }

        if (data) return data;

        // 3. Fallback to /search if /get fails
        console.log(`[Lyrics] Exact match failed, trying search fallback for: ${cleanTrackName} ${primaryArtist}`);
        const searchParams = new URLSearchParams({
            q: `${cleanTrackName} ${primaryArtist}`
        });

        const searchResponse = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`);
        
        if (searchResponse.ok) {
            const results = await searchResponse.json();
            if (Array.isArray(results) && results.length > 0) {
                // Find result with synced lyrics first, then plain, then any
                const bestMatch = results.find(r => r.syncedLyrics) || results.find(r => r.plainLyrics) || results[0];
                return bestMatch;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching lyrics from LRCLib:', error);
        return null;
    }
};

/**
 * Parses LRC format into a list of LyricLine objects.
 * Format: [mm:ss.xx] Lyric text
 */
export const parseSyncedLyrics = (lrc: string): LyricLine[] => {
    if (!lrc) return [];
    
    const lines = lrc.split('\n');
    const result: LyricLine[] = [];
    
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    lines.forEach(line => {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            
            // Handle both .xx and .xxx format
            const msFactor = match[3].length === 2 ? 10 : 1;
            const time = minutes * 60 + seconds + (milliseconds * msFactor) / 1000;
            
            const text = line.replace(timeRegex, '').trim();
            if (text) {
                result.push({ time, text });
            }
        }
    });
    
    return result.sort((a, b) => a.time - b.time);
};
