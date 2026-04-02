import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐾 Creature</Text>
      <Text style={styles.sub}>App chal rahi hai!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ff3b5c',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sub: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});
