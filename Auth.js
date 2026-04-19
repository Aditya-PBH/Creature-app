import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, ScrollView, Dimensions
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

var W = Dimensions.get('window').width;
var BG = '#0A0A0A';
var CARD = '#141414';
var ACCENT = '#FF385C';
var TEXT = '#FFFFFF';
var SUBTEXT = 'rgba(255,255,255,0.45)';
var BORDER = 'rgba(255,255,255,0.1)';
var INPUT_BG = 'rgba(255,255,255,0.06)';

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
  var [focused, setFocused] = useState('');

  function reset() { setName(''); setUsername(''); setEmail(''); setPassword(''); }

  function handleSignup() {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('', 'Please fill all fields'); return;
    }
    if (password.length < 6) { Alert.alert('', 'Password must be 6+ characters'); return; }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(function(cred) {
        return updateProfile(cred.user, { displayName: name.trim() }).then(function() {
          return saveUser(cred.user.uid, { name: name.trim(), username: username.trim().toLowerCase(), email: email.trim() });
        });
      })
      .catch(function(e) {
        var msg = e.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Something went wrong';
        Alert.alert('Error', msg);
      })
      .finally(function() { setLoading(false); });
  }

  function handleLogin() {
    if (!email.trim() || !password.trim()) { Alert.alert('', 'Enter email and password'); return; }
    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .catch(function(e) {
        var msgs = {
          'auth/user-not-found': 'No account found',
          'auth/wrong-password': 'Wrong password',
          'auth/invalid-email': 'Invalid email',
          'auth/invalid-credential': 'Invalid credentials'
        };
        Alert.alert('Error', msgs[e.code] || 'Login failed');
      })
      .finally(function() { setLoading(false); });
  }

  function InputField(iprops) {
    var isFocused = focused === iprops.name;
    return (
      <View style={[ia.wrap, isFocused && ia.wrapFocused]}>
        <Text style={ia.icon}>{iprops.icon}</Text>
        <TextInput
          style={ia.input}
          placeholder={iprops.placeholder}
          placeholderTextColor={SUBTEXT}
          value={iprops.value}
          onChangeText={iprops.onChange}
          secureTextEntry={iprops.secure && !showPass}
          keyboardType={iprops.keyboard || 'default'}
          autoCapitalize={iprops.caps || 'none'}
          onFocus={function() { setFocused(iprops.name); }}
          onBlur={function() { setFocused(''); }}
        />
        {iprops.secure ? (
          <TouchableOpacity onPress={function() { setShowPass(!showPass); }} style={ia.eyeBtn}>
            <Text style={ia.eyeIco}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Background Glow Effects */}
          <View style={s.glow1} />
          <View style={s.glow2} />

          {/* Logo Section */}
          <View style={s.logoSection}>
            <View style={s.logoMark}>
              <Text style={s.logoC}>C</Text>
            </View>
            <Text style={s.logoText}>creature</Text>
            <Text style={s.logoSub}>Share moments that matter</Text>
          </View>

          {/* Tab Switcher */}
          <View style={s.tabsWrap}>
            <TouchableOpacity
              style={[s.tab, mode === 'login' && s.tabActive]}
              onPress={function() { setMode('login'); reset(); }}>
              <Text style={[s.tabTxt, mode === 'login' && s.tabTxtActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, mode === 'signup' && s.tabActive]}
              onPress={function() { setMode('signup'); reset(); }}>
              <Text style={[s.tabTxt, mode === 'signup' && s.tabTxtActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={s.form}>
            {mode === 'signup' ? (
              <View>
                <InputField name="name" icon="👤" placeholder="Full name" value={name} onChange={setName} caps="words" />
                <View style={{ height: 12 }} />
                <InputField name="username" icon="@" placeholder="Username" value={username} onChange={setUsername} />
                <View style={{ height: 12 }} />
              </View>
            ) : null}

            <InputField name="email" icon="✉" placeholder="Email address" value={email} onChange={setEmail} keyboard="email-address" />
            <View style={{ height: 12 }} />
            <InputField name="pass" icon="🔒" placeholder="Password" value={password} onChange={setPassword} secure={true} />

            <TouchableOpacity
              style={[s.mainBtn, loading && s.mainBtnLoading]}
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.mainBtnTxt}>{mode === 'login' ? 'Continue' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.switchWrap}
              onPress={function() { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}>
              <Text style={s.switchTxt}>
                {mode === 'login' ? "New to Creature? " : "Already have account? "}
                <Text style={s.switchLink}>{mode === 'login' ? 'Join now' : 'Sign in'}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>By continuing, you agree to our Terms & Privacy Policy</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

var ia = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT_BG, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, height: 56
  },
  wrapFocused: { borderColor: ACCENT, backgroundColor: 'rgba(255,56,92,0.06)' },
  icon: { fontSize: 16, marginRight: 12, opacity: 0.6 },
  input: { flex: 1, color: TEXT, fontSize: 15, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  eyeIco: { fontSize: 16 }
});

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 30 },
  glow1: { position: 'absolute', top: -120, left: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,56,92,0.08)' },
  glow2: { position: 'absolute', top: 100, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(124,58,237,0.06)' },
  logoSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  logoMark: {
    width: 80, height: 80, borderRadius: 26,
    backgroundColor: ACCENT,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 16
  },
  logoC: { color: '#fff', fontSize: 44, fontWeight: '900', fontStyle: 'italic' },
  logoText: { color: TEXT, fontSize: 34, fontWeight: '900', letterSpacing: -1.5, fontStyle: 'italic' },
  logoSub: { color: SUBTEXT, fontSize: 14, marginTop: 8, letterSpacing: 0.3 },
  tabsWrap: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 4, marginBottom: 28,
    borderWidth: 1, borderColor: BORDER
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 13 },
  tabActive: { backgroundColor: ACCENT, shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  tabTxt: { color: SUBTEXT, fontWeight: '700', fontSize: 15 },
  tabTxtActive: { color: '#fff', fontWeight: '800' },
  form: {},
  mainBtn: {
    backgroundColor: ACCENT, borderRadius: 16,
    height: 56, justifyContent: 'center', alignItems: 'center',
    marginTop: 20,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10
  },
  mainBtnLoading: { opacity: 0.7 },
  mainBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
  switchWrap: { alignItems: 'center', marginTop: 20 },
  switchTxt: { color: SUBTEXT, fontSize: 14 },
  switchLink: { color: ACCENT, fontWeight: '800' },
  footer: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', marginTop: 30, lineHeight: 16 }
});
      
