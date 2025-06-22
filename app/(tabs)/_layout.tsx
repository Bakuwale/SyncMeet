import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useThemeContext } from '../../components/ThemeContext';

export default function TabLayout() {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    borderColor: isDarkTheme ? '#333' : '#e0e0e0',
    activeColor: '#007AFF',
    inactiveColor: isDarkTheme ? '#888' : '#666',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.activeColor,
        tabBarInactiveTintColor: themeColors.inactiveColor,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.borderColor,
          paddingBottom: 6,
          paddingTop: 6,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="meeting"
        options={{
          title: 'Meeting',
          tabBarIcon: ({ color }) => (
            <Ionicons name="videocam-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}


