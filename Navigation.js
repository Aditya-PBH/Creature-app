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

export default function Navigation(props) {
  var user = props.user;
  var [tab, setTab] = useState('home');
  function goHome() { setTab('home'); }
  function logout() { signOut(auth); }

  return (
    <View style={s.wrap}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.content}>
        {tab === 'home' ? <HomeScreen user={user} /> : null}
        {tab === 'search' ? <SearchScreen /> : null}
        {tab === 'create' ? <CreatePostScreen user={user} onDone={goHome} /> : null}
        {tab === 'reels' ? <ReelsScreen /> : null}
        {tab === 'chat' ? <ChatScreen /> : null}
        {tab === 'profile' ? <ProfileScreen user={user} onLogout={logout} /> : null}
      </View>
      <View style={s.nav}>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('home'); }}>
          <Text style={tab === 'home' ? s.icoActive : s.ico}>🏠</Text>
          <Text style={tab === 'home' ? s.lblActive : s.lbl}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('search'); }}>
          <Text style={tab === 'search' ? s.icoActive : s.ico}>🔍</Text>
          <Text style={tab === 'search' ? s.lblActive : s.lbl}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('create'); }}>
          <View style={s.createBtn}>
            <Text style={s.createIco}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('reels'); }}>
          <Text style={tab === 'reels' ? s.icoActive : s.ico}>🎬</Text>
          <Text style={tab === 'reels' ? s.lblActive : s.lbl}>Reels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('chat'); }}>
          <Text style={tab === 'chat' ? s.icoActive : s.ico}>💬</Text>
          <Text style={tab === 'chat' ? s.lblActive : s.lbl}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={function() { setTab('profile'); }}>
          <Text style={tab === 'profile' ? s.icoActive : s.ico}>👤</Text>
          <Text style={tab === 'profile' ? s.lblActive : s.lbl}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F8F4FF' },
  content: { flex: 1 },
  nav: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0EAFF',
    paddingBottom: 20, paddingTop: 8, paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10
  },
  navBtn: { flex: 1, alignItems: 'center', gap: 2 },
  ico: { fontSize: 22, opacity: 0.35 },
  icoActive: { fontSize: 22, opacity: 1 },
  lbl: { color: '#bbb', fontSize: 9, fontWeight: '500' },
  lblActive: { color: '#8B5CF6', fontSize: 9, fontWeight: '700' },
  createBtn: {
    width: 46, height: 46, borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
  },
  createIco: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '300' }
});
          
