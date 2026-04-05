import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, SafeAreaView,
  StatusBar, ScrollView
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function AuthScreen() {
  var [mode, setMode] = useState('login');
  var [name, setName] = useState('');
  var [username, setUsername] = useState('');
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [showPass, setShowPass] = useState(false);

  function reset() {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
  }

  function saveUser(uid, data) {
    return getDoc(doc(db, 'users', uid)).then(function(snap) {
      if (!snap.exists()) {
        return setDoc(doc(db, 'users', uid), {
          uid: uid,
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          avatar: '',
          bio: '',
          followers: 0,
          following: 0,
          posts: 0,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  function handleSignup() {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Saare fields bhar do!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password 6+ characters chahiye!');
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(function(cred) {
        return updateProfile(cred.user, { displayName: name.trim() })
          .then(function() {
            return saveUser(cred.user.uid, {
              name: name.trim(),
              username: username.trim().toLowerCase(),
              email: email.trim().toLowerCase()
            });
          });
      })
      .catch(function(e) {
        var msg = 'Error aa gaya!';
        if (e.code === 'auth/email-already-in-use') msg = 'Email already use ho rahi hai!';
        if (e.code === 'auth/invalid-email') msg = 'Email sahi nahi!';
        if (e.code === 'auth/weak-password') msg = 'Password zyada strong chahiye!';
        Alert.alert('Error', msg);
      })
      .finally(function() { setLoading(false); });
  }

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email aur password daalo!');
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .catch(function(e) {
        var msg = 'Login fail!';
        if (e.code === 'auth/user-not-found') msg = 'Account nahi mila!';
        if (e.code === 'auth/wrong-password') msg = 'Password galat hai!';
        if (e.code === 'auth/invalid-email') msg = 'Email sahi nahi!';
        Alert.alert('Error', msg);
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.glow1} />
          <View style={st.glow2} />

          <View style={st.logoWrap}>
            <View style={st.logoBox}>
              <Text style={st.logoTxt}>C</Text>
            </View>
            <Text style={st.appName}>Creature</Text>
            <Text style={st.tagline}>Share your world</Text>
          </View>

          <View style={st.card}>
            <View style={st.tabs}>
              <TouchableOpacity
                style={mode === 'login' ? st.tabActive : st.tab}
                onPress={function() { setMode('login'); reset(); }}
              >
                <Text style={mode === 'login' ? st.tabTxtActive : st.tabTxt}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={mode === 'signup' ? st.tabActive : st.tab}
                onPress={function() { setMode('signup'); reset(); }}
              >
                <Text style={mode === 'signup' ? st.tabTxtActive : st.tabTxt}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {mode === 'signup' ? (
              <View>
                <View style={st.inputRow}>
                  <Text style={st.inputIcon}>👤</Text>
                  <TextInput
                    style={st.input}
                    placeholder="Full name"
                    placeholderTextColor="#444"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[st.inputRow, { marginTop: 10 }]}>
                  <Text style={st.inputIcon}>@</Text>
                  <TextInput
                    style={st.input}
                    placeholder="Username"
                    placeholderTextColor="#444"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : null}

            <View style={[st.inputRow, { marginTop: 10 }]}>
              <Text style={st.inputIcon}>✉</Text>
              <TextInput
                style={st.input}
                placeholder="Email"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[st.inputRow, { marginTop: 10 }]}>
              <Text style={st.inputIcon}>🔒</Text>
              <TextInput
                style={[st.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={function() { setShowPass(!showPass); }}>
                <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={loading ? st.btnOff : st.btn}
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={st.btnTxt}>
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={st.switchBtn}
              onPress={function() { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
            >
              <Text style={st.switchTxt}>
                {mode === 'login' ? "Don't have account? " : "Already have account? "}
                <Text style={st.switchLink}>
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

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  glow1: { position: 'absolute', top: -80, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(139,92,246,0.12)' },
  glow2: { position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(236,72,153,0.10)' },
  logoWrap: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logoBox: { width: 68, height: 68, borderRadius: 18, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoTxt: { color: '#fff', fontSize: 38, fontWeight: '900' },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800' },
  tagline: { color: '#666', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#13131A', borderRadius: 22, borderWidth: 1, borderColor: '#1E1E2E', padding: 20 },
  tabs: { flexDirection: 'row', backgroundColor: '#0A0A0F', borderRadius: 12, padding: 3, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabActive: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10, backgroundColor: '#8B5CF6' },
  tabTxt: { color: '#555', fontWeight: '600', fontSize: 14 },
  tabTxtActive: { color: '#fff', fontWeight: '600', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0F', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E2E', paddingHorizontal: 12 },
  inputIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 13 },
  btn: { backgroundColor: '#8B5CF6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  btnOff: { backgroundColor: '#3a2a6a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  switchBtn: { alignItems: 'center', marginTop: 14 },
  switchTxt: { color: '#666', fontSize: 13 },
  switchLink: { color: '#8B5CF6', fontWeight: '700' }
});
  
