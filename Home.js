import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, TextInput, Modal, ScrollView,
  ActivityIndicator, StatusBar, Dimensions, RefreshControl
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot, limit,
  doc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;
var BG = '#0A0A0A';
var ACCENT = '#FF385C';
var TEXT = '#FFFFFF';
var SUBTEXT = 'rgba(255,255,255,0.45)';
var BORDER = 'rgba(255,255,255,0.08)';
var CARD = '#111111';

// Image cache
var imgCache = {};

function CachedImage(props) {
  var uri = props.uri;
  var style = props.style;
  var mode = props.mode || 'cover';
  var [loaded, setLoaded] = useState(imgCache[uri] || false);

  function onLoad() {
    imgCache[uri] = true;
    setLoaded(true);
  }

  return (
    <View style={[style, { backgroundColor: '#1a1a1a' }]}>
      <Image
        source={{ uri: uri }}
        style={[style, { position: 'absolute' }]}
        resizeMode={mode}
        onLoad={onLoad}
        fadeDuration={200}
      />
      {!loaded ? (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color={ACCENT} size="small" />
        </View>
      ) : null}
    </View>
  );
}

function timeAgo(date) {
  if (!date) return 'now';
  var s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'Just now';
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
    // Limit to 15 posts to save data
    var q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(15));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; });
      setPosts(list);
      setLoading(false);
    });
  }, []);

  useEffect(function() {
    // Limit stories to 10
    var q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(10));
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
    return (
      <View style={s.center}>
        <ActivityIndicator color={ACCENT} size="large" />
        <Text style={s.loadingTxt}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.logo}>creature</Text>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>LIVE</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIco}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIco}>✈</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={function(i) { return i.id; }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: BG }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={8}
        initialNumToRender={3}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={function() {
              setRefreshing(true);
              setTimeout(function() { setRefreshing(false); }, 1000);
            }}
            tintColor={ACCENT} />
        }
        ListHeaderComponent={function() {
          return (
            <View>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                style={s.storiesScroll}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <TouchableOpacity style={s.storyItem}>
                  <View style={s.myStoryRing}>
                    <CachedImage
                      uri={auth.currentUser ? (auth.currentUser.photoURL || 'https://i.pravatar.cc/60?u=me') : 'https://i.pravatar.cc/60?u=me'}
                      style={s.storyAv}
                    />
                    <View style={s.storyAddBtn}><Text style={s.storyAddTxt}>+</Text></View>
                  </View>
                  <Text style={s.storyName}>Your Story</Text>
                </TouchableOpacity>
                {stories.map(function(st) {
                  return (
                    <TouchableOpacity key={st.id} style={s.storyItem}
                      onPress={function() { setActiveStory(st); setShowStory(true); }}>
                      <View style={s.storyGradRing}>
                        <View style={s.storyInner}>
                          <CachedImage uri={st.avatar || 'https://i.pravatar.cc/60'} style={s.storyAv} />
                        </View>
                      </View>
                      <Text style={s.storyName} numberOfLines={1}>{st.username}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={s.divider} />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIco}>✨</Text>
            <Text style={s.emptyTitle}>No posts yet</Text>
            <Text style={s.emptySub}>Be the first to share!</Text>
          </View>
        }
        renderItem={function(info) {
          var item = info.item;
          var liked = Array.isArray(item.likes) && item.likes.indexOf(uid) !== -1;
          var likes = Array.isArray(item.likes) ? item.likes.length : 0;
          var cmts = Array.isArray(item.comments) ? item.comments.length : 0;
          var t = item.createdAt && item.createdAt.toDate ? timeAgo(item.createdAt.toDate()) : '';

          return (
            <View style={s.postCard}>
              <View style={s.postTop}>
                <View style={s.postUserRow}>
                  <View style={s.postAvRing}>
                    <CachedImage uri={item.avatar || 'https://i.pravatar.cc/40'} style={s.postAv} />
                  </View>
                  <View>
                    <Text style={s.postUsername}>{item.username || 'User'}</Text>
                    {item.location ? <Text style={s.postLoc}>📍 {item.location}</Text> : null}
                  </View>
                </View>
                <TouchableOpacity style={s.moreBtn}>
                  <Text style={s.moreDots}>•••</Text>
                </TouchableOpacity>
              </View>

              <CachedImage uri={item.imageUrl} style={s.postImg} />

              <View style={s.actBar}>
                <View style={s.actLeft}>
                  <TouchableOpacity style={s.actBtn} onPress={function() { doLike(item); }}>
                    <Text style={[s.actIco, liked && { color: ACCENT }]}>{liked ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actBtn}
                    onPress={function() { setActivePost(item); setShowComments(true); }}>
                    <Text style={s.actIco}>💬</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actBtn}>
                    <Text style={s.actIco}>✈️</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={s.actIco}>🔖</Text>
                </TouchableOpacity>
              </View>

              {likes > 0 ? <Text style={s.likeTxt}>{likes.toLocaleString()} likes</Text> : null}
              {item.caption ? (
                <Text style={s.caption}>
                  <Text style={s.capUser}>{item.username || 'User'} </Text>
                  {item.caption}
                </Text>
              ) : null}
              {cmts > 0 ? (
                <TouchableOpacity onPress={function() { setActivePost(item); setShowComments(true); }}>
                  <Text style={s.viewCmts}>View all {cmts} comments</Text>
                </TouchableOpacity>
              ) : null}
              {t ? <Text style={s.timeAgo}>{t}</Text> : null}
            </View>
          );
        }}
      />

      <Modal visible={showComments} animationType="slide" onRequestClose={function() { setShowComments(false); }}>
        <View style={s.modalRoot}>
          <View style={s.modalPill} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={function() { setShowComments(false); }} style={s.modalCloseBtn}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={activePost ? (activePost.comments || []) : []}
            keyExtractor={function(x, i) { return String(i); }}
            ListEmptyComponent={
              <View style={s.center}>
                <Text style={s.emptySub}>No comments yet!</Text>
              </View>
            }
            renderItem={function(info) {
              var c = info.item;
              return (
                <View style={s.cmtRow}>
                  <View style={s.cmtAv}>
                    <Text style={s.cmtAvTxt}>{c.username ? c.username[0].toUpperCase() : 'U'}</Text>
                  </View>
                  <View style={s.cmtBody}>
                    <Text style={s.cmtUser}>{c.username}</Text>
                    <Text style={s.cmtTxt}>{c.text}</Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={s.cmtInputRow}>
            <TextInput style={s.cmtInput} placeholder="Add a comment..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newComment} onChangeText={setNewComment} multiline={true} />
            <TouchableOpacity style={newComment.trim() ? s.cmtSendBtn : s.cmtSendBtnOff}
              onPress={doComment} disabled={!newComment.trim()}>
              <Text style={s.cmtSendTxt}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStory} animationType="fade" onRequestClose={function() { setShowStory(false); }}>
        <View style={s.storyViewer}>
          <View style={s.storyProgressBar} />
          <View style={s.storyViewerTop}>
            <CachedImage uri={activeStory ? (activeStory.avatar || 'https://i.pravatar.cc/60') : 'https://i.pravatar.cc/60'} style={s.storyViewerAv} />
            <Text style={s.storyViewerName}>{activeStory ? activeStory.username : ''}</Text>
            <TouchableOpacity onPress={function() { setShowStory(false); }} style={s.storyViewerClose}>
              <Text style={s.storyViewerCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          {activeStory && activeStory.imageUrl ? (
            <CachedImage uri={activeStory.imageUrl} style={s.storyViewerImg} mode="contain" />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: BG },
  loadingTxt: { color: SUBTEXT, fontSize: 13, marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: BG },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { color: TEXT, fontSize: 26, fontWeight: '900', letterSpacing: -1, fontStyle: 'italic' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,56,92,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, gap: 4, borderWidth: 1, borderColor: 'rgba(255,56,92,0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  liveTxt: { color: ACCENT, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', gap: 6 },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  headerBtnIco: { color: TEXT, fontSize: 17 },
  storiesScroll: { backgroundColor: BG },
  storyItem: { alignItems: 'center', marginRight: 14, width: 64 },
  myStoryRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 5, position: 'relative' },
  storyGradRing: { width: 62, height: 62, borderRadius: 31, padding: 2.5, marginBottom: 5, backgroundColor: ACCENT },
  storyInner: { flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: BG },
  storyAv: { width: 56, height: 56, borderRadius: 28 },
  storyAddBtn: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BG },
  storyAddTxt: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  storyName: { color: SUBTEXT, fontSize: 10, textAlign: 'center', fontWeight: '500' },
  divider: { height: 1, backgroundColor: BORDER },
  postCard: { backgroundColor: BG, marginBottom: 2 },
  postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11 },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvRing: { width: 40, height: 40, borderRadius: 20, padding: 2, backgroundColor: ACCENT },
  postAv: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: BG },
  postUsername: { color: TEXT, fontWeight: '700', fontSize: 14 },
  postLoc: { color: SUBTEXT, fontSize: 11, marginTop: 1 },
  moreBtn: { padding: 8 },
  moreDots: { color: SUBTEXT, fontSize: 18, letterSpacing: 2 },
  postImg: { width: W, height: W, backgroundColor: CARD },
  actBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  actLeft: { flexDirection: 'row', gap: 16 },
  actBtn: {},
  actIco: { fontSize: 26, color: TEXT },
  likeTxt: { color: TEXT, fontWeight: '700', fontSize: 14, paddingHorizontal: 14, marginBottom: 3 },
  caption: { color: 'rgba(255,255,255,0.8)', fontSize: 14, paddingHorizontal: 14, lineHeight: 20, marginBottom: 3 },
  capUser: { color: TEXT, fontWeight: '800' },
  viewCmts: { color: SUBTEXT, fontSize: 13, paddingHorizontal: 14, marginBottom: 3 },
  timeAgo: { color: 'rgba(255,255,255,0.25)', fontSize: 10, paddingHorizontal: 14, paddingBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  emptyWrap: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyIco: { fontSize: 64 },
  emptyTitle: { color: TEXT, fontSize: 22, fontWeight: '800' },
  emptySub: { color: SUBTEXT, fontSize: 14 },
  modalRoot: { flex: 1, backgroundColor: '#0D0D0D' },
  modalPill: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalTitle: { color: TEXT, fontSize: 17, fontWeight: '800' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  modalCloseTxt: { color: SUBTEXT, fontSize: 14 },
  cmtRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  cmtAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center' },
  cmtAvTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cmtBody: { flex: 1 },
  cmtUser: { color: TEXT, fontWeight: '700', fontSize: 13 },
  cmtTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20, marginTop: 2 },
  cmtInputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER, gap: 10 },
  cmtInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: TEXT, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: BORDER },
  cmtSendBtn: { backgroundColor: ACCENT, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  cmtSendBtnOff: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  cmtSendTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  storyViewer: { flex: 1, backgroundColor: '#000' },
  storyProgressBar: { position: 'absolute', top: 52, left: 16, right: 16, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, zIndex: 10 },
  storyViewerTop: { position: 'absolute', top: 66, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10 },
  storyViewerAv: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: ACCENT },
  storyViewerName: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1 },
  storyViewerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  storyViewerCloseTxt: { color: '#fff', fontSize: 14 },
  storyViewerImg: { width: W, height: '100%' },
});
        
