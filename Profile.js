import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Dimensions, ScrollView, StatusBar
} from 'react-native';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;
var GRID = (W - 3) / 3;
var BG = '#0A0A0A';
var ACCENT = '#FF385C';
var TEXT = '#FFFFFF';
var SUBTEXT = 'rgba(255,255,255,0.45)';
var BORDER = 'rgba(255,255,255,0.08)';
var CARD = '#141414';

// Simple image cache
var imgCache = {};
function CachedImage(props) {
  var [loaded, setLoaded] = useState(imgCache[props.uri] || false);
  return (
    <View style={[props.style, { backgroundColor: '#1a1a1a' }]}>
      <Image source={{ uri: props.uri }} style={[props.style, { position: 'absolute' }]}
        resizeMode={props.mode || 'cover'}
        onLoad={function() { imgCache[props.uri] = true; setLoaded(true); }}
        fadeDuration={150} />
      {!loaded ? (
        <View style={[props.style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color={ACCENT} size="small" />
        </View>
      ) : null}
    </View>
  );
}

export default function ProfileScreen(props) {
  var onLogout = props.onLogout;
  var [userData, setUserData] = useState(null);
  var [posts, setPosts] = useState([]);
  var [loading, setLoading] = useState(true);
  var [postsLoading, setPostsLoading] = useState(true);
  var uid = auth.currentUser ? auth.currentUser.uid : '';

  useEffect(function() {
    if (!uid) return;
    // Get user data once (not realtime - saves data)
    getDoc(doc(db, 'users', uid)).then(function(snap) {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    }).catch(function() { setLoading(false); });

    // Get posts once with limit
    var q = query(collection(db, 'posts'), where('uid', '==', uid));
    getDocs(q).then(function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; })
        .sort(function(a, b) {
          return (b.createdAt ? b.createdAt.seconds || 0 : 0) - (a.createdAt ? a.createdAt.seconds || 0 : 0);
        });
      setPosts(list);
      setPostsLoading(false);
    }).catch(function() { setPostsLoading(false); });
  }, [uid]);

  function confirmLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout }
    ]);
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={ACCENT} size="large" />
        <Text style={s.loadTxt}>Loading profile...</Text>
      </View>
    );
  }

  var user = userData || {};
  var displayName = user.name || (auth.currentUser ? auth.currentUser.displayName : '') || 'User';
  var username = user.username || displayName.toLowerCase().replace(' ', '_');
  var avatar = user.avatar || (auth.currentUser ? auth.currentUser.photoURL : '') || ('https://i.pravatar.cc/100?u=' + uid);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.header}>
        <Text style={s.headerName}>{username}</Text>
        <TouchableOpacity onPress={confirmLogout} style={s.settingsBtn}>
          <Text style={s.settingsIco}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: BG }}>

        <View style={s.profileTop}>
          <View style={s.avatarContainer}>
            <View style={s.avatarRing}>
              <CachedImage uri={avatar} style={s.avatar} />
            </View>
            <View style={s.verifiedBadge}><Text style={s.verifiedIco}>✓</Text></View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNum}>{posts.length}</Text>
              <Text style={s.statLbl}>Posts</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{user.followers || 0}</Text>
              <Text style={s.statLbl}>Followers</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{user.following || 0}</Text>
              <Text style={s.statLbl}>Following</Text>
            </View>
          </View>
        </View>

        <View style={s.bioSection}>
          <Text style={s.bioName}>{displayName}</Text>
          {user.bio ? (
            <Text style={s.bioTxt}>{user.bio}</Text>
          ) : (
            <Text style={s.bioPlaceholder}>Tap Edit Profile to add bio</Text>
          )}
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnTxt}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shareBtn}>
            <Text style={s.shareBtnTxt}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.moreBtn}>
            <Text style={s.moreIco}>•••</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tabBar}>
          <View style={s.tabItemActive}>
            <Text style={s.tabIcoActive}>⊞</Text>
          </View>
          <View style={s.tabItem}>
            <Text style={s.tabIco}>◻</Text>
          </View>
        </View>

        {postsLoading ? (
          <View style={s.gridLoading}>
            <ActivityIndicator color={ACCENT} />
            <Text style={s.loadTxt}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={s.noPostWrap}>
            <Text style={s.noPostIco}>📷</Text>
            <Text style={s.noPostTitle}>No Posts Yet</Text>
            <Text style={s.noPostSub}>Share your first photo</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={function(item) { return item.id; }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            initialNumToRender={9}
            renderItem={function(info) {
              var item = info.item;
              var idx = info.index;
              return (
                <TouchableOpacity style={[s.gridItem, idx % 3 !== 2 && { marginRight: 1.5 }]}>
                  <CachedImage uri={item.imageUrl} style={s.gridImg} />
                  {item.likes && item.likes.length > 0 ? (
                    <View style={s.gridOverlay}>
                      <Text style={s.gridLikeTxt}>❤ {item.likes.length}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={function() { return <View style={{ height: 1.5 }} />; }}
          />
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
          <Text style={s.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadTxt: { color: SUBTEXT, fontSize: 13 },
  gridLoading: { alignItems: 'center', padding: 40, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerName: { color: TEXT, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  settingsBtn: { padding: 4 },
  settingsIco: { fontSize: 22 },
  profileTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 20, gap: 20 },
  avatarContainer: { position: 'relative' },
  avatarRing: { width: 90, height: 90, borderRadius: 45, padding: 3, backgroundColor: ACCENT, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: BG },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#1877F2', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BG },
  verifiedIco: { color: '#fff', fontSize: 11, fontWeight: '900' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statNum: { color: TEXT, fontSize: 20, fontWeight: '900' },
  statLbl: { color: SUBTEXT, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: BORDER },
  bioSection: { paddingHorizontal: 18, paddingBottom: 16 },
  bioName: { color: TEXT, fontWeight: '800', fontSize: 15 },
  bioTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4, lineHeight: 20 },
  bioPlaceholder: { color: SUBTEXT, fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 18 },
  editBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  editBtnTxt: { color: TEXT, fontWeight: '700', fontSize: 14 },
  shareBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  shareBtnTxt: { color: TEXT, fontWeight: '700', fontSize: 14 },
  moreBtn: { width: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  moreIco: { color: SUBTEXT, fontSize: 14 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, borderBottomWidth: 1, borderBottomColor: BORDER },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabItemActive: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: TEXT },
  tabIco: { fontSize: 22, color: SUBTEXT },
  tabIcoActive: { fontSize: 22, color: TEXT },
  noPostWrap: { alignItems: 'center', paddingVertical: 70, gap: 12 },
  noPostIco: { fontSize: 56 },
  noPostTitle: { color: TEXT, fontSize: 20, fontWeight: '800' },
  noPostSub: { color: SUBTEXT, fontSize: 14 },
  gridItem: { width: GRID, height: GRID, marginBottom: 1.5 },
  gridImg: { width: GRID, height: GRID, backgroundColor: CARD },
  gridOverlay: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  gridLikeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  logoutBtn: { margin: 16, backgroundColor: 'rgba(255,56,92,0.1)', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,56,92,0.2)' },
  logoutTxt: { color: ACCENT, fontWeight: '800', fontSize: 15 }
});
  
