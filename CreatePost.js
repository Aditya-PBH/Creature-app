import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';

const W = Dimensions.get('window').width;

const SAMPLE_IMGS = [
  'https://picsum.photos/seed/c1/400/400',
  'https://picsum.photos/seed/c2/400/400',
  'https://picsum.photos/seed/c3/400/400',
  'https://picsum.photos/seed/c4/400/400',
  'https://picsum.photos/seed/c5/400/400',
  'https://picsum.photos/seed/c6/400/400',
];

export default function CreatePostScreen({ onDone }) {
  const [selected, setSelected] = useState(SAMPLE_IMGS[0]);
  const [caption, setCaption] = useState('');
  const [type, setType] = useState('post');

  const handleShare = () => {
    if (!caption.trim()) {
      Alert.alert('Ruko!', 'Caption likho pehle!');
      return;
    }
    Alert.alert('Posted! 🎉', 'Tera post share ho gaya!', [
      { text: 'OK', onPress: onDone }
    ]);
  };

  return (
    <ScrollView style={s.bg} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={onDone}>
          <Text style={{ color: '#ff3b5c', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.headerTxt}>New Post</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={{ color: '#ff3b5c', fontSize: 16, fontWeight: '700' }}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={s.typeRow}>
        {['post', 'reel', 'story'].map(t => (
          <TouchableOpacity key={t} style={[s.typeBtn, type === t && s.typeBtnActive]} onPress={() => setType(t)}>
            <Text style={[s.typeTxt, type === t && s.typeTxtActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Image source={{ uri: selected }} style={{ width: W, height: W }} resizeMode="cover" />

      <View style={s.captionRow}>
        <Image source={{ uri: 'https://i.pravatar.cc/40?img=10' }} style={s.smallAv} />
        <TextInput
          style={s.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={300}
        />
      </View>

      <Text style={s.galleryLabel}>Choose from gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 8 }}>
        {SAMPLE_IMGS.map(img => (
          <TouchableOpacity key={img} onPress={() => setSelected(img)} style={{ marginRight: 4 }}>
            <Image
              source={{ uri: img }}
              style={{ width: 80, height: 80, borderRadius: 8, borderWidth: selected === img ? 3 : 0, borderColor: '#ff3b5c' }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
        <Text style={s.shareBtnTxt}>Share Now 🚀</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  typeRow: { flexDirection: 'row', padding: 12 },
  typeBtn: { marginRight: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  typeBtnActive: { backgroundColor: '#ff3b5c', borderColor: '#ff3b5c' },
  typeTxt: { color: '#888', fontWeight: '600' },
  typeTxtActive: { color: '#fff' },
  captionRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  smallAv: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  captionInput: { flex: 1, color: '#fff', fontSize: 15, minHeight: 60 },
  galleryLabel: { color: '#888', fontSize: 13, padding: 12 },
  shareBtn: { margin: 16, backgroundColor: '#ff3b5c', borderRadius: 14, padding: 16, alignItems: 'center' },
  shareBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
