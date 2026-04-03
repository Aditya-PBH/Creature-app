// ➕ CreatePost.js — Photo upload with caption
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, SafeAreaView, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

const PINK = '#ff3b5c';

export default function CreatePostScreen({ onDone }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission chahiye!', 'Gallery access do.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission chahiye!', 'Camera access do.');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadPost = async () => {
    if (!image) return Alert.alert('❌', 'Pehle photo select karo!');
    setLoading(true);
    try {
      // Upload image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = `posts/${auth.currentUser.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      // Save post to Firestore
      await addDoc(collection(db, 'posts'), {
        uid: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'User',
        avatar: auth.currentUser.photoURL || '',
        imageUrl,
        caption: caption.trim(),
        location: location.trim(),
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      Alert.alert('✅', 'Post ho gaya!');
      setImage(null); setCaption(''); setLocation('');
      onDone?.();
    } catch (e) {
      console.error(e);
      Alert.alert('❌ Error', 'Post upload nahi hua. Try again!');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={onDone}>
          <Text style={s.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.title}>Naya Post</Text>
        <TouchableOpacity onPress={uploadPost} disabled={loading || !image}>
          <Text style={[s.share, (!image || loading) && s.shareDisabled]}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Image Preview */}
        <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
          {image
            ? <Image source={{ uri: image }} style={s.preview} />
            : <View style={s.imagePlaceholder}>
                <Text style={s.imagePlaceholderIcon}>🖼️</Text>
                <Text style={s.imagePlaceholderText}>Photo select karo</Text>
              </View>
          }
        </TouchableOpacity>

        {/* Buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity style={s.pickBtn} onPress={pickImage}>
            <Text style={s.pickBtnText}>📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pickBtn} onPress={takePhoto}>
            <Text style={s.pickBtnText}>📷 Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={s.inputWrap}>
          <Image
            source={{ uri: auth.currentUser?.photoURL || 'https://i.pravatar.cc/100' }}
            style={s.userAvatar}
          />
          <TextInput
            style={s.captionInput}
            placeholder="Caption likho..."
            placeholderTextColor="#555"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
        </View>

        {/* Location */}
        <TextInput
          style={s.locationInput}
          placeholder="📍 Location add karo (optional)"
          placeholderTextColor="#555"
          value={location}
          onChangeText={setLocation}
        />

        {/* Upload Button */}
        <TouchableOpacity
          style={[s.uploadBtn, (!image || loading) && s.uploadDisabled]}
          onPress={uploadPost}
          disabled={!image || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.uploadText}>🚀 Post Karo</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { color: '#aaa', fontSize: 15 },
  share: { color: PINK, fontSize: 15, fontWeight: '700' },
  shareDisabled: { color: '#444' },
  imagePicker: { width: '100%', aspectRatio: 1, backgroundColor: '#111' },
  preview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderIcon: { fontSize: 60 },
  imagePlaceholderText: { color: '#555', fontSize: 16, marginTop: 12 },
  btnRow: { flexDirection: 'row', gap: 12, padding: 16 },
  pickBtn: { flex: 1, backgroundColor: '#111', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  pickBtnText: { color: '#fff', fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, marginTop: 4 },
  captionInput: { flex: 1, color: '#fff', fontSize: 15, minHeight: 80, lineHeight: 22 },
  locationInput: { borderTopWidth: 0.5, borderTopColor: '#222', borderBottomWidth: 0.5, borderBottomColor: '#222', paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15 },
  uploadBtn: { margin: 16, backgroundColor: PINK, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  uploadDisabled: { backgroundColor: '#333' },
  uploadText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
    
