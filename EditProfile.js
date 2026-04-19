import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image, Alert, SafeAreaView, StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';

var BG = '#000000';
var SURFACE = '#111111';
var SURFACE2 = '#1A1A1A';
var BORDER = '#2A2A2A';
var TEXT = '#FFFFFF';
var MUTED = '#666666';
var SECONDARY = '#AAAAAA';
var PRIMARY = '#0095F6';
var ACCENT = '#FF385C';

export default function EditProfileScreen(props) {
  var onBack = props.onBack;
  var user = auth.currentUser;

  var [form, setForm] = useState({
    fullName: user ? (user.displayName || '') : '',
    username: props.username || '',
    bio: props.bio || '',
    website: props.website || '',
    isPrivate: props.isPrivate || false
  });
  var [avatar, setAvatar] = useState(user ? (user.photoURL || '') : '');
  var [saving, setSaving] = useState(false);

  function update(key, val) {
    var newForm = {};
    newForm.fullName = form.fullName;
    newForm.username = form.username;
    newForm.bio = form.bio;
    newForm.website = form.website;
    newForm.isPrivate = form.isPrivate;
    newForm[key] = val;
    setForm(newForm);
  }

  function pickAvatar() {
    ImagePicker.requestMediaLibraryPermissionsAsync().then(function(perm) {
      if (!perm.granted) { Alert.alert('Permission', 'Gallery access chahiye!'); return; }
      return ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8
      });
    }).then(function(result) {
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    });
  }

  function handleSave() {
    if (!form.fullName.trim()) { Alert.alert('Error', 'Name daalo!'); return; }
    setSaving(true);
    var uid = user ? user.uid : null;
    if (!uid) { setSaving(false); return; }

    var promises = [];

    // Update Firebase Auth display name
    promises.push(updateProfile(user, { displayName: form.fullName.trim() }));

    // Update Firestore
    promises.push(updateDoc(doc(db, 'users', uid), {
      name: form.fullName.trim(),
      username: form.username.trim().toLowerCase(),
      bio: form.bio.trim(),
      website: form.website.trim(),
      isPrivate: form.isPrivate,
      updatedAt: new Date().toISOString()
    }));

    Promise.all(promises)
      .then(function() {
        Alert.alert('Saved!', 'Profile update ho gaya!');
        if (onBack) onBack();
      })
      .catch(function(e) {
        Alert.alert('Error', 'Save nahi hua. Try again!');
      })
      .finally(function() { setSaving(false); });
  }

  function Field(fprops) {
    return (
      <View style={s.field}>
        <Text style={s.fieldLabel}>{fprops.label}</Text>
        <TextInput
          style={[s.fieldInput, fprops.multiline && s.fieldInputMulti]}
          value={fprops.value}
          onChangeText={fprops.onChange}
          placeholder={fprops.placeholder}
          placeholderTextColor={MUTED}
          keyboardType={fprops.keyboard || 'default'}
          autoCapitalize={fprops.caps || 'sentences'}
          multiline={fprops.multiline || false}
          numberOfLines={fprops.lines || 1}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onBack} style={s.backBtn}>
              <Text style={s.cancelTxt}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={s.doneBtn}>
              {saving ? (
                <ActivityIndicator color={PRIMARY} size="small" />
              ) : (
                <Text style={s.doneTxt}>Done</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <TouchableOpacity style={s.avatarSection} onPress={pickAvatar} activeOpacity={0.8}>
            <View style={s.avatarRing}>
              <Image
                source={{ uri: avatar || ('https://i.pravatar.cc/92?u=' + (user ? user.uid : 'me')) }}
                style={s.avatar}
              />
            </View>
            <Text style={s.changeAvatarTxt}>Change Profile Photo</Text>
          </TouchableOpacity>

          {/* Fields */}
          <View style={s.fieldsWrap}>
            <Field label="Name" value={form.fullName} onChange={function(v) { update('fullName', v); }} placeholder="Your full name" caps="words" />
            <Field label="Username" value={form.username} onChange={function(v) { update('username', v); }} placeholder="username" caps="none" />
            <Field label="Bio" value={form.bio} onChange={function(v) { update('bio', v); }} placeholder="Tell people about yourself..." multiline={true} lines={3} />
            <Field label="Website" value={form.website} onChange={function(v) { update('website', v); }} placeholder="https://yoursite.com" keyboard="url" caps="none" />
          </View>

          {/* Private Toggle */}
          <View style={s.toggleWrap}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Private Account</Text>
              <Text style={s.toggleSub}>Only approved followers can see your content</Text>
            </View>
            <TouchableOpacity
              onPress={function() { update('isPrivate', !form.isPrivate); }}
              style={[s.toggle, form.isPrivate && s.toggleActive]}>
              <View style={[s.toggleThumb, form.isPrivate && s.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.saveBtnTxt}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  backBtn: { padding: 4 },
  cancelTxt: { color: SECONDARY, fontSize: 15 },
  headerTitle: { color: TEXT, fontSize: 17, fontWeight: '700' },
  doneBtn: { minWidth: 50, alignItems: 'flex-end' },
  doneTxt: { color: PRIMARY, fontSize: 16, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarRing: { width: 92, height: 92, borderRadius: 46, padding: 3, marginBottom: 12, backgroundColor: ACCENT },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: BG, backgroundColor: SURFACE2 },
  changeAvatarTxt: { color: PRIMARY, fontSize: 15, fontWeight: '600' },
  fieldsWrap: { paddingHorizontal: 16 },
  field: { marginBottom: 22 },
  fieldLabel: { color: MUTED, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { color: TEXT, fontSize: 15, borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 10 },
  fieldInputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  toggleWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: BORDER, marginTop: 8 },
  toggleInfo: { flex: 1, marginRight: 16 },
  toggleLabel: { color: TEXT, fontSize: 15, fontWeight: '600' },
  toggleSub: { color: MUTED, fontSize: 12, marginTop: 3 },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', paddingHorizontal: 3 },
  toggleActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: MUTED },
  toggleThumbActive: { backgroundColor: TEXT, alignSelf: 'flex-end' },
  saveBtn: { margin: 16, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnTxt: { color: TEXT, fontWeight: '700', fontSize: 16 }
});
