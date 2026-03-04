import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";

class SpotifyArtistEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async follow(artistIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: artistIds.map((id) => `spotify:artist:${id}`),
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

    async unfollow(artistIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: artistIds.map((id) => `spotify:artist:${id}`),
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

    async getArtist(artistId: string) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uri: `spotify:artist:${artistId}`,
                    locale: "en",
                    includePrerelease: false,
                },
                operationName: "queryArtistOverview",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "dd14c6043d8127b56c5acbe534f6b3c58714f0c26bc6ad41776079ed52833a8f",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data.artistUnion || res.data.artistV2 || res.data.artist;
    }
}

export { SpotifyArtistEndpoint };
