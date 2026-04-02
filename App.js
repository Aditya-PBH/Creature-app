import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

var currentScreen = 'login';

function App() {
  var screen = React.useState('login');
  var tab = React.useState('home');
  var user = React.useState(null);

  if (screen[0] === 'login') {
    return React.createElement(SafeAreaView, { style: styles.bg },
      React.createElement(StatusBar, { barStyle: 'light-content', backgroundColor: '#000' }),
      React.createElement(View, { style: styles.center },
        React.createElement(Text, { style: styles.logo }, '🐾'),
        React.createElement(Text, { style: styles.title }, 'creature'),
        React.createElement(Text, { style: styles.sub }, 'apna duniya, apni vibe'),
        React.createElement(TouchableOpacity, {
          style: styles.btn,
          onPress: function() {
            user[1]({ name: 'Aditya', username: 'adi72' });
            screen[1]('home');
          }
        },
          React.createElement(Text, { style: styles.btnTxt }, 'Login Karo')
        ),
        React.createElement(TouchableOpacity, {
          style: styles.waBtn,
          onPress: function() {
            user[1]({ name: 'Aditya', username: 'adi72' });
            screen[1]('home');
          }
        },
          React.createElement(Text, { style: styles.waTxt }, 'WhatsApp se Login')
        )
      )
    );
  }

  return React.createElement(SafeAreaView, { style: styles.bg },
    React.createElement(StatusBar, { barStyle: 'light-content', backgroundColor: '#000' }),
    React.createElement(View, { style: styles.header },
      React.createElement(Text, { style: styles.headerTxt }, '🐾 creature')
    ),
    React.createElement(View, { style: styles.content },
      React.createElement(Text, { style: styles.welcomeTxt }, 'Welcome, ' + (user[0] ? user[0].name : '') + '! 👋'),
      React.createElement(Text, { style: styles.infoTxt }, 'App chal rahi hai!'),
      React.createElement(Text, { style: styles.infoTxt }, 'Feed, Reels, Chat aayenge!'),
      React.createElement(TouchableOpacity, {
        style: styles.logoutBtn,
        onPress: function() {
          user[1](null);
          screen[1]('login');
        }
      },
        React.createElement(Text, { style: styles.logoutTxt }, 'Logout')
      )
    ),
    React.createElement(View, { style: styles.nav },
      React.createElement(TouchableOpacity, {
        style: styles.navBtn,
        onPress: function() { tab[1]('home'); }
      },
        React.createElement(Text, { style: tab[0] === 'home' ? styles.navActive : styles.navIcon }, '🏠'),
        React.createElement(Text, { style: tab[0] === 'home' ? styles.navLblActive : styles.navLbl }, 'Home')
      ),
      React.createElement(TouchableOpacity, {
        style: styles.navBtn,
        onPress: function() { tab[1]('reels'); }
      },
        React.createElement(Text, { style: tab[0] === 'reels' ? styles.navActive : styles.navIcon }, '🎬'),
        React.createElement(Text, { style: tab[0] === 'reels' ? styles.navLblActive : styles.navLbl }, 'Reels')
      ),
      React.createElement(TouchableOpacity, {
        style: styles.navBtn,
        onPress: function() { tab[1]('chat'); }
      },
        React.createElement(Text, { style: tab[0] === 'chat' ? styles.navActive : styles.navIcon }, '💬'),
        React.createElement(Text, { style: tab[0] === 'chat' ? styles.navLblActive : styles.navLbl }, 'Chat')
      ),
      React.createElement(TouchableOpacity, {
        style: styles.navBtn,
        onPress: function() { tab[1]('profile'); }
      },
        React.createElement(Text, { style: tab[0] === 'profile' ? styles.navActive : styles.navIcon }, '👤'),
        React.createElement(Text, { style: tab[0] === 'profile' ? styles.navLblActive : styles.navLbl }, 'Profile')
      )
    )
  );
}

var styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  sub: { fontSize: 14, color: '#888888', marginBottom: 40 },
  btn: { backgroundColor: '#ff3b5c', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 60, marginBottom: 14 },
  btnTxt: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
  waBtn: { backgroundColor: '#0a1f0a', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, borderWidth: 1, borderColor: '#25D366' },
  waTxt: { color: '#25D366', fontWeight: '600', fontSize: 15 },
  header: { backgroundColor: '#000000', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTxt: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeTxt: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  infoTxt: { color: '#aaaaaa', fontSize: 15, marginBottom: 8 },
  logoutBtn: { marginTop: 40, backgroundColor: '#1e1e1e', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: '#ff3b5c' },
  logoutTxt: { color: '#ff3b5c', fontWeight: '700', fontSize: 15 },
  nav: { flexDirection: 'row', backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingBottom: 8 },
  navBtn: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22 },
  navActive: { fontSize: 24 },
  navLbl: { color: '#555555', fontSize: 10, marginTop: 2 },
  navLblActive: { color: '#ff3b5c', fontSize: 10, marginTop: 2, fontWeight: '700' },
});

export default App;
          
