// =============================
// LAYOUT & NOTIFICATIONS NOTES
// =============================
// Expo Go (SDK 53+) does NOT support push/remote notifications. Use EAS Dev Client for full support.
// Toast must be rendered outside the navigation tree to avoid expo-router layout warnings.
// For more info: https://docs.expo.dev/develop/development-builds/introduction/
// =============================
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../components/auth-context';
import { ChatProvider } from '../components/ChatContext';
import { ContactProvider } from '../components/ContactContext';
import { MeetingProvider } from '../components/MeetingContext';
import { ParticipantProvider } from '../components/ParticipantContext';
import { ScheduleProvider } from '../components/ScheduleContext';
import { ThemeProvider } from '../components/ThemeContext';
import { initializeNotifications } from '../utils/notifications';

const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.CLERK_PUBLISHABLE_KEY;

type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {}
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function AuthAndThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
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
      <ChatProvider>
        <ParticipantProvider>
          <ContactProvider>
            <MeetingProvider>
              <ScheduleProvider>
                <View style={{ flex: 1 }}>
                  <ErrorBoundary>
                    {/* Toast must be outside the navigation tree to avoid expo-router layout warning */}
                    <Toast />
                    <AuthAndThemeProviders>
                      <RootStackWithAuth />
                    </AuthAndThemeProviders>
                  </ErrorBoundary>
                </View>
              </ScheduleProvider>
            </MeetingProvider>
          </ContactProvider>
        </ParticipantProvider>
      </ChatProvider>
    </GestureHandlerRootView>
  );
}

function RootStackWithAuth() {
  const { user, loading } = useAuth();
  console.log('RootStackWithAuth', { user, loading });
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
          <Stack.Screen name="video-call" />
          <Stack.Screen name="meetings" />
        </>
      ) : (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
        </>
      )}
    </Stack>
  );
}
