import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useApi } from '@/context/ApiContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import type { BrowseSectionItem, GqlPlaylistSimplified, GqlAlbumSimplified, GqlArtist } from '@/Plugin/gql';

// --- Optimized Components ---

const Card = React.memo(({ item, onPress }: { item: GqlPlaylistSimplified | GqlAlbumSimplified | GqlArtist, onPress: (item: any) => void }) => {
    return (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => onPress(item)}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/150' }} 
                    style={styles.cardImage} 
                />
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.objectType === 'Playlist' ? 'Playlist' : item.objectType === 'Album' ? 'Album' : 'Artist'}
            </Text>
        </TouchableOpacity>
    );
});

const HomeSection = React.memo(({ section, onCardPress }: { section: BrowseSectionItem, onCardPress: (item: any) => void }) => {
    if (!section.items || section.items.length === 0) return null;

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <TouchableOpacity>
                    <Text style={styles.showAllText}>Show All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={section.items}
                renderItem={({ item }) => <Card item={item} onPress={onCardPress} />}
                keyExtractor={(item) => item.uri}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                initialNumToRender={5}
                windowSize={3}
                maxToRenderPerBatch={5}
                removeClippedSubviews={true}
            />
        </View>
    );
});

export const HomeView = () => {
    const { api, spT } = useApi();
    const { logout } = useAuth();
    const [sections, setSections] = useState<BrowseSectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const fetchHomeData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.browse.home({
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                spTCookie: spT || '',
            });
            setSections(data);
        } catch (err: any) {
            console.error('Failed to fetch home data:', err);
            setError(err.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    }, [api, spT]);

    useEffect(() => {
        fetchHomeData();
    }, [fetchHomeData]);

    const handlePress = useCallback((item: GqlPlaylistSimplified | GqlAlbumSimplified | GqlArtist) => {
        if (item.objectType === 'Playlist') {
            router.push(`/playlist/${item.id}` as any);
        } else if (item.objectType === 'Album') {
            router.push(`/album/${item.id}` as any);
        } else if (item.objectType === 'Artist') {
            // router.push(`/artist/${item.id}` as any);
        }
    }, []);

    const renderSection = useCallback(({ item: section }: { item: BrowseSectionItem }) => (
        <HomeSection section={section} onCardPress={handlePress} />
    ), [handlePress]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Fetching your music...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Oops! {error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchHomeData}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            data={sections.filter(s => s.items.length > 0 && s.title)}
            renderItem={renderSection}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
                <View style={styles.header}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
            contentContainerStyle={styles.listContent}
            initialNumToRender={4}
            windowSize={5}
            maxToRenderPerBatch={4}
            removeClippedSubviews={true}
        />
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        color: Colors.textDim,
        marginTop: Spacing.md,
        fontSize: 14,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    retryBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.accentSoft,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.accent,
    },
    retryText: {
        color: Colors.accent,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
    },
    greeting: {
        ...Typography.header,
        fontSize: 28,
        letterSpacing: -0.5,
    },
    logoutBtn: {
        position: 'absolute',
        right: Spacing.md,
        top: Spacing.lg + 5,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logoutText: {
        color: Colors.textDim,
        fontSize: 12,
        fontWeight: '600',
    },
    sectionContainer: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        ...Typography.subHeader,
        fontSize: 22,
    },
    showAllText: {
        ...Typography.caption,
        color: Colors.textDim,
        fontWeight: '600',
    },
    horizontalList: {
        paddingLeft: Spacing.md,
        paddingRight: Spacing.md,
    },
    card: {
        width: 140,
        marginRight: Spacing.md,
    },
    imageContainer: {
        width: 140,
        height: 140,
        borderRadius: 8,
        backgroundColor: Colors.bgSurface,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardTitle: {
        ...Typography.body,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardSubtitle: {
        ...Typography.caption,
        fontSize: 12,
    }
});
