import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomeScreen from './Home';
import SearchScreen from './Search';
import ReelsScreen from './Reels';
import ProfileScreen from './Profile';
import CreatePostScreen from './CreatePost';
import ChatScreen from './Chat';

const PURPLE = '#8B5CF6';
const DARK = '#0A0A0F';
const BORDER = '#1E1E2E';

export default function Navigation(props) {
  const user = props.user;
  const [tab, setTab] = useState('home');

  function goHome() { setTab('home'); }
  function handleLogout() { signOut(auth); }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <View style={styles.content}>
        {tab === 'home'    && <HomeScreen user={user} />}
        {tab === 'search'  && <SearchScreen />}
        {tab === 'create'  && <CreatePostScreen user={user} onDone={goHome} />}
        {tab === 'reels'   && <ReelsScreen />}
        {tab === 'chat'    && <ChatScreen />}
        {tab === 'profile' && <ProfileScreen user={user} onLogout={handleLogout} />}
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('home')}>
          <Text style={[styles.navIcon, tab === 'home' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, tab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('search')}>
          <Text style={[styles.navIcon, tab === 'search' && styles.navIconActive]}>🔍</Text>
          <Text style={[styles.navLabel, tab === 'search' && styles.navLabelActive]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('create')}>
          <View style={styles.createBtn}>
            <Text style={styles.createIcon}>＋</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('reels')}>
          <Text style={[styles.navIcon, tab === 'reels' && styles.navIconActive]}>🎬</Text>
          <Text style={[styles.navLabel, tab === 'reels' && styles.navLabelActive]}>Reels</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('chat')}>
          <Text style={[styles.navIcon, tab === 'chat' && styles.navIconActive]}>💬</Text>
          <Text style={[styles.navLabel, tab === 'chat' && styles.navLabelActive]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('profile')}>
          <Text style={[styles.navIcon, tab === 'profile' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, tab === 'profile' && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  content: { flex: 1 },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#0D0D14',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingBottom: 24, paddingTop: 10, paddingHorizontal: 4,
    alignItems: 'center',
  },
  navBtn: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20, opacity: 0.4 },
  navIconActive: { opacity: 1 },
  navLabel: { color: '#555', fontSize: 9, fontWeight: '500' },
  navLabelActive: { color: PURPLE, fontWeight: '700' },
  createBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
    elevation: 8,
  },
  createIcon: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
});
