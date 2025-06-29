import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './auth-context';

export default function Index() {
  const { user, loading, hasLoggedOut } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is authenticated, redirect to main app
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If user has logged out before, show login screen
  // Otherwise, show signup screen for new users
  return <Redirect href={hasLoggedOut ? "/login" : "/signup"} />;
} 