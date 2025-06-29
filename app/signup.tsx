import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PhotoUpload from '../components/PhotoUpload';
import { useThemeContext } from '../components/ThemeContext';
import { useAuth } from './auth-context';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const { signup, loading } = useAuth();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  // Focus states for animations
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
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
    checkboxBackground: isDarkTheme ? '#2A2A2A' : '#FFFFFF',
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    setSubmitting(true);
    const success = await signup(email, password);
    setSubmitting(false);
    
    if (success) {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } else {
      Alert.alert('Signup Failed', 'Unable to create account. Please try again.');
    }
  };

  const handlePhotoSelected = (photoUri: string) => {
    setProfilePhoto(photoUri);
  };

  const validatePassword = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    return 'strong';
  };

  const getPasswordStrengthColor = () => {
    const strength = validatePassword();
    switch (strength) {
      case 'weak': return themeColors.error;
      case 'medium': return '#FF9500';
      case 'strong': return themeColors.success;
      default: return themeColors.textSecondary;
    }
  };

  const getPasswordStrengthText = () => {
    const strength = validatePassword();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
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
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
                  Create Account
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Join SyncMeet and start connecting
                </Text>
              </View>

              {/* Profile Photo */}
              <View style={styles.photoSection}>
                <TouchableOpacity 
                  style={[styles.photoContainer, { backgroundColor: themeColors.cardBackground }]}
                  onPress={() => setShowPhotoUpload(true)}
                >
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={40} color={themeColors.textSecondary} />
                    </View>
                  )}
                  <View style={[styles.photoOverlay, { backgroundColor: themeColors.accent }]}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.photoText, { color: themeColors.textSecondary }]}>
                  Tap to add profile photo
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Full Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={nameFocused ? themeColors.accent : themeColors.textSecondary} 
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: nameFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                        color: themeColors.textPrimary,
                      }
                    ]}
                    placeholder="Full Name"
                    placeholderTextColor={themeColors.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>

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

                {/* Password Strength */}
                {password.length > 0 && (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthBar}>
                      <View 
                        style={[
                          styles.strengthFill, 
                          { 
                            width: `${Math.min((password.length / 8) * 100, 100)}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                )}

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={confirmPasswordFocused ? themeColors.accent : themeColors.textSecondary} 
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: confirmPasswordFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                        color: themeColors.textPrimary,
                      }
                    ]}
                    placeholder="Confirm Password"
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.passwordMatch}>
                    <Ionicons 
                      name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={password === confirmPassword ? themeColors.success : themeColors.error} 
                    />
                    <Text style={[
                      styles.passwordMatchText, 
                      { color: password === confirmPassword ? themeColors.success : themeColors.error }
                    ]}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </Text>
                  </View>
                )}

                {/* Terms and Conditions */}
                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.checkbox, 
                    { 
                      backgroundColor: acceptedTerms ? themeColors.accent : themeColors.checkboxBackground,
                      borderColor: acceptedTerms ? themeColors.accent : themeColors.inputBorder
                    }
                  ]}>
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.termsText, { color: themeColors.textSecondary }]}>
                    I agree to the{' '}
                    <Text style={[styles.termsLink, { color: themeColors.accent }]}>
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text style={[styles.termsLink, { color: themeColors.accent }]}>
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Signup Button */}
                <TouchableOpacity 
                  style={[styles.signupButton, { opacity: submitting ? 0.7 : 1 }]}
                  onPress={handleSignup}
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
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                  Already have an account?{' '}
                  <Text 
                    style={[styles.footerLink, { color: themeColors.accent }]}
                    onPress={() => router.push('/login')}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Photo Upload Modal */}
      <PhotoUpload
        visible={showPhotoUpload}
        onPhotoSelected={handlePhotoSelected}
        onClose={() => setShowPhotoUpload(false)}
      />
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoText: {
    fontSize: 14,
    textAlign: 'center',
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
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  passwordMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signupButton: {
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
  signupButtonText: {
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