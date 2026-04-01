import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Share,
  Dimensions,
  Alert,
} from 'react-native';

var W = Dimensions.get('window').width;

var STORIES = [
  { id: '0', name: 'My Story', avatar: 'https://i.pravatar.cc/100?img=10', own: true },
  { id: '1', name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'Aman', avatar: 'https://i.pravatar.cc/100?img=3' },
];

var POSTS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/p1/400/400', caption: 'Bhai ye jagah gajab hai! 🏔️', likes: 1234 },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/p2/400/400', caption: 'Ghar ka khana best 🍛', likes: 987 },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/p3/400/400', caption: 'Gym grind 💪', likes: 543 },
];

var REELS = [
  { id: '1', username: 'rahul_s', avatar: 'https://i.pravatar.cc/60?img=1', image: 'https://picsum.photos/seed/r1/400/700', caption: 'Travel vibe 🔥', likes: 4821 },
  { id: '2', username: 'priya_k', avatar: 'https://i.pravatar.cc/60?img=2', image: 'https://picsum.photos/seed/r2/400/700', caption: 'Food lover 😋', likes: 9234 },
  { id: '3', username: 'aman_v', avatar: 'https://i.pravatar.cc/60?img=3', image: 'https://picsum.photos/seed/r3/400/700', caption: 'Gym grind 💪', likes: 3102 },
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
  try {
    Share.share({ message: msg });
  } catch (e) {
    Alert.alert('Error', e.message);
  }
}

// LOGIN SCREEN
function LoginScreen(props) {
  var onLogin = props.onLogin;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <Text style={styles.loginLogo}>🐾</Text>
        <Text style={styles.loginAppName}>creature</Text>
        <Text style={styles.loginTagline}>apna duniya, apni vibe</Text>
        <View style={styles.loginCard}>
          <TextInput
            style={styles.loginInput}
            placeholder="Email"
            placeholderTextColor="#666666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.loginInput}
            placeholder="Password"
            placeholderTextColor="#666666"
            secureTextEntry={true}
          />
          <TouchableOpacity
            style={styles.loginButton}
            onPress={function() {
              onLogin({ name: 'Aditya', username: 'adi72' });
            }}
          >
            <Text style={styles.loginButtonText}>Login Karo</Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>YA</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.waButton}
            onPress={function() {
              onLogin({ name: 'Aditya', username: 'adi72' });
            }}
          >
            <Text style={styles.waButtonText}>WhatsApp se Login Karo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// FEED SCREEN
