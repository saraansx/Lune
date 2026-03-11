import _ytdlp from 'yt-dlp-exec';
import fs from 'fs';

/** Cached stream URL entry */
interface CacheEntry {
    url: string;
    expiresAt: number; // timestamp in ms
}

/** Rate limiter: min delay between yt-dlp requests */
const MIN_REQUEST_INTERVAL_MS = 1500; // 1.5 seconds between requests

/** Cache TTL: YouTube stream URLs can expire unexpectedly, keeping it shorter (30 mins) to be safe */
const CACHE_TTL_MS = 30 * 60 * 1000;

/** Max number of cached entries */
const MAX_CACHE_SIZE = 200;


export class YtDlpAudio {
    private cookiesPath: string | null = null;
    private ytdlpInstance: any = _ytdlp;
    
    /**
     * Override the default yt-dlp instance.
     * Useful for pointing to a specific binary path in production.
     */
    setYtDlpInstance(instance: any) {
        this.ytdlpInstance = instance;
    }

    /** Cache: query string → stream URL + expiry */
    private urlCache = new Map<string, CacheEntry>();

    /** Timestamp of last yt-dlp request (for rate limiting) */
    private lastRequestTime = 0;

    /** Queue to handle yt-dlp requests with priority support */
    private taskQueue: Array<{ isPriority: boolean; resolve: (onDone: () => void) => void }> = [];
    private isProcessingQueue = false;

    /**
     * Set the path to a Netscape-format cookies.txt file.
     * If set, yt-dlp will use these cookies to authenticate with YouTube,
     * which prevents bot detection blocks.
     */
    setCookiesPath(cookiesPath: string) {
        if (fs.existsSync(cookiesPath)) {
            if (this.cookiesPath !== cookiesPath) {
                console.log(`[YtDlp] Using cookies file: ${cookiesPath}`);
            }
            this.cookiesPath = cookiesPath;
        } else {
            console.warn(`[YtDlp] Cookies file not found: ${cookiesPath}`);
        }
    }

    /**
     * The ordered list of YouTube player clients to try.
     * 'mweb' and 'web' clients are less aggressively bot-checked by YouTube.
     * 'tv_embedded' works for most content without a login.
     * 'android' is tried last as YouTube has started flagging it more.
     */
    private static readonly PLAYER_CLIENTS = [
        'mweb,default',
        'web,default',
        'tv_embedded',
        'android',
    ];

    private getYouTubeOptions(quality: string | undefined, formatExt: string | undefined, extra: Record<string, any> = {}, playerClient = 'mweb,default'): Record<string, any> {
        // High fidelity priority: 
        // 1. Specifically request the best WebM (Opus) or M4A (AAC) stream.
        // 2. If quality is specified, limit the average bitrate (abr).
        let formatStr = 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best';
        let extFilter = '';
        
        if (formatExt === 'mp4' || formatExt === 'm4a') extFilter = '[ext=m4a]';
        else if (formatExt === 'webm') extFilter = '[ext=webm]';

        if (quality) {
            // Re-build format string to honor the quality cap while still prioritizing Opus
            const q = parseInt(quality, 10);
            formatStr = `bestaudio${extFilter}[abr<=${q}]/bestaudio${extFilter}/bestaudio/best`;
        } else if (extFilter) {
            formatStr = `bestaudio${extFilter}/bestaudio/best`;
        }

        const opts: Record<string, any> = {
            format: formatStr,
            noPlaylist: true,
            noWarnings: true,
            geoBypass: true,
            noCheckCertificates: true,
            extractorArgs: `youtube:player_client=${playerClient}`,
            ...extra
        };

        if (this.cookiesPath && fs.existsSync(this.cookiesPath)) {
            opts.cookies = this.cookiesPath;
        }

        console.log(`[YtDlp] Generated Options: format="${formatStr}", extractorArgs="${opts.extractorArgs}"`);

        return opts;
    }

    /** Returns true if the error is a YouTube bot-detection block that warrants a retry with a different client. */
    private isBotDetectionError(err: any): boolean {
        const msg: string = err?.stderr || err?.message || '';
        return (
            msg.includes('Sign in to confirm') ||
            msg.includes('bot') ||
            msg.includes('HTTP Error 429') ||
            msg.includes('Precondition check failed')
        );
    }

    /**
     * Generate a cache key from track + artist names.
     */
    private getCacheKey(trackName: string, artistName: string, quality?: string, formatExt?: string): string {
        return `${trackName.toLowerCase().trim()}::${artistName.toLowerCase().trim()}::${quality||'default'}::${formatExt||'default'}`;
    }

    /**
     * Get a cached URL if it exists and hasn't expired.
     */
    private getCachedUrl(key: string): string | null {
        const entry = this.urlCache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.urlCache.delete(key);
            return null;
        }

