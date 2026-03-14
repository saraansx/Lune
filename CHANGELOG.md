# Changelog

All notable changes to Lune will be documented in this file.

## [1.0.3] - 2026-03-14

### Self-Healing Authentication & Session Resiliency

This update introduces a robust, proactive authentication system that automatically recovers from expired Spotify tokens and transient network failures, ensuring uninterrupted playback and account access.

#### Added

- **Real-time 401 Error Detection:** The application now actively monitors all Spotify API requests for "Unauthorized" (401) responses. If a session expires while the app is running, it instantly triggers a background recovery instead of waiting for a scheduled timer.
- **Proactive Token Refresh:** Implemented a global `onUnauthorized` hook that bridges all API endpoints to the main authentication controller, allowing for immediate "self-healing" of the application state.

#### Changed

- **Improved Session Resiliency:** Refactored the authentication lifecycle in `main.tsx` to hold onto user credentials during transient errors. The app no longer "gives up" on a session due to a single failed refresh, preventing users from being kicked to the "Log out anyway" setting state.
- **Bypassable Refresh Cooldown:** Modified the Electron background process to ignore the standard 10-second refresh cooldown if a hard 401 error is detected, ensuring music playback and settings can recover the millisecond a connection is restored.

#### Fixed

- **Persistent "Log out anyway" Bug:** Fixed a logic error where the app would mark a session as invalid if a background refresh failed once, which previously forced users to manually log out and back in to fix the "Could not load profile" error in settings.
- **Refresh Timer Suspension:** Corrected a bug in the token refresh logic where an already-expired token would wait 5 minutes to retry; it now retries in the background with increasing frequency while keeping the UI active.


## [1.0.2] - 2026-03-12

### Remote Plugin System & Reliability Overhaul

This update eliminates the need for app updates when Spotify changes their API hashes, fixes critical YouTube playback failures, and adds a full Downloads management experience.

#### Added

- **Gapless Autoplay Transition:** The `AutoplayQueue` radio tracks are now fully integrated into the stream prefetcher. When the player queue falls back to the autoplay list, the next track's audio is fetched in the background before the current song finishes, ensuring instant gapless playback transitions.
- **Backend Application Logs:** Internal application logs, including the Rate Limiter, Radio Pool engine, and Stream Prefetcher, are now dynamically intercepted from the React frontend and bridged directly into the Electron main process logs for easier debugging in the Lune Settings.
- **Remote Hash Registry:** All Spotify GraphQL persisted-query hashes are now fetched from a remote GitHub Gist at runtime instead of being hardcoded. If a hash breaks, it can be fixed by editing the gist — no app update required. Hashes are cached in memory with a 30-minute TTL, with graceful fallback to stale cache if the remote fetch fails.
- **Downloads View:** Brand new dedicated Downloads page with full track listing, virtualized scrolling (handles thousands of tracks), shuffle play, queue management, and per-track context menus (play next, add to queue, favorite, add to local playlist, remove download).
- **Download Settings:** New settings panel to view and change the download storage location with a folder picker.
- **Star on GitHub Prompt:** A non-intrusive, glassmorphism-styled popup that asks users to star the GitHub repo after their second session. Includes "Maybe Later" dismiss and remembers if the user has already starred.
- **GitHub Feature Request Template:** Added a structured YAML-based issue template for feature requests.

#### Changed

- **YouTube Playback Fallback Strategies:** Implemented multi-client fallback for `yt-dlp` stream fetching. If the primary YouTube API client fails, the system now automatically tries alternative clients before giving up, dramatically improving playback success rates.
- **Player Context Improvements:** Significant refactoring of `PlayerContext` to improve state management, queue handling, and playback reliability. Enhanced error handling for edge cases during track transitions.
- **Streaming Handler Robustness:** Updated `electron/handlers/streaming.ts` with better error recovery, retry logic, and cache management for audio streams.
- **Electron Main Process:** Enhanced window management, IPC handlers, settings persistence (`electron-store`), and yt-dlp binary path resolution. Improved error handling throughout the main process.
- **PlayerBar Enhancements:** Improved player bar UI interactions and state synchronization.
- **Playlist Component:** Refactored playlist display with better error handling and type safety.
- **Artist View:** Improved artist page data handling and layout.
- **Updated Dependencies:** Bumped `package-lock.json` and various dependency versions.

#### Fixed

- **YouTube Playback Loop:** Fixed a critical bug where the application would repeatedly clear its cache and re-fetch stream URLs in an infinite loop, completely preventing playback. The cache-clearing logic and URL fetching triggers have been corrected to ensure seamless audio playback.
- **Spotify Hash Breakage:** By moving to remote hashes, the app no longer becomes non-functional when Spotify rotates their internal API hashes — a problem that previously required pushing an app update to fix.
- **Download Indicator Scoping:** Improved download progress indicator to correctly scope updates to individual tracks.
- **Login Flow:** Minor improvements to the login component for better reliability.

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
