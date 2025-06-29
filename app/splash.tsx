import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';
import { useThemeContext } from '../components/ThemeContext';
import { useAuth } from './auth-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { user, loading, hasLoggedOut } = useAuth();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const themeColors = {
    background: isDarkTheme ? '#0A0A0A' : '#FFFFFF',
    gradientStart: isDarkTheme ? '#0A0A0A' : '#FFFFFF',
    gradientEnd: isDarkTheme ? '#1A1A1A' : '#F8F9FA',
    textPrimary: isDarkTheme ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDarkTheme ? '#B0B0B0' : '#666666',
    accent: '#007AFF',
    accentGradient: ['#007AFF', '#5856D6'] as const,
  };

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Pulse animation
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();
    startPulse();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          router.replace('/(tabs)');
        } else {
          // If user has logged out before, show login screen
          // Otherwise, show signup screen for new users
          router.replace(hasLoggedOut ? '/login' : '/signup');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            }
          ]}
        >
          {/* Logo Container */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={themeColors.accentGradient}
              style={styles.logoGradient}
            >
              <Ionicons name="videocam" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* App Name */}
          <Animated.Text 
            style={[
              styles.appName,
              { color: themeColors.textPrimary },
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            SyncMeet
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text 
            style={[
              styles.tagline,
              { color: themeColors.textSecondary },
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            Connect, Collaborate, Communicate
          </Animated.Text>

          {/* Loading Dots */}
          <View style={styles.loadingContainer}>
            <Animated.View 
              style={[
                styles.loadingDot,
                { backgroundColor: themeColors.accent },
                {
                  opacity: pulseAnim,
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.loadingDot,
                { backgroundColor: themeColors.accent },
                {
                  opacity: pulseAnim,
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.loadingDot,
                { backgroundColor: themeColors.accent },
                {
                  opacity: pulseAnim,
                }
              ]} 
            />
          </View>

          {/* Version Info */}
          <Animated.Text 
            style={[
              styles.versionText,
              { color: themeColors.textSecondary },
              {
                opacity: fadeAnim,
              }
            ]}
          >
            Version 1.0.0
          </Animated.Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    maxWidth: 280,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 48,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
  },
}); 