import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  Dimensions, ScrollView, StatusBar
} from 'react-native';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;
var GRID = (W - 4) / 3;

export default function ProfileScreen(props) {
  var onLogout = props.onLogout;
  var [userData, setUserData] = useState(null);
  var [posts, setPosts] = useState([]);
  var [loading, setLoading] = useState(true);
  var uid = auth.currentUser ? auth.currentUser.uid : '';

  useEffect(function() {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(function(snap) {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    var q = query(collection(db, 'posts'), where('uid', '==', uid));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; })
        .sort(function(a, b) { return (b.createdAt ? b.createdAt.seconds || 0 : 0) - (a.createdAt ? a.createdAt.seconds || 0 : 0); });
      setPosts(list);
    });
  }, [uid]);

  function confirmLogout() {
    Alert.alert('Logout', 'Pakka logout karna hai?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout }
    ]);
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#8B5CF6" size="large" /></View>;
  }

  var user = userData || {};
  var displayName = user.name || (auth.currentUser ? auth.currentUser.displayName : '') || 'User';
  var username = user.username || displayName;
  var avatar = user.avatar || (auth.currentUser ? auth.currentUser.photoURL : '') || ('https://i.pravatar.cc/150?u=' + uid);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <Text style={s.headerName}>{username}</Text>
        <TouchableOpacity onPress={confirmLogout}><Text style={s.settingsIco}>⚙️</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#F8F4FF' }}>
        <View style={s.topCard}>
          <View style={s.topRow}>
            <View style={s.avatarRing}>
              <Image source={{ uri: avatar }} style={s.avatar} />
            </View>
            <View style={s.statsRow}>
              <View style={s.stat}><Text style={s.statNum}>{posts.length}</Text><Text style={s.statLbl}>Posts</Text></View>
              <View style={s.stat}><Text style={s.statNum}>{user.followers || 0}</Text><Text style={s.statLbl}>Followers</Text></View>
              <View style={s.stat}><Text style={s.statNum}>{user.following || 0}</Text><Text style={s.statLbl}>Following</Text></View>
            </View>
          </View>
          <Text style={s.bioName}>{displayName}</Text>
          {user.bio ? <Text style={s.bioTxt}>{user.bio}</Text> : null}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.editBtn}><Text style={s.editBtnTxt}>Edit Profile</Text></TouchableOpacity>
            <TouchableOpacity style={s.shareBtn}><Text style={s.shareBtnTxt}>Share</Text></TouchableOpacity>
          </View>
        </View>

        <View style={s.gridWrap}>
          {posts.length === 0 ? (
            <View style={s.noPost}>
              <Text style={s.noPostIco}>📷</Text>
              <Text style={s.noPostTxt}>No posts yet</Text>
              <Text style={s.noPostSub}>Share your first moment!</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={function(item) { return item.id; }}
              renderItem={function(info) {
                var item = info.item;
                var idx = info.index;
                return (
                  <TouchableOpacity style={[s.gridItem, idx % 3 !== 2 ? { marginRight: 2 } : {}]}>
                    <Image source={{ uri: item.imageUrl }} style={s.gridImg} />
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={function() { return <View style={{ height: 2 }} />; }}
            />
          )}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
          <Text style={s.logoutTxt}>🚪 Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, backgroundColor: '#F8F4FF', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0EAFF' },
  headerName: { color: '#1A1A2E', fontSize: 20, fontWeight: '900' },
  settingsIco: { fontSize: 22 },
  topCard: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16, marginBottom: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 12 },
  avatarRing: { width: 90, height: 90, borderRadius: 45, padding: 3, backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  avatar: { width: '100%', height: '100%', borderRadius: 40, borderWidth: 2, borderColor: '#fff' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { color: '#1A1A2E', fontSize: 20, fontWeight: '900' },
  statLbl: { color: '#aaa', fontSize: 11, marginTop: 2 },
  bioName: { color: '#1A1A2E', fontWeight: '700', fontSize: 15, marginBottom: 3 },
  bioTxt: { color: '#777', fontSize: 13, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  editBtn: { flex: 1, backgroundColor: '#F3EEFF', borderRadius: 12, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#E0D4FF' },
  editBtnTxt: { color: '#8B5CF6', fontWeight: '700', fontSize: 13 },
  shareBtn: { flex: 1, backgroundColor: '#F3EEFF', borderRadius: 12, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#E0D4FF' },
  shareBtnTxt: { color: '#8B5CF6', fontWeight: '700', fontSize: 13 },
  gridWrap: { backgroundColor: '#fff' },
  gridItem: { width: GRID, height: GRID, marginBottom: 2 },
  gridImg: { width: '100%', height: '100%', backgroundColor: '#F0EAFF' },
  noPost: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  noPostIco: { fontSize: 56 },
  noPostTxt: { color: '#1A1A2E', fontSize: 18, fontWeight: '700' },
  noPostSub: { color: '#aaa', fontSize: 13 },
  logoutBtn: { margin: 16, backgroundColor: '#FFF0F0', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#FFD4D4' },
  logoutTxt: { color: '#FF4444', fontWeight: '700', fontSize: 14 }
});
    
