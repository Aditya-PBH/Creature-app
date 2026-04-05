import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, TextInput, Modal, ScrollView,
  ActivityIndicator, StatusBar, Dimensions, RefreshControl
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;

function timeAgo(date) {
  if (!date) return 'now';
  var s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

export default function HomeScreen() {
  var [posts, setPosts] = useState([]);
  var [stories, setStories] = useState([]);
  var [loading, setLoading] = useState(true);
  var [refreshing, setRefreshing] = useState(false);
  var [showComments, setShowComments] = useState(false);
  var [activePost, setActivePost] = useState(null);
  var [newComment, setNewComment] = useState('');
  var [showStory, setShowStory] = useState(false);
  var [activeStory, setActiveStory] = useState(null);
  var uid = auth.currentUser ? auth.currentUser.uid : '';

  useEffect(function() {
    var q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; });
      setPosts(list);
      setLoading(false);
    });
  }, []);

  useEffect(function() {
    var q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; });
      setStories(list);
    });
  }, []);

  function doLike(post) {
    var liked = Array.isArray(post.likes) && post.likes.indexOf(uid) !== -1;
    var ref = doc(db, 'posts', post.id);
    updateDoc(ref, { likes: liked ? arrayRemove(uid) : arrayUnion(uid) });
  }

  function doComment() {
    if (!newComment.trim()) return;
    var ref = doc(db, 'posts', activePost.id);
    updateDoc(ref, {
      comments: arrayUnion({
        uid: uid,
        username: auth.currentUser ? (auth.currentUser.displayName || 'User') : 'User',
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      })
    });
    setNewComment('');
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#8B5CF6" size="large" /></View>;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <Text style={s.logo}>Creature</Text>
        <View style={s.hRight}>
          <TouchableOpacity style={s.hBtn}><Text style={s.hIco}>🔔</Text></TouchableOpacity>
          <TouchableOpacity style={s.hBtn}><Text style={s.hIco}>✉️</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={function(i) { return i.id; }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#F8F4FF' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={function() { setRefreshing(true); setTimeout(function() { setRefreshing(false); }, 1000); }} tintColor="#8B5CF6" />}
        ListHeaderComponent={function() {
          return (
            <View style={s.storiesWrap}>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={s.storyItem}>
                  <View style={s.myStoryRing}>
                    <Image source={{ uri: auth.currentUser ? (auth.currentUser.photoURL || 'https://i.pravatar.cc/100?u=me') : 'https://i.pravatar.cc/100?u=me' }} style={s.storyAv} />
                    <View style={s.addDot}><Text style={s.addDotTxt}>+</Text></View>
                  </View>
                  <Text style={s.storyName}>Your Story</Text>
                </TouchableOpacity>
                {stories.map(function(st) {
                  return (
                    <TouchableOpacity key={st.id} style={s.storyItem} onPress={function() { setActiveStory(st); setShowStory(true); }}>
                      <View style={s.storyRing}>
                        <Image source={{ uri: st.avatar || 'https://i.pravatar.cc/100' }} style={s.storyAv} />
                      </View>
                      <Text style={s.storyName} numberOfLines={1}>{st.username}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIco}>📸</Text>
            <Text style={s.emptyTxt}>No posts yet!</Text>
            <Text style={s.emptySub}>Be first to share a moment</Text>
          </View>
        }
        renderItem={function(info) {
          var item = info.item;
          var liked = Array.isArray(item.likes) && item.likes.indexOf(uid) !== -1;
          var likes = Array.isArray(item.likes) ? item.likes.length : 0;
          var cmts = Array.isArray(item.comments) ? item.comments.length : 0;
          var t = item.createdAt && item.createdAt.toDate ? timeAgo(item.createdAt.toDate()) : '';
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={s.cardUser}>
                  <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }} style={s.cardAv} />
                  <View>
                    <Text style={s.cardName}>{item.username || 'User'}</Text>
                    {item.location ? <Text style={s.cardLoc}>{'📍 ' + item.location}</Text> : null}
                  </View>
                </View>
                <TouchableOpacity><Text style={s.dots}>•••</Text></TouchableOpacity>
              </View>

              <Image source={{ uri: item.imageUrl }} style={s.cardImg} resizeMode="cover" />

              <View style={s.cardActions}>
                <View style={s.actLeft}>
                  <TouchableOpacity style={s.actBtn} onPress={function() { doLike(item); }}>
                    <Text style={s.actIco}>{liked ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actBtn} onPress={function() { setActivePost(item); setShowComments(true); }}>
                    <Text style={s.actIco}>💬</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actBtn}>
                    <Text style={s.actIco}>📤</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity><Text style={s.actIco}>🔖</Text></TouchableOpacity>
              </View>

              {likes > 0 ? <Text style={s.likeTxt}>{likes + ' likes'}</Text> : null}
              {item.caption ? (
                <Text style={s.caption}>
                  <Text style={s.capUser}>{(item.username || 'User') + ' '}</Text>
                  {item.caption}
                </Text>
              ) : null}
              {cmts > 0 ? (
                <TouchableOpacity onPress={function() { setActivePost(item); setShowComments(true); }}>
                  <Text style={s.viewCmts}>{'View all ' + cmts + ' comments'}</Text>
                </TouchableOpacity>
              ) : null}
              {t ? <Text style={s.timeAgo}>{t}</Text> : null}
            </View>
          );
        }}
      />

      <Modal visible={showComments} animationType="slide" onRequestClose={function() { setShowComments(false); }}>
        <View style={s.modal}>
          <View style={s.modalHandle} />
          <View style={s.modalTop}>
            <Text style={s.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={function() { setShowComments(false); }}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={activePost ? (activePost.comments || []) : []}
            keyExtractor={function(x, i) { return String(i); }}
            ListEmptyComponent={<Text style={s.noCmt}>No comments yet!</Text>}
            renderItem={function(info) {
              var c = info.item;
              return (
                <View style={s.cmtRow}>
                  <View style={s.cmtAv}><Text style={s.cmtAvTxt}>{c.username ? c.username[0].toUpperCase() : 'U'}</Text></View>
                  <View style={s.cmtBody}>
                    <Text style={s.cmtUser}>{c.username}</Text>
                    <Text style={s.cmtTxt}>{c.text}</Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={s.cmtInput}>
            <TextInput style={s.cmtBox} placeholder="Add a comment..." placeholderTextColor="#aaa" value={newComment} onChangeText={setNewComment} multiline={true} />
            <TouchableOpacity style={newComment.trim() ? s.postBtn : s.postBtnOff} onPress={doComment} disabled={!newComment.trim()}>
              <Text style={s.postBtnTxt}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStory} animationType="fade" onRequestClose={function() { setShowStory(false); }}>
        <View style={s.storyView}>
          <TouchableOpacity style={s.storyClose} onPress={function() { setShowStory(false); }}>
            <Text style={s.storyCloseTxt}>✕</Text>
          </TouchableOpacity>
          {activeStory ? (
            <View>
              <View style={s.storyViewTop}>
                <Image source={{ uri: activeStory.avatar || 'https://i.pravatar.cc/100' }} style={s.storyViewAv} />
                <Text style={s.storyViewName}>{activeStory.username}</Text>
              </View>
              {activeStory.imageUrl ? <Image source={{ uri: activeStory.imageUrl }} style={s.storyViewImg} resizeMode="cover" /> : null}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F4FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0EAFF' },
  logo: { fontSize: 22, fontWeight: '900', color: '#8B5CF6' },
  hRight: { flexDirection: 'row', gap: 10 },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3EEFF', justifyContent: 'center', alignItems: 'center' },
  hIco: { fontSize: 16 },
  storiesWrap: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F0EAFF' },
  storyItem: { alignItems: 'center', marginHorizontal: 7, width: 66 },
  myStoryRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: '#E0D4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 5, position: 'relative' },
  storyRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  storyAv: { width: 52, height: 52, borderRadius: 26 },
  addDot: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  addDotTxt: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  storyName: { color: '#555', fontSize: 10, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIco: { fontSize: 60 },
  emptyTxt: { color: '#333', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#999', fontSize: 14 },
  card: { backgroundColor: '#fff', marginBottom: 8, borderRadius: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  cardUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardAv: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#8B5CF6' },
  cardName: { color: '#1A1A2E', fontWeight: '700', fontSize: 14 },
  cardLoc: { color: '#999', fontSize: 11 },
  dots: { color: '#ccc', fontSize: 18 },
  cardImg: { width: W, height: W, backgroundColor: '#F0EAFF' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  actLeft: { flexDirection: 'row', gap: 16 },
  actBtn: {},
  actIco: { fontSize: 26 },
  likeTxt: { color: '#1A1A2E', fontWeight: '700', fontSize: 14, paddingHorizontal: 14 },
  caption: { color: '#444', fontSize: 14, paddingHorizontal: 14, paddingTop: 3, lineHeight: 20 },
  capUser: { color: '#1A1A2E', fontWeight: '700' },
  viewCmts: { color: '#aaa', fontSize: 13, paddingHorizontal: 14, paddingTop: 3 },
  timeAgo: { color: '#ccc', fontSize: 11, paddingHorizontal: 14, paddingTop: 3, paddingBottom: 12 },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHandle: { width: 36, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0EAFF' },
  modalTitle: { color: '#1A1A2E', fontSize: 16, fontWeight: '700' },
  modalClose: { color: '#aaa', fontSize: 20 },
  cmtRow: { flexDirection: 'row', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: '#F9F5FF' },
  cmtAv: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  cmtAvTxt: { color: '#fff', fontWeight: '700' },
  cmtBody: { flex: 1 },
  cmtUser: { color: '#1A1A2E', fontWeight: '700', fontSize: 13 },
  cmtTxt: { color: '#555', fontSize: 13, marginTop: 2 },
  noCmt: { color: '#ccc', textAlign: 'center', padding: 40 },
  cmtInput: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#F0EAFF', gap: 10 },
  cmtBox: { flex: 1, backgroundColor: '#F8F4FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: '#333', fontSize: 14, maxHeight: 80 },
  postBtn: { backgroundColor: '#8B5CF6', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  postBtnOff: { backgroundColor: '#E0D4FF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  postBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  storyView: { flex: 1, backgroundColor: '#000' },
  storyClose: { position: 'absolute', top: 50, right: 16, zIndex: 10 },
  storyCloseTxt: { color: '#fff', fontSize: 22 },
  storyViewTop: { position: 'absolute', top: 60, left: 16, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10 },
  storyViewAv: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#8B5CF6' },
  storyViewName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  storyViewImg: { width: W, height: '100%' }
});
        
