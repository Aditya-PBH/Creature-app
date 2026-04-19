import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Dimensions
} from 'react-native';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

var W = Dimensions.get('window').width;
var GRID = (W - 3) / 3;

export default function SearchScreen() {
  var [searchText, setSearchText] = useState('');
  var [users, setUsers] = useState([]);
  var [explore, setExplore] = useState([]);
  var [loading, setLoading] = useState(false);
  var [searched, setSearched] = useState(false);

  useEffect(function() {
    var q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
    getDocs(q).then(function(snap) {
      setExplore(snap.docs.map(function(d) {
        var data = d.data();
        data.id = d.id;
        return data;
      }));
    });
  }, []);

  function doSearch() {
    if (!searchText.trim()) return;
    setLoading(true);
    setSearched(true);
    getDocs(collection(db, 'users')).then(function(snap) {
      var txt = searchText.toLowerCase();
      var results = snap.docs.map(function(d) { return d.data(); }).filter(function(u) {
        return (u.username || '').toLowerCase().indexOf(txt) !== -1 ||
               (u.name || '').toLowerCase().indexOf(txt) !== -1;
      });
      setUsers(results);
      setLoading(false);
    });
  }

  return (
    <SafeAreaView style={st.safe}>
      <View style={st.searchRow}>
        <View style={st.searchBar}>
          <Text style={st.searchIco}>🔍</Text>
          <TextInput
            style={st.searchInput}
            placeholder="Search..."
            placeholderTextColor="#555"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={function() { setSearchText(''); setSearched(false); setUsers([]); }}>
              <Text style={st.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? <ActivityIndicator color="#8B5CF6" style={{ marginTop: 30 }} /> : null}

      {searched && !loading ? (
        <FlatList
          data={users}
          keyExtractor={function(item, i) { return item.uid || String(i); }}
          ListEmptyComponent={
            <View style={st.center}>
              <Text style={st.emptyTxt}>Koi nahi mila</Text>
            </View>
          }
          renderItem={function(info) {
            var item = info.item;
            return (
              <View style={st.userRow}>
                <Image
                  source={{ uri: item.avatar || ('https://i.pravatar.cc/100?u=' + item.uid) }}
                  style={st.userAv}
                />
                <View>
                  <Text style={st.userName}>{item.username}</Text>
                  <Text style={st.userSub}>{item.name}</Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View>
          <Text style={st.exploreTitle}>Explore</Text>
          <FlatList
            data={explore}
            numColumns={3}
            keyExtractor={function(item) { return item.id; }}
            renderItem={function(info) {
              var item = info.item;
              return (
                <TouchableOpacity style={st.gridItem}>
                  <Image source={{ uri: item.imageUrl }} style={st.gridImg} />
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  searchRow: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13131A', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1E1E2E' },
  searchIco: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 11 },
  clearBtn: { color: '#888', fontSize: 16 },
  exploreTitle: { color: '#fff', fontWeight: '700', fontSize: 15, paddingHorizontal: 12, paddingBottom: 8 },
  gridItem: { width: GRID, height: GRID, marginRight: 1.5, marginBottom: 1.5 },
  gridImg: { width: '100%', height: '100%', backgroundColor: '#13131A' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#111' },
  userAv: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#222' },
  userName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  userSub: { color: '#888', fontSize: 12, marginTop: 2 },
  center: { padding: 40, alignItems: 'center' },
  emptyTxt: { color: '#555', fontSize: 15 }
});
                       
