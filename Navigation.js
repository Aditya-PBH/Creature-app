// 🧭 Navigation.js — Premium Bottom Tab Bar
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomeScreen from './Home';
import SearchScreen from './Search';
import ReelsScreen from './Reels';
import ProfileScreen from './Profile';
import CreatePostScreen from './CreatePost';

const PURPLE = '#8B5CF6';
const DARK = '#0A0A0F';
const BORDER = '#1E1E2E';

export default function Navigation({ user }) {
  const [tab, setTab] = useState('home');

  const TABS = [
    { key: 'home',    icon: '⊞',  iconActive: '⊟',  label: 'Home' },
    { key: 'search',  icon: '○',   iconActive: '◉',   label: 'Search' },
    { key: 'create',  icon: '＋',  iconActive: '＋',  label: 'Create' },
    { key: 'reels',   icon: '▷',   iconActive: '▶',   label: 'Reels' },
    { key: 'profile', icon: '◯',   iconActive: '●',   label: 'Profile' },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <View style={s.content}>
        {tab === 'home'    && <HomeScreen user={user} />}
        {tab === 'search'  && <SearchScreen />}
        {tab === 'create'  && <CreatePostScreen user={user} onDone={() => setTab('home')} />}
        {tab === 'reels'   && <ReelsScreen />}
        {tab === 'profile' && <ProfileScreen user={user} onLogout={() => signOut(auth)} />}
      </View>

      {/* BOTTOM NAV */}
      <View style={s.nav}>
        {TABS.map(t => {
          const isActive = tab === t.key;
          const isCreate = t.key === 'create';
          return (
            <TouchableOpacity
              key={t.key}
              style={[s.navBtn, isCreate && s.createBtn]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.7}>
              {isCreate ? (
                <View style={s.createInner}>
                  <Text style={s.createIcon}>＋</Text>
                </View>
              ) : (
                <>
                  <View style={[s.iconWrap, isActive && s.iconWrapActive]}>
                    <Text style={[s.navEmoji, isActive && s.navEmojiActive]}>
                      {t.key === 'home'    ? (isActive ? '🏠' : '🏡') :
                       t.key === 'search'  ? (isActive ? '🔍' : '🔎') :
                       t.key === 'reels'   ? (isActive ? '🎬' : '📽️') :
                       t.key === 'profile' ? (isActive ? '👤' : '🧑') : ''}
                    </Text>
                  </View>
                  <Text style={[s.navLabel, isActive && s.navLabelActive]}>
                    {t.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  content: { flex: 1 },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#0D0D14',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingBottom: 20, paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  navBtn: { flex: 1, alignItems: 'center', gap: 3 },
  createBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  createInner: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
    marginBottom: 2,
  },
  createIcon: { color: '#fff', fontSize: 24, fontWeight: '300' },
  iconWrap: { width: 36, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  iconWrapActive: { backgroundColor: '#8B5CF615' },
  navEmoji: { fontSize: 20, opacity: 0.5 },
  navEmojiActive: { opacity: 1 },
  navLabel: { color: '#555', fontSize: 10, fontWeight: '500' },
  navLabelActive: { color: PURPLE, fontWeight: '700' },
});
    
