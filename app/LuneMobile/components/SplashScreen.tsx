import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Text, Image, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { LuneBackground } from './LuneBackground';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  
  // Dots animation
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo Float Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse Dots Animation
    const pulseDot = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    pulseDot(dot1Anim, 0).start();
    pulseDot(dot2Anim, 150).start();
    pulseDot(dot3Anim, 300).start();

    // Fade out after 2 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinished();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    transform: [{
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      }),
    }],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LuneBackground>
        <View style={styles.center}>
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoFloatAnim }] }]}>
            <Image 
              source={require('../assets/images/splash-icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>LUNE</Text>
          </Animated.View>

          <View style={styles.loader}>
            <Animated.View style={[styles.dot, dotStyle(dot1Anim)]} />
            <Animated.View style={[styles.dot, dotStyle(dot2Anim)]} />
            <Animated.View style={[styles.dot, dotStyle(dot3Anim)]} />
          </View>
        </View>
      </LuneBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 12, // 0.6em of 20px
    color: '#ffffff',
    textTransform: 'uppercase',
    paddingLeft: 12, // Offset letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  loader: {
    marginTop: 36,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
});
