// 🔐 Auth.js — Premium Login/Signup (Email + Google only, Facebook removed - expo-facebook deprecated)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, ScrollView, Dimensions
} from 'react-native';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, GoogleAuthProvider, signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db } from './firebase';

const PURPLE = '#8B5CF6';
const DARK = '#0A0A0F';
const CARD = '#13131A';
const BORDER = '#1E1E2E';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Firebase Console → Authentication → Google → Web client ID
});

const saveUser = async (uid, data) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid, name: data.name || '',
      username: data.username || data.email?.split('@')[0] || '',
      email: data.email || '', avatar: data.avatar || '',
      bio: '', followers: 0, following: 0, posts: 0,
      createdAt: new Date().toISOString(),
    });
  }
};

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const reset = () => { setName(''); setUsername(''); setEmail(''); setPassword(''); };

  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim())
      return Alert.alert('⚠️', 'Saare fields bhar do!');
    if (password.length < 6)
      return Alert.alert('⚠️', 'Password 6+ characters ka hona chahiye!');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await saveUser(cred.user.uid, { name: name.trim(), username: username.trim(), email: email.trim() });
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Ye email pehle se use ho rahi hai!',
        'auth/invalid-email': 'Email sahi nahi hai!',
        'auth/weak-password': 'Password zyada strong chahiye!',
      };
      Alert.alert('❌', msgs[e.code] || 'Error aa gaya!');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('⚠️', 'Email aur password daalo!');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      const msgs = {
        'auth/user-not-found': 'Account nahi mila!',
        'auth/wrong-password': 'Password galat hai!',
        'auth/invalid-email': 'Email sahi nahi!',
        'auth/too-many-requests': 'Bahut zyada tries! Baad mein try karo.',
      };
      Alert.alert('❌', msgs[e.code] || 'Login fail!');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);
      await saveUser(cred.user.uid, {
        name: cred.user.displayName,
        email: cred.user.email,
        avatar: cred.user.photoURL,
      });
    } catch (e) {
      Alert.alert('❌', 'Google login fail ho gaya!');
    }
    setGLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.glowTop} />
          <View style={s.glowBottom} />

          {/* LOGO */}
          <View style={s.logoSection}>
            <View style={s.logoCircle}>
              <Text style={s.logoC}>C</Text>
            </View>
            <Text style={s.appName}>Creature</Text>
            <Text style={s.tagline}>Share your world ✨</Text>
          </View>

          {/* CARD */}
          <View style={s.card}>
            <View style={s.tabs}>
              <TouchableOpacity style={[s.tab, mode === 'login' && s.tabActive]}
                onPress={() => { setMode('login'); reset(); }}>
                <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.tab, mode === 'signup' && s.tabActive]}
                onPress={() => { setMode('signup'); reset(); }}>
                <Text style={[s.tabText, mode === 'signup' && s.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={s.form}>
              {mode === 'signup' && (
                <>
                  <View style={s.inputWrap}>
                    <Text style={s.inputIcon}>👤</Text>
                    <TextInput style={s.input} placeholder="Full name" placeholderTextColor="#444"
                      value={name} onChangeText={setName} autoCapitalize="words" />
                  </View>
                  <View style={s.inputWrap}>
                    <Text style={s.inputIcon}>@</Text>
                    <TextInput style={s.input} placeholder="Username" placeholderTextColor="#444"
                      value={username} onChangeText={setUsername} autoCapitalize="none" />
                  </View>
                </>
              )}

              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>✉</Text>
                <TextInput style={s.input} placeholder="Email" placeholderTextColor="#444"
                  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>🔒</Text>
                <TextInput style={[s.input, { flex: 1 }]} placeholder="Password" placeholderTextColor="#444"
                  value={password} onChangeText={setPassword} secureTextEntry={!showPass} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                  <Text>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[s.mainBtn, loading && s.btnDisabled]}
                onPress={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={s.mainBtnText}>{mode === 'login' ? 'Login →' : 'Create Account →'}</Text>}
              </TouchableOpacity>

              <View style={s.divider}>
                <View style={s.divLine} />
                <Text style={s.divText}>or continue with</Text>
                <View style={s.divLine} />
              </View>

              {/* GOOGLE ONLY */}
              <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} disabled={gLoading}>
                {gLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <Text style={s.googleBtnText}>🔵  Continue with Google</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
                style={s.switchWrap}>
                <Text style={s.switchText}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <Text style={s.switchLink}>{mode === 'login' ? 'Sign Up' : 'Login'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 },
  glowTop: { position: 'absolute', top: -100, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#8B5CF620' },
  glowBottom: { position: 'absolute', bottom: -60, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: '#EC489920' },
  logoSection: { alignItems: 'center', marginBottom: 36, marginTop: 20 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: PURPLE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  logoC: { color: '#fff', fontSize: 40, fontWeight: '900' },
  appName: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 1 },
  tagline: { color: '#666', fontSize: 14, marginTop: 6 },
  card: { backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: BORDER, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 40, elevation: 20 },
  tabs: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: PURPLE },
  tabText: { color: '#555', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: '#fff' },
  form: { gap: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, gap: 10 },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  mainBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', backgroundColor: PURPLE, marginTop: 4, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { color: '#555', fontSize: 12 },
  googleBtn: { backgroundColor: DARK, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  googleBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  switchWrap: { alignItems: 'center', marginTop: 4 },
  switchText: { color: '#666', fontSize: 14 },
  switchLink: { color: PURPLE, fontWeight: '700' },
});
