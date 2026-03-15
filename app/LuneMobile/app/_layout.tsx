import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Colors } from '../constants/Colors';

import { SplashScreen as CustomSplash } from '../components/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Hide native splash immediately since we use our custom one
    SplashScreen.hideAsync();
  }, []);

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
      </Stack>
    </ThemeProvider>
  );
}
