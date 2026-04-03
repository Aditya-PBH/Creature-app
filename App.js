import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens import karo
import HomeScreen from './HomeScreen';
import Search from './Search';
import Reels from './Reels';
import Profile from './Profile';
import UploadScreen from './UploadScreen';
import ChatScreen from './ChatScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>

        {/* 🏠 Home */}
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        />

        {/* 🔍 Search */}
        <Tab.Screen 
          name="Search" 
          component={Search}
          options={{ tabBarIcon: () => <Text>🔍</Text> }}
        />

        {/* ➕ Upload */}
        <Tab.Screen 
          name="Add" 
          component={UploadScreen}
          options={{ tabBarIcon: () => <Text>➕</Text> }}
        />

        {/* 🎥 Reels */}
        <Tab.Screen 
          name="Reels" 
          component={Reels}
          options={{ tabBarIcon: () => <Text>🎥</Text> }}
        />

        {/* 👤 Profile */}
        <Tab.Screen 
          name="Profile" 
          component={Profile}
          options={{ tabBarIcon: () => <Text>👤</Text> }}
        />

        {/* 💬 Chat (hidden) */}
        <Tab.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ tabBarButton: () => null }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
                   }
