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
                // Discover track object more broadly
                const track = item.track?.data || item.track?.track || item.track
                    || item.itemV2?.data || item.itemV2?.track || item.item?.data || item.item?.track
                    || (item.name ? item : null);
                if (!track) return null;

                const uri = track.uri || track._uri || "";
                const id = uri ? uri.split(":").pop() : (track.id || track.trackId || "");

                // Broad discovery for name
                const name = track.name || track.title || track.data?.name || track.data?.title
                    || track.track?.name || track.track?.title || "";

                // Discover album data
                const albumData = track.album?.data || track.album || track.albumOfTrack?.data || track.albumOfTrack
                    || track.track?.album;
                const albumImages = albumData?.images?.items?.flatMap((i: any) => i.sources)
                    || albumData?.images?.items
                    || albumData?.images
                    || albumData?.coverArt?.sources
                    || [];

                // Discover artists
                const artistsData = track.artists?.items || track.artists || track.track?.artists?.items || [];
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
                        || track.track?.duration?.totalMilliseconds
                        || 0,
                    explicit: track.contentRating?.label === "EXPLICIT" || track.explicit === true || track.track?.explicit === true,
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