function FeedScreen() {
  var likedState = useState({});
  var liked = likedState[0];
  var setLiked = likedState[1];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <FlatList
        horizontal={true}
        data={STORIES}
        keyExtractor={function(item) { return item.id; }}
        showsHorizontalScrollIndicator={false}
        style={styles.storiesBar}
        renderItem={function(info) {
          var item = info.item;
          return (
            <View style={styles.storyItem}>
              <View style={item.own ? styles.storyRingOwn : styles.storyRingActive}>
                <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
            </View>
          );
        }}
      />
      {POSTS.map(function(post) {
        var isLiked = liked[post.id] ? true : false;
        return (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
              <Text style={styles.postUsername}>{post.username}</Text>
            </View>
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={function() {
                  var next = {};
                  for (var k in liked) { next[k] = liked[k]; }
                  next[post.id] = !liked[post.id];
                  setLiked(next);
                }}
              >
                <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={function() {
                  doShare('Creature pe dekh: ' + post.caption + ' @' + post.username);
                }}
              >
                <Text style={styles.actionIcon}>📤</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.postLikes}>{post.likes + (isLiked ? 1 : 0)} likes</Text>
              <Text style={styles.postCaption}>{post.username + '  ' + post.caption}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// REELS SCREEN
function ReelsScreen() {
  var likedState = useState({});
  var liked = likedState[0];
  var setLiked = likedState[1];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView pagingEnabled={true} showsVerticalScrollIndicator={false}>
        {REELS.map(function(reel) {
          var isLiked = liked[reel.id] ? true : false;
          var reelHeight = W * 1.77;
          return (
            <View key={reel.id} style={{ width: W, height: reelHeight }}>
              <Image
                source={{ uri: reel.image }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                resizeMode="cover"
              />
              <View style={styles.reelActions}>
                <TouchableOpacity
                  style={styles.reelActionBtn}
                  onPress={function() {
                    var next = {};
                    for (var k in liked) { next[k] = liked[k]; }
                    next[reel.id] = !liked[reel.id];
                    setLiked(next);
                  }}
                >
                  <Text style={styles.reelActionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                  <Text style={styles.reelActionCount}>{reel.likes + (isLiked ? 1 : 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reelActionBtn}
                  onPress={function() {
                    doShare('Creature pe Reel dekh: ' + reel.caption);
                  }}
                >
                  <Text style={styles.reelActionIcon}>📤</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reelInfo}>
                <Text style={styles.reelUsername}>{'@' + reel.username}</Text>
                <Text style={styles.reelCaption}>{reel.caption}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// CHAT LIST SCREEN
function ChatListScreen(props) {
  var onOpen = props.onOpen;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.chatListTitle}>Messages</Text>
      <FlatList
        data={CHATS}
        keyExtractor={function(item) { return item.id; }}
        renderItem={function(info) {
          var item = info.item;
          return (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={function() { onOpen(item); }}
            >
              <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatLastMsg} numberOfLines={1}>{item.last}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.chatTime}>{item.time}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
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

// CHAT ROOM SCREEN
function ChatRoomScreen(props) {
  var chat = props.chat;
  var onBack = props.onBack;
  var msgsState = useState(MSGS);
  var msgs = msgsState[0];
  var setMsgs = msgsState[1];
  var textState = useState('');
  var text = textState[0];
  var setText = textState[1];

  function sendMsg() {
    if (!text.trim()) return;
    var newMsg = { id: String(Date.now()), me: true, text: text.trim() };
    setMsgs(msgs.concat([newMsg]));
    setText('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatRoomHeader}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Text style={{ color: '#ff3b5c', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: chat.avatar }} style={styles.chatRoomAvatar} />
        <Text style={styles.chatRoomName}>{chat.name}</Text>
      </View>
      <FlatList
        data={msgs}
        keyExtractor={function(item) { return item.id; }}
        contentContainerStyle={{ padding: 12 }}
        renderItem={function(info) {
          var item = info.item;
          return (
            <View style={[styles.msgBubble, item.me ? styles.msgBubbleMe : styles.msgBubbleThem]}>
              <Text style={{ color: '#ffffff' }}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.msgInputRow}>
        <TextInput
          style={styles.msgInput}
          placeholder="Message..."
          placeholderTextColor="#666666"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMsg}>
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// PROFILE SCREEN
function ProfileScreen(props) {
  var user = props.user;
  var onLogout = props.onLogout;
  var gridNums = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=10' }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>9</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>342</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileBio}>Creature user | India 🇮🇳</Text>
        <View style={styles.profileButtons}>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={{ color: '#ffffff', fontWeight: '600' }}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareProfileBtn}
            onPress={function() {
              doShare('Creature pe mera profile dekh! @' + user.username);
            }}
          >
            <Text style={{ color: '#25D366', fontWeight: '600' }}>Share</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileGrid}>
          {gridNums.map(function(n) {
            return (
              <Image
                key={n}
                source={{ uri: 'https://picsum.photos/seed/grid' + n + '/200/200' }}
                style={styles.gridImage}
              />
            );
          })}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={{ color: '#ff3b5c', fontWeight: '700', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// MAIN APP
export default function App() {
  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];

  var tabState = useState('feed');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var chatState = useState(null);
  var openChat = chatState[0];
  var setOpenChat = chatState[1];

  if (!user) {
    return React.createElement(LoginScreen, { onLogin: setUser });
  }

  if (openChat) {
    return React.createElement(ChatRoomScreen, {
      chat: openChat,
      onBack: function() { setOpenChat(null); }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {activeTab !== 'reels' && (
        <View style={styles.appHeader}>
          <Text style={styles.appHeaderLogo}>🐾 creature</Text>
          <TouchableOpacity onPress={function() { setActiveTab('chat'); }}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {activeTab === 'feed' && React.createElement(FeedScreen, null)}
        {activeTab === 'reels' && React.createElement(ReelsScreen, null)}
        {activeTab === 'chat' && React.createElement(ChatListScreen, { onOpen: setOpenChat })}
        {activeTab === 'profile' && React.createElement(ProfileScreen, { user: user, onLogout: function() { setUser(null); } })}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={function() { setActiveTab('feed'); }}>
          <Text style={activeTab === 'feed' ? styles.navIconActive : styles.navIcon}>🏠</Text>
          <Text style={activeTab === 'feed' ? styles.navLabelActive : styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={function() { setActiveTab('reels'); }}>
          <Text style={activeTab === 'reels' ? styles.navIconActive : styles.navIcon}>🎬</Text>
          <Text style={activeTab === 'reels' ? styles.navLabelActive : styles.navLabel}>Reels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={function() { setActiveTab('chat'); }}>
          <Text style={activeTab === 'chat' ? styles.navIconActive : styles.navIcon}>💬</Text>
          <Text style={activeTab === 'chat' ? styles.navLabelActive : styles.navLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={function() { setActiveTab('profile'); }}>
          <Text style={activeTab === 'profile' ? styles.navIconActive : styles.navIcon}>👤</Text>
          <Text style={activeTab === 'profile' ? styles.navLabelActive : styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  // LOGIN
  loginScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  loginLogo: { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  loginAppName: { fontSize: 36, fontWeight: '900', color: '#ffffff', textAlign: 'center', letterSpacing: 2, marginBottom: 4 },
  loginTagline: { fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 32 },
  loginCard: { backgroundColor: '#141414', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#222222' },
  loginInput: { backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15 },
  loginButton: { backgroundColor: '#ff3b5c', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  loginButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333333' },
  dividerText: { color: '#666666', marginHorizontal: 12 },
  waButton: { backgroundColor: '#0a1f0a', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1a3a1a' },
  waButtonText: { color: '#25D366', fontWeight: '600' },

  // HEADER
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  appHeaderLogo: { fontSize: 20, fontWeight: '900', color: '#ffffff' },

  // STORIES
  storiesBar: { paddingVertical: 10 },
  storyItem: { alignItems: 'center', marginHorizontal: 8, width: 68 },
  storyRingActive: { borderWidth: 2, borderColor: '#ff3b5c', borderRadius: 34, padding: 2 },
  storyRingOwn: { borderWidth: 2, borderColor: '#555555', borderRadius: 34, padding: 2 },
  storyAvatar: { width: 58, height: 58, borderRadius: 29 },
  storyName: { color: '#cccccc', fontSize: 11, marginTop: 4, textAlign: 'center' },

  // POSTS
  postCard: { marginBottom: 4 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  postUsername: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  postImage: { width: '100%', height: 360 },
  postActions: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  actionButton: { marginRight: 16 },
  actionIcon: { fontSize: 26 },
  postMeta: { paddingHorizontal: 14, paddingBottom: 14 },
  postLikes: { color: '#ffffff', fontWeight: '700', marginBottom: 4 },
  postCaption: { color: '#dddddd', fontSize: 13 },

  // REELS
  reelActions: { position: 'absolute', right: 12, bottom: 120, alignItems: 'center' },
  reelActionBtn: { alignItems: 'center', marginBottom: 24 },
  reelActionIcon: { fontSize: 30 },
  reelActionCount: { color: '#ffffff', fontSize: 12, marginTop: 2 },
  
