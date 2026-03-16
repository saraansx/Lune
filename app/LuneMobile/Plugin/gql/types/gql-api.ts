import type { ExternalUrls, Image } from "./web-api";

export interface GqlPage<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export interface GqlArtistSimplified {
    objectType: "Artist";
    id: string;
    uri: string;
    name: string;
    external_urls: ExternalUrls;
}

export interface GqlArtist extends GqlArtistSimplified {
    images: Image[];
}

export interface GqlAlbumSimplified {
    objectType: "Album";
    id: string;
    name: string;
    album_type: "single" | "album" | "compilation";
    images: Image[];
    external_urls: ExternalUrls;
    artists: GqlArtistSimplified[];
    uri: string;
}

export interface GqlAlbum extends GqlAlbumSimplified {
    release_date: string;
    release_date_precision: "year" | "month" | "day";
}

export interface BrowseSectionItem {
    id: string;
    title: string;
    uri: string;
    external_urls: ExternalUrls;
    items: (GqlPlaylistSimplified | GqlAlbumSimplified | GqlArtist)[];
}

export interface GqlUser {
    type: "User";
    external_urls: ExternalUrls;
    id: string;
    uri: string;
    display_name: string;
    name?: string;
    images: Image[]; // often empty for system users like "Spotify"
}

export interface GqlPlaylistSimplified {
    objectType: "Playlist";
    id: string;
    description: string; // may contain HTML-like anchor tags as strings
    external_urls: ExternalUrls;
    images: Image[];
    name: string;
    owner: GqlUser;
    uri: string;
}
