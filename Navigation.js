import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomeScreen from './Home';
import ExploreScreen from './Explore';
import ReelsScreen from './Reels';
import ProfileScreen from './Profile';
import CreatePostScreen from './CreatePost';
import ChatScreen from './Chat';
import NotificationsScreen from './Notifications';
import EditProfileScreen from './EditProfile';

var BG = '#000000';
var SURFACE = '#111111';
var BORDER = '#2A2A2A';
var TEXT = '#FFFFFF';
var INACTIVE = 'rgba(255,255,255,0.35)';
var ACCENT = '#FF385C';
var PRIMARY = '#0095F6';

export default function Navigation(props) {
  var user = props.user;
  var [tab, setTab] = useState('home');
  var [subScreen, setSubScreen] = useState(null);

  function goHome() { setTab('home'); setSubScreen(null); }
  function logout() { signOut(auth); }
  function openEditProfile() { setSubScreen('editProfile'); }
  function closeSubScreen() { setSubScreen(null); }

  // Sub screens (modal-like)
  if (subScreen === 'editProfile') {
    return (
      <EditProfileScreen
        onBack={closeSubScreen}
        username={props.username}
        bio={props.bio}
      />
    );
  }

  if (subScreen === 'notifications') {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <NotificationsScreen />
        <TouchableOpacity style={s.backFab} onPress={closeSubScreen}>
          <Text style={s.backFabTxt}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={s.content}>
        {tab === 'home' ? <HomeScreen user={user} onNotifications={function() { setSubScreen('notifications'); }} /> : null}
        {tab === 'explore' ? <ExploreScreen /> : null}
        {tab === 'create' ? <CreatePostScreen user={user} onDone={goHome} /> : null}
        {tab === 'reels' ? <ReelsScreen /> : null}
        {tab === 'chat' ? <ChatScreen /> : null}
        {tab === 'profile' ? <ProfileScreen user={user} onLogout={logout} onEditProfile={openEditProfile} /> : null}
      </View>

      <View style={s.nav}>
        <View style={s.navInner}>
          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('home'); }}>
            <View style={[s.navIconWrap, tab === 'home' && s.navIconWrapActive]}>
              <Text style={[s.navIco, tab === 'home' && s.navIcoActive]}>🏠</Text>
            </View>
            <Text style={[s.navLbl, tab === 'home' && s.navLblActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('explore'); }}>
            <View style={[s.navIconWrap, tab === 'explore' && s.navIconWrapActive]}>
              <Text style={[s.navIco, tab === 'explore' && s.navIcoActive]}>🔍</Text>
            </View>
            <Text style={[s.navLbl, tab === 'explore' && s.navLblActive]}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('create'); }}>
            <View style={s.createBtn}>
              <Text style={s.createIco}>+</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('reels'); }}>
            <View style={[s.navIconWrap, tab === 'reels' && s.navIconWrapActive]}>
              <Text style={[s.navIco, tab === 'reels' && s.navIcoActive]}>🎬</Text>
            </View>
            <Text style={[s.navLbl, tab === 'reels' && s.navLblActive]}>Reels</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('chat'); }}>
            <View style={[s.navIconWrap, tab === 'chat' && s.navIconWrapActive]}>
              <Text style={[s.navIco, tab === 'chat' && s.navIcoActive]}>✉️</Text>
            </View>
            <Text style={[s.navLbl, tab === 'chat' && s.navLblActive]}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.navBtn} onPress={function() { setTab('profile'); }}>
            <View style={[s.navIconWrap, tab === 'profile' && s.navIconWrapActive]}>
              <Text style={[s.navIco, tab === 'profile' && s.navIcoActive]}>👤</Text>
            </View>
            <Text style={[s.navLbl, tab === 'profile' && s.navLblActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BG },
  content: { flex: 1 },
  nav: { backgroundColor: BG, borderTopWidth: 0.5, borderTopColor: BORDER, paddingBottom: 26, paddingTop: 0 },
  navInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 8 },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIconWrap: { width: 40, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  navIconWrapActive: { backgroundColor: 'rgba(255,56,92,0.12)' },
  navIco: { fontSize: 20, opacity: 0.35 },
  navIcoActive: { opacity: 1 },
  navLbl: { color: INACTIVE, fontSize: 9, fontWeight: '600', marginTop: 2 },
  navLblActive: { color: ACCENT, fontWeight: '800' },
  createBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center', marginTop: -8, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  createIco: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 },
  backFab: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  backFabTxt: { color: TEXT, fontSize: 14, fontWeight: '600' }
});
    
