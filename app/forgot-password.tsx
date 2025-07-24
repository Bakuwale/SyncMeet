import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useThemeContext } from '../components/ThemeContext';
import { useAuth } from '../components/auth-context';

export default function ForgotPasswordScreen() {
  const { resetPassword, loading } = useAuth();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const themeColors = {
    background: isDarkTheme ? '#0A0A0A' : '#FFFFFF',
    cardBackground: isDarkTheme ? '#1A1A1A' : '#F8F9FA',
    textPrimary: isDarkTheme ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDarkTheme ? '#B0B0B0' : '#666666',
    inputBackground: isDarkTheme ? '#2A2A2A' : '#FFFFFF',
    inputBorder: isDarkTheme ? '#404040' : '#E0E0E0',
    inputBorderFocused: '#007AFF',
    accent: '#007AFF',
    accentGradient: ['#007AFF', '#5856D6'] as const,
    error: '#FF3B30',
    success: '#34C759',
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    const success = await resetPassword(email);
    setSubmitting(false);

    if (success) {
      Alert.alert(
        'Reset Link Sent',
        'If an account with this email exists, you will receive a password reset link shortly.',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } else {
      Alert.alert('Error', 'Unable to send reset link. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <LinearGradient
              colors={isDarkTheme ? ['#0A0A0A', '#1A1A1A'] : ['#FFFFFF', '#F8F9FA']}
              style={styles.gradient}
            >
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.header}>
                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.accent} />
                  </TouchableOpacity>

                  <View style={[styles.logoContainer, { backgroundColor: themeColors.cardBackground }]}>
                    <Ionicons name="lock-open" size={40} color={themeColors.accent} />
                  </View>

                  <Text style={[styles.title, { color: themeColors.textPrimary }]}>Reset Password</Text>
                  <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                    Enter your email to receive a password reset link
                  </Text>
                </View>

                <View style={styles.form}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: emailFocused
                          ? themeColors.inputBorderFocused
                          : themeColors.inputBorder,
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? themeColors.accent : themeColors.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      style={[styles.input, { color: themeColors.textPrimary }]}
                      placeholder="Enter your email address"
                      placeholderTextColor={themeColors.textSecondary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={text => { setEmail(text); setEmailTouched(true); }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => { setEmailFocused(false); setEmailTouched(true); }}
                    />
                  </View>
                {/* Email format helper below input */}
                {emailTouched && email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email) && (
                  <Text style={{ color: 'orange', fontSize: 12, marginLeft: 12, marginBottom: 4 }}>
                    Please enter a valid email address (e.g. user@example.com)
                  </Text>
                )}

                  <View style={styles.infoContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color={themeColors.textSecondary}
                    />
                    <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                      We’ll send you a link to reset your password. Make sure to check your spam folder.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.resetButton, { opacity: submitting ? 0.7 : 1 }]}
                    onPress={handleResetPassword}
                    disabled={submitting || loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient colors={themeColors.accentGradient} style={styles.gradientButton}>
                      {submitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.resetButtonText}>Send Reset Link</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                    Remember your password?{' '}
                    <Text
                      style={[styles.footerLink, { color: themeColors.accent }]}
                      onPress={() => router.push('/login')}
                    >
                      Sign in
                    </Text>
                  </Text>
                </View>
              </Animated.View>
            </LinearGradient>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingHorizontal: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  resetButton: {
    borderRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: 'bold',
  },
});
