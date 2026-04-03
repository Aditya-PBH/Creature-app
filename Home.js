import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, StyleSheet, Dimensions, Share } from 'react-native';

const W = Dimensions.get('window').width;

const STORIES = [
  { id: '0', name: 'My Story', avatar: 'https://i.pravatar.cc/100?img=10', own: true },
  { id: '1', name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'Aman', avatar: 'https://i.pravatar.cc/100?img=3' },
  { id: '4', name: 'Sneha', avatar: 'https://i.pravatar.cc/100?img=4' },
];

const POSTS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/p1/400/400', caption: 'Bhai ye jagah gajab hai! 🏔️', likes: 1234, location: 'Manali, India' },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/p2/400/400', caption: 'Ghar ka khana best hai 🍛', likes: 987, location: 'Mumbai' },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/p3/400/400', caption: 'Gym grind never stops 💪', likes: 543, location: 'Delhi' },
];

export default function HomeScreen() {
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});

  return (
    <ScrollView style={s.bg} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.logo}>🐾 creature</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 24 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal data={STORIES} keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <View style={s.storyWrap}>
            <View style={item.own ? s.storyOwn : s.storyRing}>
              <Image source={{ uri: item.avatar }} style={s.storyImg} />
              {item.own && <View style={s.storyPlus}><Text style={{ color: '#fff', fontSize: 12 }}>+</Text></View>}
            </View>
            <Text style={s.storyName} numberOfLines={1}>{item.name}</Text>
          </View>
        )}
      />

      <View style={s.divider} />

      {POSTS.map(post => (
        <View key={post.id} style={s.postCard}>
          <View style={s.postHead}>
            <Image source={{ uri: post.avatar }} style={s.postAv} />
            <View style={{ flex: 1 }}>
              <Text style={s.postUser}>{post.username}</Text>
              <Text style={s.postLoc}>{post.location}</Text>
            </View>
            <TouchableOpacity><Text style={{ color: '#fff', fontSize: 20 }}>•••</Text></TouchableOpacity>
          </View>
          <Image source={{ uri: post.image }} style={s.postImg} resizeMode="cover" />
          <View style={s.postActs}>
            <TouchableOpacity style={s.actBtn} onPress={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))}>
              <Text style={s.actIcon}>{liked[post.id] ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actBtn}>
              <Text style={s.actIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actBtn} onPress={() => Share.share({ message: 'Creature pe dekh: ' + post.caption })}>
              <Text style={s.actIcon}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setSaved(p => ({ ...p, [post.id]: !p[post.id] }))}>
              <Text style={s.actIcon}>{saved[post.id] ? '🔖' : '🏷️'}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.postMeta}>
            <Text style={s.postLikes}>{(post.likes + (liked[post.id] ? 1 : 0)).toLocaleString()} likes</Text>
            <Text style={s.postCap}><Text style={s.postUser}>{post.username} </Text>{post.caption}</Text>
            <TouchableOpacity><Text style={{ color: '#888', marginTop: 4 }}>View all comments</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  logo: { fontSize: 22, fontWeight: '900', color: '#fff' },
  storyWrap: { alignItems: 'center', marginRight: 14, width: 70 },
  storyRing: { borderWidth: 2.5, borderColor: '#ff3b5c', borderRadius: 36, padding: 2 },
  storyOwn: { borderWidth: 2.5, borderColor: '#555', borderRadius: 36, padding: 2 },
  storyImg: { width: 62, height: 62, borderRadius: 31 },
  storyPlus: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ff3b5c', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  storyName: { color: '#ccc', fontSize: 11, marginTop: 4, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#1a1a1a' },
  postCard: { marginBottom: 4 },
  postHead: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAv: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  postUser: { color: '#fff', fontWeight: '700', fontSize: 13 },
  postLoc: { color: '#888', fontSize: 11 },
  postImg: { width: '100%', height: W },
  postActs: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  actBtn: { marginRight: 14 },
  actIcon: { fontSize: 26 },
  postMeta: { paddingHorizontal: 14, paddingBottom: 14 },
  postLikes: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  postCap: { color: '#ddd', fontSize: 13, lineHeight: 18 },
});
