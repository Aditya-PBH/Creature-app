// 🏠 Home.js — Premium Instagram-style UI (Purple/Pink Gradient Theme)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  TextInput, Modal, SafeAreaView, RefreshControl, ScrollView,
  ActivityIndicator, StatusBar, Dimensions
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot, doc,
  updateDoc, arrayUnion, arrayRemove, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

const { width } = Dimensions.get('window');
const GRADIENT_START = '#8B5CF6';
const GRADIENT_END = '#EC4899';
const DARK = '#0A0A0F';
const CARD = '#13131A';
const BORDER = '#1E1E2E';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [comment, setComment] = useState('');
  const [storyModal, setStoryModal] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setStories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const toggleLike = async (post) => {
    const ref = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(uid);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(uid) : arrayUnion(uid)
    });
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    const ref = doc(db, 'posts', activePost.id);
    await updateDoc(ref, {
      comments: arrayUnion({
        uid,
        username: auth.currentUser?.displayName || 'User',
        text: comment.trim(),
        createdAt: new Date().toISOString(),
      })
    });
    setComment('');
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ── Story Ring ──────────────────────────────
  const StoryItem = ({ item, isFirst }) => (
    <TouchableOpacity style={s.storyWrap}
      onPress={() => { setActiveStory(item); setStoryModal(true); }}>
      <View style={s.storyGradientRing}>
        <View style={s.storyInnerRing}>
          <Image
            source={{ uri: item.avatar || `https://i.pravatar.cc/100?u=${item.uid}` }}
            style={s.storyAvatar}
          />
        </View>
      </View>
      <Text style={s.storyName} numberOfLines={1}>
        {isFirst ? 'Your Story' : item.username}
      </Text>
    </TouchableOpacity>
  );

  // ── Post Card ───────────────────────────────
  const PostItem = ({ item }) => {
    const liked = item.likes?.includes(uid);
    const likeCount = item.likes?.length || 0;
    const commentCount = item.comments?.length || 0;

    return (
      <View style={s.postCard}>
        {/* Header */}
        <View style={s.postHeader}>
          <View style={s.postUserRow}>
            <View style={s.postAvatarRing}>
              <Image
                source={{ uri: item.avatar || `https://i.pravatar.cc/100?u=${item.uid}` }}
                style={s.postAvatar}
              />
            </View>
            <View>
              <Text style={s.postUsername}>{item.username || 'User'}</Text>
              {item.location
                ? <Text style={s.postLocation}>📍 {item.location}</Text>
                : null}
            </View>
          </View>
          <TouchableOpacity style={s.moreBtn}>
            <Text style={s.moreDots}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        <Image source={{ uri: item.imageUrl }} style={s.postImage} resizeMode="cover" />

        {/* Actions Row */}
        <View style={s.actionsRow}>
          <View style={s.actionsLeft}>
            <TouchableOpacity onPress={() => toggleLike(item)} style={s.actionBtn}>
              <Text style={[s.actionEmoji, liked && s.likedEmoji]}>
                {liked ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setActivePost(item); setCommentModal(true); }}
              style={s.actionBtn}>
              <Text style={s.actionEmoji}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Text style={s.actionEmoji}>✈️</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text style={s.actionEmoji}>🔖</Text>
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {likeCount > 0 && (
          <Text style={s.likeCount}>{likeCount.toLocaleString()} likes</Text>
        )}

        {/* Caption */}
        {item.caption ? (
          <Text style={s.caption}>
            <Text style={s.captionUsername}>{item.username} </Text>
            {item.caption}
          </Text>
        ) : null}

        {/* View comments */}
        {commentCount > 0 && (
          <TouchableOpacity onPress={() => { setActivePost(item); setCommentModal(true); }}>
            <Text style={s.viewAllComments}>View all {commentCount} comments</Text>
          </TouchableOpacity>
        )}

        <Text style={s.postTime}>{timeAgo(item.createdAt?.toDate?.())}</Text>
      </View>
    );
  };

  if (loading) return (
    <View style={s.loadingWrap}>
      <ActivityIndicator color={GRADIENT_START} size="large" />
    </View>
  );

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerLogo}>
          <Text style={s.headerLogoC}>C</Text>reature
        </Text>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.headerIconBtn}>
            <Text style={s.headerIconText}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIconBtn}>
            <Text style={s.headerIconText}>✉</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        backgroundColor={DARK}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GRADIENT_START} />
        }
        ListHeaderComponent={() => (
          <>
            {/* STORIES */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.storiesRow}>
              <StoryItem
                item={{ username: 'Your Story', avatar: auth.currentUser?.photoURL, uid: 'me' }}
                isFirst
              />
              {stories.map(st => <StoryItem key={st.id} item={st} />)}
            </ScrollView>
            <View style={s.separator} />
          </>
        )}
        renderItem={({ item }) => <PostItem item={item} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>📸</Text>
            <Text style={s.emptyTitle}>No posts yet</Text>
            <Text style={s.emptySub}>Be the first to share a moment!</Text>
          </View>
        }
      />

      {/* COMMENT MODAL */}
      <Modal visible={commentModal} animationType="slide" onRequestClose={() => setCommentModal(false)}>
        <View style={s.modalWrap}>
          {/* Modal Handle */}
          <View style={s.modalHandle} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setCommentModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={activePost?.comments || []}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={s.commentRow}>
                <View style={s.commentAvatar}>
                  <Text style={s.commentAvatarText}>
                    {item.username?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={s.commentContent}>
                  <Text style={s.commentUsername}>{item.username}</Text>
                  <Text style={s.commentText}>{item.text}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Text style={s.emptyIcon}>💬</Text>
                <Text style={s.emptySub}>No comments yet. Be first!</Text>
              </View>
            }
          />

          <View style={s.commentInputRow}>
            <TextInput
              style={s.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#555"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              onPress={addComment}
              disabled={!comment.trim()}
              style={[s.sendBtn, !comment.trim() && s.sendDisabled]}>
              <Text style={s.sendBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* STORY VIEWER */}
      <Modal visible={storyModal} animationType="fade" onRequestClose={() => setStoryModal(false)}>
        <View style={s.storyViewer}>
          <View style={s.storyViewerBar} />
          <View style={s.storyViewerHeader}>
            <Image
              source={{ uri: activeStory?.avatar || 'https://i.pravatar.cc/100' }}
              style={s.storyViewerAvatar}
            />
            <Text style={s.storyViewerName}>{activeStory?.username}</Text>
          </View>
          {activeStory?.imageUrl && (
            <Image source={{ uri: activeStory.imageUrl }}
              style={s.storyViewerImg} resizeMode="cover" />
          )}
          <TouchableOpacity style={s.storyCloseBtn} onPress={() => setStoryModal(false)}>
            <Text style={s.storyCloseTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function timeAgo(date) {
  if (!date) return 'Just now';
  const s = Math.floor((new Date() - date) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  loadingWrap: { flex: 1, backgroundColor: DARK, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: DARK,
  },
  headerLogo: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  headerLogoC: { color: '#A855F7' },
  headerIcons: { flexDirection: 'row', gap: 16 },
  headerIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: CARD, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  headerIconText: { color: '#fff', fontSize: 16 },

  // Stories
  storiesRow: { paddingVertical: 14, paddingHorizontal: 10, backgroundColor: DARK },
  storyWrap: { alignItems: 'center', marginHorizontal: 7, width: 70 },
  storyGradientRing: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#A855F7',
    padding: 2.5, marginBottom: 5,
    shadowColor: '#A855F7', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 8,
  },
  storyInnerRing: {
    flex: 1, borderRadius: 32,
    borderWidth: 2, borderColor: DARK,
    overflow: 'hidden',
  },
  storyAvatar: { width: '100%', height: '100%' },
  storyName: { color: '#aaa', fontSize: 11, textAlign: 'center' },
  separator: { height: 1, backgroundColor: BORDER },

  // Post
  postCard: { backgroundColor: DARK, marginBottom: 2 },
  postHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatarRing: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: '#A855F7', padding: 1.5,
  },
  postAvatar: { width: '100%', height: '100%', borderRadius: 18 },
  postUsername: { color: '#fff', fontWeight: '700', fontSize: 14 },
  postLocation: { color: '#888', fontSize: 11, marginTop: 1 },
  moreBtn: { padding: 4 },
  moreDots: { color: '#888', fontSize: 18, letterSpacing: 1 },
  postImage: { width, height: width, backgroundColor: CARD },

  // Actions
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  actionsLeft: { flexDirection: 'row', gap: 18 },
  actionBtn: {},
  actionEmoji: { fontSize: 26 },
  likedEmoji: { transform: [{ scale: 1.1 }] },
  likeCount: { color: '#fff', fontWeight: '700', fontSize: 14, paddingHorizontal: 14 },
  caption: { color: '#e0e0e0', fontSize: 14, paddingHorizontal: 14, paddingTop: 4, lineHeight: 20 },
  captionUsername: { color: '#fff', fontWeight: '700' },
  viewAllComments: { color: '#888', fontSize: 13, paddingHorizontal: 14, paddingTop: 4 },
  postTime: { color: '#555', fontSize: 11, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },

  // Empty
  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' },

  // Comment Modal
  modalWrap: { flex: 1, backgroundColor: '#0D0D14' },
  modalHandle: { width: 36, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalClose: { color: '#888', fontSize: 20 },
  commentRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  commentAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#A855F7', justifyContent: 'center', alignItems: 'center',
  },
  commentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  commentContent: { flex: 1 },
  commentUsername: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentText: { color: '#ccc', fontSize: 14, marginTop: 2, lineHeight: 20 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 1, borderTopColor: BORDER, padding: 12,
  },
  commentInput: {
    flex: 1, backgroundColor: CARD, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 14, maxHeight: 100,
    borderWidth: 1, borderColor: BORDER,
  },
  sendBtn: {
    backgroundColor: '#A855F7', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  sendDisabled: { backgroundColor: '#2a2a3a' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Story Viewer
  storyViewer: { flex: 1, backgroundColor: '#000' },
  storyViewerBar: {
    position: 'absolute', top: 50, left: 16, right: 16, height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, zIndex: 10,
  },
  storyViewerHeader: {
    position: 'absolute', top: 65, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10,
  },
  storyViewerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#A855F7' },
  storyViewerName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  storyViewerImg: { width, height: '100%' },
  storyCloseBtn: { position: 'absolute', top: 50, right: 16, zIndex: 10 },
  storyCloseTxt: { color: '#fff', fontSize: 22, fontWeight: '300' },
});
        
