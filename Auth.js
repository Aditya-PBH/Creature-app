import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, ScrollView
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const PURPLE = '#8B5CF6';
const DARK = '#0A0A0F';
const CARD = '#13131A';
const BORDER = '#1E1E2E';

async function saveUser(uid, data) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: uid,
      name: data.name || '',
      username: data.username || '',
      email: data.email || '',
      avatar: data.avatar || '',
      bio: '',
      followers: 0,
      following: 0,
      posts: 0,
      createdAt: new Date().toISOString(),
    });
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function reset() {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
  }

  async function handleSignup() {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Saare fields bhar do!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password 6+ characters ka hona chahiye!');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await saveUser(cred.user.uid, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase()
      });
    } catch (e) {
      let msg = 'Error aa gaya!';
      if (e.code === 'auth/email-already-in-use') msg = 'Ye email pehle se use ho rahi hai!';
      if (e.code === 'auth/invalid-email') msg = 'Email sahi nahi hai!';
      if (e.code === 'auth/weak-password') msg = 'Password zyada strong chahiye!';
      Alert.alert('Error', msg);
    }
    setLoading(false);
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email aur password daalo!');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      let msg = 'Login fail!';
      if (e.code === 'auth/user-not-found') msg = 'Account nahi mila!';
      if (e.code === 'auth/wrong-password') msg = 'Password galat hai!';
      if (e.code === 'auth/invalid-email') msg = 'Email sahi nahi!';
      if (e.code === 'auth/too-many-requests') msg = 'Bahut zyada tries! Baad mein try karo.';
      Alert.alert('Error', msg);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoC}>C</Text>
            </View>
            <Text style={styles.appName}>Creature</Text>
            <Text style={styles.tagline}>Share your world ✨</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => { setMode('login'); reset(); }}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => { setMode('signup'); reset(); }}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'signup' && (
              <View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="#444"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.inputWrap, { marginTop: 12 }]}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#444"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <View style={[styles.inputWrap, { marginTop: 12 }]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrap, { marginTop: 12 }]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, loading && styles.btnDisabled]}
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainBtnText}>
                  {mode === 'login' ? 'Login →' : 'Create Account →'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
              style={styles.switchWrap}
            >
              <Text style={styles.switchText}>
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.switchLink}>
                  {mode === 'login' ? 'Sign Up' : 'Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 },
  glowTop: { position: 'absolute', top: -100, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#8B5CF620' },
  glowBottom: { position: 'absolute', bottom: -60, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: '#EC489920' },
  logoSection: { alignItems: 'center', marginBottom: 36, marginTop: 20 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  logoC: { color: '#fff', fontSize: 40, fontWeight: '900' },
  appName: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 1 },
  tagline: { color: '#666', fontSize: 14, marginTop: 6 },
  card: { backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: BORDER, padding: 24 },
  tabs: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: PURPLE },
  tabText: { color: '#555', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: '#fff' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14 },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  mainBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', backgroundColor: PURPLE, marginTop: 16 },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchWrap: { alignItems: 'center', marginTop: 16 },
  switchText: { color: '#666', fontSize: 14 },
  switchLink: { color: PURPLE, fontWeight: '700' },
});

                  
