// 🐾 App.js — Main Entry Point
// Auth check karo → Login dikhao ya App
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AuthScreen from './Auth';
import Navigation from './Navigation';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={s.loading}>
        <Text style={s.logo}>🐾</Text>
        <ActivityIndicator color="#ff3b5c" size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Not logged in → Auth Screen
  if (!user) return <AuthScreen />;

  // Logged in → Main App with Navigation
  return <Navigation user={user} />;
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 80 },
});
