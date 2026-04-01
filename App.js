import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#ff3b5c', fontSize: 32, fontWeight: 'bold' }}>🐾 Creature</Text>
      <Text style={{ color: '#fff', fontSize: 16, marginTop: 10 }}>App chal rahi hai!</Text>
    </View>
  );
}
