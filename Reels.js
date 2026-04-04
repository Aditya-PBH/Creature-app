// 🎬 Reels.js — Vertical video reels (TikTok style)
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Video } from 'expo-av';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const { width, height } = Dimensions.get('window');
const PINK = '#ff3b5c';

export default function ReelsScreen() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const ReelItem = ({ item, index }) => {
    const videoRef = useRef(null);
    const isActive = index === activeIndex;

    useEffect(() => {
      if (isActive) videoRef.current?.playAsync();
      else videoRef.current?.pauseAsync();
    }, [isActive]);

    return (
      <View style={s.reel}>
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={s.video}
          resizeMode="cover"
          isLooping
          shouldPlay={isActive}
        />
        {/* Overlay */}
        <View style={s.overlay}>
          <View style={s.rightActions}>
            <TouchableOpacity style={s.actionBtn}>
              <Text style={s.actionIcon}>❤️</Text>
              <Text style={s.actionCount}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Text style={s.actionIcon}>💬</Text>
              <Text style={s.actionCount}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Text style={s.actionIcon}>📤</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bottomInfo}>
            <Text style={s.reelUsername}>@{item.username || 'user'}</Text>
            {item.caption ? <Text style={s.reelCaption}>{item.caption}</Text> : null}
          </View>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={PINK} size="large" /></View>
  );

  if (reels.length === 0) return (
    <View style={s.center}>
      <Text style={s.emptyIcon}>🎬</Text>
      <Text style={s.emptyText}>Abhi koi reel nahi!</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={reels}
        keyExtractor={i => i.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.y / height));
        }}
        renderItem={({ item, index }) => <ReelItem item={item} index={index} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60 },
  emptyText: { color: '#fff', fontSize: 18, marginTop: 16 },
  reel: { width, height, backgroundColor: '#000' },
  video: { width, height },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  rightActions: { gap: 24, marginBottom: 20 },
  actionBtn: { alignItems: 'center' },
  actionIcon: { fontSize: 30 },
  actionCount: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: '600' },
  bottomInfo: { flex: 1, marginRight: 16 },
  reelUsername: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  reelCaption: { color: '#ddd', fontSize: 13, lineHeight: 18 },
});
            
