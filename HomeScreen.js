import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

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

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MyApp</Text>
        <Text style={styles.icon}>💬</Text>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>

            {/* Header */}
            <View style={styles.header}>
              <Image source={{ uri: item.profile }} style={styles.profilePic} />
              <Text style={styles.username}>{item.user}</Text>
            </View>

            {/* Post Image */}
            <Image source={{ uri: item.image }} style={styles.postImage} />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity>
                <Text style={styles.actionIcon}>❤️</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.actionIcon}>📤</Text>
              </TouchableOpacity>
            </View>

            {/* Caption */}
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
    fontSize: 20
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
