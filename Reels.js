import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Share } from 'react-native';

const W = Dimensions.get('window').width;

const REELS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/r1/400/700', caption: 'Travel vibe 🔥 #india #travel', likes: 4821, comments: 312 },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/r2/400/700', caption: 'Food lover 😋 #foodie #homecooking', likes: 9234, comments: 541 },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/r3/400/700', caption: 'Gym grind 💪 #fitness #gym', likes: 3102, comments: 189 },
  { id: '4', username: 'sneha_j', avatar: 'https://i.pravatar.cc/60?img=4', image: 'https://picsum.photos/seed/r4/400/700', caption: 'Sunset vibes 🌅 #nature #peace', likes: 7654, comments: 432 },
];

export default function ReelsScreen() {
  const [liked, setLiked] = useState({});
  const [following, setFollowing] = useState({});

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
        {REELS.map(reel => (
          <View key={reel.id} style={{ width: W, height: W * 1.77 }}>
            <Image source={{ uri: reel.image }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />

            <View style={s.reelRight}>
              <Image source={{ uri: reel.avatar }} style={s.reelAv} />
              <TouchableOpacity
                style={s.followBubble}
                onPress={() => setFollowing(p => ({ ...p, [reel.id]: !p[reel.id] }))}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>{following[reel.id] ? '✓' : '+'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.reelAction} onPress={() => setLiked(p => ({ ...p, [reel.id]: !p[reel.id] }))}>
                <Text style={{ fontSize: 30 }}>{liked[reel.id] ? '❤️' : '🤍'}</Text>
                <Text style={s.reelCount}>{(reel.likes + (liked[reel.id] ? 1 : 0)).toLocaleString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.reelAction}>
                <Text style={{ fontSize: 30 }}>💬</Text>
                <Text style={s.reelCount}>{reel.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.reelAction} onPress={() => Share.share({ message: 'Creature pe Reel dekh: ' + reel.caption })}>
                <Text style={{ fontSize: 30 }}>📤</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.reelAction}>
                <Text style={{ fontSize: 30 }}>🎵</Text>
              </TouchableOpacity>
            </View>

            <View style={s.reelBottom}>
              <Text style={s.reelUser}>@{reel.username}</Text>
              <Text style={s.reelCap}>{reel.caption}</Text>
              <View style={s.musicRow}>
                <Text style={{ fontSize: 14 }}>🎵</Text>
                <Text style={s.musicTxt}> Original Audio • {reel.username}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  reelRight: { position: 'absolute', right: 12, bottom: 120, alignItems: 'center' },
  reelAv: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff', marginBottom: 4 },
  followBubble: { backgroundColor: '#ff3b5c', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  reelAction: { alignItems: 'center', marginBottom: 20 },
  reelCount: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: '600' },
  reelBottom: { position: 'absolute', bottom: 0, left: 0, right: 60, padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
  reelUser: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  reelCap: { color: '#eee', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicTxt: { color: '#ddd', fontSize: 12 },
});
