// ChangePasswordScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useThemeContext } from '../components/ThemeContext';

export default function ChangePasswordScreen() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const themeColors = {
    background: isDark ? '#121212' : '#fff',
    text: isDark ? '#fff' : '#000',
    subtext: isDark ? '#aaa' : '#555',
    inputBg: isDark ? '#2b2b2b' : '#f5f5f5',
    border: isDark ? '#444' : '#ccc',
    active: '#007AFF',
  };

  const handleChange = () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              padding: 24,
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={themeColors.active} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: themeColors.text }]}>Change Password</Text>
            <Text style={[styles.subtitle, { color: themeColors.subtext }]}>
              Enter your current and new password below.
            </Text>

            {/* Inputs */}
            {[
              {
                value: oldPass,
                setter: setOldPass,
                placeholder: 'Current password',
              },
              {
                value: newPass,
                setter: setNewPass,
                placeholder: 'New password',
              },
              {
                value: confirmPass,
                setter: setConfirmPass,
                placeholder: 'Confirm new password',
              },
            ].map(({ value, setter, placeholder }, i) => (
              <View
                key={i}
                style={[styles.inputBox, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}
              >
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor={themeColors.subtext}
                  style={[styles.input, { color: themeColors.text }]}
                  secureTextEntry
                  value={value}
                  onChangeText={setter}
                  returnKeyType="next"
                />
              </View>
            ))}

            {/* Button */}
            <TouchableOpacity
              style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleChange}
              disabled={loading}
            >
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Update Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, marginBottom: 30 },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  input: {
    height: 50,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
