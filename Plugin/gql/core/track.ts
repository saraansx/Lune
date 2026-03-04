import { HttpClient } from "./http-client.js"
import { SpotifyError } from "./error.js";

class SpotifyTrackEndpoint {
    gqlClient!: HttpClient;

    constructor(gqlClient: HttpClient) {
        this.gqlClient = gqlClient;
    }

    async save(trackIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: trackIds.map((id) => `spotify:track:${id}`),
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

    async unsave(trackIds: string[]) {
        const res = await this.gqlClient
            .post("query", {
                body: {
                    variables: {
                        uris: trackIds.map((id) => `spotify:track:${id}`),
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
    async getTrack(trackId: string) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    uri: `spotify:track:${trackId}`,
                },
                operationName: "getTrack",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data.trackUnion || res.data.track || res.data.trackV2;
    }

    async getCanvas(trackId: string) {
        const res = await this.gqlClient.post("query", {
            body: {
                variables: {
                    trackUri: `spotify:track:${trackId}`,
                },
                operationName: "canvas",
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "575138ab27cd5c1b3e54da54d0a7cc8d85485402de26340c2145f0f6bb5e7a9f",
                    },
                },
            },
        });

        SpotifyError.mayThrow(res);
        return res.data;
    }
}

export { SpotifyTrackEndpoint };
