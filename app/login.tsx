import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeContext } from '../components/ThemeContext';
import { useAuth } from './auth-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const router = useRouter();

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  React.useEffect(() => {
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    Alert.alert('Social Login', `${provider} login will be implemented soon!`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: themeColors.cardBackground }]}>
                <Ionicons name="videocam" size={40} color={themeColors.accent} />
              </View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                Welcome Back
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Sign in to continue to SyncMeet
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={emailFocused ? themeColors.accent : themeColors.textSecondary} 
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: emailFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    }
                  ]}
                  placeholder="Email address"
                  placeholderTextColor={themeColors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={passwordFocused ? themeColors.accent : themeColors.textSecondary} 
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: passwordFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    }
                  ]}
                  placeholder="Password"
                  placeholderTextColor={themeColors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotPassword}
              >
                <Text style={[styles.forgotPasswordText, { color: themeColors.accent }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={submitting || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={themeColors.accentGradient}
                  style={styles.gradientButton}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />
                <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>
                  or continue with
                </Text>
                <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: themeColors.cardBackground }]}
                  onPress={() => handleSocialLogin('google')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                  <Text style={[styles.socialButtonText, { color: themeColors.textPrimary }]}>
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: themeColors.cardBackground }]}
                  onPress={() => handleSocialLogin('apple')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-apple" size={24} color={themeColors.textPrimary} />
                  <Text style={[styles.socialButtonText, { color: themeColors.textPrimary }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                Don't have an account?{' '}
                <Text 
                  style={[styles.footerLink, { color: themeColors.accent }]}
                  onPress={() => router.push('/signup')}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
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