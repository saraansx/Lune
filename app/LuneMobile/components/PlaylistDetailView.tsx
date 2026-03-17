import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { useApi } from '@/context/ApiContext';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { normalizeTrack, LuneTrack } from '@/types/track';
import { ArrowLeft, Play, MoreVertical } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Optimized Components ---

const TrackItem = React.memo(({ item, index, onMorePress }: { item: LuneTrack; index: number; onMorePress: (item: LuneTrack) => void }) => {
    return (
        <TouchableOpacity style={styles.trackItem} activeOpacity={0.7}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => onMorePress(item)} style={styles.moreBtn}>
                <MoreVertical size={20} color={Colors.textDim} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
});

interface PlaylistDetailViewProps {
    id: string;
    type: 'playlist' | 'album';
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ id, type }) => {
    const { api } = useApi();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [tracks, setTracks] = useState<LuneTrack[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (type === 'playlist') {
                const playlistData = await api.playlist.getPlaylist(id);
                setData({
                    name: playlistData.name,
                    description: playlistData.description || '',
                    coverUrl: playlistData.images?.items?.[0]?.sources?.[0]?.url || playlistData.images?.items?.[0]?.url || '',
                    ownerName: playlistData.ownerV2?.data?.name || playlistData.owner?.name || 'Unknown',
                    totalTracks: playlistData.content?.totalCount || 0,
                });

                const rawTracks = playlistData.content?.items || [];
                const normalized = rawTracks.map((item: any) => {
                    const trackData = item.itemV2?.data;
                    return trackData ? normalizeTrack(trackData) : null;
                }).filter(Boolean) as LuneTrack[];
                
                setTracks(normalized);
            } else {
                const albumData = await api.album.getAlbum(id);
                const coverUrl = albumData.coverArt?.sources?.[0]?.url || albumData.images?.items?.[0]?.sources?.[0]?.url || '';
                
                setData({
                    name: albumData.name,
                    description: albumData.artists?.items?.[0]?.profile?.name || 'Album',
                    coverUrl: coverUrl,
                    ownerName: albumData.artists?.items?.[0]?.profile?.name || 'Unknown',
                    totalTracks: albumData.tracksV2?.totalCount || albumData.tracks?.items?.length || 0,
                });

                const rawTracks = albumData.tracksV2?.items || albumData.tracks?.items || [];
                const normalized = rawTracks.map((item: any) => {
                    const track = item.track || item;
                    const n = normalizeTrack(track);
                    if (!n.albumArt || n.albumArt.includes('placeholder')) n.albumArt = coverUrl;
                    if (!n.albumName) n.albumName = albumData.name;
                    return n;
                });
                
                setTracks(normalized);
            }
        } catch (err: any) {
            console.error('Failed to fetch detail data:', err);
            setError(err.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    }, [api, id, type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMorePress = useCallback((item: LuneTrack) => {
        // Implement track options menu
    }, []);

    const renderTrackItem = useCallback(({ item, index }: { item: LuneTrack; index: number }) => (
        <TrackItem item={item} index={index} onMorePress={handleMorePress} />
    ), [handleMorePress]);

    const listHeader = useMemo(() => {
        if (!data) return null;
        return (
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.textMain} />
                </TouchableOpacity>
                
                <View style={styles.heroSection}>
                    <Image source={{ uri: data.coverUrl }} style={styles.coverImage} />
                    <Text style={styles.title}>{data.name}</Text>
                    <Text style={styles.subtitle}>{data.ownerName} • {data.totalTracks} songs</Text>
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.playBtn}>
                            <Play size={24} color="white" fill="white" />
                        </TouchableOpacity>
                        <View style={styles.actionSpace} />
                        <TouchableOpacity style={styles.secondaryAction}>
                            <MoreVertical size={24} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }, [data]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.accent} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Oops! {error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tracks}
                renderItem={renderTrackItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ListHeaderComponent={listHeader}
                contentContainerStyle={styles.listContent}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'android'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 10,
    },
    backBtn: {
        padding: Spacing.md,
        zIndex: 10,
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    coverImage: {
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.header,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.caption,
        fontSize: 14,
        marginBottom: Spacing.lg,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    actionSpace: {
        width: Spacing.xl,
    },
    secondaryAction: {
        padding: Spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    trackIndex: {
        ...Typography.caption,
        width: 30,
        textAlign: 'center',
        marginRight: Spacing.sm,
    },
    trackInfo: {
        flex: 1,
    },
    trackName: {
        ...Typography.body,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    trackArtist: {
        ...Typography.caption,
        fontSize: 13,
    },
    moreBtn: {
        padding: Spacing.xs,
    },
    errorText: {
        ...Typography.body,
        color: '#ef4444',
        marginBottom: Spacing.md,
    },
    retryBtn: {
        padding: Spacing.md,
        backgroundColor: Colors.accentSoft,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.accent,
        fontWeight: '700',
    }
});
