import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeView } from '@/components/HomeView';
import { LuneBackground } from '@/components/LuneBackground';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { accessToken, loading } = useAuth();

  if (loading) return null;
  // If not logged in, RootLayout will handle redirect or we can do it here
  if (!accessToken) return null;

  return (
    <LuneBackground>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <HomeView />
        </SafeAreaView>
    </LuneBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  }
});
