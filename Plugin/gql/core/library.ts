import { HttpClient } from "./http-client.js";
import { SpotifyError } from "./error.js";
import { Track } from "../types/web-api.js";
import { GqlPage } from "../types/gql-api.js";

export class SpotifyLibraryEndpoint {
    gqlClient: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async tracks({
        offset = 0,
        limit = 50, // Higher default limit for liked songs
    }: { offset?: number; limit?: number } = {}): Promise<GqlPage<Track>> {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    offset,
                    limit,
                },
                operationName: "fetchLibraryTracks",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "087278b20b743578a6262c2b0b4bcd20d879c503cc359a2285baf083ef944240",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);

        const trackData = res.data.me?.library?.tracks?.items ?? [];
        const pagingInfo = res.data.me?.library?.tracks?.pagingInfo;

        const items = trackData
            .map((item: any) => {
                // New Spotify structure: item.track._uri + item.track.data.{name, albumOfTrack, artists, ...}
                // Also handle legacy structure where data might be flat on item.track
                const trackWrapper = item.track || item.itemV2 || item.item;
                if (!trackWrapper) return null;

                // The actual track metadata lives in track.data (new) or directly on track (legacy)
                const track = trackWrapper.data || trackWrapper;
                if (!track) return null;

                // URI is at trackWrapper._uri (new) or track.uri / track._uri (legacy)
                const uri = trackWrapper._uri || track.uri || track._uri || "";
                const id = uri ? uri.split(":").pop() : (track.id || track.trackId || "");

                // Name
                const name = track.name || track.title || "";

                // Album: new structure uses "albumOfTrack", legacy uses "album"
                const albumData = track.albumOfTrack || track.album?.data || track.album || {};
                const albumImages = albumData?.coverArt?.sources
                    || albumData?.images?.items?.flatMap((i: any) => i.sources)
                    || albumData?.images?.items
                    || albumData?.images
                    || [];

                // Artists
                const artistsData = track.artists?.items || track.artists || [];
                const mappedArtists = artistsData.map((artist: any) => {
                    const aData = artist?.profile || artist?.data || artist;
                    return {
                        id: aData?.uri ? aData.uri.split(":").pop() : (artist?.uri ? artist.uri.split(":").pop() : (aData?.id || "")),
                        name: aData?.name || artist?.name || aData?.title || "Unknown Artist",
                        uri: aData?.uri || artist?.uri || "",
                    };
                });

                return {
                    id,
                    name: name || "Unknown Track",
                    uri: uri,
                    duration_ms: track.duration?.totalMilliseconds
                        || track.trackDuration?.totalMilliseconds
                        || track.duration_ms
                        || 0,
                    explicit: track.contentRating?.label === "EXPLICIT" || track.explicit === true,
                    album: {
                        id: albumData?.uri ? albumData.uri.split(":").pop() : (albumData?.id || ""),
                        name: albumData?.name || albumData?.title || "Unknown Album",
                        images: albumImages,
                    } as any,
                    artists: mappedArtists,
                    added_at: item.addedAt?.isoString || item.addedAt || "",
                } as unknown as Track;
            }).filter(Boolean);

        return {
            offset: pagingInfo?.offset ?? 0,
            limit: pagingInfo?.limit ?? limit,
            total: res.data.me?.library?.tracks?.totalCount ?? 0,
            items,
        };
    }
}
