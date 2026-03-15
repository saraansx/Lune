import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export const LuneBackground = ({ children }: { children?: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {/* Primary Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bgPrimary }]} />

      {/* Mesh Gradients (Matching Desktop radial-gradient) */}
      <LinearGradient
        colors={[Colors.mesh1, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 0.4 }}
        style={styles.meshTopLeft}
      />
      
      <LinearGradient
        colors={[Colors.mesh2, 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.6, y: 0.4 }}
        style={styles.meshTopRight}
      />

      <LinearGradient
        colors={[Colors.mesh3, 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.meshBottom}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  meshTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: height * 0.4,
    opacity: 0.6,
  },
  meshTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.8,
    height: height * 0.4,
    opacity: 0.6,
  },
  meshBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    opacity: 0.5,
  },
});
