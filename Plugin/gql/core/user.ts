import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";
import type { GqlPage, GqlPlaylistSimplified } from "../types/gql-api.js";
import type { Album, Artist, Track } from "../types/web-api.js";

class SpotifyUserEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async me() {
        const res = await this.gqlClient.post("query", {
            body: {
                operationName: "profileAttributes",
                variables: {},
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "53bcb064f6cd18c23f752bc324a791194d20df612d8e1239c735144ab0399ced",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        const data = res.data.me;
        return {
            id: data.uri?.split(":").pop() || "",
            display_name: data.profile?.name || data.name || data.displayName || "",
            images: data.profile?.avatar?.sources || data.profile?.images || data.images || data.avatar?.sources || [],
            uri: data.uri || "",
        };
    }

    async attributes() {
        const res = await this.gqlClient.post("query", {
            body: {
                operationName: "accountAttributes",
                variables: {},
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "24aaa3057b69fa91492de26841ad199bd0b330ca95817b7a4d6715150de01827",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data;
    }

    async savedTracks({
        offset = 0,
        limit = 20,
    }: { offset?: number; limit?: number } = {}): Promise<GqlPage<Track>> {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        offset,
                        limit,
                    },
                    operationName: "fetchLibraryTracks",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "087278b20b743578a6262c2b0b4bcd20d879c503cc359a2285baf083ef944240",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const trackData = res.data.me.library.tracks.items;
        const pagingInfo = res.data.me.library.tracks.pagingInfo;

        const items = trackData
            .filter((item: any) => item.__typename === "UserLibraryTrackResponse")
            .map((item: any) => {
                const track = item.track;
                const id = track._uri.split(":").pop();
                return {
                    id,
                    name: track.name,
                    uri: track._uri,
                    duration_ms: track.duration?.totalMilliseconds ?? 0,
                    explicit: track.contentRating?.label === "EXPLICIT",
                    album: {
                        id: track.album?.uri.split(":").pop(),
                        name: track.album?.name,
                        images: track.album?.coverArt?.sources ?? [],
                    } as any,
                    artists: track.artists?.items?.map((artist: any) => ({
                        id: artist.uri.split(":").pop(),
                        name: artist.profile?.name,
                        uri: artist.uri,
                    })) ?? [],
                } as Track;
            });

        return {
            offset: pagingInfo.offset,
            limit: pagingInfo.limit,
            total: res.data.me.library.tracks.totalCount,
            items,
        };
    }

    async savedPlaylists({
        offset = 0,
        limit = 20,
    }: { offset?: number; limit?: number } = {}): Promise<
        GqlPage<GqlPlaylistSimplified>
    > {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        filters: ["Playlists"],
                        order: null,
                        textFilter: "",
                        features: [
                            "LIKED_SONGS",
                            "YOUR_EPISODES_V2",
                            "PRERELEASES",
                            "EVENTS",
                        ],
                        limit,
                        offset,
                        flatten: false,
                        expandedFolders: [],
                        folderUri: null,
                        includeFoldersWhenFlattening: true,
                    },
                    operationName: "libraryV3",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "2de10199b2441d6e4ae875f27d2db361020c399fb10b03951120223fbed10b08",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const playlistData = res.data.me.libraryV3;
        const pagingInfo = playlistData.pagingInfo;

        const items = playlistData.items
            .filter(
                (item: any) =>
                    item.item.__typename === "PlaylistResponseWrapper" &&
                    item.item.data.__typename === "Playlist"
            )
            .map((item: any) => {
                const id = item.item._uri.split(":").pop();
                const playlist = item.item.data;
                const ownerV2 = playlist.ownerV2.data;

                return {
                    id,
                    description: playlist.description,
                    external_urls: {
                        spotify: `https://open.spotify.com/playlist/${id}`,
                    },
                    images:
                        playlist.images?.items.flatMap((image: any) => image.sources) ?? [],
                    name: playlist.name,
                    owner: {
                        type: "User",
                        external_urls: {
                            spotify: `https://open.spotify.com/user/${ownerV2.id}`,
                        },
                        id: ownerV2.id,
                        uri: ownerV2.uri,
                        display_name: ownerV2.name,
                        images: ownerV2.avatar?.sources ?? [],
                    },
                    uri: item.item._uri,
                    objectType: "Playlist",
                } satisfies GqlPlaylistSimplified;
            });

        return {
            limit: pagingInfo.limit,
            offset: pagingInfo.offset,
            total: playlistData.totalCount,
            items,
        };
    }

    async savedAlbums({
        offset = 0,
        limit = 20,
    }: { offset?: number; limit?: number } = {}): Promise<GqlPage<Album>> {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        filters: ["Albums"],
                        order: null,
                        textFilter: "",
                        features: [
                            "LIKED_SONGS",
                            "YOUR_EPISODES_V2",
                            "PRERELEASES",
                            "EVENTS",
                        ],
                        limit,
                        offset,
                        flatten: false,
                        expandedFolders: [],
                        folderUri: null,
                        includeFoldersWhenFlattening: true,
                    },
                    operationName: "libraryV3",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "2de10199b2441d6e4ae875f27d2db361020c399fb10b03951120223fbed10b08",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const albumsData = res.data.me.libraryV3;
        const pagingInfo = albumsData.pagingInfo;

        const items = albumsData.items
            .filter(
                (item: any) =>
                    item.item.__typename === "AlbumResponseWrapper" &&
                    item.item.data.__typename === "Album"
            )
            .map((item: any) => {
                const album = item.item.data;
                const id = item.item._uri.split(":").pop();
                return {
                    id,
                    name: album.name,
                    uri: item.item._uri,
                    images: album.coverArt?.sources ?? [],
                    artists: album.artists?.items?.map((artist: any) => ({
                        id: artist.uri.split(":").pop(),
                        name: artist.profile?.name,
                        uri: artist.uri,
                    })) ?? [],
                } as Album;
            });

        return {
            offset: pagingInfo.offset,
            limit: pagingInfo.limit,
            total: albumsData.totalCount,
            items,
        };
    }

    async savedArtists({
        offset = 0,
        limit = 20,
    }: { offset?: number; limit?: number } = {}): Promise<GqlPage<Artist>> {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        filters: ["Artists"],
                        order: null,
                        textFilter: "",
                        features: [
                            "LIKED_SONGS",
                            "YOUR_EPISODES_V2",
                            "PRERELEASES",
                            "EVENTS",
                        ],
                        limit,
                        offset,
                        flatten: false,
                        expandedFolders: [],
                        folderUri: null,
                        includeFoldersWhenFlattening: true,
                    },
                    operationName: "libraryV3",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "2de10199b2441d6e4ae875f27d2db361020c399fb10b03951120223fbed10b08",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const artistData = res.data.me.libraryV3;
        const pagingInfo = artistData.pagingInfo;

        const items = artistData.items
            .filter(
                (item: any) =>
                    item.item.__typename === "ArtistResponseWrapper" &&
                    item.item.data.__typename === "Artist"
            )
            .map((item: any) => {
                const artist = item.item.data;
                const id = item.item._uri.split(":").pop();
                return {
                    id,
                    name: artist.profile?.name,
                    uri: item.item._uri,
                    images: artist.visuals?.avatarImage?.sources ?? [],
                } as Artist;
            });

        return {
            offset: pagingInfo.offset,
            limit: pagingInfo.limit,
            total: artistData.totalCount,
            items,
        };
    }

    async isTracksSaved(ids: string[]): Promise<boolean[]> {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: ids.map((id) => `spotify:track:${id}`),
                    },
                    operationName: "isCurated",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "e4ed1f91a2cc5415befedb85acf8671dc1a4bf3ca1a5b945a6386101a22e28a6",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const lookup = res.data.lookup;

        return lookup
            .filter((item: any) => item.data?.__typename === "Track")
            .map((item: any) => item.data?.isCurated ?? false);
    }

    async isInLibrary(
        ids: string[],
        { itemType }: { itemType: "artist" | "album" }
    ): Promise<boolean[]> {
        if (itemType !== "artist" && itemType !== "album") {
            throw new Error("itemType must be 'artist' or 'album'");
        }

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: ids.map((id) => `spotify:${itemType}:${id}`),
                    },
                    operationName: "areEntitiesInLibrary",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "134337999233cc6fdd6b1e6dbf94841409f04a946c5c7b744b09ba0dfe5a85ed",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const lookup = res.data.lookup;

        return lookup
            .filter((item: any) => item.data?.__typename.toLowerCase() === itemType)
            .map((item: any) => item.data?.saved ?? false);
    }
}

export { SpotifyUserEndpoint };
