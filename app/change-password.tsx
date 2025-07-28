// ChangePasswordScreen.tsx

"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
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
} from "react-native"
import { useThemeContext } from "../components/ThemeContext"
import axios from "axios"

const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ API Service for password reset
const authApiService = {
  // Send password reset email
  sendPasswordResetEmail: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email: email,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error sending password reset email:", error.response?.data || error.message)
      throw error
    }
  },

  // Verify if email exists (optional - for better UX)
  checkEmailExists: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/check-email`, {
        email: email,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error checking email:", error.response?.data || error.message)
      throw error
    }
  },
}

const ForgotPasswordScreen = () => {
  const { theme } = useThemeContext()
  const isDark = theme === "dark"
  const [email, setEmail] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const themeColors = {
    background: isDark ? "#121212" : "#fff",
    text: isDark ? "#fff" : "#000",
    subtext: isDark ? "#aaa" : "#555",
    inputBg: isDark ? "#2b2b2b" : "#f5f5f5",
    border: isDark ? "#444" : "#ccc",
    borderFocused: "#007AFF",
    active: "#007AFF",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  }

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

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
    ]).start()
  }, [])

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    setSubmitting(true)

    try {
      // ✅ Call backend to send password reset email
      const response = await authApiService.sendPasswordResetEmail(email.trim())

      setSubmitting(false)

      // ✅ Show success message
      Alert.alert(
        "Reset Link Sent",
        "If an account with this email exists, you will receive a password reset link shortly. Please check your email and spam folder.",
        [
          {
            text: "OK",
            onPress: () => {
              // Clear the form
              setEmail("")
              setEmailTouched(false)
              // Navigate back to login
              router.push("/login")
            },
          },
        ],
      )
    } catch (error) {
      setSubmitting(false)

      // ✅ Handle different error scenarios
      if (error.response?.status === 404) {
        // Email not found - but don't reveal this for security
        Alert.alert(
          "Reset Link Sent",
          "If an account with this email exists, you will receive a password reset link shortly.",
          [{ text: "OK", onPress: () => router.push("/login") }],
        )
      } else if (error.response?.status === 429) {
        // Too many requests
        Alert.alert("Too Many Requests", "Please wait a few minutes before requesting another password reset.")
      } else if (error.response?.status === 400) {
        // Bad request - invalid email format
        Alert.alert("Error", "Please enter a valid email address")
      } else {
        // Generic error
        Alert.alert("Error", "Unable to send reset link. Please check your internet connection and try again.")
      }

      console.error("Password reset error:", error)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
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

            <Text style={[styles.title, { color: themeColors.text }]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: themeColors.subtext }]}>
              Enter your email address to reset your password.
            </Text>

            {/* Email Input */}
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: themeColors.inputBg,
                  borderColor:
                    emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? themeColors.error : themeColors.border,
                },
              ]}
            >
              <TextInput
                placeholder="Email"
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text }]}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>

            {/* Error Message */}
            {emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>Please enter a valid email address</Text>
            )}

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.button, { opacity: submitting ? 0.7 : 1 }]}
              onPress={handleResetPassword}
              disabled={submitting}
            >
              <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.gradientButton}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={[styles.linkText, { color: themeColors.active }]}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    marginTop: 20,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
})

export default ForgotPasswordScreen
