import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, FlatList, Image, StyleSheet,
  SafeAreaView, StatusBar, Share, Dimensions,
} from 'react-native';

var W = Dimensions.get('window').width;

var STORIES = [
  { id: '0', name: 'My Story', avatar: 'https://i.pravatar.cc/100?img=10', own: true },
  { id: '1', name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'Aman', avatar: 'https://i.pravatar.cc/100?img=3' },
];

var POSTS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/aa1/400/400', caption: 'Bhai ye jagah gajab hai! 🏔️', likes: 1234 },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/aa2/400/400', caption: 'Ghar ka khana best 🍛', likes: 987 },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/aa3/400/400', caption: 'Gym grind 💪', likes: 543 },
];

var REELS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/bb1/400/700', caption: 'Travel vibe 🔥', likes: 4821 },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/bb2/400/700', caption: 'Food lover 😋', likes: 9234 },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/bb3/400/700', caption: 'Gym grind 💪', likes: 3102 },
];

var CHATS = [
  { id: '1', name: 'Rahul Sharma', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', last: 'Bhai kal milte hain!', time: '10:33', unread: 0 },
  { id: '2', name: 'Priya Kapoor', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', last: 'Hey! 👋', time: '9:00', unread: 2 },
  { id: '3', name: 'Aman Verma', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', last: 'Photo dekhi kya?', time: 'Kal', unread: 5 },
];

var MSGS = [
  { id: '1', me: false, text: 'Bhai kya hal hai?' },
  { id: '2', me: true, text: 'Sab badiya yaar!' },
  { id: '3', me: false, text: 'Kal milna?' },
  { id: '4', me: true, text: 'Haan bhai zaroor!' },
];

function doShare(msg) {
  Share.share({ message: msg });
}

function LoginScreen(props) {
  var email = useState('');
  var pass = useState('');
  return (
    <SafeAreaView style={st.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={st.loginWrap}>
        <Text style={st.logo}>🐾</Text>
        <Text style={st.appName}>creature</Text>
        <Text style={st.tagline}>apna duniya, apni vibe</Text>
        <View style={st.card}>
          <TextInput style={st.input} placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={st.input} placeholder="Password" placeholderTextColor="#666" secureTextEntry={true} />
          <TouchableOpacity style={st.loginBtn} onPress={function() { props.onLogin({ name: 'Aditya', username: 'adi72' }); }}>
            <Text style={st.loginBtnTxt}>Login Karo</Text>
          </TouchableOpacity>
          <View style={st.divRow}>
            <View style={st.divLine} /><Text style={st.divTxt}>YA</Text><View style={st.divLine} />
          </View>
          <TouchableOpacity style={st.waBtn} onPress={function() { props.onLogin({ name: 'Aditya', username: 'adi72' }); }}>
            <Text style={st.waBtnTxt}>WhatsApp se login karo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedScreen() {
  var liked = useState({});
  function toggleLike(id) {
    liked[1](function(p) {
      var n = Object.assign({}, p);
      n[id] = !p[id];
      return n;
    });
  }
  return (
    <ScrollView style={st.bg}>
      <FlatList
        horizontal={true}
        data={STORIES}
        keyExtractor={function(i) { return i.id; }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        renderItem={function(ref) {
          var item = ref.item;
          return (
            <View style={st.storyWrap}>
              <View style={item.own ? st.storyOwn : st.storyActive}>
                <Image source={{ uri: item.avatar }} style={st.storyImg} />
              </View>
              <Text style={st.storyName} numberOfLines={1}>{item.name}</Text>
            </View>
          );
        }}
      />
      {POSTS.map(function(post) {
        return (
          <View key={post.id} style={st.postCard}>
            <View style={st.postHead}>
              <Image source={{ uri: post.avatar }} style={st.postAv} />
              <Text style={st.postUser}>{post.username}</Text>
            </View>
            <Image source={{ uri: post.image }} style={st.postImg} resizeMode="cover" />
            <View style={st.postActs}>
              <TouchableOpacity onPress={function() { toggleLike(post.id); }} style={st.actBtn}>
                <Text style={st.actIcon}>{liked[0][post.id] ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actBtn}>
                <Text style={st.actIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actBtn} onPress={function() { doShare('Creature pe dekh: ' + post.caption); }}>
                <Text style={st.actIcon}>📤</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
              <Text style={st.postLikes}>{post.likes + (liked[0][post.id] ? 1 : 0)} likes</Text>
              <Text style={st.postCap}>{post.username + '  ' + post.caption}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ReelsScreen() {
  var liked = useState({});
  function toggleLike(id) {
    liked[1](function(p) {
      var n = Object.assign({}, p);
      n[id] = !p[id];
      return n;
    });
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView pagingEnabled={true} showsVerticalScrollIndicator={false}>
        {REELS.map(function(reel) {
          return (
            <View key={reel.id} style={{ width: W, height: W * 1.77, position: 'relative' }}>
              <Image source={{ uri: reel.image }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
              <View style={{ position: 'absolute', right: 12, bottom: 120 }}>
                <TouchableOpacity style={{ alignItems: 'center', marginBottom: 20 }} onPress={function() { toggleLike(reel.id); }}>
                  <Text style={{ fontSize: 28 }}>{liked[0][reel.id] ? '❤️' : '🤍'}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>{reel.likes + (liked[0][reel.id] ? 1 : 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={function() { doShare('Creature pe Reel dekh: ' + reel.caption); }}>
                  <Text style={{ fontSize: 28 }}>📤</Text>
                </TouchableOpacity>
              </View>
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'@' + reel.username}</Text>
                <Text style={{ color: '#eee', marginTop: 4 }}>{reel.caption}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ChatListScreen(props) {
  return (
    <SafeAreaView style={st.bg}>
      <Text style={st.chatTitle}>Messages</Text>
      <FlatList
        data={CHATS}
        keyExtractor={function(i) { return i.id; }}
        renderItem={function(ref) {
          var item = ref.item;
          return (
            <TouchableOpacity style={st.chatRow} onPress={function() { props.onOpen(item); }}>
              <Image source={{ uri: item.avatar }} style={st.chatAv} />
              <View style={{ flex: 1 }}>
                <Text style={st.chatName}>{item.name}</Text>
                <Text style={st.chatLast} numberOfLines={1}>{item.last}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={st.chatTime}>{item.time}</Text>
                {item.unread > 0 && (
                  <View style={st.badge}>
                    <Text style={st.badgeTxt}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function ChatScreen(props) {
  var msgs = useState(MSGS);
  var text = useState('');
  function send() {
    if (!text[0].trim()) return;
    msgs[1](function(p) { return p.concat([{ id: String(Date.now()), me: true, text: text[0].trim() }]); });
    text[1]('');
  }
  return (
    <SafeAreaView style={st.bg}>
      <View style={st.chatHead}>
        <TouchableOpacity onPress={props.onBack} style={{ padding: 8 }}>
          <Text style={{ color: '#ff3b5c', fontSize: 18, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: props.chat.avatar }} style={st.chatHeadAv} />
        <Text style={st.chatHeadName}>{props.chat.name}</Text>
      </View>
      <FlatList
        data={msgs[0]}
        keyExtractor={function(i) { return i.id; }}
        contentContainerStyle={{ padding: 12 }}
        renderItem={function(ref) {
          var item = ref.item;
          return (
            <View style={[st.bubble, item.me ? st.bubbleMe : st.bubbleThem]}>
              <Text style={{ color: '#fff' }}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={st.inputRow}>
        <TextInput style={st.msgInput} placeholder="Message..." placeholderTextColor="#666" value={text[0]} onChangeText={text[1]} />
        <TouchableOpacity style={st.sendBtn} onPress={send}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen(props) {
  var grid = ['1','2','3','4','5','6','7','8','9'];
  return (
    <SafeAreaView style={st.bg}>
      <ScrollView>
        <View style={st.profHead}>
          <Image source={{ uri: 'https://i.pravatar.cc/100?img=10' }} style={st.profAv} />
          <View style={st.profStats}>
            <View style={st.stat}><Text style={st.statVal}>9</Text><Text style={st.statLbl}>Posts</Text></View>
            <View style={st.stat}><Text style={st.statVal}>1.2K</Text><Text style={st.statLbl}>Followers</Text></View>
            <View style={st.stat}><Text style={st.statVal}>342</Text><Text style={st.statLbl}>Following</Text></View>
          </View>
        </View>
        <Text style={st.profName}>{props.user.name}</Text>
        <Text style={st.profBio}>Creature user | India 🇮🇳</Text>
        <View style={st.profBtns}>
          <TouchableOpacity style={st.editBtn}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.shareBtn} onPress={function() { doShare('Creature pe mera profile dekh! @' + props.user.username); }}>
            <Text style={{ color: '#25D366', fontWeight: '600' }}>Share</Text>
          </TouchableOpacity>
        </View>
        <View style={st.grid}>
          {grid.map(function(n) {
            return (
              <Image key={n} source={{ uri: 'https://picsum.photos/seed/gg' + n + '/200/200' }} style={st.gridImg} />
            );
          })}
        </View>
        <TouchableOpacity style={st.logoutBtn} onPress={props.onLogout}>
          <Text style={{ color: '#ff3b5c', fontWeight: '700' }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

var TABS = [
  { key: 'feed', icon: '🏠', label: 'Home' },
  { key: 'reels', icon: '🎬', label: 'Reels' },
  { key: 'chat', icon: '💬', label: 'Chat' },
  { key: 'profile', icon: '👤', label: 'Profile' },
];

export default function App() {
  var user = useState(null);
  var tab = useState('feed');
  var openChat = useState(null);

  if (!user[0]) {
    return React.createElement(LoginScreen, { onLogin: user[1] });
  }

  if (openChat[0]) {
    return React.createElement(ChatScreen, { chat: openChat[0], onBack: function() { openChat[1](null); } });
  }

  return (
    <SafeAreaView style={st.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {tab[0] !== 'reels' && (
        <View style={st.header}>
          <Text style={st.headerLogo}>🐾 creature</Text>
          <TouchableOpacity onPress={function() { tab[1]('chat'); }}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1 }}>
        {tab[0] === 'feed' && React.createElement(FeedScreen, null)}
        {tab[0] === 'reels' && React.createElement(ReelsScreen, null)}
        {tab[0] === 'chat' && React.createElement(ChatListScreen, { onOpen: openChat[1] })}
        {tab[0] === 'profile' && React.createElement(ProfileScreen, { user: user[0], onLogout: function() { user[1](null); } })}
      </View>
      <View style={st.nav}>
        {TABS.map(function(t) {
          return (
            <TouchableOpacity key={t.key} style={st.navItem} onPress={function() { tab[1](t.key); }}>
              <Text style={tab[0] === t.key ? st.navIconActive : st.navIcon}>{t.icon}</Text>
              <Text style={tab[0] === t.key ? st.navLblActive : st.navLbl}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

var st = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a0a0a' },
  loginWrap: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 60, textAlign: 'center' },
  appName: { fontSize: 34, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  tagline: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#141414', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222' },
  input: { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15 },
  loginBtn: { backgroundColor: '#ff3b5c', borderRadius: 12, padding: 15, alignItems: 'center' },
  loginBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  divRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: '#333' },
  divTxt: { color: '#666', marginHorizontal: 12 },
  waBtn: { backgroundColor: '#0a1f0a', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1a3a1a' },
  waBtnTxt: { color: '#25D366', fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  headerLogo: { fontSize: 20, fontWeight: '900', color: '#fff' },
  storyWrap: { alignItems: 'center', marginRight: 14, width: 66 },
  storyActive: { borderWidth: 2.5, borderColor: '#ff3b5c', borderRadius: 34, padding: 2 },
  storyOwn: { borderWidth: 2.5, borderColor: '#555', borderRadius: 34, padding: 2 },
  storyImg: { width: 58, height: 58, borderRadius: 29 },
  storyName: { color: '#ccc', fontSize: 11, marginTop: 4, textAlign: 'center' },
  postCard: { marginBottom: 2 },
  postHead: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAv: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  postUser: { color: '#fff', fontWeight: '700' },
  postImg: { width: '100%', height: W },
  postActs: { flexDirection: 'row', padding: 12 },
  actBtn: { marginRight: 16 },
  actIcon: { fontSize: 26 },
  postLikes: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  postCap: { color: '#ddd', fontSize: 13 },
  chatTitle: { color: '#fff', fontSize: 22, fontWeight: '900', padding: 16 },
  chatRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  chatAv: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatName: { color: '#fff', fontWeight: '700' },
  chatLast: { color: '#888', fontSize: 13 },
  chatTime: { color: '#666', fontSize: 12 },
  badge: { backgroundColor: '#ff3b5c', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chatHead: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  chatHeadAv: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  chatHeadName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMe: { backgroundColor: '#ff3b5c', alignSelf: 'flex-end' },
  bubbleThem: { backgroundColor: '#1e1e1e', alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 0.5, borderTopColor: '#1a1a1a' },
  msgInput: { flex: 1, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  sendBtn: { backgroundColor: '#ff3b5c', borderRadius: 20, paddingHorizontal: 16, marginLeft: 8, justifyContent: 'center' },
  profHead: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  profAv: { width: 86, height: 86, borderRadius: 43, borderWidth: 3, borderColor: '#ff3b5c' },
  profStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { color: '#fff', fontWeight: '900', fontSize: 18 },
  statLbl: { color: '#888', fontSize: 12 },
  profName: { color: '#fff', fontWeight: '700', fontSize: 16, paddingHorizontal: 20 },
  profBio: { color: '#aaa', fontSize: 13, paddingHorizontal: 20, marginBottom: 14 },
  profBtns: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  editBtn: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  shareBtn: { backgroundColor: '#0a1f0a', borderRadius: 10, padding: 10, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#25D366' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridImg: { width: W / 3, height: W / 3 },
  logoutBtn: { margin: 20, backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, alignItems: 'center' },
  nav: { flexDirection: 'row', backgroundColor: '#0a0a0a', borderTopWidth: 0.5, borderTopColor: '#1a1a1a', paddingBottom: 6 },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22 },
  navIconActive: { fontSize: 24 },
  navLbl: { color: '#555', fontSize: 10, marginTop: 2 },
  navLblActive: { color: '#ff3b5c', fontWeight: '700', fontSize: 10, marginTop: 2 },
});
  
