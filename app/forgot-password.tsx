"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { TouchableOpacity } from "react-native-gesture-handler"
import axios from "axios"

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const BASE_URL = "https://syncmeet-back.onrender.com"

  // ✅ API Service for password reset - Now only includes 'sendPasswordResetEmail'
  const authApiService = {
    // Send password reset email
    sendPasswordResetEmail: async (email) => {
      try {
        const response = await axios.post(`${BASE_URL}/req/forgot-password`, {
          email: email,
        })
        return response.data
      } catch (error) {
        console.error("❌ Error sending password reset email:", error.response?.data || error.message)
        throw error
      }
    },
    // Removed 'checkEmailExists' as per your request to only use /req/forgot-password
  }

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
      // ✅ Call backend to send password reset email - This is the ONLY API call now
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
        // Email not found - but don't reveal this for security (backend practice)
        Alert.alert(
          "Reset Link Sent",
          "If an account with this email exists, you will receive a password reset link shortly.",
          [{ text: "OK", onPress: () => router.push("/login") }],
        )
      } else if (error.response?.status === 429) {
        // Too many requests
        Alert.alert("Too Many Requests", "Please wait a few minutes before requesting another password reset.")
      } else if (error.response?.status === 400) {
        // Bad request - invalid email format (from backend validation)
        Alert.alert("Error", "Please enter a valid email address")
      } else if (error.response?.status === 403) {
        // Handle 403 Forbidden specifically
        Alert.alert("Error", "Access denied. There might be a server configuration issue (CORS, CSRF, or security rules) preventing this request.")
      }
      else {
        // Generic error
        Alert.alert("Error", "Unable to send reset link. Please check your internet connection and try again.")
      }

      console.error("Password reset error:", error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Lock Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.lockIcon}>
          <Text style={styles.lockText}>🔓</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Reset Password</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Enter your email to receive a{"\n"}password reset link
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.emailIcon}>✉</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
        />
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoIcon}>ⓘ</Text>
        <Text style={styles.infoText}>
          We'll send you a link to reset your password. Make sure to check your spam folder.
        </Text>
      </View>

      {/* Send Reset Link Button */}
      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.signInLink}>Sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Error Text */}
      {emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length > 0 && (
        <Text style={styles.errorText}>Please enter a valid email address</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
  },
  emailIcon: {
    fontSize: 16,
    color: "#666",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 0,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  infoIcon: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: "#999",
  },
  signInLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
})

export default ForgotPasswordScreen
