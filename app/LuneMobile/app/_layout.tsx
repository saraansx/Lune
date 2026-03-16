import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Colors } from '../constants/Colors';

import { SplashScreen as CustomSplash } from '../components/SplashScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ApiProvider } from '../context/ApiContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { accessToken, spDc, spT, loading } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Hide native splash immediately
    SplashScreen.hideAsync();
  }, []);

  if (loading) return null;

  return (
    <ApiProvider accessToken={accessToken || ''} spDc={spDc || undefined} spT={spT || undefined}>
      <StatusBar style="light" />
      
      {!splashFinished && (
        <CustomSplash onFinished={() => setSplashFinished(true)} />
      )}

      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgPrimary }
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="album/[id]" options={{ headerShown: false }} />
      </Stack>
    </ApiProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={{
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: Colors.bgPrimary,
        primary: Colors.accent,
        card: Colors.bgSurface,
        text: Colors.textMain,
        border: Colors.cardBorder,
      }
    }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
