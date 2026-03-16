import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import CookieManager from '@react-native-cookies/cookies';

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('spotify_access_token').then((storedToken) => {
        setToken(storedToken);
    });
  }, []);

  const handleLogout = async () => {
      await SecureStore.deleteItemAsync('sp_dc');
      await SecureStore.deleteItemAsync('spotify_access_token');
      await SecureStore.deleteItemAsync('spotify_token_expiration');
      await CookieManager.clearAll();
      router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Home Page</Text>
        <Text style={styles.subtitle}>You have successfully logged in!</Text>
        <Text style={styles.tokenText}>Token: {token ? token.substring(0, 20) + '...' : 'Loading...'}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Basic dark theme bg
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 20,
  },
  tokenText: {
    color: '#0ea5e9',
    fontSize: 12,
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutBtn: {
      padding: 12,
      backgroundColor: '#333',
      borderRadius: 8,
  },
  logoutText: {
      color: '#fff',
      fontSize: 16,
  }
});
