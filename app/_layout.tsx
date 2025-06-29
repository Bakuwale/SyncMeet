import { Stack } from 'expo-router';
import React from 'react';
import 'react-native-reanimated';
import { MeetingProvider } from '../components/MeetingContext';
import { ScheduleProvider } from '../components/ScheduleContext';
import { ThemeProvider } from '../components/ThemeContext';
import { AuthProvider } from './auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MeetingProvider>
          <ScheduleProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="change-password" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="splash" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ScheduleProvider>
        </MeetingProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}



