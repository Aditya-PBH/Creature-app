# 🐾 Creature App — Expo Go + APK Guide

---

## ✅ STEP 1 — Node.js install karo
https://nodejs.org se LTS version download karo

---

## ✅ STEP 2 — Expo CLI install karo
```bash
npm install -g expo-cli eas-cli
```

---

## ✅ STEP 3 — Project folder mein jao
```bash
cd mobile
npm install
```

---

## ✅ STEP 4 — Expo Go pe chalao (testing ke liye)
```bash
npx expo start
```
- Phone pe **Expo Go** app install karo (Play Store se)
- Terminal mein QR code aayega
- Expo Go app se QR scan karo
- App seedha phone pe khul jaayega! 🎉

> ⚠️ Phone aur laptop **ek hi WiFi** pe hone chahiye

---

## ✅ STEP 5 — APK banana (EAS Build)

### 5.1 — Expo account banao (free)
https://expo.dev pe jao aur account banao

### 5.2 — Login karo terminal mein
```bash
eas login
```

### 5.3 — Project initialize karo
```bash
eas build:configure
```
Ye `app.json` mein projectId add kar dega automatically

### 5.4 — APK build karo 🚀
```bash
eas build --platform android --profile preview
```

- Ye cloud pe build hoga (tere PC pe kuch install nahi chahiye)
- 10-15 minute lagenge
- Build complete hone pe **download link** milega
- Wahan se APK download karo aur phone pe install karo!

---

## 🌐 Server IP kahan set hai?

`App.js` file mein line 10 pe:
```js
const API_URL = "http://[2409:40e3:1048:1cde:8000::]:8000/api";
```

Agar IP change ho toh sirf ye line update karo.

> **Note:** Server aur phone dono same network pe hone chahiye ya server public hona chahiye

---

## 📦 Files ki list

```
mobile/
├── App.js          ← Poori app (Feed, Reels, Chat, Profile, Login)
├── app.json        ← Expo config (app naam, icon, package)
├── eas.json        ← APK build config
├── package.json    ← Dependencies
└── babel.config.js ← Babel setup
```

---

## 🔥 Features

| Feature | Status |
|---|---|
| Login / Signup | ✅ |
| Stories | ✅ |
| Feed + Posts | ✅ |
| Reels (vertical) | ✅ |
| Chat + Messaging | ✅ |
| WhatsApp Share | ✅ |
| Profile | ✅ |
| Expo Go support | ✅ |
| APK (EAS Build) | ✅ |

---

Made with ❤️ — Creature App 🐾

