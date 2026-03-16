import { useLocalSearchParams } from 'expo-router';
import { PlaylistDetailView } from '@/components/PlaylistDetailView';
import { LuneBackground } from '@/components/LuneBackground';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlbumScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    
    if (!id) return null;

    return (
        <LuneBackground>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <PlaylistDetailView id={id} type="album" />
            </SafeAreaView>
        </LuneBackground>
    );
}
