import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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

const USER_PROFILE_KEY = 'user_profile_data';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profilePhoto: string | null;
}

export default function EditProfileScreen() {
  const { user, updateUserProfile } = useAuth();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  const themeColors = {
    background: isDarkTheme ? '#121212' : '#ffffff',
    cardBackground: isDarkTheme ? '#1e1e1e' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    textTertiary: isDarkTheme ? '#888888' : '#999999',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f1f1f1',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
  };

  // Load existing profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        const profileData: UserProfile = JSON.parse(storedProfile);
        setName(profileData.name || user?.email?.split('@')[0] || '');
        setEmail(profileData.email || user?.email || '');
        setPhone(profileData.phone || '');
        setProfilePhoto(profileData.profilePhoto || null);
      } else {
        // Initialize with default values
        setName(user?.email?.split('@')[0] || '');
        setEmail(user?.email || '');
        setPhone('');
        setProfilePhoto(null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Fallback to default values
      setName(user?.email?.split('@')[0] || '');
      setEmail(user?.email || '');
      setPhone('');
      setProfilePhoto(null);
    }
  };

  // Check for changes
  useEffect(() => {
    const originalName = user?.email?.split('@')[0] || '';
    const originalEmail = user?.email || '';
    
    const hasNameChanged = name !== originalName;
    const hasEmailChanged = email !== originalEmail;
    const hasPhoneChanged = phone !== '';
    const hasPhotoChanged = profilePhoto !== null;
    
    setHasChanges(hasNameChanged || hasEmailChanged || hasPhoneChanged || hasPhotoChanged);
  }, [name, email, phone, profilePhoto, user]);

  const saveProfileData = async (profileData: UserProfile) => {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
      return true;
    } catch (error) {
      console.error('Error saving profile data:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in both name and email fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    
    try {
      const profileData: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profilePhoto: profilePhoto,
      };

      // Save to AsyncStorage
      const saveSuccess = await saveProfileData(profileData);
      
      if (saveSuccess) {
        // Update auth context if available
        if (updateUserProfile) {
          updateUserProfile({
            ...user,
            name: profileData.name,
            email: profileData.email,
            profilePhoto: profileData.profilePhoto,
          });
        }

        Alert.alert(
          'Profile Updated', 
          'Your profile has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setHasChanges(false);
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              loadProfileData(); // Reload original data
              setHasChanges(false);
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePhotoSelected = (photoUri: string) => {
    setProfilePhoto(photoUri);
  };

  const handleChangePassword = () => {
    router.push('/change-password' as any);
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Privacy settings will be implemented here. You can configure who can see your profile, contact you, and access your information.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Edit Profile</Text>
          <View style={{ width: 60 }} /> {/* Spacer for centering */}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={() => setShowPhotoUpload(true)}
            >
              <Image
                source={profilePhoto ? { uri: profilePhoto } : require('../assets/images/profile.jpg')}
                style={styles.profilePhoto}
              />
              <View style={[styles.photoEditButton, { backgroundColor: themeColors.accent }]}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoLabel, { color: themeColors.textSecondary }]}>
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Full Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
                <Ionicons name="person-outline" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={themeColors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Email Address</Text>
              <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
                <Ionicons name="mail-outline" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }]}
                  placeholder="Enter your email address"
                  placeholderTextColor={themeColors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Phone Number (Optional)</Text>
              <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
                <Ionicons name="call-outline" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: themeColors.textPrimary }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={themeColors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.optionsSection}>
            <TouchableOpacity 
              style={[styles.optionItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.borderColor }]}
              onPress={handleChangePassword}
            >
              <Ionicons name="lock-closed-outline" size={20} color={themeColors.textSecondary} />
              <Text style={[styles.optionText, { color: themeColors.textPrimary }]}>Change Password</Text>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.borderColor }]}
              onPress={handlePrivacySettings}
            >
              <Ionicons name="shield-outline" size={20} color={themeColors.textSecondary} />
              <Text style={[styles.optionText, { color: themeColors.textPrimary }]}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Spacer for bottom buttons */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={[styles.bottomButtons, { backgroundColor: themeColors.background, borderTopColor: themeColors.borderColor }]}>
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: themeColors.borderColor }]}
            onPress={handleCancel}
            disabled={submitting}
          >
            <Text style={[styles.cancelButtonText, { color: themeColors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { 
                backgroundColor: hasChanges ? themeColors.accent : themeColors.textTertiary,
                opacity: submitting ? 0.7 : 1
              }
            ]}
            onPress={handleSave}
            disabled={submitting || !hasChanges}
          >
            {submitting ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoEditButton: {
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
  photoLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 100, // Space for bottom buttons
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 