import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';

const W = Dimensions.get('window').width;
const IMG_SIZE = W / 3 - 2;

const GRID = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  uri: 'https://picsum.photos/seed/s' + (i + 1) + '/300/300',
}));

const USERS = [
  { id: '1', name: 'Rahul Sharma', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', followers: '12.4K' },
  { id: '2', name: 'Priya Kapoor', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', followers: '8.2K' },
  { id: '3', name: 'Aman Verma', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', followers: '5.1K' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  return (
    <View style={s.bg}>
      <View style={s.searchBar}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={s.input}
          placeholder="Search users, posts..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={t => { setQuery(t); setSearching(t.length > 0); }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSearching(false); }}>
            <Text style={{ color: '#ff3b5c', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {searching ? (
        <FlatList
          data={USERS.filter(u => u.username.includes(query) || u.name.toLowerCase().includes(query.toLowerCase()))}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.userRow}>
              <Image source={{ uri: item.avatar }} style={s.userAv} />
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{item.name}</Text>
                <Text style={s.userHandle}>@{item.username} • {item.followers} followers</Text>
              </View>
              <TouchableOpacity style={s.followBtn}>
                <Text style={s.followTxt}>Follow</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={GRID}
          keyExtractor={i => i.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <Image source={{ uri: item.uri }} style={{ width: IMG_SIZE, height: IMG_SIZE, margin: 1 }} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#1e1e1e', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#111' },
  userAv: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  userHandle: { color: '#888', fontSize: 12, marginTop: 2 },
  followBtn: { backgroundColor: '#ff3b5c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  followTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
