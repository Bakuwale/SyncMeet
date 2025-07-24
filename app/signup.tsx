// SignupScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import PhotoUpload from '../components/PhotoUpload';
import { useAuth } from '../components/auth-context';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirm?: string }>({});
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
      duration: 700,
        useNativeDriver: true,
    }).start();
  }, []);

  const theme = {
    bg: '#111',
    card: '#222',
    text: '#fff',
    inputBg: '#222',
    inputText: '#fff',
    placeholder: '#aaa',
    accent: '#007AFF',
    btn: '#2979ff',
    btnText: '#fff',
    divider: '#333',
  };

  const validate = () => {
    const errs: { fullName?: string; email?: string; password?: string; confirm?: string } = {};
    if (!fullName) errs.fullName = 'Full Name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await signup({ fullName, email, password, profilePhoto });
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      setErrors({ email: 'Signup failed' });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}> 
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.centered}>
                <View style={styles.iconCircle}>
                  <Ionicons name="videocam" size={48} color={theme.accent} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: theme.placeholder }]}>Join SyncMeet and start connecting</Text>
                <TouchableOpacity style={styles.photoCircle} onPress={() => setShowPhotoUpload(true)}>
                    {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.photoImg} />
                    ) : (
                    <Ionicons name="person" size={48} color={theme.placeholder} />
                    )}
                  <View style={styles.photoAddIcon}>
                    <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                <Text style={{ color: theme.placeholder, textAlign: 'center', marginBottom: 16 }}>
                  Tap to add profile photo
                </Text>
                </View>
              <View style={styles.form}>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                    <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                      placeholder="Full Name"
                    placeholderTextColor={theme.placeholder}
                    value={fullName}
                    onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                    <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                      placeholder="Email address"
                    placeholderTextColor={theme.placeholder}
                    value={email}
                    onChangeText={text => { setEmail(text); setEmailTouched(true); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onBlur={() => setEmailTouched(true)}
                    />
                </View>
                {/* Email format helper and error below input */}
                {emailTouched && email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email) && (
                  <Text style={{ color: 'orange', fontSize: 12, marginLeft: 12, marginBottom: 4 }}>
                    Please enter a valid email address (e.g. user@example.com)
                  </Text>
                )}
                {errors.email && <Text style={{ color: 'red', fontSize: 12, marginLeft: 12, marginBottom: 4 }}>{errors.email}</Text>}
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                    <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                      placeholder="Password"
                    placeholderTextColor={theme.placeholder}
                    value={password}
                    onChangeText={text => { setPassword(text); setPasswordTouched(true); }}
                      secureTextEntry
                      onBlur={() => setPasswordTouched(true)}
                    />
                </View>
                {/* Password length helper and error below input */}
                {passwordTouched && password.length > 0 && password.length < 6 && (
                  <Text style={{ color: 'orange', fontSize: 12, marginLeft: 12, marginBottom: 4 }}>
                    Password must be at least 6 characters
                  </Text>
                )}
                {errors.password && <Text style={{ color: 'red', fontSize: 12, marginLeft: 12, marginBottom: 4 }}>{errors.password}</Text>}
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                    <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                      placeholder="Confirm Password"
                    placeholderTextColor={theme.placeholder}
                    value={confirm}
                    onChangeText={setConfirm}
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity 
                  style={[styles.signUpBtn, { backgroundColor: theme.btn }]}
                  onPress={handleCreateAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.btnText} />
                      ) : (
                    <Text style={[styles.signUpText, { color: theme.btnText }]}>Create Account</Text>
                      )}
                  </TouchableOpacity>
                </View>
              <View style={styles.bottomRow}>
                <Text style={{ color: theme.placeholder }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={[styles.signinText, { color: theme.accent }]}>Sign in</Text>
                </TouchableOpacity>
                </View>
              <PhotoUpload
                visible={showPhotoUpload}
                currentPhoto={profilePhoto || undefined}
                onPhotoSelected={setProfilePhoto}
                onClose={() => setShowPhotoUpload(false)}
              />
              </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  centered: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#222',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  photoCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#222',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    position: 'relative',
  },
  photoImg: { width: 90, height: 90, borderRadius: 45 },
  photoAddIcon: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF',
    borderRadius: 16, padding: 4, borderWidth: 2, borderColor: '#fff',
  },
  form: {},
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 8, marginBottom: 16,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: '#333',
  },
  inputIcon: { marginLeft: 12, marginRight: 8 },
  input: {
    flex: 1, height: 48, fontSize: 16, borderRadius: 8, paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  signUpBtn: {
    height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  signUpText: { fontSize: 18, fontWeight: 'bold' },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 16,
  },
  signinText: { fontWeight: 'bold' },
});
