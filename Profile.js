import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, StyleSheet, Dimensions, Share } from 'react-native';

const W = Dimensions.get('window').width;

const GRID = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  uri: 'https://picsum.photos/seed/prof' + (i + 1) + '/300/300',
}));

export default function ProfileScreen({ user }) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <ScrollView style={s.bg} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.username}>{user ? user.username : 'adi72'}</Text>
        </View>
        <TouchableOpacity style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: '#fff' }}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ fontSize: 24, color: '#fff' }}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={s.profInfo}>
        <Image source={{ uri: 'https://i.pravatar.cc/100?img=10' }} style={s.profAv} />
        <View style={s.statsRow}>
          {[['9', 'Posts'], ['1.2K', 'Followers'], ['342', 'Following']].map(([val, lbl]) => (
            <View key={lbl} style={s.stat}>
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
        <Text style={s.displayName}>{user ? user.name : 'Aditya'}</Text>
        <Text style={s.bio}>🐾 Creature user{'\n'}India 🇮🇳 | Building cool stuff</Text>
      </View>

      <View style={s.btnRow}>
        <TouchableOpacity style={s.editBtn}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.shareBtn} onPress={() => Share.share({ message: 'Creature pe mera profile dekh! @' + (user ? user.username : 'adi72') })}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Share Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabRow}>
        <TouchableOpacity style={[s.tab, activeTab === 'posts' && s.tabActive]} onPress={() => setActiveTab('posts')}>
          <Text style={s.tabIcon}>⊞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'reels' && s.tabActive]} onPress={() => setActiveTab('reels')}>
          <Text style={s.tabIcon}>🎬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'tagged' && s.tabActive]} onPress={() => setActiveTab('tagged')}>
          <Text style={s.tabIcon}>🏷️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={GRID} keyExtractor={i => i.id}
        numColumns={3} scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <Image source={{ uri: item.uri }} style={{ width: W / 3 - 1, height: W / 3 - 1, margin: 0.5 }} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={s.logoutBtn}>
        <Text style={{ color: '#ff3b5c', fontWeight: '700' }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  username: { color: '#fff', fontSize: 20, fontWeight: '900' },
  profInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  profAv: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#ff3b5c' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { color: '#fff', fontWeight: '900', fontSize: 18 },
  statLbl: { color: '#888', fontSize: 12 },
  displayName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bio: { color: '#aaa', fontSize: 13, marginTop: 4, lineHeight: 18 },
  btnRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  editBtn: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 10, padding: 10, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#333' },
  shareBtn: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  tabRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginBottom: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#fff' },
  tabIcon: { fontSize: 20 },
  logoutBtn: { margin: 24, backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ff3b5c' },
});
