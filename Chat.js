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

function getChatId(a, b) { return a < b ? a + '_' + b : b + '_' + a; }
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
      setUsers(snap.docs.map(function(d) { return d.data(); }).filter(function(u) { return u.uid !== uid; }));
      setLoading(false);
    });
  }, []);

  var filtered = users.filter(function(u) {
    var t = search.toLowerCase();
    return (u.username || '').toLowerCase().indexOf(t) !== -1 || (u.name || '').toLowerCase().indexOf(t) !== -1;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <Text style={s.title}>Messages</Text>
        <TouchableOpacity style={s.newBtn}><Text style={s.newBtnTxt}>✏️</Text></TouchableOpacity>
      </View>
      <View style={s.searchWrap}>
        <Text style={s.searchIco}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor="#bbb" value={search} onChangeText={setSearch} />
        {search.length > 0 ? <TouchableOpacity onPress={function() { setSearch(''); }}><Text style={s.clearBtn}>✕</Text></TouchableOpacity> : null}
      </View>
      {loading ? <ActivityIndicator color="#8B5CF6" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={function(item, i) { return item.uid || String(i); }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={s.empty}><Text style={s.emptyIco}>💬</Text><Text style={s.emptyTxt}>No users found</Text></View>}
          renderItem={function(info) {
            var item = info.item;
            return (
              <TouchableOpacity style={s.userRow} onPress={function() { onOpen(item, getChatId(uid, item.uid)); }}>
                <View style={s.avWrap}>
                  <Image source={{ uri: item.avatar || ('https://i.pravatar.cc/100?u=' + item.uid) }} style={s.userAv} />
                  <View style={s.onlineDot} />
                </View>
                <View style={s.userInfo}>
                  <Text style={s.userName}>{item.name || item.username}</Text>
                  <Text style={s.userHandle}>{'@' + item.username}</Text>
                </View>
                <View style={s.msgBtn}><Text style={s.msgBtnTxt}>Message</Text></View>
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
      var list = snap.docs.map(function(d) { var x = d.data(); x.id = d.id; return x; });
      setMessages(list);
      setTimeout(function() { if (listRef.current) listRef.current.scrollToEnd({ animated: true }); }, 100);
    });
  }, [chatId]);

  function sendMsg() {
    if (!text.trim() || sending) return;
    var msg = text.trim();
    setText('');
    setSending(true);
    addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: msg, senderUid: uid,
      senderName: me ? (me.displayName || 'User') : 'User',
      createdAt: serverTimestamp()
    }).catch(function(e) { console.error(e); }).finally(function() { setSending(false); });
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.roomHeader}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}><Text style={s.backTxt}>←</Text></TouchableOpacity>
        <Image source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }} style={s.roomAv} />
        <View style={s.roomInfo}>
          <Text style={s.roomName}>{otherUser.name || otherUser.username}</Text>
          <Text style={s.roomStatus}>🟢 Online</Text>
        </View>
        <TouchableOpacity style={s.callBtn}><Text>📞</Text></TouchableOpacity>
        <TouchableOpacity style={s.callBtn}><Text>📹</Text></TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={function(item) { return item.id; }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.msgList}
          style={{ backgroundColor: '#F8F4FF' }}
          ListEmptyComponent={<View style={s.empty}><Text style={s.emptyIco}>👋</Text><Text style={s.emptyTxt}>Say hello!</Text></View>}
          renderItem={function(info) {
            var item = info.item;
            var isMe = item.senderUid === uid;
            var t = item.createdAt && item.createdAt.toDate ? timeAgo(item.createdAt.toDate()) : '';
            return (
              <View style={isMe ? s.rowMe : s.rowOther}>
                {!isMe ? <Image source={{ uri: otherUser.avatar || ('https://i.pravatar.cc/100?u=' + otherUser.uid) }} style={s.msgAv} /> : null}
                <View style={isMe ? s.bubbleMe : s.bubbleOther}>
                  <Text style={isMe ? s.bubbleTxtMe : s.bubbleTxtOther}>{item.text}</Text>
                  {t ? <Text style={isMe ? s.timeMe : s.timeOther}>{t}</Text> : null}
                </View>
              </View>
            );
          }}
        />
        <View style={s.inputRow}>
          <TouchableOpacity style={s.attachBtn}><Text style={{ fontSize: 20 }}>📎</Text></TouchableOpacity>
          <TextInput style={s.msgInput} placeholder="Type a message..." placeholderTextColor="#bbb" value={text} onChangeText={setText} multiline={true} maxLength={500} />
          <TouchableOpacity style={text.trim() && !sending ? s.sendBtn : s.sendBtnOff} onPress={sendMsg} disabled={!text.trim() || sending}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.sendIco}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ChatScreen() {
  var [activeChat, setActiveChat] = useState(null);
  if (activeChat) {
    return <ChatRoom otherUser={activeChat.user} chatId={activeChat.chatId} onBack={function() { setActiveChat(null); }} />;
  }
  return <ChatList onOpen={function(user, chatId) { setActiveChat({ user: user, chatId: chatId }); }} />;
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0EAFF' },
  title: { color: '#1A1A2E', fontSize: 22, fontWeight: '900' },
  newBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3EEFF', justifyContent: 'center', alignItems: 'center' },
  newBtnTxt: { fontSize: 16 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3EEFF', borderRadius: 14, marginHorizontal: 14, marginVertical: 10, paddingHorizontal: 12 },
  searchIco: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#333', fontSize: 14, paddingVertical: 11 },
  clearBtn: { color: '#aaa', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIco: { fontSize: 48 },
  emptyTxt: { color: '#555', fontSize: 16, fontWeight: '600' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9F5FF', gap: 12 },
  avWrap: { position: 'relative' },
  userAv: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#8B5CF6' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
  userInfo: { flex: 1 },
  userName: { color: '#1A1A2E', fontWeight: '700', fontSize: 14 },
  userHandle: { color: '#aaa', fontSize: 12, marginTop: 2 },
  msgBtn: { borderWidth: 1.5, borderColor: '#8B5CF6', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#F3EEFF' },
  msgBtnTxt: { color: '#8B5CF6', fontWeight: '700', fontSize: 12 },
  roomHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0EAFF', gap: 10, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  backTxt: { color: '#8B5CF6', fontSize: 22, fontWeight: '700' },
  roomAv: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#8B5CF6' },
  roomInfo: { flex: 1 },
  roomName: { color: '#1A1A2E', fontWeight: '700', fontSize: 15 },
  roomStatus: { color: '#22C55E', fontSize: 11 },
  callBtn: { padding: 6 },
  msgList: { padding: 14, flexGrow: 1 },
  rowMe: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  rowOther: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, gap: 8 },
  msgAv: { width: 28, height: 28, borderRadius: 14 },
  bubbleMe: { backgroundColor: '#8B5CF6', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: W * 0.7, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  bubbleOther: { backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: W * 0.7, borderWidth: 1, borderColor: '#EDE8FF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  bubbleTxtMe: { color: '#fff', fontSize: 14, lineHeight: 20 },
  bubbleTxtOther: { color: '#1A1A2E', fontSize: 14, lineHeight: 20 },
  timeMe: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  timeOther: { color: '#bbb', fontSize: 10, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 1, borderTopColor: '#F0EAFF', gap: 8, backgroundColor: '#fff' },
  attachBtn: { padding: 6 },
  msgInput: { flex: 1, backgroundColor: '#F3EEFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: '#333', fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  sendBtnOff: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E0D4FF', justifyContent: 'center', alignItems: 'center' },
  sendIco: { color: '#fff', fontSize: 16, marginLeft: 2 }
});
  
