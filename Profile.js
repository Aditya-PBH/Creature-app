import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  Dimensions, ScrollView
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
      var list = snap.docs.map(function(d) {
        var data = d.data();
        data.id = d.id;
        return data;
      }).sort(function(a, b) {
        return (b.createdAt ? b.createdAt.seconds || 0 : 0) - (a.createdAt ? a.createdAt.seconds || 0 : 0);
      });
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
    return (
      <View style={st.center}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  var user = userData || {};
  var displayName = user.name || (auth.currentUser ? auth.currentUser.displayName : '') || 'User';
  var displayUsername = user.username || (auth.currentUser ? auth.currentUser.displayName : '') || 'user';
  var avatarUrl = user.avatar || (auth.currentUser ? auth.currentUser.photoURL : '') || ('https://i.pravatar.cc/150?u=' + uid);

  return (
    <SafeAreaView style={st.safe}>
      <View style={st.header}>
        <Text style={st.headerName}>{displayUsername}</Text>
        <TouchableOpacity onPress={confirmLogout}>
          <Text style={st.settingsIco}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={st.topRow}>
          <View style={st.avatarRing}>
            <Image source={{ uri: avatarUrl }} style={st.avatar} />
          </View>
          <View style={st.statsRow}>
            <View style={st.stat}>
              <Text style={st.statNum}>{posts.length}</Text>
              <Text style={st.statLbl}>Posts</Text>
            </View>
            <View style={st.stat}>
              <Text style={st.statNum}>{user.followers || 0}</Text>
              <Text style={st.statLbl}>Followers</Text>
            </View>
            <View style={st.stat}>
              <Text style={st.statNum}>{user.following || 0}</Text>
              <Text style={st.statLbl}>Following</Text>
            </View>
          </View>
        </View>

        <View style={st.bio}>
          <Text style={st.bioName}>{displayName}</Text>
          {user.bio ? <Text style={st.bioTxt}>{user.bio}</Text> : null}
        </View>

        <View style={st.btnRow}>
          <TouchableOpacity style={st.editBtn}>
            <Text style={st.editBtnTxt}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.editBtn}>
            <Text style={st.editBtnTxt}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={st.divider} />

        {posts.length === 0 ? (
          <View style={st.noPost}>
            <Text style={st.noPostIco}>📷</Text>
            <Text style={st.noPostTxt}>No posts yet</Text>
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
                <TouchableOpacity style={[st.gridItem, idx % 3 !== 2 ? { marginRight: 2 } : {}]}>
                  <Image source={{ uri: item.imageUrl }} style={st.gridImg} />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={function() { return <View style={{ height: 2 }} />; }}
          />
        )}

        <TouchableOpacity style={st.logoutBtn} onPress={confirmLogout}>
          <Text style={st.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  center: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#1E1E2E' },
  headerName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  settingsIco: { fontSize: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18, gap: 20 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, padding: 3, backgroundColor: '#8B5CF6' },
  avatar: { width: '100%', height: '100%', borderRadius: 40, borderWidth: 2, borderColor: '#0A0A0F' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLbl: { color: '#666', fontSize: 11, marginTop: 2 },
  bio: { paddingHorizontal: 16, paddingBottom: 14 },
  bioName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bioTxt: { color: '#aaa', fontSize: 13, marginTop: 3 },
  btnRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginBottom: 16 },
  editBtn: { flex: 1, backgroundColor: '#13131A', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E2E' },
  editBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#1E1E2E', marginBottom: 2 },
  noPost: { alignItems: 'center', paddingVertical: 50 },
  noPostIco: { fontSize: 48, marginBottom: 12 },
  noPostTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  gridItem: { width: GRID, height: GRID, marginBottom: 2 },
  gridImg: { width: '100%', height: '100%', backgroundColor: '#13131A' },
  logoutBtn: { margin: 16, backgroundColor: '#13131A', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  logoutTxt: { color: '#ff4444', fontWeight: '600', fontSize: 14 }
});
      
