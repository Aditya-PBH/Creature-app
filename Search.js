// 🔍 Search.js — Search users and posts
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Dimensions
} from 'react-native';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const { width } = Dimensions.get('window');
const GRID = (width - 3) / 3;
const PINK = '#ff3b5c';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load explore posts on mount
  useEffect(() => {
    const fetchExplore = async () => {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      setExplorePosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchExplore();
  }, []);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const results = snap.docs
        .map(d => d.data())
        .filter(u =>
          u.username?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.name?.toLowerCase().includes(searchText.toLowerCase())
        );
      setUsers(results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* SEARCH BAR */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search karo..."
            placeholderTextColor="#555"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => { setSearchText(''); setSearched(false); setUsers([]); }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading && <ActivityIndicator color={PINK} style={{ marginTop: 20 }} />}

      {searched && !loading ? (
        // SEARCH RESULTS
        <FlatList
          data={users}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.userItem}>
              <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/100?u=' + item.uid }} style={s.userAvatar} />
              <View>
                <Text style={s.userName}>{item.username}</Text>
                <Text style={s.userFullName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>Koi nahi mila 😕</Text>
            </View>
          }
        />
      ) : (
        // EXPLORE GRID
        <>
          <Text style={s.exploreTitle}>🔥 Explore</Text>
          <FlatList
            data={explorePosts}
            numColumns={3}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.gridItem}>
                <Image source={{ uri: item.imageUrl }} style={s.gridImg} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.center}>
                <Text style={s.emptyText}>Abhi koi post nahi 😔</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  searchWrap: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12 },
  clearBtn: { color: '#888', fontSize: 16 },
  exploreTitle: { color: '#fff', fontWeight: '700', fontSize: 16, paddingHorizontal: 12, paddingBottom: 8 },
  gridItem: { width: GRID, height: GRID, marginRight: 1.5, marginBottom: 1.5 },
  gridImg: { width: '100%', height: '100%', backgroundColor: '#111' },
  userItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#222' },
  userName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  userFullName: { color: '#888', fontSize: 13, marginTop: 2 },
  center: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 16 },
});
    
