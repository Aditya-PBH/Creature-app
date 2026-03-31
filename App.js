import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, Image, StyleSheet, SafeAreaView, StatusBar,
  Share, Alert, Dimensions, ActivityIndicator,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── API CONFIG ───────────────────────────────────────────────
const API_URL = "http://[2409:40e3:1048:1cde:8000::]:8000/api";

const api = {
  post: async (path, body, token) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  get: async (path, token) => {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    return res.json();
  },
};

// ─── DUMMY DATA (fallback jab server nahi hai) ────────────────
const DUMMY_STORIES = [
  { id: "0", user: "My Story", avatar: "https://i.pravatar.cc/100?img=10", isOwn: true },
  { id: "1", user: "Rahul",    avatar: "https://i.pravatar.cc/100?img=1",  seen: false },
  { id: "2", user: "Priya",    avatar: "https://i.pravatar.cc/100?img=2",  seen: false },
  { id: "3", user: "Aman",     avatar: "https://i.pravatar.cc/100?img=3",  seen: true  },
  { id: "4", user: "Sneha",    avatar: "https://i.pravatar.cc/100?img=4",  seen: false },
];

const DUMMY_POSTS = [
  { _id: "p1", user: { username: "rahul_s", avatar: "https://i.pravatar.cc/60?img=1" }, image: "https://picsum.photos/seed/post1/400/400", caption: "Bhai ye jagah gajab hai! 🏔️", likes: [] },
  { _id: "p2", user: { username: "priya_k", avatar: "https://i.pravatar.cc/60?img=2" }, image: "https://picsum.photos/seed/post2/400/400", caption: "Ghar ka khana >> bahar ka 🍛",  likes: [] },
  { _id: "p3", user: { username: "aman_v",  avatar: "https://i.pravatar.cc/60?img=3" }, image: "https://picsum.photos/seed/post3/400/400", caption: "Gym grind 💪💪",                likes: [] },
];

const DUMMY_REELS = [
  { _id: "r1", user: { username: "rahul_s", avatar: "https://i.pravatar.cc/60?img=1" }, image: "https://picsum.photos/seed/reel1/400/700", caption: "Travel vibe 🔥 #india",   likes: [], comments: 312 },
  { _id: "r2", user: { username: "priya_k", avatar: "https://i.pravatar.cc/60?img=2" }, image: "https://picsum.photos/seed/reel2/400/700", caption: "Food lover 😋 #foodie",  likes: [], comments: 541 },
  { _id: "r3", user: { username: "aman_v",  avatar: "https://i.pravatar.cc/60?img=3" }, image: "https://picsum.photos/seed/reel3/400/700", caption: "Gym grind 💪 #fitness",  likes: [], comments: 189 },
];

const DUMMY_CHATS = [
  { id: "1", user: { name: "Rahul Sharma",  username: "rahul_s", avatar: "https://i.pravatar.cc/60?img=1" }, lastMsg: "Bhai kal milte hain!", time: "10:33", unread: 0 },
  { id: "2", user: { name: "Priya Kapoor",  username: "priya_k", avatar: "https://i.pravatar.cc/60?img=2" }, lastMsg: "Hey! 👋",              time: "9:00",  unread: 2 },
  { id: "3", user: { name: "Aman Verma",    username: "aman_v",  avatar: "https://i.pravatar.cc/60?img=3" }, lastMsg: "Photo dekhi kya?",    time: "Kal",   unread: 5 },
];

const DUMMY_MESSAGES = [
  { id: "m1", from: "them", text: "Bhai kya hal hai?",           time: "10:30" },
  { id: "m2", from: "me",   text: "Sab badiya yaar! Tu bata",    time: "10:31" },
  { id: "m3", from: "them", text: "Kal milna kya plan hai?",     time: "10:32" },
  { id: "m4", from: "me",   text: "Haan bhai, shaam ko milte",   time: "10:33" },
];

// ─── WHATSAPP SHARE ───────────────────────────────────────────
const shareWA = async (msg) => {
  try { await Share.share({ message: msg }); }
  catch (e) { Alert.alert("Share Error", e.message); }
};

