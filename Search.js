import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, SafeAreaView, ActivityIndicator, Image
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

export default function ReelsScreen() {
  var [reels, setReels] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    var q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, function(snap) {
      var list = snap.docs.map(function(d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
      setReels(list);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={st.center}>
        <Text style={st.emptyIco}>🎬</Text>
        <Text style={st.emptyTxt}>No reels yet!</Text>
        <Text style={st.emptySub}>Upload a video to get started</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={st.safe}>
      <FlatList
        data={reels}
        keyExtractor={function(item) { return item.id; }}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={H}
        decelerationRate="fast"
        renderItem={function(info) {
          var item = info.item;
          var likes = Array.isArray(item.likes) ? item.likes.length : 0;
          var comments = Array.isArray(item.comments) ? item.comments.length : 0;
          return (
            <View style={st.reel}>
              {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={st.reelBg} resizeMode="cover" />
              ) : (
                <View style={st.reelBg} />
              )}
              <View style={st.overlay}>
                <View style={st.rightCol}>
                  <TouchableOpacity style={st.actionItem}>
                    <Text style={st.actionIco}>❤️</Text>
                    <Text style={st.actionTxt}>{likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.actionItem}>
                    <Text style={st.actionIco}>💬</Text>
                    <Text style={st.actionTxt}>{comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.actionItem}>
                    <Text style={st.actionIco}>📤</Text>
                  </TouchableOpacity>
                </View>
                <View style={st.bottomInfo}>
                  <Text style={st.reelUser}>{'@' + (item.username || 'user')}</Text>
                  {item.caption ? <Text style={st.reelCaption}>{item.caption}</Text> : null}
                </View>
              </View>
              <View style={st.playBtn}>
                <Text style={st.playIco}>▶</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

var st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' },
  emptyIco: { fontSize: 56, marginBottom: 12 },
  emptyTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#888', fontSize: 13, marginTop: 6 },
  reel: { width: W, height: H, backgroundColor: '#000' },
  reelBg: { width: W, height: H, backgroundColor: '#111' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  rightCol: { gap: 20, marginBottom: 20 },
  actionItem: { alignItems: 'center' },
  actionIco: { fontSize: 28 },
  actionTxt: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: '600' },
  bottomInfo: { flex: 1, marginRight: 16 },
  reelUser: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  reelCaption: { color: '#ddd', fontSize: 13, lineHeight: 18 },
  playBtn: { position: 'absolute', top: '45%', left: '45%' },
  playIco: { color: 'rgba(255,255,255,0.7)', fontSize: 48 }
});
