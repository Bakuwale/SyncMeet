import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../components/auth-context';
import PhotoUpload from '../components/PhotoUpload';
import { themeColors, useThemeContext } from '../components/ThemeContext';

const AVATAR_SIZE = 110;

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { theme } = useThemeContext();
  const colors = themeColors[theme];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (updateUser) {
      // Update user data with JSON
      // If profilePhoto is a local URI (starts with 'file://'), it will be handled
      // separately by the updateUser function using the fileUploadService
      const result = await updateUser({ 
        fullName, 
        email, 
        phone, 
        profilePhoto 
      });
      
      if (!result.success) {
        // Handle error
        console.error('Failed to update profile:', result.error);
      }
    }
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.form, { backgroundColor: colors.cardBackground, shadowColor: colors.textPrimary }]}> 
          {/* Avatar Section */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={() => setPhotoModalVisible(true)} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={[styles.avatar, { borderColor: colors.accent }]} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.background, borderColor: colors.borderColor, justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={{ color: colors.textTertiary, fontSize: 36, fontWeight: 'bold' }}>+</Text>
              </View>
            )}
            <Text style={[styles.avatarText, { color: colors.accent }]}>Tap to change photo</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textTertiary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.borderColor }]} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <PhotoUpload
        currentPhoto={profilePhoto || undefined}
        visible={photoModalVisible}
        onPhotoSelected={(uri) => setProfilePhoto(uri)}
        onClose={() => setPhotoModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  form: {
    borderRadius: 24,
    padding: 28,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
    minHeight: 520,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    width: '100%',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
