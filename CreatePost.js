import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, ScrollView,
  StatusBar, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

export default function CreatePostScreen(props) {
  var onDone = props.onDone;
  var [media, setMedia] = useState(null);
  var [caption, setCaption] = useState('');
  var [location, setLocation] = useState('');
  var [loading, setLoading] = useState(false);
  var [progress, setProgress] = useState('');

  function pickGallery() {
    ImagePicker.requestMediaLibraryPermissionsAsync()
      .then(function(perm) {
        if (!perm.granted) {
          Alert.alert('Permission chahiye!', 'Gallery access allow karo settings mein.');
          return null;
        }
        return ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7
        });
      })
      .then(function(result) {
        if (result && !result.canceled && result.assets && result.assets.length > 0) {
          setMedia(result.assets[0]);
        }
      })
      .catch(function(e) { console.error(e); });
  }

  function openCamera() {
    ImagePicker.requestCameraPermissionsAsync()
      .then(function(perm) {
        if (!perm.granted) {
          Alert.alert('Permission chahiye!', 'Camera access allow karo settings mein.');
          return null;
        }
        return ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7
        });
      })
      .then(function(result) {
        if (result && !result.canceled && result.assets && result.assets.length > 0) {
          setMedia(result.assets[0]);
        }
      })
      .catch(function(e) { console.error(e); });
  }

  function doPost() {
    if (!media) {
      Alert.alert('Error', 'Pehle photo ya video select karo!');
      return;
    }
    var user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Login karo pehle!');
      return;
    }

    setLoading(true);
    setProgress('Uploading...');

    var isVideo = media.type === 'video';
    var ext = isVideo ? 'mp4' : 'jpg';
    var folder = isVideo ? 'videos' : 'images';
    var filename = folder + '/' + user.uid + '/' + Date.now() + '.' + ext;
    var storageRef = ref(storage, filename);

    fetch(media.uri)
      .then(function(res) { return res.blob(); })
      .then(function(blob) {
        setProgress('Uploading file...');
        return uploadBytes(storageRef, blob);
      })
      .then(function() {
        setProgress('Getting URL...');
        return getDownloadURL(storageRef);
      })
      .then(function(downloadUrl) {
        setProgress('Saving post...');
        var postData = {
          uid: user.uid,
          username: user.displayName || 'User',
          avatar: user.photoURL || '',
          imageUrl: downloadUrl,
          isVideo: isVideo,
          caption: caption.trim(),
          location: location.trim(),
          likes: [],
          comments: [],
          createdAt: serverTimestamp()
        };

        if (isVideo) {
          postData.videoUrl = downloadUrl;
        }

        return addDoc(collection(db, 'posts'), postData);
      })
      .then(function() {
        setProgress('');
        Alert.alert('Post ho gaya!', 'Teri post feed mein aa gayi!');
        setMedia(null);
        setCaption('');
        setLocation('');
        if (onDone) onDone();
      })
      .catch(function(e) {
        console.error(e);
        setProgress('');
        Alert.alert('Error', 'Upload fail! Internet check karo aur try again.');
      })
      .finally(function() { setLoading(false); });
  }

  var isVideo = media && media.type === 'video';

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <View style={st.header}>
        <TouchableOpacity onPress={onDone} disabled={loading}>
          <Text style={st.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={st.title}>New Post</Text>
        <TouchableOpacity onPress={doPost} disabled={!media || loading}>
          <Text style={!media || loading ? st.shareOff : st.share}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* MEDIA PREVIEW */}
        <TouchableOpacity style={st.previewBox} onPress={pickGallery} disabled={loading}>
          {media ? (
            <View style={st.previewWrap}>
              <Image source={{ uri: media.uri }} style={st.preview} resizeMode="cover" />
              {isVideo ? (
                <View style={st.videoTag}>
                  <Text style={st.videoTagTxt}>🎬 Video</Text>
                </View>
              ) : null}
              {!loading ? (
                <View style={st.changeTag}>
                  <Text style={st.changeTxt}>Change</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={st.placeholder}>
              <Text style={st.phIco}>📸</Text>
              <Text style={st.phTitle}>Add Photo or Video</Text>
              <Text style={st.phSub}>Tap to select from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* PICK BUTTONS */}
        <View style={st.pickRow}>
          <TouchableOpacity style={st.pickBtn} onPress={pickGallery} disabled={loading}>
            <Text style={st.pickIco}>🖼️</Text>
            <Text style={st.pickLbl}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.pickBtn} onPress={openCamera} disabled={loading}>
            <Text style={st.pickIco}>📷</Text>
            <Text style={st.pickLbl}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* LOADING PROGRESS */}
        {loading ? (
          <View style={st.progressWrap}>
            <ActivityIndicator color="#8B5CF6" size="large" />
            <Text style={st.progressTxt}>{progress}</Text>
          </View>
        ) : null}

        {/* CAPTION */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>Caption</Text>
          <TextInput
            style={st.captionBox}
            placeholder="Kuch likho..."
            placeholderTextColor="#555"
            value={caption}
            onChangeText={setCaption}
            multiline={true}
            maxLength={500}
            editable={!loading}
          />
          <Text style={st.charCount}>{caption.length + '/500'}</Text>
        </View>

        {/* LOCATION */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>Location (Optional)</Text>
          <TextInput
            style={st.locationBox}
            placeholder="📍 Location add karo"
            placeholderTextColor="#555"
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />
        </View>

        {/* POST BUTTON */}
        <TouchableOpacity
          style={!media || loading ? st.postBtnOff : st.postBtn}
          onPress={doPost}
          disabled={!media || loading}
        >
          {loading ? (
            <View style={st.postBtnInner}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={st.postBtnTxt}>{progress || 'Uploading...'}</Text>
            </View>
          ) : (
            <Text style={st.postBtnTxt}>🚀 Post Karo</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E'
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { color: '#aaa', fontSize: 14 },
  share: { color: '#8B5CF6', fontSize: 15, fontWeight: '700' },
  shareOff: { color: '#333', fontSize: 15 },
  previewBox: {
    width: '100%', aspectRatio: 1,
    backgroundColor: '#13131A',
    justifyContent: 'center', alignItems: 'center'
  },
  previewWrap: { width: '100%', height: '100%' },
  preview: { width: '100%', height: '100%' },
  videoTag: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5
  },
  videoTagTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  changeTag: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(139,92,246,0.85)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6
  },
  changeTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  placeholder: { alignItems: 'center', gap: 8 },
  phIco: { fontSize: 72 },
  phTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  phSub: { color: '#555', fontSize: 13 },
  pickRow: { flexDirection: 'row', gap: 12, padding: 16 },
  pickBtn: {
    flex: 1, backgroundColor: '#13131A', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E1E2E', gap: 6
  },
  pickIco: { fontSize: 32 },
  pickLbl: { color: '#fff', fontWeight: '600', fontSize: 13 },
  progressWrap: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  progressTxt: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  captionBox: {
    backgroundColor: '#13131A', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 14, minHeight: 90,
    borderWidth: 1, borderColor: '#1E1E2E', lineHeight: 22
  },
  charCount: { color: '#444', fontSize: 11, textAlign: 'right', marginTop: 4 },
  locationBox: {
    backgroundColor: '#13131A', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: '#1E1E2E'
  },
  postBtn: {
    marginHorizontal: 16, backgroundColor: '#8B5CF6',
    borderRadius: 16, paddingVertical: 16, alignItems: 'center'
  },
  postBtnOff: {
    marginHorizontal: 16, backgroundColor: '#1a1a2a',
    borderRadius: 16, paddingVertical: 16, alignItems: 'center'
  },
  postBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
      
