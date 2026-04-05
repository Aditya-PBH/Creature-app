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

function saveUser(uid, data) {
  return getDoc(doc(db, 'users', uid)).then(function(snap) {
    if (!snap.exists()) {
      return setDoc(doc(db, 'users', uid), {
        uid: uid, name: data.name || '',
        username: data.username || '', email: data.email || '',
        avatar: '', bio: '', followers: 0, following: 0, posts: 0,
        createdAt: new Date().toISOString()
      });
    }
  });
}

export default function AuthScreen() {
  var [mode, setMode] = useState('login');
  var [name, setName] = useState('');
  var [username, setUsername] = useState('');
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [showPass, setShowPass] = useState(false);

  function reset() { setName(''); setUsername(''); setEmail(''); setPassword(''); }

  function handleSignup() {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Saare fields bhar do!'); return;
    }
    if (password.length < 6) { Alert.alert('Error', 'Password 6+ chars!'); return; }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(function(cred) {
        return updateProfile(cred.user, { displayName: name.trim() }).then(function() {
          return saveUser(cred.user.uid, { name: name.trim(), username: username.trim().toLowerCase(), email: email.trim() });
        });
      })
      .catch(function(e) {
        var msg = e.code === 'auth/email-already-in-use' ? 'Email already use ho rahi hai!' : 'Error aa gaya!';
        Alert.alert('Error', msg);
      })
      .finally(function() { setLoading(false); });
  }

  function handleLogin() {
    if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Email aur password daalo!'); return; }
    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .catch(function(e) {
        var msgs = { 'auth/user-not-found': 'Account nahi mila!', 'auth/wrong-password': 'Password galat!', 'auth/invalid-email': 'Email sahi nahi!' };
        Alert.alert('Error', msgs[e.code] || 'Login fail!');
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <Text style={s.logoTxt}>C</Text>
            </View>
            <Text style={s.appName}>Creature</Text>
            <Text style={s.tagline}>Share moments, watch reels, chat!</Text>
          </View>

          <View style={s.card}>
            <View style={s.tabs}>
              <TouchableOpacity style={mode === 'login' ? s.tabActive : s.tab} onPress={function() { setMode('login'); reset(); }}>
                <Text style={mode === 'login' ? s.tabTxtA : s.tabTxt}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mode === 'signup' ? s.tabActive : s.tab} onPress={function() { setMode('signup'); reset(); }}>
                <Text style={mode === 'signup' ? s.tabTxtA : s.tabTxt}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {mode === 'signup' ? (
              <View>
                <View style={s.inputRow}>
                  <Text style={s.inputIco}>👤</Text>
                  <TextInput style={s.input} placeholder="Full name" placeholderTextColor="#bbb" value={name} onChangeText={setName} autoCapitalize="words" />
                </View>
                <View style={[s.inputRow, { marginTop: 10 }]}>
                  <Text style={s.inputIco}>@</Text>
                  <TextInput style={s.input} placeholder="Username" placeholderTextColor="#bbb" value={username} onChangeText={setUsername} autoCapitalize="none" />
                </View>
              </View>
            ) : null}

            <View style={[s.inputRow, { marginTop: 10 }]}>
              <Text style={s.inputIco}>✉️</Text>
              <TextInput style={s.input} placeholder="Email" placeholderTextColor="#bbb" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={[s.inputRow, { marginTop: 10 }]}>
              <Text style={s.inputIco}>🔒</Text>
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Password" placeholderTextColor="#bbb" value={password} onChangeText={setPassword} secureTextEntry={!showPass} autoCapitalize="none" />
              <TouchableOpacity onPress={function() { setShowPass(!showPass); }}>
                <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={loading ? s.btnOff : s.btn} onPress={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.switchBtn} onPress={function() { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}>
              <Text style={s.switchTxt}>
                {mode === 'login' ? "Don't have account? " : "Already have account? "}
                <Text style={s.switchLink}>{mode === 'login' ? 'Sign Up' : 'Login'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F4FF' },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28, marginTop: 20 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  logoTxt: { color: '#fff', fontSize: 42, fontWeight: '900' },
  appName: { color: '#1A1A2E', fontSize: 30, fontWeight: '900' },
  tagline: { color: '#999', fontSize: 13, marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  tabs: { flexDirection: 'row', backgroundColor: '#F3EEFF', borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: '#8B5CF6' },
  tabTxt: { color: '#aaa', fontWeight: '600', fontSize: 14 },
  tabTxtA: { color: '#fff', fontWeight: '700', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F4FF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E8DEFF', paddingHorizontal: 14 },
  inputIco: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#1A1A2E', fontSize: 15, paddingVertical: 13 },
  btn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  btnOff: { backgroundColor: '#D4C4FF', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchTxt: { color: '#aaa', fontSize: 13 },
  switchLink: { color: '#8B5CF6', fontWeight: '700' }
});
    
