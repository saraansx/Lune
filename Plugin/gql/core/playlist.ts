import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";

class SpotifyPlaylistEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async getPlaylist(playlistId: string): Promise<any> {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uri: `spotify:playlist:${playlistId}`,
                    offset: 0,
                    limit: 343,
                    enableWatchFeedEntrypoint: false,
                },
                operationName: "fetchPlaylist",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "7982b11e21535cd2594badc40030b745671b61a1fa66766e569d45e6364f3422",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data.playlistV2;
    }

    async tracks(
        playlistId: string,
        { offset = 0, limit = 50 }: { offset?: number; limit?: number } = {}
    ): Promise<any> {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uri: `spotify:playlist:${playlistId}`,
                    offset,
                    limit,
                    enableWatchFeedEntrypoint: false,
                },
                operationName: "fetchPlaylist",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "7982b11e21535cd2594badc40030b745671b61a1fa66766e569d45e6364f3422",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data.playlistV2.content;
    }

    async create(options: { name: string; description?: string; public?: boolean; collaborative?: boolean }) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    name: options.name,
                    description: options.description || "",
                    public: options.public || false,
                    collaborative: options.collaborative || false,
                },
                operationName: "createPlaylist",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "8ae780f2d9f3f9e9d6d8d6f9d6f9d6f9d6f9d6f9d6f9d6f9d6f9d6f9d6f9d6f9", // Placeholder until verified
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data.createPlaylist;
    }

    async addTracks(playlistId: string, { uris, position }: { uris: string[]; position?: number }) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    playlistUri: `spotify:playlist:${playlistId}`,
                    uris,
                    position: position ?? null,
                },
                operationName: "addItemsToPlaylist",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "602cc1832bc9c3b7a5a3a0e367878844be800ee74b4a1127083a21689252c80c",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res;
    }

    async removeTracks(playlistId: string, { uris }: { uris: string[] }) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    playlistUri: `spotify:playlist:${playlistId}`,
                    uris,
                },
                operationName: "removeItemsFromPlaylist",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "df208d132ce310bc931e9c522ef65377fd354b600f13524a806951b14299be65",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res;
    }

    async follow(playlistIds: string[]) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uris: playlistIds.map(id => `spotify:playlist:${id}`),
                },
                operationName: "addToLibrary",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res;
    }

    async unfollow(playlistIds: string[]) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uris: playlistIds.map(id => `spotify:playlist:${id}`),
                },
                operationName: "removeFromLibrary",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res;
    }
}

export { SpotifyPlaylistEndpoint };
