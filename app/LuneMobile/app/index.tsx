import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../constants/Colors';
import { LuneBackground } from '../components/LuneBackground';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
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
    </LuneBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loginCenter: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  moonIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonImg: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 14, // 0.5em
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingLeft: 14,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.76, // 0.16em
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  brandDescription: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.15)',
    textAlign: 'center',
    lineHeight: 15,
    maxWidth: 240,
    marginTop: 6,
  },
  lineSep: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Exact from desktop desktop Login.css .line-sep
    marginVertical: 32,
  },
  glassWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    width: 260,
  },
  blurContainer: {
    width: '100%',
    backgroundColor: 'rgba(16, 20, 26, 0.6)', // Exact desktop glass-bg
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 22,
    width: '100%',
  },
  btnText: {
    color: '#94a3b8', // Exact desktop --text-dim
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.39, // 0.03em
    marginLeft: 10,
  },
  spotifyIcon: {
    width: 16,
    height: 16,
  },
  loginFooter: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  }
});
