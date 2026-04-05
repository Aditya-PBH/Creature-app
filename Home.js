import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from './firebase';

var screenWidth = Dimensions.get('window').width;
var PURPLE = '#8B5CF6';
var DARK = '#0A0A0F';
var CARD = '#13131A';
var BORDER = '#1E1E2E';

function getTimeAgo(date) {
  if (!date) {
    return 'Just now';
  }
  var seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) {
    return 'Just now';
  }
  if (seconds < 3600) {
    return Math.floor(seconds / 60) + 'm ago';
  }
  if (seconds < 86400) {
    return Math.floor(seconds / 3600) + 'h ago';
  }
  return Math.floor(seconds / 86400) + 'd ago';
}

export default function HomeScreen() {
  var [posts, setPosts] = useState([]);
  var [stories, setStories] = useState([]);
  var [loading, setLoading] = useState(true);
  var [refreshing, setRefreshing] = useState(false);
  var [commentModal, setCommentModal] = useState(false);
  var [activePost, setActivePost] = useState(null);
  var [comment, setComment] = useState('');
  var [storyModal, setStoryModal] = useState(false);
  var [activeStory, setActiveStory] = useState(null);

  var currentUser = auth.currentUser;
  var uid = currentUser ? currentUser.uid : null;

  useEffect(function() {
    var q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    var unsubscribe = onSnapshot(q, function(snap) {
      var result = [];
      snap.docs.forEach(function(d) {
        var data = d.data();
        data.id = d.id;
        result.push(data);
      });
      setPosts(result);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(function() {
    var q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    var unsubscribe = onSnapshot(q, function(snap) {
      var result = [];
      snap.docs.forEach(function(d) {
        var data = d.data();
        data.id = d.id;
        result.push(data);
      });
      setStories(result);
    });
    return unsubscribe;
  }, []);

  function handleLike(post) {
    var ref = doc(db, 'posts', post.id);
    var liked = post.likes && post.likes.indexOf(uid) !== -1;
    if (liked) {
      updateDoc(ref, { likes: arrayRemove(uid) });
    } else {
      updateDoc(ref, { likes: arrayUnion(uid) });
    }
  }

  function handleComment() {
    if (!comment.trim()) {
      return;
    }
    var ref = doc(db, 'posts', activePost.id);
    var newComment = {
      uid: uid,
      username: currentUser ? (currentUser.displayName || 'User') : 'User',
      text: comment.trim(),
      createdAt: new Date().toISOString()
    };
    updateDoc(ref, { comments: arrayUnion(newComment) });
    setComment('');
  }

  var onRefresh = useCallback(function() {
    setRefreshing(true);
    setTimeout(function() {
      setRefreshing(false);
    }, 1000);
  }, []);

  function openStory(story) {
    setActiveStory(story);
    setStoryModal(true);
  }

  function openComments(post) {
    setActivePost(post);
    setCommentModal(true);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={PURPLE} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      <View style={styles.header}>
        <Text style={styles.headerLogo}>Creature</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnTxt}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnTxt}>✉</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={function(item) { return item.id; }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: DARK }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PURPLE}
          />
        }
        ListHeaderComponent={function() {
          return (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.storiesRow}
              >
                <TouchableOpacity style={styles.storyItem}>
                  <View style={styles.storyRing}>
                    <View style={styles.storyRingInner}>
                      <Image
                        source={{ uri: currentUser && currentUser.photoURL ? currentUser.photoURL : 'https://i.pravatar.cc/100' }}
                        style={styles.storyImg}
                      />
                    </View>
                  </View>
                  <Text style={styles.storyName}>Your Story</Text>
                </TouchableOpacity>
                {stories.map(function(st) {
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={styles.storyItem}
                      onPress={function() { openStory(st); }}
                    >
                      <View style={styles.storyRing}>
                        <View style={styles.storyRingInner}>
                          <Image
                            source={{ uri: st.avatar ? st.avatar : 'https://i.pravatar.cc/100' }}
                            style={styles.storyImg}
                          />
                        </View>
                      </View>
                      <Text style={styles.storyName} numberOfLines={1}>
                        {st.username}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.divider} />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>Be the first to share!</Text>
          </View>
        }
        renderItem={function(info) {
          var item = info.item;
          var liked = item.likes && item.likes.indexOf(uid) !== -1;
          var likeCount = item.likes ? item.likes.length : 0;
          var commentCount = item.comments ? item.comments.length : 0;

          return (
            <View style={styles.postCard}>
              <View style={styles.postTop}>
                <View style={styles.postUserRow}>
                  <View style={styles.postAvatarWrap}>
                    <Image
                      source={{ uri: item.avatar ? item.avatar : 'https://i.pravatar.cc/100' }}
                      style={styles.postAvatarImg}
                    />
                  </View>
                  <View>
                    <Text style={styles.postUser}>{item.username ? item.username : 'User'}</Text>
                    {item.location ? (
                      <Text style={styles.postLoc}>{'📍 ' + item.location}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={styles.postMore}>•••</Text>
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />

              <View style={styles.postActions}>
                <View style={styles.postActLeft}>
                  <TouchableOpacity
                    onPress={function() { handleLike(item); }}
                    style={styles.actBtn}
                  >
                    <Text style={styles.actIcon}>{liked ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={function() { openComments(item); }}
                    style={styles.actBtn}
                  >
                    <Text style={styles.actIcon}>💬</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actBtn}>
                    <Text style={styles.actIcon}>✈️</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={styles.actIcon}>🔖</Text>
                </TouchableOpacity>
              </View>

              {likeCount > 0 ? (
                <Text style={styles.likeCount}>{likeCount + ' likes'}</Text>
              ) : null}

              {item.caption ? (
                <Text style={styles.caption}>
                  <Text style={styles.captionUser}>
                    {(item.username ? item.username : 'User') + ' '}
                  </Text>
                  {item.caption}
                </Text>
              ) : null}

              {commentCount > 0 ? (
                <TouchableOpacity onPress={function() { openComments(item); }}>
                  <Text style={styles.viewComments}>
                    {'View all ' + commentCount + ' comments'}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.postTime}>
                {getTimeAgo(item.createdAt && item.createdAt.toDate ? item.createdAt.toDate() : null)}
              </Text>
            </View>
          );
        }}
      />

      <Modal
        visible={commentModal}
        animationType="slide"
        onRequestClose={function() { setCommentModal(false); }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={function() { setCommentModal(false); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={activePost ? (activePost.comments || []) : []}
            keyExtractor={function(item, index) { return String(index); }}
            ListEmptyComponent={
              <Text style={styles.noComments}>No comments yet!</Text>
            }
            renderItem={function(info) {
              var item = info.item;
              return (
                <View style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarTxt}>
                      {item.username ? item.username[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.commentRight}>
                    <Text style={styles.commentUser}>{item.username}</Text>
                    <Text style={styles.commentTxt}>{item.text}</Text>
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#555"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              onPress={handleComment}
              disabled={!comment.trim()}
              style={comment.trim() ? styles.sendBtn : styles.sendBtnOff}
            >
              <Text style={styles.sendBtnTxt}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={storyModal}
        animationType="fade"
        onRequestClose={function() { setStoryModal(false); }}
      >
        <View style={styles.storyViewer}>
          <View style={styles.storyViewerBar} />
          {activeStory ? (
            <View>
              <View style={styles.storyViewerTop}>
                <Image
                  source={{ uri: activeStory.avatar ? activeStory.avatar : 'https://i.pravatar.cc/100' }}
                  style={styles.storyViewerAvatar}
                />
                <Text style={styles.storyViewerName}>{activeStory.username}</Text>
              </View>
              {activeStory.imageUrl ? (
                <Image
                  source={{ uri: activeStory.imageUrl }}
                  style={styles.storyViewerImage}
                  resizeMode="cover"
                />
              ) : null}
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.storyCloseBtn}
            onPress={function() { setStoryModal(false); }}
          >
            <Text style={styles.storyCloseTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, backgroundColor: DARK, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: DARK },
  headerLogo: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  headerBtnTxt: { color: '#fff', fontSize: 16 },
  storiesRow: { paddingVertical: 12, paddingHorizontal: 10, backgroundColor: DARK },
  storyItem: { alignItems: 'center', marginHorizontal: 7, width: 68 },
  storyRing: { width: 66, height: 66, borderRadius: 33, backgroundColor: PURPLE, padding: 2, marginBottom: 5 },
  storyRingInner: { flex: 1, borderRadius: 30, borderWidth: 2, borderColor: DARK, overflow: 'hidden' },
  storyImg: { width: '100%', height: '100%' },
  storyName: { color: '#aaa', fontSize: 10, textAlign: 'center' },
  divider: { height: 1, backgroundColor: BORDER },
  postCard: { backgroundColor: DARK, marginBottom: 2 },
  postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatarWrap: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: PURPLE, padding: 1.5, overflow: 'hidden' },
  postAvatarImg: { width: '100%', height: '100%', borderRadius: 16 },
  postUser: { color: '#fff', fontWeight: '700', fontSize: 14 },
  postLoc: { color: '#888', fontSize: 11, marginTop: 1 },
  postMore: { color: '#888', fontSize: 18 },
  postImage: { width: screenWidth, height: screenWidth, backgroundColor: CARD },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  postActLeft: { flexDirection: 'row', gap: 16 },
  actBtn: {},
  actIcon: { fontSize: 26 },
  likeCount: { color: '#fff', fontWeight: '700', fontSize: 13, paddingHorizontal: 14 },
  caption: { color: '#ddd', fontSize: 13, paddingHorizontal: 14, paddingTop: 3, lineHeight: 20 },
  captionUser: { color: '#fff', fontWeight: '700' },
  viewComments: { color: '#777', fontSize: 12, paddingHorizontal: 14, paddingTop: 3 },
  postTime: { color: '#555', fontSize: 11, paddingHorizontal: 14, paddingTop: 3, paddingBottom: 10 },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#666', fontSize: 14, marginTop: 6 },
  modalContainer: { flex: 1, backgroundColor: '#0D0D14' },
  modalHandle: { width: 36, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalClose: { color: '#888', fontSize: 20 },
  noComments: { color: '#555', textAlign: 'center', padding: 40, fontSize: 15 },
  commentRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center' },
  commentAvatarTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  commentRight: { flex: 1 },
  commentUser: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentTxt: { color: '#ccc', fontSize: 14, marginTop: 2, lineHeight: 20 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: BORDER, padding: 12 },
  commentInput: { flex: 1, backgroundColor: CARD, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: BORDER },
  sendBtn: { backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendBtnOff: { backgroundColor: '#2a2a3a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  storyViewer: { flex: 1, backgroundColor: '#000' },
  storyViewerBar: { position: 'absolute', top: 50, left: 16, right: 16, height: 3, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, zIndex: 10 },
  storyViewerTop: { position: 'absolute', top: 65, left: 16, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10 },
  storyViewerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: PURPLE },
  storyViewerName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  storyViewerImage: { width: screenWidth, height: '100%' },
  storyCloseBtn: { position: 'absolute', top: 50, right: 16, zIndex: 10 },
  storyCloseTxt: { color: '#fff', fontSize: 22 }
});
                      
