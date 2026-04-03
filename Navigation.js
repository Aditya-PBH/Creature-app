import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from '../Screens/Home';
import SearchScreen from '../Screens/Search';
import ReelsScreen from '../Screens/Reels';
import ProfileScreen from '../Screens/Profile';
import CreatePostScreen from '../Screens/CreatePost';

export default function Navigation() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState({ name: 'Aditya', username: 'adi72' });

  const TABS = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'search', icon: '🔍', label: 'Search' },
    { key: 'create', icon: '➕', label: 'Create' },
    { key: 'reels', icon: '🎬', label: 'Reels' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={s.content}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'create' && <CreatePostScreen onDone={() => setTab('home')} />}
        {tab === 'reels' && <ReelsScreen />}
        {tab === 'profile' && <ProfileScreen user={user} />}
      </View>
      <View style={s.nav}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={s.navBtn} onPress={() => setTab(t.key)}>
            <Text style={tab === t.key ? s.navActive : s.navIcon}>{t.icon}</Text>
            <Text style={tab === t.key ? s.navLblActive : s.navLbl}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingBottom: 6 },
  navBtn: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22 },
  navActive: { fontSize: 24 },
  navLbl: { color: '#555', fontSize: 10, marginTop: 2 },
  navLblActive: { color: '#ff3b5c', fontSize: 10, marginTop: 2, fontWeight: '700' },
});
