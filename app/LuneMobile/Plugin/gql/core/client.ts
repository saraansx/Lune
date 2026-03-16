import { SpotifyAlbumEndpoint } from "./album";
import { SpotifyArtistEndpoint } from "./artist";
import { SpotifyPlaylistEndpoint } from "./playlist";
import { SpotifySearchEndpoint } from "./search";
import { SpotifyTrackEndpoint } from "./track";
import { SpotifyUserEndpoint } from "./user";
import { SpotifyBrowseEndpoint } from "./browse";
import { SpotifyLibraryEndpoint } from "./library";
import { SpotifyRadioEndpoint } from "./radio";
import { generateRandomUserAgent } from "./utils";
import { HttpClient } from "./http-client";
import { preloadHashes } from "./hash-registry";

export class SpotifyGqlApi {
    gqlClient!: HttpClient;

    album!: SpotifyAlbumEndpoint;
    artist!: SpotifyArtistEndpoint;
    browse!: SpotifyBrowseEndpoint;
    library!: SpotifyLibraryEndpoint;
    playlist!: SpotifyPlaylistEndpoint;
    radio!: SpotifyRadioEndpoint;
    search!: SpotifySearchEndpoint;
    track!: SpotifyTrackEndpoint;
    user!: SpotifyUserEndpoint;
    private onUnauthorized?: () => void;

    constructor(accessToken?: string | null, spDc?: string, spT?: string, onUnauthorized?: () => void) {
        this.onUnauthorized = onUnauthorized;
        this.setAccessToken(accessToken, spDc, spT);
        // Pre-warm the remote hash cache (fire and forget – won't block constructor)
        preloadHashes().catch((err) =>
            console.warn("[SpotifyGqlApi] Failed to preload remote hashes:", err)
        );
    }

    setAccessToken(accessToken: string | null | undefined, spDc?: string, spT?: string) {
        const headers: Record<string, string | undefined> = {};
        headers["Authorization"] = `Bearer ${accessToken}`;
        headers["User-Agent"] = generateRandomUserAgent();
        if (spDc) {
            let cookie = `sp_dc=${spDc}`;
            if (spT) {
                cookie += `; sp_t=${spT}`;
            }
            headers["Cookie"] = cookie;
        }

        this.gqlClient = new HttpClient({
            baseURL: "https://api-partner.spotify.com/pathfinder/v2/",
            headers: headers,
            onUnauthorized: this.onUnauthorized
        });

        this.album = new SpotifyAlbumEndpoint(this.gqlClient);
        this.artist = new SpotifyArtistEndpoint(this.gqlClient);
        this.browse = new SpotifyBrowseEndpoint(this.gqlClient);
        this.library = new SpotifyLibraryEndpoint(this.gqlClient);
        this.playlist = new SpotifyPlaylistEndpoint(this.gqlClient);
        this.radio = new SpotifyRadioEndpoint(accessToken ?? '', this.onUnauthorized);
        this.search = new SpotifySearchEndpoint(this.gqlClient);
        this.track = new SpotifyTrackEndpoint(this.gqlClient);
        this.user = new SpotifyUserEndpoint(this.gqlClient);
    }
}
