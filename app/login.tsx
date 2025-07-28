"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native"
import { useAuth } from "../components/auth-context"
import axios from "axios"

const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ API Service - Now only for user login (as per your request)
const authApiService = {
  // User login endpoint. Only this endpoint call is retained.
  login: async (email, password) => {
    try {
      console.log("🔄 Attempting login with:", { email, baseUrl: BASE_URL })

      const response = await axios.post(`${BASE_URL}/req/login`, {
        email: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Origin' header is typically handled by the browser/runtime and not explicitly set in React Native Axios.
          // 'X-Requested-With': 'XMLHttpRequest', // Often automatically sent by Axios
        },
        timeout: 15000, // 15 second timeout for slow servers
        withCredentials: false, // Ensure this matches your backend's cookie/session strategy
      })

      console.log("✅ Login response status:", response.status)
      console.log("✅ Login response headers:", response.headers)
      console.log("✅ Login response data:", JSON.stringify(response.data, null, 2))

      return response.data
    } catch (error) {
      console.error("❌ Login request failed:")
      console.error("- Status:", error.response?.status)
      console.error("- Status Text:", error.response?.statusText)
      console.error("- Response Headers:", error.response?.headers)
      console.error("- Response Data:", JSON.stringify(error.response?.data, null, 2))
      console.error("- Request URL:", error.config?.url)
      console.error("- Request Headers:", error.config?.headers)
      console.error("- Error Message:", error.message)
      console.error("- Error Code:", error.code)

      if (error.response?.status === 403) {
        console.error("🚫 403 Forbidden Error Details:")
        console.error("- This usually indicates CORS issues or server-side authorization middleware blocking the request.")
        console.error("- Server response body:", error.response?.data)
        console.error("- Check if your backend allows requests from your domain and for this /req/login endpoint.")
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - server is taking too long to respond')
      }

      throw error
    }
  },

  // Removed all other API calls (testConnection, refreshToken, getUserProfile, verifyEmail)
  // as per your request to only call '/req/login'.
}

