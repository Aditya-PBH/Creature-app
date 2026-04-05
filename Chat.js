import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';

var W = Dimensions.get('window').width;

function getChatId(uid1, uid2) {
  return uid1 < uid2 ? uid1 + '_' + uid2 : uid2 + '_' + uid1;
}

function timeAgo(date) {
  if (!date) return '';
  var s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

function ChatList(props) {
  var onOpen = props.onOpen;
  var [users, setUsers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var uid = auth.currentUser ? auth.currentUser.uid : '';

  useEffect(function() {
    getDocs(collection(db, 'users')).then(function(snap) {
      var list = snap.docs.map(function(d) { return d.data(); }).filter(function(u) { return u.uid !== uid; });
      setUsers(list);
      setLoading(false);
    });
  }, []);

  var filtered = users.filter(function(u) {
    var txt = search.toLowerCase();
    return (u.username || '').toLowerCase().indexOf(txt) !== -1 ||
           (u.name || '').toLowerCase().indexOf(txt) !== -1;
  });

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <View style={st.header}>
        <Text style={st.headerTitle}>Messages</Text>
      </View>
      <View style={st.searchBar}>
        <Text style={st.searchIco}>🔍</Text>
        <TextInput
          style={st.searchInput}
          placeholder="Search..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={function() { setSearch(''); }}>
            <Text style={st.clearBtn}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color="#8B5CF6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={function(item, i) { return item.uid || String(i); }}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Text style={st.emptyIco}>💬</Text>
              <Text style={st.emptyTxt}>No users found</Text>
            </View>
          }
          renderItem={function(info) {
            var item = info.item;
            var chatId = getChatId(uid, item.uid);
            return (
              <TouchableOpacity
                style={st.userRow}
                onPress={function() { onOpen(item, chatId); }}
              >
                <View style={st.avWrap}>
                  <Image
                    source={{ uri: item.avatar || ('https://i.pravatar.cc/100?u=' + item.uid) }}
                    style={st.userAv}
                  />
                  <View style={st.onlineDot} />
                </View>
                <View style={st.userInfo}>
                  <Text style={st.userName}>{item.name || item.username}</Text>
                  <Text style={st.userHandle}>{'@' + item.username}</Text>
                </View>
                <View style={st.msgBtn}>
                  <Text style={st.msgBtnTxt}>Message</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRoom(props) {
  var otherUser = props.otherUser;
  var chatId = props.chatId;
  var onBack = props.onBack;
  var [messages, setMessages] = useState([]);
  var [text, setText] = useState('');
  var [sending, setSending] = useState(false);
  var listRef = useRef(null);
  var uid = auth.currentUser ? auth.currentUser.uid : '';
  var me = auth.currentUser;

  useEffect(function() {
    var q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
      setMessages(list);
      setTimeout(function() {
        if (listRef.current) listRef.current.scrollToEnd({ animated: true });
      }, 100);
    });
  }, [chatId]);

  function sendMsg() {
    if (!text.trim() || sending) return;
    var msg = text.trim();
    setText('');
    setSending(true);
    addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: msg,
      senderUid: uid,
      senderName: me ? (me.displayName || 'User') : 'User',
      createdAt: serverTimestamp()
    })
    .catch(function(e) { console.error(e); })
    .finally(function() { setSending(false); });
  }

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <View style={st.roomHeader}>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Text style={st.backTxt}>←</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }}
          style={st.roomAv}
        />
        <View style={st.roomInfo}>
          <Text style={st.roomName}>{otherUser.name || otherUser.username}</Text>
          <Text style={st.roomStatus}>Online</Text>
        </View>
        <TouchableOpacity style={st.callBtn}><Text>📞</Text></TouchableOpacity>
        <TouchableOpacity style={st.callBtn}><Text>📹</Text></TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={function(item) { return item.id; }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.msgList}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Text style={st.emptyIco}>👋</Text>
              <Text style={st.emptyTxt}>Say hello!</Text>
            </View>
          }
          renderItem={function(info) {
            var item = info.item;
            var isMe = item.senderUid === uid;
            var timeStr = item.createdAt && item.createdAt.toDate ? timeAgo(item.createdAt.toDate()) : '';
            return (
              <View style={isMe ? st.rowMe : st.rowOther}>
                {!isMe ? (
                  <Image
                    source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }}
                    style={st.msgAv}
                  />
                ) : null}
                <View style={isMe ? st.bubbleMe : st.bubbleOther}>
                  <Text style={isMe ? st.bubbleTxtMe : st.bubbleTxtOther}>{item.text}</Text>
                  {timeStr ? <Text style={isMe ? st.timeMe : st.timeOther}>{timeStr}</Text> : null}
                </View>
              </View>
            );
          }}
        />

        <View style={st.inputRow}>
          <TouchableOpacity style={st.attachBtn}><Text style={{ fontSize: 20 }}>📎</Text></TouchableOpacity>
          <TextInput
            style={st.msgInput}
            placeholder="Type a message..."
            placeholderTextColor="#555"
            value={text}
            onChangeText={setText}
            multiline={true}
            maxLength={500}
          />
          <TouchableOpacity
            style={text.trim() && !sending ? st.sendBtn : st.sendBtnOff}
            onPress={sendMsg}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={st.sendIco}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ChatScreen() {
  var [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return (
      <ChatRoom
        otherUser={activeChat.user}
        chatId={activeChat.chatId}
        onBack={function() { setActiveChat(null); }}
      />
    );
  }
  return (
    <ChatList
      onOpen={function(user, chatId) { setActiveChat({ user: user, chatId: chatId }); }}
    />
  );
}

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E1E2E' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13131A', borderRadius: 12, marginHorizontal: 14, marginVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1E1E2E' },
  searchIco: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 11 },
  clearBtn: { color: '#888', fontSize: 15 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyIco: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#111', gap: 12 },
  avWrap: { position: 'relative' },
  userAv: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#8B5CF6', backgroundColor: '#222' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#0A0A0F' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  userHandle: { color: '#666', fontSize: 12, marginTop: 2 },
  msgBtn: { borderWidth: 1.5, borderColor: '#8B5CF6', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 },
  msgBtnTxt: { color: '#8B5CF6', fontWeight: '700', fontSize: 12 },
  roomHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1E1E2E', gap: 10 },
  backBtn: { padding: 4 },
  backTxt: { color: '#8B5CF6', fontSize: 22, fontWeight: '700' },
  roomAv: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#8B5CF6' },
  roomInfo: { flex: 1 },
  roomName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  roomStatus: { color: '#22C55E', fontSize: 11 },
  callBtn: { padding: 6 },
  msgList: { padding: 14, flexGrow: 1 },
  rowMe: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  rowOther: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, gap: 8 },
  msgAv: { width: 28, height: 28, borderRadius: 14 },
  bubbleMe: { backgroundColor: '#8B5CF6', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: W * 0.7 },
  bubbleOther: { backgroundColor: '#13131A', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: W * 0.7, borderWidth: 1, borderColor: '#1E1E2E' },
  bubbleTxtMe: { color: '#fff', fontSize: 14, lineHeight: 20 },
  bubbleTxtOther: { color: '#e0e0e0', fontSize: 14, lineHeight: 20 },
  timeMe: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  timeOther: { color: '#555', fontSize: 10, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 1, borderTopColor: '#1E1E2E', gap: 8 },
  attachBtn: { padding: 6 },
  msgInput: { flex: 1, backgroundColor: '#13131A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#1E1E2E' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2a2a3a', justifyContent: 'center', alignItems: 'center' },
  sendIco: { color: '#fff', fontSize: 16, marginLeft: 2 }
});
    
