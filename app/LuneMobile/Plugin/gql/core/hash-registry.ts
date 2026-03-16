/**
 * Remote Hash Registry
 * Fetches Spotify GQL persisted-query hashes from a remote GitHub Gist
 * so they can be updated without pushing a new app release.
 *
 * Hashes are cached in memory with a configurable TTL (default 30 min).
 * If the remote fetch fails, the last successfully fetched hashes are reused.
 */

const GIST_URL =
    "https://gist.githubusercontent.com/saraansx/c50367808cbbf6ea7352920e4b556ac3/raw/spotify_hashes.json";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface HashStore {
    [category: string]: {
        [operation: string]: string;
    };
}

let cachedHashes: HashStore | null = null;
let lastFetchedAt = 0;
let fetchPromise: Promise<HashStore> | null = null;

/**
 * Fetches the hash map from the remote gist.
 * De-duplicates concurrent calls so we don't hammer the endpoint.
 */
async function fetchRemoteHashes(): Promise<HashStore> {
    if (fetchPromise) return fetchPromise;

    fetchPromise = (async () => {
        try {
            console.log("[HashRegistry] Fetching remote hashes from gist...");
            const res = await fetch(GIST_URL, {
                headers: { Accept: "application/json" },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }

            const data: HashStore = await res.json();
            cachedHashes = data;
            lastFetchedAt = Date.now();
            console.log("[HashRegistry] ✅ Remote hashes loaded successfully");
            return data;
        } catch (err) {
            console.error("[HashRegistry] ❌ Failed to fetch remote hashes:", err);
            if (cachedHashes) {
                console.warn("[HashRegistry] Using previously cached hashes");
                return cachedHashes;
            }
            throw new Error(
                "Failed to fetch remote hashes and no cached hashes available"
            );
        } finally {
            fetchPromise = null;
        }
    })();

    return fetchPromise;
}

/**
 * Returns the full hash store, refreshing if the cache is stale.
 */
async function getHashes(): Promise<HashStore> {
    const now = Date.now();
    if (cachedHashes && now - lastFetchedAt < CACHE_TTL_MS) {
        return cachedHashes;
    }
    return fetchRemoteHashes();
}

/**
 * Look up a single hash by category and operation name.
 *
 * @example
 *   const hash = await getHash("Album", "getAlbum");
 *   const hash = await getHash("Search", "searchDesktop");
 */
async function getHash(category: string, operation: string): Promise<string> {
    const hashes = await getHashes();
    const hash = hashes?.[category]?.[operation];
    if (!hash) {
        throw new Error(
            `[HashRegistry] No hash found for ${category}.${operation}. ` +
            `Available categories: ${Object.keys(hashes).join(", ")}`
        );
    }
    return hash;
}

/**
 * Pre-warm the cache at startup so the first API call isn't delayed.
 * Call this once when the plugin initialises.
 */
async function preloadHashes(): Promise<void> {
    await getHashes();
}

/**
 * Force a refresh on the next call (e.g. after a hash error from Spotify).
 */
function invalidateHashCache(): void {
    lastFetchedAt = 0;
    console.log("[HashRegistry] Cache invalidated — will re-fetch on next call");
}

export { getHash, getHashes, preloadHashes, invalidateHashCache };
export type { HashStore };
