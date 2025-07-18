// =============================
// LAYOUT & NOTIFICATIONS NOTES
// =============================
// Expo Go (SDK 53+) does NOT support push/remote notifications. Use EAS Dev Client for full support.
// Toast must be rendered outside the navigation tree to avoid expo-router layout warnings.
// For more info: https://docs.expo.dev/develop/development-builds/introduction/
// =============================
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../components/auth-context';
import { MeetingProvider } from '../components/MeetingContext';
import { ScheduleProvider } from '../components/ScheduleContext';
import { ThemeProvider } from '../components/ThemeContext';
import { initializeNotifications } from '../utils/notifications';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log('Caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}><Text>Something went wrong.</Text></View>;
    }
    return this.props.children;
  }
}

function AuthAndThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification system
    initializeNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        {/* Toast must be outside the navigation tree to avoid expo-router layout warning */}
        <Toast />
        <AuthAndThemeProviders>
          <MeetingProvider>
            <ScheduleProvider>
              <RootStackWithAuth />
            </ScheduleProvider>
          </MeetingProvider>
        </AuthAndThemeProviders>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function RootStackWithAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="reminder-settings" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="+not-found" />
        </>
      ) : (
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
        </>
      )}
    </Stack>
  );
}



