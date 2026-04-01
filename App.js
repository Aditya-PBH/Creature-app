// FIXED & OPTIMIZED COMPLETE APP.JS (NO CRASH)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, StyleSheet,
  SafeAreaView, StatusBar, Share, Dimensions
} from 'react-native';

const W = Dimensions.get('window').width;

const STORIES = [
  { id: '0', name: 'My Story', avatar: 'https://i.pravatar.cc/100?img=10', own: true },
  { id: '1', name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=2' }
];

const POSTS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/400', caption: 'Nice place!', likes: 100 }
];

function doShare(msg) {
  Share.share({ message: msg });
}

function LoginScreen({ onLogin }) {
  return (
    <SafeAreaView style={st.bg}>
      <Text style={st.logo}>🐾</Text>
      <TouchableOpacity onPress={() => onLogin({ name: 'Aditya', username: 'adi72' })}>
        <Text style={st.btn}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FeedScreen() {
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <FlatList
      style={st.bg}
      ListHeaderComponent={() => (
        <FlatList
          horizontal
          data={STORIES}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={st.storyWrap}>
              <Image source={{ uri: item.avatar }} style={st.storyImg} />
              <Text style={st.txt}>{item.name}</Text>
            </View>
          )}
        />
      )}
      data={POSTS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Image source={{ uri: item.image }} style={{ height: 300 }} />
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
            <Text>{liked[item.id] ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      <FeedScreen />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  logo: { fontSize: 50, color: '#fff', textAlign: 'center' },
  btn: { color: '#fff', textAlign: 'center', marginTop: 20 },
  storyWrap: { alignItems: 'center', margin: 10 },
  storyImg: { width: 60, height: 60, borderRadius: 30 },
  txt: { color: '#fff' }
});
            
