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
    <View style={st.wrap}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <View style={st.content}>
        {tab === 'home' ? <HomeScreen user={user} /> : null}
        {tab === 'search' ? <SearchScreen /> : null}
        {tab === 'create' ? <CreatePostScreen user={user} onDone={goHome} /> : null}
        {tab === 'reels' ? <ReelsScreen /> : null}
        {tab === 'chat' ? <ChatScreen /> : null}
        {tab === 'profile' ? <ProfileScreen user={user} onLogout={logout} /> : null}
      </View>
      <View style={st.nav}>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('home'); }}>
          <Text style={tab === 'home' ? st.iconActive : st.icon}>🏠</Text>
          <Text style={tab === 'home' ? st.lblActive : st.lbl}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('search'); }}>
          <Text style={tab === 'search' ? st.iconActive : st.icon}>🔍</Text>
          <Text style={tab === 'search' ? st.lblActive : st.lbl}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('create'); }}>
          <View style={st.createBtn}>
            <Text style={st.createTxt}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('reels'); }}>
          <Text style={tab === 'reels' ? st.iconActive : st.icon}>🎬</Text>
          <Text style={tab === 'reels' ? st.lblActive : st.lbl}>Reels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('chat'); }}>
          <Text style={tab === 'chat' ? st.iconActive : st.icon}>💬</Text>
          <Text style={tab === 'chat' ? st.lblActive : st.lbl}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.navBtn} onPress={function() { setTab('profile'); }}>
          <Text style={tab === 'profile' ? st.iconActive : st.icon}>👤</Text>
          <Text style={tab === 'profile' ? st.lblActive : st.lbl}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

var st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: '#0D0D14', borderTopWidth: 1, borderTopColor: '#1E1E2E', paddingBottom: 22, paddingTop: 8, paddingHorizontal: 4, alignItems: 'center' },
  navBtn: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 20, opacity: 0.4 },
  iconActive: { fontSize: 20, opacity: 1 },
  lbl: { color: '#555', fontSize: 9, marginTop: 3 },
  lblActive: { color: '#8B5CF6', fontSize: 9, marginTop: 3, fontWeight: '700' },
  createBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  createTxt: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' }
});
          
