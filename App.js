import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Button } from 'react-native';

export default function App() {
  const [tab, setTab] = useState('home');
  const [user] = useState({ name: 'Aditya', username: 'adi72' });

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
        {tab === 'home' && <Home />}
        {tab === 'search' && <Search />}
        {tab === 'create' && <CreatePost onDone={() => setTab('home')} />}
        {tab === 'reels' && <Reels />}
        {tab === 'profile' && <Profile user={user} />}
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

// 🔽 Screens (same file me)

function Home() {
  return (
    <View style={s.screen}>
      <Text style={s.text}>Home Screen</Text>
    </View>
  );
}

function Search() {
  return (
    <View style={s.screen}>
      <Text style={s.text}>Search Screen</Text>
    </View>
  );
}

function Reels() {
  return (
    <View style={s.screen}>
      <Text style={s.text}>Reels Screen</Text>
    </View>
  );
}

function Profile({ user }) {
  return (
    <View style={s.screen}>
      <Text style={s.text}>Profile</Text>
      <Text style={s.text}>{user.name}</Text>
      <Text style={s.text}>@{user.username}</Text>
    </View>
  );
}

function CreatePost({ onDone }) {
  return (
    <View style={s.screen}>
      <Text style={s.text}>Create Post</Text>
      <Button title="Done" onPress={onDone} />
    </View>
  );
}

// 🔽 Styles
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1 },

  screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 18 },

  nav: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a'
  },
  navBtn: { flex: 1, alignItems: 'center', padding: 10 },

  navIcon: { fontSize: 22 },
  navActive: { fontSize: 24 },

  navLbl: { color: '#555', fontSize: 10 },
  navLblActive: { color: '#ff3b5c', fontSize: 10, fontWeight: '700' },
});
