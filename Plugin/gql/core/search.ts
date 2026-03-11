import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";
import { getHash } from "./hash-registry.js";
import type {
    GqlAlbum,
    GqlArtist,
    GqlArtistSimplified,
    GqlPage,
    GqlPlaylistSimplified,
    GqlUser,
} from "../types/gql-api.js";
import type { Track } from "../types/web-api.js";

class SpotifySearchEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    convertAlbums(albums: Record<string, any>[]): GqlAlbum[] {
        return albums
            .filter(
                (item) =>
                    item?.__typename === "AlbumResponseWrapper" &&
                    item?.data?.__typename === "Album"
            )
            .map((item) => {
                try {
                    const album = item.data;
                    const id = album.uri?.split(":").pop() || "";

                    return {
                        objectType: "Album",
                        id,
                        name: album.name || "",
                        album_type: album.type?.toLowerCase(),
                        release_date: album.date?.year?.toString(),
                        release_date_precision: "year",
                        images: album.coverArt?.sources || album.images?.items?.flatMap((i: any) => i.sources) || [],
                        uri: album.uri || "",
                        external_urls: {
                            spotify: `https://open.spotify.com/album/${id}`,
                        },
                        artists:
                            album.artists?.items?.map((artist: any) => {
                                const artistId = artist.uri?.split(":").pop() || "";
                                return {
                                    objectType: "Artist",
                                    id: artistId,
                                    uri: artist.uri || "",
                                    name: artist.profile?.name || artist.name || "",
                                    external_urls: {
                                        spotify: `https://open.spotify.com/artist/${artistId}`,
                                    },
                                } satisfies GqlArtistSimplified;
                            }) ?? [],
                    } satisfies GqlAlbum;
                } catch {
                    return null;
                }
            }).filter(Boolean) as GqlAlbum[];
    }

    convertArtists(artists: Record<string, any>[]): GqlArtist[] {
        return artists
            .filter(
                (item) =>
                    item.__typename === "ArtistResponseWrapper" &&
                    item.data?.__typename === "Artist"
            )
            .map((data) => {
                const artist = data.data;
                const id = artist.uri.split(":").pop();

                return {
                    objectType: "Artist",
                    id,
                    uri: artist.uri,
                    name: artist.profile.name,
                    images: artist.visuals?.avatarImage?.sources ?? [],
                    external_urls: {
                        spotify: `https://open.spotify.com/artist/${id}`,
                    },
                } satisfies GqlArtist;
            });
    }

    convertPlaylists(playlists: Record<string, any>[]): GqlPlaylistSimplified[] {
        return playlists
            .filter(
                (item) =>
                    item?.__typename === "PlaylistResponseWrapper" &&
                    item?.data?.__typename === "Playlist"
            )
            .map((data) => {
                try {
                    const playlist = data.data;
                    const id = playlist.uri?.split(":").pop() || "";

                    const owner = playlist.ownerV2?.data || {};
                    const ownerId = owner.uri?.split(":").pop() || "";

                    return {
                        id,
                        uri: playlist.uri || "",
                        name: playlist.name || "",
                        description: playlist.description || "",
                        images:
                            playlist.images?.items?.flatMap((image: any) => image.sources) ??
                            [],
                        external_urls: {
                            spotify: `https://open.spotify.com/playlist/${id}`,
                        },
                        owner: {
                            type: "User",
                            id: ownerId,
                            uri: owner.uri || "",
                            name: owner.username || owner.name || "",
                            display_name: owner.name || "",
                            images: owner.avatar?.sources ?? [],
                            external_urls: {
                                spotify: `https://open.spotify.com/user/${ownerId}`,
                            },
                        } satisfies GqlUser,
                        objectType: "Playlist",
                    } satisfies GqlPlaylistSimplified;
                } catch {
                    return null;
                }
            }).filter(Boolean) as GqlPlaylistSimplified[];
    }

    convertTracks(tracks: Record<string, any>[]): Track[] {
        return tracks
            .filter(
                (item) =>
                    item.item?.__typename === "TrackResponseWrapper" &&
                    item.item.data?.__typename === "Track"
            )
            .map((item) => {
                const track = item.item.data;
                const id = track.uri.split(":").pop();

                return {
                    id,
                    name: track.name,
                    uri: track.uri,
                    duration_ms: track.duration?.totalMilliseconds ?? 0,
                    explicit: track.contentRating?.label === "EXPLICIT",
                    preview_url: null,
                    external_urls: {
                        spotify: `https://open.spotify.com/track/${id}`,
                    },
                    album: {
                        id: track.albumOfTrack?.uri.split(":").pop(),
                        name: track.albumOfTrack?.name,
                        images: track.albumOfTrack?.coverArt?.sources ?? [],
                        external_urls: {
                            spotify: `https://open.spotify.com/album/${track.albumOfTrack?.uri.split(":").pop()}`,
                        },
                    } as any,
                    artists: track.artists?.items?.map((artist: any) => {
                        const artistId = artist.uri.split(":").pop();
                        return {
                            id: artistId,
                            name: artist.profile?.name,
                            uri: artist.uri,
                            external_urls: {
                                spotify: `https://open.spotify.com/artist/${artistId}`,
                            },
                        };
                    }) ?? [],
                } as Track;
            });
    }

    async all(
        query: string,
        {
            offset = 0,
            limit = 10,
            topResults = 5,
        }: { offset?: number; limit?: number; topResults?: number } = {}
    ): Promise<{
        albums: GqlAlbum[];
        artists: GqlArtist[];
        playlists: GqlPlaylistSimplified[];
        tracks: Track[];
    }> {
        const hash = await getHash("Search", "searchDesktop");

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        searchTerm: query,
                        offset,
                        limit,
                        numberOfTopResults: topResults,
                        includeAudiobooks: true,
                        includeArtistHasConcertsField: false,
                        includePreReleases: true,
                        includeLocalConcertsField: false,
                        includeAuthors: false,
                    },
                    operationName: "searchDesktop",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const searchData = res.data.searchV2;
        const albums = this.convertAlbums(searchData.albumsV2?.items || []);
        const artists = this.convertArtists(searchData.artists?.items || []);
        const playlists = this.convertPlaylists(searchData.playlists?.items || searchData.playlistsV2?.items || []);
        const tracks = this.convertTracks(searchData.tracksV2?.items || []);

        return {
            albums,
            artists,
            playlists,
            tracks,
        };
    }

    async albums(
        query: string,
        { offset = 0, limit = 20 }: { offset?: number; limit?: number } = {}
    ): Promise<GqlPage<GqlAlbum>> {
        const hash = await getHash("Search", "searchAlbums");

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        includePreReleases: false,
                        numberOfTopResults: 20,
                        searchTerm: query,
                        offset,
                        limit,
                        includeAudiobooks: false,
                        includeAuthors: false,
                    },
                    operationName: "searchAlbums",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const searchData = res.data.searchV2.albumsV2;
        const pagingInfo = searchData.pagingInfo;
        const items = this.convertAlbums(searchData.items);

        return {
            total: searchData.totalCount,
            limit: pagingInfo.limit,
            offset: pagingInfo.nextOffset,
            items,
        };
    }

    async artists(
        query: string,
        { offset = 0, limit = 20 }: { offset?: number; limit?: number } = {}
    ): Promise<GqlPage<GqlArtist>> {
        const hash = await getHash("Search", "searchArtists");

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        includePreReleases: false,
                        numberOfTopResults: 20,
                        searchTerm: query,
                        offset,
                        limit,
                        includeAudiobooks: true,
                        includeAuthors: false,
                    },
                    operationName: "searchArtists",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const searchData = res.data.searchV2.artists;
        const pagingInfo = searchData.pagingInfo;
        const items = this.convertArtists(searchData.items);

        return {
            total: searchData.totalCount,
            limit: pagingInfo.limit,
            offset: pagingInfo.nextOffset,
            items,
        };
    }

    async playlists(
        query: string,
        { offset = 0, limit = 20 }: { offset?: number; limit?: number } = {}
    ): Promise<GqlPage<GqlPlaylistSimplified>> {
        const hash = await getHash("Search", "searchPlaylists");

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        includePreReleases: false,
                        numberOfTopResults: 20,
                        searchTerm: query,
                        offset,
                        limit,
                        includeAudiobooks: true,
                        includeAuthors: false,
                    },
                    operationName: "searchPlaylists",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const searchData = res.data.searchV2.playlists;
        const pagingInfo = searchData.pagingInfo;
        const items = this.convertPlaylists(searchData.items);

        return {
            total: searchData.totalCount,
            limit: pagingInfo.limit,
            offset: pagingInfo.nextOffset,
            items,
        };
    }

    async tracks(
        query: string,
        { offset = 0, limit = 20 }: { offset?: number; limit?: number } = {}
    ): Promise<GqlPage<Track>> {
        const hash = await getHash("Search", "searchTracks");

        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        includePreReleases: false,
                        numberOfTopResults: 20,
                        searchTerm: query,
                        offset,
                        limit,
                        includeAudiobooks: true,
                        includeAuthors: false,
                    },
                    operationName: "searchTracks",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const searchData = res.data.searchV2.tracksV2;
        const pagingInfo = searchData.pagingInfo;
        const items = this.convertTracks(searchData.items);

        return {
            total: searchData.totalCount,
            limit: pagingInfo.limit,
            offset: pagingInfo.nextOffset,
            items,
        };
    }
}

export { SpotifySearchEndpoint };
