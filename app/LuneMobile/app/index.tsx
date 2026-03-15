import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../constants/Colors';
import { LuneBackground } from '../components/LuneBackground';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { SpotifyAuthCore } from '../Plugin/spotify-auth-core';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const core = useRef(new SpotifyAuthCore()).current;

  // Setup loop animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleLogin = () => {
    setIsLoading(true);
    setShowWebView(true);
  };

  const isProcessingAuth = useRef(false);

  // Check if user is already logged in on startup
  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('spotify_access_token');
        const expiration = await SecureStore.getItemAsync('spotify_token_expiration');
        
        if (token && expiration) {
          const expiresAt = parseInt(expiration, 10);
          // If token is expired or about to expire in 5 minutes
          if (Date.now() > expiresAt - 300000) {
            try {
              // Automatically grabs sp_dc from native phone cookie jar
              const tokenData = await core.getAccessToken();
              await SecureStore.setItemAsync('spotify_access_token', tokenData.accessToken);
              await SecureStore.setItemAsync('spotify_token_expiration', tokenData.accessTokenExpirationTimestampMs.toString());
              router.replace('/home' as any);
              return; // Successfully refreshed and redirected
            } catch (refreshError) {
              // Token refresh failed (maybe sp_dc expired), user must log in again
            }
          } else {
            // Token still valid, redirect immediately
            router.replace('/home' as any);
            return;
          }
        }
      } catch (e) {
        // Ignore errors and default to showing login
      }
      setIsLoading(false); // Only set false if we didn't redirect
    };
    
    checkLoginStatus();
  }, [core]);

  const onNavigationStateChange = async (navState: any) => {
    const url = navState.url;
    // When the user completes login, the WebView will navigate away from the login page.
    // If we land on a generic Spotify page (e.g. account overview), we attempt to fetch a token.
    if (url && url.includes('spotify.com') && !url.includes('login') && !url.includes('authorize')) {
      if (isProcessingAuth.current) return;
      
      try {
        isProcessingAuth.current = true;
        
        // Native networking inside React Native automatically shares the sp_dc 
        // cookie established by the WebView, so we don't need to manually pass it.
        const tokenData = await core.getAccessToken();
        
        await SecureStore.setItemAsync('spotify_access_token', tokenData.accessToken);
        await SecureStore.setItemAsync('spotify_token_expiration', tokenData.accessTokenExpirationTimestampMs.toString());
        
        setShowWebView(false);
        setIsLoading(false);
        router.replace('/home' as any); // Redirect to home page
      } catch (error) {
        // If it throws an error (e.g., token fetch fails because user isn't fully logged in), 
        // we reset so it can try again on the next navigation event.
        isProcessingAuth.current = false;
      }
    }
  };

  return (
    <LuneBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Centered Content */}
          <View style={styles.loginCenter}>
             {/* Moon Icon (Floating) - Exact Desktop Asset */}
             <Animated.View style={[styles.moonIcon, { transform: [{ translateY: floatAnim }] }]}>
                <Image 
                  source={require('../assets/images/Main.png')} 
                  style={styles.moonImg}
                  resizeMode="contain"
                />
             </Animated.View>

             {/* Branding - Exact Desktop Typography */}
             <Text style={styles.brandTitle}>LUNE</Text>
             <Text style={styles.brandTagline}>your music, reimagined</Text>
             <Text style={styles.brandDescription}>
               A next-gen music client powered by Spotify's metadata ecosystem.
             </Text>

             {/* Separator - Exact 28px width */}
             <View style={styles.lineSep} />

             {/* Connect Button - Exact Desktop Glass Style */}
             <View style={styles.glassWrapper}>
                <BlurView intensity={24} tint="dark" style={styles.blurContainer}>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={styles.connectBtn}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.textDim} size="small" />
                    ) : (
                      <>
                        {/* Exact Spotify SVG from Desktop */}
                        <Svg width="16" height="16" viewBox="0 0 16 16" fill={isLoading ? Colors.textDim : "#B3B3B3"} style={styles.spotifyIcon}>
                          <Path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288" />
                        </Svg>
                        <Text style={styles.btnText}>Continue with Spotify</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </BlurView>
             </View>
          </View>

          {/* Version Footer */}
          <View style={styles.loginFooter}>
            <Text style={styles.versionText}>V 1.0.3</Text>
          </View>

        </View>
      </SafeAreaView>

      <Modal visible={showWebView} animationType="slide">
         <SafeAreaView style={{ flex: 1 }}>
            {/* Nav bar for modal */}
            <View style={styles.modalHeader}>
               <TouchableOpacity onPress={() => { setShowWebView(false); setIsLoading(false); }}>
                  <Text style={styles.closeBtn}>Close</Text>
               </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: 'https://accounts.spotify.com/' }}
              onNavigationStateChange={onNavigationStateChange}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
            />
         </SafeAreaView>
      </Modal>
    </LuneBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loginCenter: { alignItems: 'center', width: '100%', paddingBottom: 40 },
  moonIcon: { width: 80, height: 80, marginBottom: 24, justifyContent: 'center', alignItems: 'center' },
  moonImg: { width: '100%', height: '100%' },
  brandTitle: {
    fontSize: 28, fontWeight: '300', letterSpacing: 14, color: '#ffffff',
    textTransform: 'uppercase', textAlign: 'center', paddingLeft: 14, marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 24,
  },
  brandTagline: {
    fontSize: 11, fontWeight: '400', letterSpacing: 1.76, color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center', textTransform: 'lowercase',
  },
  brandDescription: {
    fontSize: 10, fontWeight: '300', letterSpacing: 0.4, color: 'rgba(255, 255, 255, 0.15)',
    textAlign: 'center', lineHeight: 15, maxWidth: 240, marginTop: 6,
  },
  lineSep: {
    width: 28, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: 32,
  },
  glassWrapper: {
    borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)',
    width: 260, shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 40, elevation: 10,
  },
  blurContainer: { width: '100%', backgroundColor: 'rgba(14, 165, 233, 0.08)' },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, paddingHorizontal: 22, width: '100%',
  },
  btnText: { color: '#94a3b8', fontSize: 13, fontWeight: '500', letterSpacing: 0.39, marginLeft: 10 },
  spotifyIcon: { width: 16, height: 16 },
  loginFooter: { position: 'absolute', bottom: 24, width: '100%', alignItems: 'center' },
  versionText: { fontSize: 10, fontWeight: '300', letterSpacing: 0.5, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' },
  modalHeader: {
    padding: 16,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    color: '#fff',
    fontSize: 16,
  }
});