export default function LoginScreen() {
  const router = useRouter()
  // Renamed 'login' from useAuth to 'authLogin' to avoid naming conflict with local function
  const { login: authLogin } = useAuth()

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validation states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  // UI states related to login attempts are now restored
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start()
  }, [])

  // ✅ Handle account lockout timer - Restored
  useEffect(() => {
    let timer
    if (isBlocked && blockTimeRemaining > 0) {
      timer = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false)
            setLoginAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isBlocked, blockTimeRemaining])

  const theme = {
    bg: "#111",
    card: "#222",
    text: "#fff",
    inputBg: "#222",
    inputText: "#fff",
    placeholder: "#aaa",
    accent: "#007AFF",
    btn: "#2979ff",
    btnText: "#fff",
    divider: "#333",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  }

  // ✅ Validation with better error messages (client-side only)
  const validate = () => {
    const errs: { email?: string; password?: string } = {}

    // Email validation
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address"
    }

    // Password validation
    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ✅ handleSignIn now performs a login operation to /req/login
  const handleSignIn = async () => {
    // Check if account is blocked - Restored
    if (isBlocked) {
      Alert.alert(
        "Account Temporarily Locked",
        `Too many failed login attempts. Please try again in ${formatBlockTime(blockTimeRemaining)}.`,
      )
      return
    }

    // Validate form
    if (!validate()) return

    setLoading(true)
    setErrors({}) // Clear previous errors

    try {
      console.log("🚀 Starting login process...")

      // ✅ Call backend login API
      const loginResponse = await authApiService.login(email.trim(), password)

      console.log("📦 Raw login response:", loginResponse)

      // ✅ FLEXIBLE token extraction - handle different response structures
      let accessToken, refreshToken, user, expiresIn

      // Common response structures from Spring Boot backends:
      // Structure 1: Direct properties
      if (loginResponse.accessToken || loginResponse.access_token) {
        accessToken = loginResponse.accessToken || loginResponse.access_token
        refreshToken = loginResponse.refreshToken || loginResponse.refresh_token
        user = loginResponse.user || loginResponse.userDetails || loginResponse.userData
        expiresIn = loginResponse.expiresIn || loginResponse.expires_in || loginResponse.expiry
      }
      // Structure 2: Nested in 'data' property
      else if (loginResponse.data) {
        accessToken = loginResponse.data.accessToken || loginResponse.data.access_token
        refreshToken = loginResponse.data.refreshToken || loginResponse.data.refresh_token
        user = loginResponse.data.user || loginResponse.data.userDetails
        expiresIn = loginResponse.data.expiresIn || loginResponse.data.expires_in
      }
      // Structure 3: Token directly as property name
      else if (loginResponse.token) {
        accessToken = loginResponse.token
        refreshToken = loginResponse.refreshToken
        user = loginResponse.user
        expiresIn = loginResponse.expiresIn
      }
      // Structure 4: JWT structure
      else if (loginResponse.jwt || loginResponse.jwtToken) {
        accessToken = loginResponse.jwt || loginResponse.jwtToken
        refreshToken = loginResponse.refreshToken
        user = loginResponse.user
        expiresIn = loginResponse.expiresIn
      }

      console.log("🔍 Extracted tokens:", {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
        user: user,
        expiresIn: expiresIn
      })

      // ✅ Check if we got an access token
      if (!accessToken) {
        console.error("❌ No access token found in response structure:")
        console.error("Available keys:", Object.keys(loginResponse))

        const possibleTokenKeys = Object.keys(loginResponse).filter(key =>
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('access') ||
          key.toLowerCase().includes('jwt')
        )

        if (possibleTokenKeys.length > 0) {
          console.log("🔍 Possible token keys found:", possibleTokenKeys)
          Alert.alert(
            "Debug Info",
            `No standard token found. Available keys: ${Object.keys(loginResponse).join(', ')}\n\nPossible tokens: ${possibleTokenKeys.join(', ')}`
          )
        }

        throw new Error(`No access token received. Response keys: ${Object.keys(loginResponse).join(', ')}`)
      }

      // No getUserProfile or refreshToken or verifyEmail call, as per request.
      let userProfile = user || { email: email.trim() }; // Fallback user data

      // ✅ Store authentication data (using your auth context)
      const authData = {
        email: email.trim(),
        password: password, // Note: In production, don't store passwords
        accessToken,
        refreshToken, // Even if not used for refresh, store if backend sends it.
        user: userProfile,
        expiresIn,
      }

      console.log("💾 Storing auth data:", {
        ...authData,
        password: '[REDACTED]',
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null'
      })

      const loginSuccess = await authLogin(authData)

      setLoading(false)

      if (loginSuccess) {
        // Reset login attempts on successful login - Restored
        setLoginAttempts(0)
        setIsBlocked(false)

        console.log("🎉 Login successful, navigating to main app...")

        // ✅ Navigate to main app
        router.replace("/(tabs)")

        // Show welcome message
        const userName = userProfile?.name || userProfile?.firstName || userProfile?.email || "User"
        Alert.alert("Welcome Back!", `Hello ${userName}!`)
      } else {
        throw new Error("Authentication context rejected the login data")
      }
    } catch (error) {
      setLoading(false)

      console.error("🚨 Login process failed:", error)

      // ✅ Handle different error scenarios with better messaging
      let errorMessage = "Login failed. Please try again."

      if (error.message && error.message.includes("No access token received")) {
        // This is our custom error when token extraction fails
        errorMessage = "Server response format error. Please contact support with this info: " + error.message
      } else if (error.response?.status === 401) {
        // Invalid credentials
        errorMessage = "Invalid email or password. Please check your credentials and try again."
        setErrors({ email: "Invalid credentials" })

        // ✅ Implement login attempt tracking - Restored
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        if (newAttempts >= 5) { // Example: Block after 5 attempts
          setIsBlocked(true)
          setBlockTimeRemaining(300) // 5 minutes
          errorMessage = "Too many failed attempts. Account locked for 5 minutes."
        } else {
          errorMessage += ` (${5 - newAttempts} attempts remaining)`
        }
      } else if (error.response?.status === 403) {
        // ✅ Enhanced 403 Forbidden error handling
        const message = error.response.data?.message || error.response.data?.error || "Access forbidden"

        if (message.includes("verify") || message.includes("email")) {
          errorMessage = "Please verify your email address before logging in."
          // Removed auto-resend verification as per simplification
        } else if (message.includes("disabled") || message.includes("suspended")) {
          errorMessage = "Your account has been disabled. Please contact support."
        } else if (message.includes("CORS") || message.includes("origin")) {
          errorMessage = "Server configuration error (CORS). Please contact support."
        } else {
          // General 403 error - likely CORS or server configuration issue
          errorMessage = `Access forbidden. This might be a server configuration issue. Please try again or contact support.`
        }
      } else if (error.response?.status === 429) {
        // Rate limiting
        errorMessage = "Too many login attempts. Please wait a few minutes and try again."
        setIsBlocked(true)
        setBlockTimeRemaining(180) // 3 minutes
      } else if (error.response?.status === 400) {
        // Bad request - validation errors
        const message = error.response.data?.message || "Invalid login data"
        errorMessage = message
      } else if (error.response?.status === 500) {
        // Server error
        errorMessage = "Server error. Please try again later or contact support if the problem persists."
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        errorMessage = "Request timeout. The server is taking too long to respond. Please try again."
      } else if (!error.response) {
        // Network error
        errorMessage = "Network error. Please check your internet connection and try again."
      }

      Alert.alert("Login Failed", errorMessage)
    }
  }

  // ✅ Handle forgot password - Restored navigation
  const handleForgotPassword = () => {
    if (email.trim() && /^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      // Pre-fill email in forgot password screen
      router.push({
        pathname: "/forgot-password",
        params: { email: email.trim() },
      })
    } else {
      router.push("/forgot-password")
    }
  }

  // ✅ Format block time remaining - Restored
  const formatBlockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.centered}>
                <View style={styles.iconCircle}>
                  <Ionicons name="videocam" size={48} color={theme.accent} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: theme.placeholder }]}>Sign in to continue to SyncMeet</Text>
              </View>

              <View style={styles.form}>
                {/* Account Lock Warning - Restored */}
                {isBlocked && (
                  <View style={[styles.warningBox, { backgroundColor: theme.error + "20", borderColor: theme.error }]}>
                    <Ionicons name="warning" size={20} color={theme.error} />
                    <Text style={[styles.warningText, { color: theme.error }]}>
                      Account locked. Try again in {formatBlockTime(blockTimeRemaining)}
                    </Text>
                  </View>
                )}

                {/* Email Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor: errors.email || (emailTouched && !email.trim()) ? theme.error : theme.divider,
                    },
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                    placeholder="Email address"
                    placeholderTextColor={theme.placeholder}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      setEmailTouched(true)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={() => setEmailTouched(true)}
                    editable={!isBlocked} // Restored
                    returnKeyType="next"
                  />
                </View>

                {/* Email validation helper */}
                {emailTouched && email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email.trim()) && !errors.email && (
                  <Text style={[styles.helperText, { color: theme.warning }]}>
                    Please enter a valid email address (e.g. user@example.com)
                  </Text>
                )}
                {errors?.email && <Text style={[styles.errorText, { color: theme.error }]}>{errors.email}</Text>}

                {/* Password Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor: errors.password || (passwordTouched && !password) ? theme.error : theme.divider,
                    },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                    placeholder="Password"
                    placeholderTextColor={theme.placeholder}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      setPasswordTouched(true)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    secureTextEntry={!showPassword}
                    onBlur={() => setPasswordTouched(true)}
                    editable={!isBlocked} // Restored
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.placeholder} />
                  </TouchableOpacity>
                </View>

                {/* Password validation helper */}
                {passwordTouched && password.length > 0 && password.length < 6 && !errors.password && (
                  <Text style={[styles.helperText, { color: theme.warning }]}>
                    Password must be at least 6 characters
                  </Text>
                )}
                {errors?.password && <Text style={[styles.errorText, { color: theme.error }]}>{errors.password}</Text>}

                {/* Forgot Password Link - Functionality Restored */}
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                  <Text style={[styles.forgotText, { color: theme.accent }]}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.signInBtn,
                    {
                      backgroundColor: theme.btn,
                      opacity: loading || isBlocked || !email || !password ? 0.6 : 1, // Restored isBlocked
                    },
                  ]}
                  onPress={handleSignIn}
                  disabled={loading || isBlocked || !email || !password} // Restored isBlocked
                >
                  {loading ? (
                    <ActivityIndicator color={theme.btnText} />
                  ) : (
                    <Text style={[styles.signInText, { color: theme.btnText }]}>
                      {isBlocked ? `Locked (${formatBlockTime(blockTimeRemaining)})` : "Sign In"} {/* Restored text */}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.bottomRow}>
                  <Text style={{ color: theme.placeholder }}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/signup")}>
                    <Text style={[styles.signupText, { color: theme.accent }]}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  centered: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  form: {},
  // Restored warningBox style
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333",
  },
  inputIcon: { marginLeft: 12, marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  eyeButton: {
    padding: 12,
  },
  helperText: {
    fontSize: 12,
    marginLeft: 12,
    marginBottom: 4,
    marginTop: -12,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: "500" },
  signInBtn: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  signInText: { fontSize: 18, fontWeight: "bold" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signupText: { fontWeight: "bold" },
})
