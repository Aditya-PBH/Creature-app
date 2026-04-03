import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import CryptoJS from "crypto-js";
import app from './firebase';

const db = getFirestore(app);
const SECRET_KEY = "my_secret_key_123";

// 🔒 Encrypt
const encryptMessage = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// 🔓 Decrypt
const decryptMessage = (cipher) => {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      setMessages(data);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const encrypted = encryptMessage(message);

    await addDoc(collection(db, "messages"), {
      text: encrypted,
      createdAt: Date.now()
    });

    setMessage('');
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={styles.msg}>
            {decryptMessage(item.text)}
          </Text>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message..."
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  msg: {
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 5,
    borderRadius: 5
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  input: {
    flex: 1,
    borderWidth: 1,
    marginRight: 10,
    padding: 8
  }
});