// ══════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════

// ── LOGIN ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode]         = useState("login"); // login | signup
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert("Bhai", "Email aur password bharo!");
    setLoading(true);
    try {
      const body = mode === "signup" ? { name, username, email, password } : { email, password };
      const data = await api.post(mode === "signup" ? "/signup" : "/login", body);
      if (data.token) {
        onLogin(data.user, data.token);
      } else {
        Alert.alert("Error", data.error || "Kuch gadbad hui");
      }
    } catch {
      // Server nahi mila — demo mode
      onLogin({ name: name || "Demo User", username: username || "demo_user", id: "local" }, "demo_token");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000"/>
      <ScrollView contentContainerStyle={s.loginScroll}>
        <View style={s.loginTop}>
          <Text style={s.appLogo}>🐾</Text>
          <Text style={s.appName}>creature</Text>
          <Text style={s.appTagline}>apna duniya, apni vibe</Text>
        </View>

        <View style={s.loginCard}>
          <View style={s.tabRow}>
            {["login","signup"].map(m => (
              <TouchableOpacity key={m} style={[s.tabBtn, mode===m && s.tabBtnActive]} onPress={() => setMode(m)}>
                <Text style={[s.tabBtnText, mode===m && s.tabBtnTextActive]}>{m === "login" ? "Login" : "Sign Up"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === "signup" && <>
            <TextInput style={s.input} placeholder="Poora naam" placeholderTextColor="#666" value={name} onChangeText={setName}/>
            <TextInput style={s.input} placeholder="Username" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none"/>
          </>}
          <TextInput style={s.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          <TextInput style={s.input} placeholder="Password" placeholderTextColor="#666" secureTextEntry value={password} onChangeText={setPassword}/>

          <TouchableOpacity style={s.loginBtn} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.loginBtnText}>{mode === "login" ? "Login Karo" : "Account Banao"}</Text>}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine}/><Text style={s.dividerText}>YA</Text><View style={s.dividerLine}/>
          </View>

          <TouchableOpacity style={s.waBtn} onPress={submit}>
            <Text style={s.waBtnText}>🟢  WhatsApp se continue karo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── STORIES BAR ───────────────────────────────────────────────
function StoriesBar() {
  const [seen, setSeen] = useState({});
  return (
    <FlatList
      horizontal data={DUMMY_STORIES} keyExtractor={i => i.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.storyItem} onPress={() => setSeen(p => ({ ...p, [item.id]: true }))}>
          <View style={[s.storyRing, item.isOwn ? s.storyRingOwn : seen[item.id]||item.seen ? s.storyRingSeen : s.storyRingActive]}>
            <Image source={{ uri: item.avatar }} style={s.storyAvatar}/>
            {item.isOwn && <View style={s.storyAddBtn}><Text style={{ color:"#fff", fontSize:14 }}>+</Text></View>}
          </View>
          <Text style={s.storyUsername} numberOfLines={1}>{item.user}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ── FEED ──────────────────────────────────────────────────────
function FeedScreen({ token }) {
  const [posts, setPosts]   = useState(DUMMY_POSTS);
  const [liked, setLiked]   = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (token === "demo_token") return;
    setLoading(true);
    api.get("/feed", token).then(d => { if (Array.isArray(d)) setPosts(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleLike = async (postId) => {
    setLiked(p => ({ ...p, [postId]: !p[postId] }));
    if (token !== "demo_token") await api.post(`/posts/${postId}/like`, {}, token);
  };

  return (
    <ScrollView style={s.feedScroll} showsVerticalScrollIndicator={false}>
      <StoriesBar/>
      <View style={s.dividerFull}/>
      {loading && <ActivityIndicator color="#ff3b5c" style={{ marginTop: 30 }}/>}
      {posts.map(post => (
        <View key={post._id} style={s.postCard}>
          <View style={s.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={s.postAvatar}/>
            <View style={{ flex:1 }}>
              <Text style={s.postUsername}>{post.user.username}</Text>
              <Text style={s.postLocation}>India 📍</Text>
            </View>
            <TouchableOpacity><Text style={s.postMore}>•••</Text></TouchableOpacity>
          </View>
          <Image source={{ uri: post.image }} style={s.postImage} resizeMode="cover"/>
          <View style={s.postActions}>
            <TouchableOpacity style={s.actionBtn} onPress={() => toggleLike(post._id)}>
              <Text style={[s.actionIcon, liked[post._id] && { color:"#ff3b5c" }]}>{liked[post._id] ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}><Text style={s.actionIcon}>💬</Text></TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => shareWA(`Creature pe dekh: "${post.caption}" @${post.user.username}`)}>
              <Text style={s.actionIcon}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn,{marginLeft:"auto"}]}><Text style={s.actionIcon}>🔖</Text></TouchableOpacity>
          </View>
          <View style={s.postMeta}>
            <Text style={s.postLikes}>{(post.likes.length + (liked[post._id]?1:0)).toLocaleString()} likes</Text>
            <Text style={s.postCaption}><Text style={s.postUsername}>{post.user.username} </Text>{post.caption}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── REELS ─────────────────────────────────────────────────────
function ReelsScreen({ token }) {
  const [reels, setReels] = useState(DUMMY_REELS);
  const [liked, setLiked] = useState({});

  React.useEffect(() => {
    if (token === "demo_token") return;
    api.get("/reels", token).then(d => { if (Array.isArray(d)) setReels(d); }).catch(() => {});
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:"#000" }}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
        {reels.map(reel => (
          <View key={reel._id} style={[s.reelContainer, { height: width * 1.77 }]}>
            <Image source={{ uri: reel.image }} style={s.reelThumb} resizeMode="cover"/>
            <View style={s.reelOverlay}>
              <View style={s.reelActions}>
                <TouchableOpacity style={s.reelActionBtn} onPress={() => setLiked(p => ({ ...p, [reel._id]: !p[reel._id] }))}>
                  <Text style={s.reelActionIcon}>{liked[reel._id] ? "❤️" : "🤍"}</Text>
                  <Text style={s.reelActionCount}>{reel.likes.length + (liked[reel._id]?1:0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.reelActionBtn}>
                  <Text style={s.reelActionIcon}>💬</Text>
                  <Text style={s.reelActionCount}>{reel.comments || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.reelActionBtn} onPress={() => shareWA(`🔥 Creature pe Reel dekh: "${reel.caption}" @${reel.user.username}`)}>
                  <Text style={s.reelActionIcon}>📤</Text>
                </TouchableOpacity>
              </View>
              <View style={s.reelInfo}>
                <View style={s.reelUser}>
                  <Image source={{ uri: reel.user.avatar }} style={s.reelAvatar}/>
                  <Text style={s.reelUsername}>@{reel.user.username}</Text>
                  <TouchableOpacity style={s.reelFollowBtn}><Text style={s.reelFollowText}>Follow</Text></TouchableOpacity>
                </View>
                <Text style={s.reelCaption}>{reel.caption}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── CHAT LIST ─────────────────────────────────────────────────
function ChatListScreen({ token, onOpen }) {
  const [chats, setChats] = useState(DUMMY_CHATS);

  React.useEffect(() => {
    if (token === "demo_token") return;
    api.get("/chats", token).then(d => { if (Array.isArray(d)) setChats(d); }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.chatListHeader}>
        <Text style={s.chatListTitle}>Messages</Text>
        <TouchableOpacity><Text style={{ color:"#ff3b5c", fontSize:22 }}>✏️</Text></TouchableOpacity>
      </View>
      <StoriesBar/>
      <FlatList
        data={chats} keyExtractor={i => i.id || i._id}
        ItemSeparatorComponent={() => <View style={s.chatDivider}/>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.chatRow} onPress={() => onOpen(item)}>
            <Image source={{ uri: item.user.avatar }} style={s.chatAvatar}/>
            <View style={{ flex:1 }}>
              <Text style={s.chatName}>{item.user.name}</Text>
              <Text style={s.chatLastMsg} numberOfLines={1}>{item.lastMsg}</Text>
            </View>
            <View style={{ alignItems:"flex-end" }}>
              <Text style={s.chatTime}>{item.time || ""}</Text>
              {item.unread > 0 && <View style={s.unreadBadge}><Text style={s.unreadText}>{item.unread}</Text></View>}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ── CHAT ROOM ─────────────────────────────────────────────────
function ChatScreen({ chat, token, onBack }) {
  const [msgs, setMsgs] = useState(DUMMY_MESSAGES);
  const [text, setText] = useState("");

  React.useEffect(() => {
    if (token === "demo_token") return;
    const uid = chat.user._id || chat.id;
    api.get(`/messages/${uid}`, token).then(d => {
      if (Array.isArray(d)) setMsgs(d.map(m => ({ id: m._id, from: m.from._id === chat.user._id ? "them" : "me", text: m.text, time: new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) })));
    }).catch(() => {});
  }, []);

  const send = async () => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now().toString(), from:"me", text: text.trim(), time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMsgs(p => [...p, newMsg]);
    const t = text; setText("");
    if (token !== "demo_token") await api.post("/messages", { to: chat.user._id || chat.id, text: t }, token);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.chatHeader}>
        <TouchableOpacity onPress={onBack} style={{ padding:8 }}><Text style={{ color:"#ff3b5c", fontSize:24 }}>←</Text></TouchableOpacity>
        <Image source={{ uri: chat.user.avatar }} style={s.chatHeaderAvatar}/>
        <View style={{ flex:1 }}>
          <Text style={s.chatHeaderName}>{chat.user.name}</Text>
          <Text style={s.chatHeaderStatus}>Online 🟢</Text>
        </View>
        <TouchableOpacity onPress={() => shareWA(`Creature pe ${chat.user.name} ko follow karo! @${chat.user.username}`)}>
          <Text style={{ fontSize:20 }}>📤</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={msgs} keyExtractor={i => i.id}
        contentContainerStyle={{ padding:12 }}
        renderItem={({ item }) => (
          <View style={[s.msgBubble, item.from==="me" ? s.msgMe : s.msgThem]}>
            <Text style={s.msgText}>{item.text}</Text>
            <Text style={s.msgTime}>{item.time}</Text>
          </View>
        )}
      />
      <View style={s.chatInputRow}>
        <TouchableOpacity style={s.chatIconBtn}><Text style={{ fontSize:22 }}>😊</Text></TouchableOpacity>
        <TextInput style={s.chatInput} placeholder="Message..." placeholderTextColor="#666" value={text} onChangeText={setText} multiline/>
        <TouchableOpacity style={s.chatIconBtn}><Text style={{ fontSize:22 }}>📷</Text></TouchableOpacity>
        {text.trim() ? (
          <TouchableOpacity style={s.sendBtn} onPress={send}><Text style={s.sendBtnText}>↑</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.chatIconBtn}><Text style={{ fontSize:22 }}>🎤</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── PROFILE ───────────────────────────────────────────────────
function ProfileScreen({ user, token, onLogout }) {
  const GRID = Array.from({length:9},(_,i)=>({ id:String(i), uri:`https://picsum.photos/seed/g${i}/200/200` }));
  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.profileHeader}>
          <Image source={{ uri:"https://i.pravatar.cc/100?img=10" }} style={s.profileAvatar}/>
          <View style={s.profileStats}>
            {[["Posts","9"],["Followers","1.2K"],["Following","342"]].map(([l,v]) => (
              <View key={l} style={s.statItem}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={s.profileName}>{user.name}</Text>
        <Text style={s.profileBio}>🐾 Creature user | India 🇮🇳</Text>
        <View style={s.profileBtns}>
          <TouchableOpacity style={s.editProfileBtn}><Text style={s.editProfileText}>Profile Edit Karo</Text></TouchableOpacity>
          <TouchableOpacity style={s.shareProfileBtn} onPress={() => shareWA(`Creature pe mera profile dekh! @${user.username} 🔥`)}>
            <Text style={s.shareProfileText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
        <View style={s.grid}>
          {GRID.map(p => (
            <TouchableOpacity key={p.id} style={s.gridItem}>
              <Image source={{ uri:p.uri }} style={s.gridImage}/>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
const TABS = [
  { key:"feed",    icon:"🏠", label:"Home"    },
  { key:"reels",   icon:"🎬", label:"Reels"   },
  { key:"chat",    icon:"💬", label:"Chat"    },
  { key:"profile", icon:"👤", label:"Profile" },
];

export default function App() {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(null);
  const [tab,       setTab]       = useState("feed");
  const [openChat,  setOpenChat]  = useState(null);

  if (!user) return <LoginScreen onLogin={(u, t) => { setUser(u); setToken(t); }}/>;
  if (openChat) return <ChatScreen chat={openChat} token={token} onBack={() => setOpenChat(null)}/>;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000"/>

      {tab !== "reels" && (
        <View style={s.appHeader}>
          <Text style={s.headerLogo}>🐾 creature</Text>
          <View style={s.headerIcons}>
            <TouchableOpacity style={{ marginRight:14 }}><Text style={{ fontSize:22 }}>🔔</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab("chat")}><Text style={{ fontSize:22 }}>💬</Text></TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ flex:1 }}>
        {tab === "feed"    && <FeedScreen    token={token}/>}
        {tab === "reels"   && <ReelsScreen   token={token}/>}
        {tab === "chat"    && <ChatListScreen token={token} onOpen={setOpenChat}/>}
        {tab === "profile" && <ProfileScreen  user={user} token={token} onLogout={() => { setUser(null); setToken(null); }}/>}
      </View>

      <View style={s.bottomNav}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={s.navItem} onPress={() => setTab(t.key)}>
            <Text style={[s.navIcon, tab===t.key && s.navActive]}>{t.icon}</Text>
            <Text style={[s.navLabel, tab===t.key && s.navActiveLabel]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex:1, backgroundColor:"#0a0a0a" },

  // LOGIN
  loginScroll: { flexGrow:1, justifyContent:"center", paddingHorizontal:24, paddingVertical:40 },
  loginTop: { alignItems:"center", marginBottom:36 },
  appLogo: { fontSize:64 },
  appName: { fontSize:36, fontWeight:"900", color:"#fff", letterSpacing:2 },
  appTagline: { fontSize:13, color:"#888", marginTop:4 },
  loginCard: { backgroundColor:"#141414", borderRadius:20, padding:22, borderWidth:1, borderColor:"#222" },
  tabRow: { flexDirection:"row", backgroundColor:"#1e1e1e", borderRadius:12, marginBottom:18, padding:4 },
  tabBtn: { flex:1, paddingVertical:10, alignItems:"center", borderRadius:10 },
  tabBtnActive: { backgroundColor:"#ff3b5c" },
  tabBtnText: { color:"#888", fontWeight:"600" },
  tabBtnTextActive: { color:"#fff" },
  input: { backgroundColor:"#1e1e1e", color:"#fff", borderRadius:12, padding:14, marginBottom:12, fontSize:15, borderWidth:1, borderColor:"#2a2a2a" },
  loginBtn: { backgroundColor:"#ff3b5c", borderRadius:12, padding:15, alignItems:"center", marginTop:4 },
  loginBtnText: { color:"#fff", fontWeight:"700", fontSize:16 },
  dividerRow: { flexDirection:"row", alignItems:"center", marginVertical:16 },
  dividerLine: { flex:1, height:1, backgroundColor:"#2a2a2a" },
  dividerText: { color:"#666", marginHorizontal:12, fontSize:12 },
  waBtn: { backgroundColor:"#0a1f0a", borderRadius:12, padding:14, alignItems:"center", borderWidth:1, borderColor:"#1a3a1a" },
  waBtnText: { color:"#25D366", fontWeight:"600" },

  // HEADER
  appHeader: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:16, paddingVertical:12, borderBottomWidth:0.5, borderBottomColor:"#1a1a1a" },
  headerLogo: { fontSize:22, fontWeight:"900", color:"#fff" },
  headerIcons: { flexDirection:"row" },

  // STORIES
  storyItem: { alignItems:"center", marginRight:14, width:68 },
  storyRing: { borderRadius:36, padding:2.5, marginBottom:4 },
  storyRingActive: { borderWidth:2.5, borderColor:"#ff3b5c" },
  storyRingSeen: { borderWidth:2.5, borderColor:"#333" },
  storyRingOwn: { borderWidth:2.5, borderColor:"#444" },
  storyAvatar: { width:60, height:60, borderRadius:30, borderWidth:2, borderColor:"#0a0a0a" },
  storyUsername: { color:"#ccc", fontSize:11, textAlign:"center" },
  storyAddBtn: { position:"absolute", bottom:0, right:0, backgroundColor:"#ff3b5c", width:20, height:20, borderRadius:10, alignItems:"center", justifyContent:"center", borderWidth:2, borderColor:"#0a0a0a" },

  // FEED
  feedScroll: { flex:1, backgroundColor:"#0a0a0a" },
  dividerFull: { height:0.5, backgroundColor:"#1a1a1a" },
  postCard: { marginBottom:2 },
  postHeader: { flexDirection:"row", alignItems:"center", padding:12 },
  postAvatar: { width:36, height:36, borderRadius:18, marginRight:10 },
  postUsername: { color:"#fff", fontWeight:"700", fontSize:13 },
  postLocation: { color:"#888", fontSize:11 },
  postMore: { color:"#fff", fontSize:18 },
  postImage: { width:"100%", height:width },
  postActions: { flexDirection:"row", alignItems:"center", paddingHorizontal:12, paddingVertical:10 },
  actionBtn: { marginRight:14 },
  actionIcon: { fontSize:26 },
  postMeta: { paddingHorizontal:14, paddingBottom:14 },
  postLikes: { color:"#fff", fontWeight:"700", marginBottom:4 },
  postCaption: { color:"#ddd", fontSize:13, lineHeight:18 },

  // REELS
  reelContainer: { width:"100%", position:"relative" },
  reelThumb: { position:"absolute", top:0, left:0, right:0, bottom:0 },
  reelOverlay: { flex:1, justifyContent:"flex-end" },
  reelActions: { position:"absolute", right:12, bottom:120, alignItems:"center" },
  reelActionBtn: { alignItems:"center", marginBottom:22 },
  reelActionIcon: { fontSize:30 },
  reelActionCount: { color:"#fff", fontSize:12, fontWeight:"600", marginTop:2 },
  reelInfo: { padding:16, paddingBottom:30, backgroundColor:"rgba(0,0,0,0.35)" },
  reelUser: { flexDirection:"row", alignItems:"center", marginBottom:8 },
  reelAvatar: { width:36, height:36, borderRadius:18, marginRight:8, borderWidth:1.5, borderColor:"#fff" },
  reelUsername: { color:"#fff", fontWeight:"700", fontSize:14, flex:1 },
  reelFollowBtn: { borderWidth:1, borderColor:"#fff", borderRadius:8, paddingHorizontal:14, paddingVertical:4 },
  reelFollowText: { color:"#fff", fontWeight:"600", fontSize:13 },
  reelCaption: { color:"#eee", fontSize:13, lineHeight:18 },

  // CHAT LIST
  chatListHeader: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:16, paddingVertical:14 },
  chatListTitle: { color:"#fff", fontSize:24, fontWeight:"900" },
  chatRow: { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:12 },
  chatAvatar: { width:52, height:52, borderRadius:26, marginRight:12 },
  chatName: { color:"#fff", fontWeight:"700", fontSize:15 },
  chatLastMsg: { color:"#888", fontSize:13, marginTop:2 },
  chatTime: { color:"#666", fontSize:12 },
  chatDivider: { height:0.5, backgroundColor:"#1a1a1a", marginLeft:80 },
  unreadBadge: { backgroundColor:"#ff3b5c", borderRadius:10, minWidth:20, height:20, alignItems:"center", justifyContent:"center", marginTop:4, paddingHorizontal:4 },
  unreadText: { color:"#fff", fontSize:11, fontWeight:"700" },

  // CHAT ROOM
  chatHeader: { flexDirection:"row", alignItems:"center", paddingHorizontal:8, paddingVertical:10, borderBottomWidth:0.5, borderBottomColor:"#1a1a1a" },
  chatHeaderAvatar: { width:38, height:38, borderRadius:19, marginRight:10 },
  chatHeaderName: { color:"#fff", fontWeight:"700", fontSize:15 },
  chatHeaderStatus: { color:"#25D366", fontSize:12 },
  msgBubble: { maxWidth:"75%", borderRadius:18, padding:12, marginBottom:8 },
  msgMe: { backgroundColor:"#ff3b5c", alignSelf:"flex-end", borderBottomRightRadius:4 },
  msgThem: { backgroundColor:"#1e1e1e", alignSelf:"flex-start", borderBottomLeftRadius:4 },
  msgText: { color:"#fff", fontSize:14 },
  msgTime: { color:"rgba(255,255,255,0.55)", fontSize:10, marginTop:4, alignSelf:"flex-end" },
  chatInputRow: { flexDirection:"row", alignItems:"center", paddingHorizontal:12, paddingVertical:8, borderTopWidth:0.5, borderTopColor:"#1a1a1a" },
  chatIconBtn: { padding:6 },
  chatInput: { flex:1, backgroundColor:"#1e1e1e", color:"#fff", borderRadius:20, paddingHorizontal:14, paddingVertical:8, marginHorizontal:6, fontSize:14, maxHeight:100 },
  sendBtn: { backgroundColor:"#ff3b5c", width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center" },
  sendBtnText: { color:"#fff", fontWeight:"900", fontSize:18 },

  // PROFILE
  profileHeader: { flexDirection:"row", alignItems:"center", padding:20 },
  profileAvatar: { width:90, height:90, borderRadius:45, borderWidth:3, borderColor:"#ff3b5c" },
  profileStats: { flex:1, flexDirection:"row", justifyContent:"space-around" },
  statItem: { alignItems:"center" },
  statVal: { color:"#fff", fontWeight:"900", fontSize:18 },
  statLabel: { color:"#888", fontSize:12 },
  profileName: { color:"#fff", fontWeight:"700", fontSize:16, paddingHorizontal:20 },
  profileBio: { color:"#aaa", fontSize:13, paddingHorizontal:20, marginTop:4, marginBottom:14 },
  profileBtns: { flexDirection:"row", paddingHorizontal:20, marginBottom:16, gap:10 },
  editProfileBtn: { flex:1, backgroundColor:"#1e1e1e", borderRadius:10, paddingVertical:10, alignItems:"center", borderWidth:1, borderColor:"#333" },
  editProfileText: { color:"#fff", fontWeight:"600", fontSize:13 },
  shareProfileBtn: { backgroundColor:"#0a1f0a", borderRadius:10, paddingVertical:10, paddingHorizontal:18, alignItems:"center", borderWidth:1, borderColor:"#25D366" },
  shareProfileText: { color:"#25D366", fontWeight:"600", fontSize:13 },
  grid: { flexDirection:"row", flexWrap:"wrap" },
  gridItem: { width:"33.33%", aspectRatio:1, padding:1 },
  gridImage: { width:"100%", height:"100%" },
  logoutBtn: { margin:24, backgroundColor:"#1e1e1e", borderRadius:12, padding:14, alignItems:"center", borderWidth:1, borderColor:"#ff3b5c33" },
  logoutText: { color:"#ff3b5c", fontWeight:"700" },

  // BOTTOM NAV
  bottomNav: { flexDirection:"row", backgroundColor:"#0a0a0a", borderTopWidth:0.5, borderTopColor:"#1a1a1a", paddingBottom:8 },
  navItem: { flex:1, alignItems:"center", paddingTop:10 },
  navIcon: { fontSize:22 },
  navActive: { fontSize:24 },
  navLabel: { color:"#555", fontSize:10, marginTop:2 },
  navActiveLabel: { color:"#ff3b5c", fontWeight:"700" },
});
