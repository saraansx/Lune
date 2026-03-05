# Changelog

All notable changes to Lune will be documented in this file.

## [1.0.1] - 2026-03-05

### Performance Optimizations (V2 Patch)

This update dramatically reduces RAM usage and CPU load, specifically targeting memory leaks during long listening sessions and DOM freezing on massive playlists. It should feel significantly faster to start up and smoother to scroll.

#### Changed

- **DOM Virtualization in Downloads:** the native list was replaced with `react-virtuoso`. The Downloads view now easily handles 3,000+ tracks without freezing the application DOM.
- **Code Split Views:** Converted 8 non-essential views (`Settings`, `Downloads`, `Lyrics`, `Queue`, etc.) from eager imports to deferred `React.lazy()` imports. This directly removes unused JavaScript from your RAM on startup and makes app launch faster. Included a smooth fall-back loader mask during transition.
- **Image Lazy Loading:** Added `loading="lazy"` tags to dozens of cover-art `<img>` elements (Playlist, Downloads, Search, Artist View, etc.). Browser no longer forcibly downloads 200 high-res thumbnails off-screen all at once.
- **Consolidated `SpotifyGqlApi` context:** Replaced 5 concurrent, identical Spotify API instances running in `main`, `Playlist`, `SearchView`, etc. with a single memoized application-level `ApiContext`.

#### Fixed

- **Liked Songs Empty/Failing:** Updated the internal Spotify queries and implemented an automatic background hash scraper that keeps your Liked Songs fetching correctly from the Spotify API.
- **Memory Leak in Audio Prefetching:** The Player `prefetchMap` was storing all previously fetched background audio URLs permanently in a massive object, leaking RAM over several hours of listening. It is now strictly capped to auto-prune, and only ever holds the 5 most recent tracks in memory.
- **CPU Drain on Active Downloads:** The `DownloadIndicator` component was reacting to global download progress instead of scoped progress. A single active download no longer triggers hundreds of pointless global re-renders on the track-list page per second natively. Each indicator now only listens for and re-renders on its own specific `trackId` progress tick.