        return entry.url;
    }

    /**
     * Store a URL in the cache with TTL.
     */
    private setCachedUrl(key: string, url: string): void {
        // Evict oldest entries if cache is full
        if (this.urlCache.size >= MAX_CACHE_SIZE) {
            const firstKey = this.urlCache.keys().next().value;
            if (firstKey) {
                console.log(`[YtDlp] 🫗 Cache full (${MAX_CACHE_SIZE}). Evicting oldest entry: ${firstKey.split('::').slice(0, 2).join(' - ')}`);
                this.urlCache.delete(firstKey);
            }
        }

        this.urlCache.set(key, {
            url,
            expiresAt: Date.now() + CACHE_TTL_MS
        });
    }

    /**
     * Rate limiter: waits if a request was made too recently.
     * Priority requests jump to the front of the queue to ensure immediate playback responsive.
     */
    private async waitForRateLimit(isPriority = false): Promise<() => void> {
        return new Promise(resolve => {
            if (isPriority) {
                // Priority tasks go to the front (but after any existing priority tasks to maintain order)
                const firstNonPriorityIndex = this.taskQueue.findIndex(t => !t.isPriority);
                if (firstNonPriorityIndex === -1) {
                    this.taskQueue.push({ isPriority, resolve });
                } else {
                    this.taskQueue.splice(firstNonPriorityIndex, 0, { isPriority, resolve });
                }
            } else {
                this.taskQueue.push({ isPriority, resolve });
            }
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift()!;
            
            const now = Date.now();
            const elapsed = now - this.lastRequestTime;

            if (elapsed < MIN_REQUEST_INTERVAL_MS) {
                const waitTime = MIN_REQUEST_INTERVAL_MS - elapsed;
                console.log(`[YtDlp] 🛑 Rate limit: Waiting ${waitTime}ms... (Queue: ${this.taskQueue.length + 1})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }

            await new Promise<void>((resolve) => {
                task.resolve(resolve);
            });

            this.lastRequestTime = Date.now();
        }

        this.isProcessingQueue = false;
    }

    /**
     * Searches for a track and returns the direct audio stream URL using yt-dlp.
     * Uses caching to avoid duplicate requests and rate limiting to prevent YouTube blocks.
     */
    async getStreamUrl(trackName: any, artistName: any, quality?: string, formatExt?: string, signal?: AbortSignal, isPriority = false): Promise<string> {
        const tName = typeof trackName === 'string' ? trackName : (trackName?.name || String(trackName || 'unknown'));
        const aName = typeof artistName === 'string' ? artistName : (artistName?.name || String(artistName || 'unknown'));
        
        const cacheKey = this.getCacheKey(tName, aName, quality, formatExt);

        // Check cache first — no yt-dlp request needed
        const cachedUrl = this.getCachedUrl(cacheKey);
        if (cachedUrl) {
            console.log(`[YtDlp] Cache hit for "${tName}" by ${aName} [Quality: ${quality||'default'}]`);
            return cachedUrl;
        }

        console.log(`[YtDlp] Fetching stream for "${tName}" by ${aName} at max quality ${quality || 'default'} kbps`);
        const query = `"${tName}" ${aName}`;

        try {
            if (signal?.aborted) throw Object.assign(new Error('AbortError'), { name: 'AbortError' });

            // Rate limit before making the request
            const onDone = await this.waitForRateLimit(isPriority);

            try {
                // Check abort again after waiting
                if (signal?.aborted) {
                    throw Object.assign(new Error('AbortError'), { name: 'AbortError' });
                }

                let lastError: any = null;

                // Try each player client in order — fall back on bot-detection errors
                for (const client of YtDlpAudio.PLAYER_CLIENTS) {
                    if (signal?.aborted) {
                        throw Object.assign(new Error('AbortError'), { name: 'AbortError' });
                    }

                    try {
                        const child = this.ytdlpInstance.exec(`ytsearch1:${query}`, this.getYouTubeOptions(quality, formatExt, {
                            getUrl: true,
                            quiet: true
                        }, client));

                        if (signal) {
                            const onAbort = () => {
                                try { child.cancel(); } catch (e) { /* already closed */ }
                            };
                            signal.addEventListener('abort', onAbort);
                            child.finally(() => signal.removeEventListener('abort', onAbort)).catch(() => {});
                        }

                        const rawOutput = await child;
                        const url = (typeof rawOutput === 'string' ? rawOutput : (rawOutput as any).stdout || '').trim();

                        if (!url || !url.startsWith('http')) {
                            throw new Error(`Incomplete URL from yt-dlp: ${url || '[empty]'}`);
                        }

                        // Cache the successful result
                        this.setCachedUrl(cacheKey, url);
                        console.log(`[YtDlp] Cached URL for "${tName}" by ${aName} [${quality||'default'}] via client="${client}" (${this.urlCache.size} entries)`);

                        return url;

                    } catch (err: any) {
                        if (err.isCanceled || signal?.aborted || err.name === 'AbortError') throw err;

                        lastError = err;

                        if (this.isBotDetectionError(err)) {
                            console.warn(`[YtDlp] Bot detection with client="${client}", trying next...`);
                            continue; // try the next client
                        }

                        // Non-bot error — don't retry
                        throw err;
                    }
                }

                // All clients were exhausted
                console.error('YtDlpAudio execution error:', lastError);
                throw new Error(`Failed to get stream URL: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
            } finally {
                onDone();
            }
        } catch (error: any) {
            if (error.isCanceled || signal?.aborted || error.name === 'AbortError') {
                const abortError = new Error('AbortError');
                abortError.name = 'AbortError';
                throw abortError;
            }

            throw error;
        }
    }

    async downloadTrack(trackName: any, artistName: any, outputPath: string, quality?: string, formatExt?: string, onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<string> {
        const tName = typeof trackName === 'string' ? trackName : (trackName?.name || String(trackName || 'unknown'));
        const aName = typeof artistName === 'string' ? artistName : (artistName?.name || String(artistName || 'unknown'));
        
        console.log(`[YtDlp] Starting download for "${tName}" by ${aName} at max quality ${quality || 'default'} kbps to ${outputPath}`);
        const query = `"${tName}" ${aName}`;

        // Rate limit before starting
        const onDone = await this.waitForRateLimit();

        try {
            let lastError: any = null;

            // Try each player client in order — same retry strategy as getStreamUrl
            for (const client of YtDlpAudio.PLAYER_CLIENTS) {
                if (signal?.aborted) throw Object.assign(new Error('AbortError'), { name: 'AbortError' });

                try {
                    console.log(`[YtDlp] Trying player_client="${client}" for download of "${tName}"`);
                    await this._downloadFromYouTube(query, outputPath, quality, formatExt, onProgress, signal, client);
                    return outputPath;
                } catch (err: any) {
                    // Abort / cancel is always rethrown immediately
                    if (err.isCanceled || signal?.aborted || err.message === 'Download Aborted' || err.name === 'AbortError') {
                        throw err;
                    }

                    lastError = err;

                    if (this.isBotDetectionError(err)) {
                        console.warn(`[YtDlp] Bot detection during download with client="${client}", trying next...`);
                        continue; // try next client
                    }

                    // Any other error (e.g. track not found) — don't retry
                    throw new Error(`yt-dlp exited with error: ${err.message}`);
                }
            }

            // All clients exhausted by bot detection
            throw new Error(`Download failed after trying all clients: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
        } finally {
            onDone();
        }
    }

    private _downloadFromYouTube(query: string, outputPath: string, quality?: string, formatExt?: string, onProgress?: (progress: number) => void, signal?: AbortSignal, playerClient = 'mweb,default'): Promise<void> {
        return new Promise((resolve, reject) => {
            const extraOptions: Record<string, any> = {
                output: outputPath,
                newline: true
            };

            const child = this.ytdlpInstance.exec(`ytsearch1:${query}`, this.getYouTubeOptions(quality, formatExt, extraOptions, playerClient));

            if (signal) {
                const onAbort = () => {
                    child.cancel();
                    reject(new Error('Download Aborted'));
                };
                signal.addEventListener('abort', onAbort);
                child.finally(() => signal.removeEventListener('abort', onAbort)).catch(() => {});
            }

            child.stdout?.on('data', (data: any) => {
                const output = data.toString();
                const match = output.match(/\[download\]\s+([\d.]+)%/);
                if (match && match[1] && onProgress) {
                    onProgress(parseFloat(match[1]));
                }
            });

            child.then(() => resolve()).catch((err: any) => {
                if (err.isCanceled || signal?.aborted) return;
                reject(err);
            });
        });
    }

    /**
     * Clear the URL cache and yt-dlp disk cache.
     */
    async clearCache(): Promise<void> {
        this.urlCache.clear();
        console.log('[YtDlp] In-memory URL cache cleared.');
        
        try {
            // Clear yt-dlp's internal disk cache (useful for signature updates)
            await this.ytdlpInstance.exec('', { rmCacheDir: true });
            console.log('[YtDlp] Disk cache cleared (--rm-cache-dir).');
        } catch (err) {
            console.warn('[YtDlp] Failed to clear disk cache:', err);
        }
    }

    /**
     * Auto-update the underlying yt-dlp binary from GitHub.
     * This prevents stream failures when YouTube changes its player signatures.
     */
    async update(): Promise<string> {
        console.log('[YtDlp] 🔄 Checking for yt-dlp binary updates from GitHub...');
        try {
            const res = await this.ytdlpInstance.exec('', { update: true });
            const output = (typeof res === 'string' ? res : res?.stdout || '').trim();
            console.log(`[YtDlp] 📥 Update Result: ${output}`);
            return output;
        } catch (err: any) {
            console.error('[YtDlp] ❌ Failed to update yt-dlp binary:', err);
            throw err;
        }
    }
}

