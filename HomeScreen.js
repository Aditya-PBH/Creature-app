import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const stories = [
  { id: '1', user: 'Aditya', image: 'https://i.pravatar.cc/100' },
  { id: '2', user: 'Rahul', image: 'https://i.pravatar.cc/101' },
];

const posts = [
  {
    id: '1',
    user: 'Aditya',
    profile: 'https://i.pravatar.cc/100',
    image: 'https://picsum.photos/400/400'
  },
  {
    id: '2',
    user: 'Rahul',
    profile: 'https://i.pravatar.cc/101',
    image: 'https://picsum.photos/401/400'
  }
];

export default function HomeScreen({ navigation }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.container}>

      {/* 🔝 Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MyApp</Text>

        {/* 💬 Chat Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.icon}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* 📱 Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}

        {/* 🔥 Stories (Top Scroll) */}
        ListHeaderComponent={() => (
          <FlatList
            data={stories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.storyContainer}>
                <Image source={{ uri: item.image }} style={styles.storyImage} />
                <Text style={styles.storyText}>{item.user}</Text>
              </View>
            )}
          />
        )}

        renderItem={({ item }) => (
          <View style={styles.post}>

            {/* 👤 Header */}
            <View style={styles.header}>
              <Image source={{ uri: item.profile }} style={styles.profilePic} />
              <Text style={styles.username}>{item.user}</Text>
            </View>

            {/* 📸 Image */}
            <TouchableOpacity onPress={() => setLiked(!liked)}>
              <Image source={{ uri: item.image }} style={styles.postImage} />
            </TouchableOpacity>

            {/* ❤️ Like */}
            <Text style={{ paddingLeft: 10 }}>
              {liked ? "❤️ Liked" : "🤍 Like"}
            </Text>

            {/* 🔘 Actions */}
            <View style={styles.actions}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionIcon}>📤</Text>
            </View>

            {/* 📝 Caption */}
            <Text style={styles.caption}>
              <Text style={{ fontWeight: 'bold' }}>{item.user} </Text>
              This is a sample caption...
            </Text>

          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ccc'
  },

  logo: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  icon: {
    fontSize: 22
  },

  storyContainer: {
    alignItems: 'center',
    margin: 10
  },

  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'red'
  },

  storyText: {
    fontSize: 12
  },

  post: {
    marginBottom: 20
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },

  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20
  },

  username: {
    marginLeft: 10,
    fontWeight: 'bold'
  },

  postImage: {
    width: '100%',
    height: 300
  },

  actions: {
    flexDirection: 'row',
    padding: 10
  },

  actionIcon: {
    fontSize: 20,
    marginRight: 15
  },

  caption: {
    paddingHorizontal: 10
  }
});
