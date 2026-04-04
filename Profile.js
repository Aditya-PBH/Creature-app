// 👤 Profile.js — Premium Profile Screen
import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Dimensions, ScrollView
} from 'react-native';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';

const { width } = Dimensions.get('window');
const GRID = (width - 4) / 3;
const PURPLE = '#8B5CF6';
const PINK = '#EC4899';
const DARK = '#0A0A0F';
const CARD = '#13131A';
const BORDER = '#1E1E2E';

export default function ProfileScreen({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    const q = query(collection(db, 'posts'), where('uid', '==', uid));
    const unsub = onSnapshot(q, snap => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(sorted);
    });
    return unsub;
  }, [uid]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Pakka logout karna hai?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={PURPLE} size="large" /></View>
  );

  const user = userData || {};

  return (
    <View style={s.safe}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerName}>{user.username || auth.currentUser?.displayName || 'User'}</Text>
        <TouchableOpacity onPress={handleLogout} style={s.settingsBtn}>
          <Text style={s.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE TOP */}
        <View style={s.profileTop}>
          {/* Avatar with gradient ring */}
          <View style={s.avatarRing}>
            <Image
              source={{ uri: user.avatar || auth.currentUser?.photoURL || `https://i.pravatar.cc/150?u=${uid}` }}
              style={s.avatar}
            />
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Followers', value: user.followers || 0 },
              { label: 'Following', value: user.following || 0 },
            ].map(stat => (
              <View key={stat.label} style={s.statItem}>
                <Text style={s.statNum}>{stat.value.toLocaleString()}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* BIO */}
        <View style={s.bioSection}>
          <Text style={s.bioName}>{user.name || auth.currentUser?.displayName || 'Creature User'}</Text>
          {user.bio ? <Text style={s.bioText}>{user.bio}</Text> : null}
        </View>

        {/* EDIT PROFILE */}
        <View style={s.btnRow}>
          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shareBtn}>
            <Text style={s.shareBtnText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* POSTS GRID */}
        <View style={s.gridSection}>
          {posts.length === 0 ? (
            <View style={s.noPostsWrap}>
              <View style={s.noPostsIcon}>
                <Text style={s.noPostsIconText}>📷</Text>
              </View>
              <Text style={s.noPostsTitle}>No Posts Yet</Text>
              <Text style={s.noPostsSub}>Share your first moment!</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={i => i.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={[s.gridItem, index % 3 !== 2 && { marginRight: 2 }]}>
                  <Image source={{ uri: item.imageUrl }} style={s.gridImg} />
                  {item.likes?.length > 0 && (
                    <View style={s.gridOverlay}>
                      <Text style={s.gridLikes}>❤️ {item.likes.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, backgroundColor: DARK, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },

  profileTop: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 20, gap: 24,
  },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    padding: 3, backgroundColor: PURPLE,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 42, borderWidth: 2, borderColor: DARK },

  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 2 },

  bioSection: { paddingHorizontal: 16, paddingBottom: 16 },
  bioName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bioText: { color: '#aaa', fontSize: 14, marginTop: 4, lineHeight: 20 },

  btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  editBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    paddingVertical: 9, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  shareBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    paddingVertical: 9, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  shareBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  gridSection: { borderTopWidth: 1, borderTopColor: BORDER },
  gridItem: { width: GRID, height: GRID, marginBottom: 2 },
  gridImg: { width: '100%', height: '100%', backgroundColor: CARD },
  gridOverlay: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  gridLikes: { color: '#fff', fontSize: 11, fontWeight: '600' },

  noPostsWrap: { alignItems: 'center', paddingVertical: 60 },
  noPostsIcon: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: CARD,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, marginBottom: 16,
  },
  noPostsIconText: { fontSize: 32 },
  noPostsTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  noPostsSub: { color: '#666', fontSize: 14, marginTop: 6 },
});
    
