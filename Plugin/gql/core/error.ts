class SpotifyError extends Error {
    constructor(e: Record<string, any>) {
        super(e["error"]["message"]);
    }

    static mayThrow<T extends Record<string, any>>(e: T) {
        if (e["error"] != null) {
            throw new SpotifyError(e);
        }
    }
}

export { SpotifyError };
