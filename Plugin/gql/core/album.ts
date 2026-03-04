import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";
import type { GqlAlbum, GqlPage } from "../types/gql-api.js";

class SpotifyAlbumEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async releases({
        offset = 0,
        limit = 20,
    }: { offset?: number; limit?: number } = {}): Promise<
        GqlPage<GqlAlbum>
    > {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        offset,
                        limit,
                        onlyUnPlayedItems: false,
                        includedContentTypes: ["ALBUM"],
                    },
                    operationName: "queryWhatsNewFeed",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "3b53dede3c6054e8b7c962dd280eb6761c5d1c82b06b039f4110d76a62b4966b",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);

        const releasesData = res.data.whatsNewFeedItems;
        const pagingInfo = releasesData.pagingInfo;
        const items = releasesData.items
            .filter(
                (item: any) =>
                    item.content?.__typename === "AlbumResponseWrapper" &&
                    item.content?.data?.__typename === "Album"
            )
            .map((item: any) => {
                const album = item.content.data;
                const id = album.uri.split(":").pop();

                return {
                    id,
                    name: album.name,
                    album_type: album.albumType?.toLowerCase(),
                    release_date: album.date?.isoString,
                    release_date_precision: album.date?.precision ?? "day",
                    images: album.coverArt?.sources,
                    external_urls: {
                        spotify: `https://open.spotify.com/album/${id}`,
                    },
                    artists:
                        album.artists?.items?.map((artist: any) => {
                            const artistId = artist.uri.split(":").pop();
                            return {
                                id: artistId,
                                uri: artist.uri,
                                name: artist.profile.name,
                                external_urls: {
                                    spotify: `https://open.spotify.com/artist/${artistId}`,
                                },
                            };
                        }) ?? [],
                };
            });

        return {
            offset: pagingInfo.offset,
            limit: pagingInfo.limit,
            total: releasesData.totalCount,
            items,
        };
    }

    async save(albumIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: albumIds.map((id) => `spotify:album:${id}`),
                    },
                    operationName: "addToLibrary",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);
        return res;
    }

    async getAlbum(albumId: string) {
        // Updated working hash for getAlbum/queryAlbumTracks
        const WORKING_HASH = "b9bfabef66ed756e5e13f68a942deb60bd4125ec1f1be8cc42769dc0259b4b10";

        try {
            const res = await this.gqlClient.post("query", {
                body: {
                    variables: {
                        uri: `spotify:album:${albumId}`,
                        locale: "en",
                        offset: 0,
                        limit: 300,
                    },
                    operationName: "getAlbum",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: WORKING_HASH,
                        },
                    },
                },
            });

            SpotifyError.mayThrow(res);

            // The browser reports getAlbum returns data under 'albumUnion' or 'albumV2'
            const albumData = res.data?.albumUnion || res.data?.albumV2 || res.data?.album;
            if (albumData) return albumData;

            console.log("[album.getAlbum] Raw response keys:", Object.keys(res.data || {}));
        } catch (err) {
            console.log("[album.getAlbum] Fetch failed with primary hash:", err);

            // Fallback: try queryAlbumTracks with same hash as it often works
            try {
                const res = await this.gqlClient.post("query", {
                    body: {
                        variables: {
                            uri: `spotify:album:${albumId}`,
                            offset: 0,
                            limit: 300,
                        },
                        operationName: "queryAlbumTracks",
                        extensions: {
                            persistedQuery: {
                                version: 1,
                                sha256Hash: WORKING_HASH,
                            },
                        },
                    },
                });

                SpotifyError.mayThrow(res);
                const albumData = res.data?.albumUnion || res.data?.albumV2 || res.data?.album;
                if (albumData) return albumData;
            } catch (fallbackErr) {
                console.log("[album.getAlbum] Fallback also failed:", fallbackErr);
            }
        }

        throw new Error("Could not fetch album data with discovered hashes");
    }

    async unsave(albumIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: albumIds.map((id) => `spotify:album:${id}`),
                    },
                    operationName: "removeFromLibrary",
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915",
                        },
                    },
                },
            })
            ;

        SpotifyError.mayThrow(res);
        return res;
    }
}

export { SpotifyAlbumEndpoint };
