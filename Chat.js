import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Dimensions, useColorScheme
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';

const { width } = Dimensions.get('window');

// ── Theme ────────────────────────────────────
function useTheme() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return {
    dark,
    bg:         dark ? '#0A0A0F' : '#F5F0FF',
    card:       dark ? '#13131A' : '#FFFFFF',
    border:     dark ? '#1E1E2E' : '#E8E0FF',
    text:       dark ? '#FFFFFF' : '#1A1A2E',
    subText:    dark ? '#666666' : '#8B8BA0',
    inputBg:    dark ? '#13131A' : '#FFFFFF',
    headerBg:   dark ? '#0D0D14' : '#FFFFFF',
    navBg:      dark ? '#0D0D14' : '#FFFFFF',
    bubbleMe:       '#8B5CF6',
    bubbleMeTxt:    '#FFFFFF',
    bubbleOther:    dark ? '#1E1E2E' : '#FFFFFF',
    bubbleOtherTxt: dark ? '#E0E0E0' : '#1A1A2E',
    searchBg:   dark ? '#13131A' : '#EDE8FF',
    onlineDot:  '#22C55E',
    purple:     '#8B5CF6',
    pink:       '#EC4899',
  };
}

function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((new Date() - date) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// ── Chat List ────────────────────────────────
function ChatList({ onOpen }) {
  const t = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      const all = snap.docs.map(d => d.data()).filter(u => u.uid !== uid);
      setUsers(all);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={t.dark ? 'light-content' : 'dark-content'}
        backgroundColor={t.headerBg}
      />

      {/* HEADER */}
      <View style={[ls.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <View>
          <Text style={[ls.title, { color: t.text }]}>Messages</Text>
          <Text style={[ls.subtitle, { color: t.subText }]}>
            {users.length} people
          </Text>
        </View>
        <View style={[ls.headerDot, { backgroundColor: t.purple }]} />
      </View>

      {/* SEARCH */}
      <View style={[ls.searchWrap, { backgroundColor: t.searchBg, borderColor: t.border }]}>
        <Text style={ls.searchIcon}>🔍</Text>
        <TextInput
          style={[ls.searchInput, { color: t.text }]}
          placeholder="Search people..."
          placeholderTextColor={t.subText}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: t.subText, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={ls.center}>
          <ActivityIndicator color={t.purple} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.uid || String(i)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={ls.center}>
              <Text style={ls.emptyIcon}>💬</Text>
              <Text style={[ls.emptyText, { color: t.text }]}>No users yet</Text>
              <Text style={[ls.emptySub, { color: t.subText }]}>Invite friends to Creature!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[ls.userRow, { borderBottomColor: t.border }]}
              onPress={() => onOpen(item, getChatId(uid, item.uid))}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={ls.avatarWrap}>
                <Image
                  source={{ uri: item.avatar || ('https://i.pravatar.cc/100?u=' + item.uid) }}
                  style={[ls.avatar, { borderColor: t.purple }]}
                />
                <View style={[ls.dot, { backgroundColor: t.onlineDot, borderColor: t.bg }]} />
              </View>

              {/* Info */}
              <View style={ls.userInfo}>
                <Text style={[ls.userName, { color: t.text }]}>
                  {item.name || item.username}
                </Text>
                <Text style={[ls.userSub, { color: t.subText }]}>
                  @{item.username}
                </Text>
              </View>

              {/* Button */}
              <View style={[ls.msgBtn, { borderColor: t.purple, backgroundColor: t.dark ? '#1E1E2E' : '#EDE8FF' }]}>
                <Text style={[ls.msgBtnTxt, { color: t.purple }]}>Message</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ── Chat Room ────────────────────────────────
function ChatRoom({ otherUser, chatId, onBack }) {
  const t = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);
  const uid = auth.currentUser?.uid;
  const me = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [chatId]);

  async function sendMsg() {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: msg,
        senderUid: uid,
        senderName: me?.displayName || 'User',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={t.dark ? 'light-content' : 'dark-content'}
        backgroundColor={t.headerBg}
      />

      {/* HEADER */}
      <View style={[rs.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={rs.backBtn}>
          <Text style={[rs.backTxt, { color: t.purple }]}>←</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }}
          style={[rs.avatar, { borderColor: t.purple }]}
        />
        <View style={rs.headerInfo}>
          <Text style={[rs.headerName, { color: t.text }]}>
            {otherUser.name || otherUser.username}
          </Text>
          <Text style={rs.headerStatus}>🟢 Online</Text>
        </View>
        <TouchableOpacity style={rs.callBtn}>
          <Text style={rs.callIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rs.callBtn}>
          <Text style={rs.callIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[rs.list, { backgroundColor: t.bg }]}
          ListEmptyComponent={
            <View style={rs.center}>
              <Text style={rs.emptyIcon}>👋</Text>
              <Text style={[rs.emptyTxt, { color: t.text }]}>Pehla message bhejo!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.senderUid === uid;
            return (
              <View style={[rs.msgRow, isMe ? rs.msgMe : rs.msgOther]}>
                {!isMe && (
                  <Image
                    source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }}
                    style={rs.msgAvatar}
                  />
                )}
                <View style={[
                  rs.bubble,
                  isMe
                    ? { backgroundColor: t.bubbleMe, borderBottomRightRadius: 4 }
                    : { backgroundColor: t.bubbleOther, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: t.border }
                ]}>
                  <Text style={[rs.bubbleTxt, { color: isMe ? t.bubbleMeTxt : t.bubbleOtherTxt }]}>
                    {item.text}
                  </Text>
                  <Text style={[rs.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.6)' : t.subText, textAlign: isMe ? 'right' : 'left' }]}>
                    {item.createdAt?.toDate ? timeAgo(item.createdAt.toDate()) : ''}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* INPUT */}
        <View style={[rs.inputRow, { backgroundColor: t.navBg, borderTopColor: t.border }]}>
          <TouchableOpacity style={rs.attachBtn}>
            <Text style={rs.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={[rs.input, { backgroundColor: t.inputBg, color: t.text, borderColor: t.border }]}
            placeholder="Type a message..."
            placeholderTextColor={t.subText}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[rs.sendBtn, (!text.trim() || sending) && rs.sendDisabled]}
            onPress={sendMsg}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={rs.sendIcon}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Main ─────────────────────────────────────
export default function ChatScreen() {
  const [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return (
      <ChatRoom
        otherUser={activeChat.user}
        chatId={activeChat.chatId}
        onBack={() => setActiveChat(null)}
      />
    );
  }

  return (
    <ChatList
      onOpen={(user, chatId) => setActiveChat({ user, chatId })}
    />
  );
}

// ── Styles ───────────────────────────────────
const ls = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2 },
  dot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7, borderWidth: 2,
  },
  userInfo: { flex: 1 },
  userName: { fontWeight: '700', fontSize: 15 },
  userSub: { fontSize: 13, marginTop: 2 },
  msgBtn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5,
  },
  msgBtnTxt: { fontWeight: '700', fontSize: 13 },
});

const rs = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, gap: 10,
  },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 24, fontWeight: '600' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  headerInfo: { flex: 1 },
  headerName: { fontWeight: '700', fontSize: 16 },
  headerStatus: { color: '#22C55E', fontSize: 12, marginTop: 1 },
  callBtn: { padding: 6 },
  callIcon: { fontSize: 20 },
  list: { padding: 16, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTxt: { fontSize: 18, fontWeight: '700' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgMe: { justifyContent: 'flex-end' },
  msgOther: { justifyContent: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: {
    maxWidth: width * 0.72, borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 6,
    elevation: 2,
  },
  bubbleTxt: { fontSize: 15, lineHeight: 21 },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, gap: 8, borderTopWidth: 1,
  },
  attachBtn: { padding: 8 },
  attachIcon: { fontSize: 22 },
  input: {
    flex: 1, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 100, borderWidth: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  sendDisabled: { backgroundColor: '#3a3a4a' },
  sendIcon: { color: '#fff', fontSize: 18, marginLeft: 2 },
});
