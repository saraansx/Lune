import { SpotifyAlbumEndpoint } from "./album.js";
import { SpotifyArtistEndpoint } from "./artist.js";
import { SpotifyPlaylistEndpoint } from "./playlist.js";
import { SpotifySearchEndpoint } from "./search.js";
import { SpotifyTrackEndpoint } from "./track.js";
import { SpotifyUserEndpoint } from "./user.js";
import { SpotifyBrowseEndpoint } from "./browse.js";
import { SpotifyLibraryEndpoint } from "./library.js";
import { SpotifyRadioEndpoint } from "./radio.js";
import { generateRandomUserAgent } from "./utils.js";
import { HttpClient } from "./http-client.js";

export default class SpotifyGqlApi {
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

    constructor(accessToken?: string | null, spDc?: string, spT?: string) {
        this.setAccessToken(accessToken, spDc, spT);
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
        });

        this.album = new SpotifyAlbumEndpoint(this.gqlClient);
        this.artist = new SpotifyArtistEndpoint(this.gqlClient);
        this.browse = new SpotifyBrowseEndpoint(this.gqlClient);
        this.library = new SpotifyLibraryEndpoint(this.gqlClient);
        this.playlist = new SpotifyPlaylistEndpoint(this.gqlClient);
        this.radio = new SpotifyRadioEndpoint(accessToken ?? '');
        this.search = new SpotifySearchEndpoint(this.gqlClient);
        this.track = new SpotifyTrackEndpoint(this.gqlClient);
        this.user = new SpotifyUserEndpoint(this.gqlClient);
    }
}

export { SpotifyGqlApi };
