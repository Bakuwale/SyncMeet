import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
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

export default function ChangePasswordScreen() {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Focus states for animations
  const [oldPasswordFocused, setOldPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
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
  };

  const validatePassword = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6) return 'weak';
    if (newPassword.length < 8) return 'medium';
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

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // For demo purposes, we'll simulate password verification
    // In a real app, you would verify the old password with your backend
    if (oldPassword.length < 3) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Success', 
        'Your password has been changed successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    }, 1500);
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
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={themeColors.accent} />
              </TouchableOpacity>
              
              <View style={[styles.logoContainer, { backgroundColor: themeColors.cardBackground }]}>
                <Ionicons name="lock-closed" size={40} color={themeColors.accent} />
              </View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                Change Password
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Enter your current password and choose a new one
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Current Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={oldPasswordFocused ? themeColors.accent : themeColors.textSecondary} 
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: oldPasswordFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    }
                  ]}
                  placeholder="Current password"
                  placeholderTextColor={themeColors.textSecondary}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  onFocus={() => setOldPasswordFocused(true)}
                  onBlur={() => setOldPasswordFocused(false)}
                />
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={newPasswordFocused ? themeColors.accent : themeColors.textSecondary} 
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: newPasswordFocused ? themeColors.inputBorderFocused : themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    }
                  ]}
                  placeholder="New password"
                  placeholderTextColor={themeColors.textSecondary}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                />
              </View>

              {/* Password Strength */}
              {newPassword.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${Math.min((newPassword.length / 8) * 100, 100)}%`,
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
                  placeholder="Confirm new password"
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
                    name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={newPassword === confirmPassword ? themeColors.success : themeColors.error} 
                  />
                  <Text style={[
                    styles.passwordMatchText, 
                    { color: newPassword === confirmPassword ? themeColors.success : themeColors.error }
                  ]}>
                    {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              {/* Info Text */}
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                  Your new password must be at least 6 characters long and should be different from your current password.
                </Text>
              </View>

              {/* Change Password Button */}
              <TouchableOpacity 
                style={[styles.changeButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleChangePassword}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={themeColors.accentGradient}
                  style={styles.gradientButton}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.changeButtonText}>Change Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
  changeButton: {
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
  changeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 