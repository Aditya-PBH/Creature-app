import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Dimensions, Image, ActivityIndicator,
  SafeAreaView, StatusBar, ScrollView
} from 'react-native';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;
var GRID = (W - 3) / 3;
var LARGE = GRID * 2 + 1.5;
var BG = '#000000';
var SURFACE = '#111111';
var SURFACE2 = '#1A1A1A';
var BORDER = '#2A2A2A';
var TEXT = '#FFFFFF';
var MUTED = '#666666';
var SECONDARY = '#AAAAAA';
var PRIMARY = '#0095F6';
var ACCENT = '#FF385C';

var imgCache = {};
function CachedImage(props) {
  var [ok, setOk] = useState(imgCache[props.uri] || false);
  return (
    <View style={[props.style, { backgroundColor: SURFACE2 }]}>
      <Image source={{ uri: props.uri }} style={[props.style, { position: 'absolute' }]}
        resizeMode="cover" onLoad={function() { imgCache[props.uri] = true; setOk(true); }} fadeDuration={150} />
      {!ok ? (
        <View style={[props.style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color={ACCENT} size="small" />
        </View>
      ) : null}
    </View>
  );
}

var CATEGORIES = ['All', 'Photos', 'Videos', 'Reels', 'People', 'Places'];

export default function ExploreScreen() {
  var [searchTxt, setSearchTxt] = useState('');
  var [users, setUsers] = useState([]);
  var [posts, setPosts] = useState([]);
  var [loading, setLoading] = useState(true);
  var [searching, setSearching] = useState(false);
  var [showSearch, setShowSearch] = useState(false);
  var [activeCategory, setActiveCategory] = useState('All');
  var searchTimer = useRef(null);

  useEffect(function() { loadExplore(); }, []);

  function loadExplore() {
    var q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
    getDocs(q).then(function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; });
      setPosts(list);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  function handleSearch(txt) {
    setSearchTxt(txt);
    clearTimeout(searchTimer.current);
    if (!txt.trim()) { setUsers([]); setSearching(false); return; }
    setSearching(true);
    searchTimer.current = setTimeout(function() {
      var uid = auth.currentUser ? auth.currentUser.uid : null;
      getDocs(collection(db, 'users')).then(function(snap) {
        var term = txt.toLowerCase();
        var results = snap.docs.map(function(d) { return d.data(); })
          .filter(function(u) {
            return u.uid !== uid &&
              ((u.username || '').toLowerCase().indexOf(term) !== -1 ||
               (u.name || '').toLowerCase().indexOf(term) !== -1);
          });
        setUsers(results);
        setSearching(false);
      }).catch(function() { setSearching(false); });
    }, 400);
  }

  function renderMosaicItem(info) {
    var item = info.item;
    var idx = info.index;
    var isLarge = idx % 7 === 0 || idx % 7 === 4;
    var size = isLarge ? LARGE : GRID;
    return (
      <TouchableOpacity activeOpacity={0.9}>
        <CachedImage uri={item.imageUrl || 'https://picsum.photos/300'} style={{ width: size, height: size }} />
        {item.isVideo ? (
          <View style={s.reelBadge}><Text style={s.reelBadgeTxt}>▶</Text></View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, showSearch && s.searchBarFocused]}>
          <Text style={s.searchIco}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search users, posts..."
            placeholderTextColor={MUTED}
            value={searchTxt}
            onChangeText={handleSearch}
            onFocus={function() { setShowSearch(true); }}
            onBlur={function() { if (!searchTxt) setShowSearch(false); }}
            returnKeyType="search"
          />
          {searchTxt.length > 0 ? (
            <TouchableOpacity onPress={function() { setSearchTxt(''); setUsers([]); setShowSearch(false); }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {showSearch ? (
          <TouchableOpacity onPress={function() { setSearchTxt(''); setUsers([]); setShowSearch(false); }} style={s.cancelBtn}>
            <Text style={s.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showSearch ? (
        /* SEARCH RESULTS */
        <View style={{ flex: 1 }}>
          {searching ? (
            <View style={s.center}><ActivityIndicator color={PRIMARY} /></View>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={function(item, i) { return item.uid || String(i); }}
              showsVerticalScrollIndicator={false}
              renderItem={function(info) {
                var user = info.item;
                return (
                  <TouchableOpacity style={s.userRow}>
                    <View style={s.userAvRing}>
                      <Image source={{ uri: user.avatar || ('https://i.pravatar.cc/48?u=' + user.uid) }} style={s.userAv} />
                    </View>
                    <View style={s.userInfo}>
                      <Text style={s.userName}>{user.username || 'user'}</Text>
                      <Text style={s.userSub}>{user.name || ''}</Text>
                    </View>
                    <TouchableOpacity style={s.followBtn}>
                      <Text style={s.followBtnTxt}>Follow</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          ) : searchTxt.length > 0 ? (
            <View style={s.center}>
              <Text style={s.emptyIco}>🔍</Text>
              <Text style={s.emptyTxt}>No results for "{searchTxt}"</Text>
            </View>
          ) : (
            <View style={s.center}>
              <Text style={s.searchHint}>Search for people and posts</Text>
            </View>
          )}
        </View>
      ) : (
        /* EXPLORE FEED */
        <View style={{ flex: 1 }}>
          {/* Category Pills */}
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
            style={s.catScroll} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 10 }}>
            {CATEGORIES.map(function(cat) {
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.catPill, activeCategory === cat && s.catPillActive]}
                  onPress={function() { setActiveCategory(cat); }}>
                  <Text style={[s.catTxt, activeCategory === cat && s.catTxtActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <View style={s.center}><ActivityIndicator color={ACCENT} size="large" /></View>
          ) : posts.length === 0 ? (
            <View style={s.center}>
              <Text style={s.emptyIco}>🔭</Text>
              <Text style={s.emptyTitle}>Nothing to explore yet</Text>
              <Text style={s.emptyTxt}>Posts will appear here</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={function(item) { return item.id; }}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={9}
              initialNumToRender={12}
              renderItem={renderMosaicItem}
              ItemSeparatorComponent={function() { return <View style={{ height: 1.5 }} />; }}
              columnWrapperStyle={{ gap: 1.5 }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE2, borderRadius: 12, paddingHorizontal: 12, height: 40, gap: 8 },
  searchBarFocused: { backgroundColor: SURFACE },
  searchIco: { fontSize: 14, color: MUTED },
  searchInput: { flex: 1, color: TEXT, fontSize: 15 },
  clearBtn: { color: MUTED, fontSize: 15 },
  cancelBtn: { padding: 4 },
  cancelTxt: { color: PRIMARY, fontSize: 15, fontWeight: '600' },
  catScroll: {},
  catPill: { paddingHorizontal: 16, paddingVertical: 7, backgroundColor: SURFACE2, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  catPillActive: { backgroundColor: TEXT, borderColor: TEXT },
  catTxt: { color: SECONDARY, fontSize: 13, fontWeight: '600' },
  catTxtActive: { color: BG },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  userAvRing: { width: 48, height: 48, borderRadius: 24, padding: 2, backgroundColor: ACCENT },
  userAv: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: BG },
  userInfo: { flex: 1 },
  userName: { color: TEXT, fontWeight: '700', fontSize: 14 },
  userSub: { color: SECONDARY, fontSize: 12, marginTop: 2 },
  followBtn: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  followBtnTxt: { color: TEXT, fontWeight: '700', fontSize: 13 },
  reelBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  reelBadgeTxt: { color: TEXT, fontSize: 10, fontWeight: '700' },
  emptyIco: { fontSize: 52 },
  emptyTitle: { color: TEXT, fontSize: 18, fontWeight: '700' },
  emptyTxt: { color: MUTED, fontSize: 14, textAlign: 'center' },
  searchHint: { color: MUTED, fontSize: 15 }
});
