import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image, SafeAreaView, StatusBar
} from 'react-native';
import {
  collection, query, orderBy, getDocs, limit,
  doc, updateDoc, getDoc
} from 'firebase/firestore';
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

var NOTIF_ICONS = {
  like: '❤️', comment: '💬', follow: '👤',
  mention: '@', tag: '🏷️', story_like: '❤️', dm: '✈️'
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  if (s < 604800) return Math.floor(s / 86400) + 'd';
  return Math.floor(s / 604800) + 'w';
}

export default function NotificationsScreen() {
  var [notifications, setNotifications] = useState([]);
  var [suggested, setSuggested] = useState([]);
  var [loading, setLoading] = useState(true);
  var [refreshing, setRefreshing] = useState(false);

  useEffect(function() { loadAll(); }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([loadNotifications(), loadSuggested()])
      .finally(function() { setLoading(false); });
  }

  function loadNotifications() {
    var uid = auth.currentUser ? auth.currentUser.uid : null;
    if (!uid) return Promise.resolve();
    var q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    return getDocs(q).then(function(snap) {
      var list = snap.docs.map(function(d) {
        var x = d.data(); x.id = d.id; return x;
      }).filter(function(n) { return n.toUid === uid; });
      setNotifications(list);
    }).catch(function() {
      // No notifications collection yet - show empty
      setNotifications([]);
    });
  }

  function loadSuggested() {
    return getDocs(query(collection(db, 'users'), limit(8)))
      .then(function(snap) {
        var uid = auth.currentUser ? auth.currentUser.uid : null;
        var list = snap.docs.map(function(d) { return d.data(); })
          .filter(function(u) { return u.uid !== uid; })
          .slice(0, 5);
        setSuggested(list);
      }).catch(function() {});
  }

  function onRefresh() {
    setRefreshing(true);
    Promise.all([loadNotifications(), loadSuggested()])
      .finally(function() { setRefreshing(false); });
  }

  function getNotifText(notif) {
    var user = notif.actorName || 'Someone';
    switch (notif.type) {
      case 'like': return user + ' liked your photo.';
      case 'comment': return user + ' commented: ' + (notif.preview || '');
      case 'follow': return user + ' started following you.';
      case 'mention': return user + ' mentioned you in a comment.';
      default: return user + ' interacted with your post.';
    }
  }

  function SuggestedCard(props) {
    var user = props.user;
    var [following, setFollowing] = useState(false);
    return (
      <View style={s.sugCard}>
        <View style={s.sugRing}>
          <Image
            source={{ uri: user.avatar || ('https://i.pravatar.cc/60?u=' + user.uid) }}
            style={s.sugAv}
          />
        </View>
        <Text style={s.sugName} numberOfLines={1}>{user.username || 'user'}</Text>
        <Text style={s.sugSub} numberOfLines={1}>Suggested</Text>
        <TouchableOpacity
          style={[s.followBtn, following && s.followingBtn]}
          onPress={function() { setFollowing(!following); }}>
          <Text style={[s.followBtnTxt, following && s.followingBtnTxt]}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={PRIMARY} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.header}>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={s.headerAction}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={function(item, i) { return item.id || String(i); }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: BG }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
        }
        ListHeaderComponent={function() {
          if (suggested.length === 0) return null;
          return (
            <View style={s.sugSection}>
              <Text style={s.sectionTitle}>Suggested for you</Text>
              <FlatList
                data={suggested}
                keyExtractor={function(item, i) { return item.uid || String(i); }}
                renderItem={function(info) { return <SuggestedCard user={info.item} />; }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 14, gap: 10, paddingBottom: 14 }}
              />
              <View style={s.divider} />
              {notifications.length > 0 ? (
                <Text style={s.sectionTitle}>Activity</Text>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIco}>🔔</Text>
            <Text style={s.emptyTitle}>No notifications yet</Text>
            <Text style={s.emptyTxt}>When someone likes or comments, you'll see it here.</Text>
          </View>
        }
        renderItem={function(info) {
          var item = info.item;
          return (
            <TouchableOpacity style={[s.notifRow, !item.isRead && s.notifUnread]} activeOpacity={0.7}>
              <View style={s.notifAvWrap}>
                <Image
                  source={{ uri: item.actorAvatar || 'https://i.pravatar.cc/46' }}
                  style={s.notifAv}
                />
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeIco}>{NOTIF_ICONS[item.type] || '🔔'}</Text>
                </View>
              </View>
              <View style={s.notifInfo}>
                <Text style={s.notifTxt} numberOfLines={2}>
                  <Text style={s.bold}>{item.actorName || 'User'} </Text>
                  {getNotifText(item).replace(item.actorName + ' ', '')}
                </Text>
                <Text style={s.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              {item.postImage ? (
                <Image source={{ uri: item.postImage }} style={s.notifThumb} />
              ) : null}
              {item.type === 'follow' ? (
                <TouchableOpacity style={s.followSmall}>
                  <Text style={s.followSmallTxt}>Follow</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  headerTitle: { color: TEXT, fontSize: 24, fontWeight: '700' },
  headerAction: { color: PRIMARY, fontSize: 14, fontWeight: '600' },
  sugSection: { paddingTop: 12 },
  sectionTitle: { color: SECONDARY, fontSize: 13, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 0.5, backgroundColor: BORDER, marginVertical: 6 },
  sugCard: { width: 130, alignItems: 'center', padding: 12, backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  sugRing: { width: 60, height: 60, borderRadius: 30, padding: 2.5, marginBottom: 8, backgroundColor: ACCENT },
  sugAv: { width: 53, height: 53, borderRadius: 26, borderWidth: 2, borderColor: BG, backgroundColor: SURFACE2 },
  sugName: { color: TEXT, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  sugSub: { color: MUTED, fontSize: 11, marginBottom: 10 },
  followBtn: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 6, width: '100%', alignItems: 'center' },
  followingBtn: { backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER },
  followBtnTxt: { color: TEXT, fontSize: 13, fontWeight: '600' },
  followingBtnTxt: { color: SECONDARY },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  notifUnread: { backgroundColor: 'rgba(0,149,246,0.06)' },
  notifAvWrap: { position: 'relative' },
  notifAv: { width: 46, height: 46, borderRadius: 23, backgroundColor: SURFACE2 },
  notifBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BG, alignItems: 'center', justifyContent: 'center' },
  notifBadgeIco: { fontSize: 10 },
  notifInfo: { flex: 1 },
  notifTxt: { color: SECONDARY, fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700', color: TEXT },
  notifTime: { color: MUTED, fontSize: 11, marginTop: 3 },
  notifThumb: { width: 44, height: 44, borderRadius: 6, backgroundColor: SURFACE2 },
  followSmall: { borderWidth: 1, borderColor: PRIMARY, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 },
  followSmallTxt: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', padding: 60, gap: 12 },
  emptyIco: { fontSize: 52 },
  emptyTitle: { color: TEXT, fontSize: 18, fontWeight: '700' },
  emptyTxt: { color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 22 }
});
