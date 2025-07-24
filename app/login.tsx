import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useAuth } from '../components/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  // Remove fullName state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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
    google: '#fff',
    apple: '#222',
    googleText: '#000',
    appleText: '#fff',
  };

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await login({ email, password });
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      setErrors({ email: 'Invalid credentials' });
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
                <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: theme.placeholder }]}>Sign in to continue to SyncMeet</Text>
              </View>
                <View style={styles.form}>
                {/* Remove Full Name input field */}
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
                {errors?.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
                {errors?.password && <Text style={styles.errorText}>{errors.password}</Text>}
                <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
                  <Text style={[styles.forgotText, { color: theme.accent }]}>Forgot password?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  style={[styles.signInBtn, { backgroundColor: theme.btn }]}
                  onPress={handleSignIn}
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.btnText} />
                  ) : (
                    <Text style={[styles.signInText, { color: theme.btnText }]}>Sign In</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.bottomRow}>
                  <Text style={{ color: theme.placeholder }}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text style={[styles.signupText, { color: theme.accent }]}>Sign up</Text>
                  </TouchableOpacity>
                </View>
                </View>
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
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '500' },
  signInBtn: {
    height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  signInText: { fontSize: 18, fontWeight: 'bold' },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
  },
  divider: { flex: 1, height: 1, marginHorizontal: 8 },
  orText: { fontSize: 14 },
  socialRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32,
  },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 12,
    flex: 1, justifyContent: 'center', marginHorizontal: 4,
    borderWidth: 1, borderColor: '#333',
  },
  socialText: { marginLeft: 8, fontSize: 16, fontWeight: '600' },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 16,
  },
  signupText: { fontWeight: 'bold' },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
}); 
