"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
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
} from "react-native"
import { useAuth } from "../components/auth-context"
import { api } from '../utils/api'

const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ API Service - Now only for user login (as per your request)
const authApiService = {
  // User login endpoint. Only this endpoint call is retained.
  login: async (email, password) => {
    try {
      const response = await api.login({ username: email, password })
      return response.data || response
    } catch (error) {
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
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validation states
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [usernameTouched, setUsernameTouched] = useState(false)
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
    const errs: { username?: string; password?: string } = {}

    // Username validation - allow spaces for full names
    if (!username.trim()) {
      errs.username = "Username is required"
    } else if (!/^[a-zA-Z0-9_\s]+$/.test(username.trim())) {
      errs.username = "Username can only contain letters, numbers, underscores, and spaces"
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
      // Call backend login API
      const loginResponse = await authApiService.login(username.trim(), password)

      // FLEXIBLE token extraction - handle different response structures
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

      // Check if we got an access token
      if (!accessToken) {
        const possibleTokenKeys = Object.keys(loginResponse).filter(key =>
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('access') ||
          key.toLowerCase().includes('jwt')
        )

        if (possibleTokenKeys.length > 0) {
          Alert.alert(
            "Debug Info",
            `No standard token found. Available keys: ${Object.keys(loginResponse).join(', ')}\n\nPossible tokens: ${possibleTokenKeys.join(', ')}`
          )
        }

        throw new Error(`No access token received. Response keys: ${Object.keys(loginResponse).join(', ')}`)
      }

      // No getUserProfile or refreshToken or verifyEmail call, as per request.
      let userProfile = user || { email: username.trim() }; // Fallback user data

      // Pass extracted data directly to auth context without creating intermediate object
      // This avoids any potential re-parsing of JSON
      const loginSuccess = await authLogin({
        email: username.trim(),
        password: password,
        accessToken,
        refreshToken,
        user: userProfile,
        expiresIn
      })

      setLoading(false)

      if (loginSuccess) {
        // Reset login attempts on successful login
        setLoginAttempts(0)
        setIsBlocked(false)

        // Navigate to main app immediately
        router.replace("/(tabs)")
      } else {
        throw new Error("Authentication context rejected the login data")
      }
    } catch (error) {
      setLoading(false)

      // Handle different error scenarios with better messaging
      let errorMessage = "Login failed. Please try again."

      if (error.message && error.message.includes("No access token received")) {
        // This is our custom error when token extraction fails
        errorMessage = "Server response format error. Please contact support with this info: " + error.message
      } else if (error.response?.status === 401) {
        // Invalid credentials
        errorMessage = "Invalid email or password. Please check your credentials and try again."
        setErrors({ username: "Invalid credentials" })

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
    if (username.trim() && /^[a-zA-Z0-9_\s]+$/.test(username.trim())) {
      // Pre-fill email in forgot password screen
      router.push({
        pathname: "/forgot-password",
        params: { email: username.trim() },
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

                {/* Username Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor: errors.username || (usernameTouched && !username.trim()) ? theme.error : theme.divider,
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                    placeholder="Full name or username"
                    placeholderTextColor={theme.placeholder}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text)
                      setUsernameTouched(true)
                      if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
                    }}
                    autoCapitalize="words"
                    keyboardType="default"
                    onBlur={() => setUsernameTouched(true)}
                    editable={!isBlocked} // Restored
                    returnKeyType="next"
                  />
                </View>

                {/* Username validation helper */}
                {usernameTouched && username.length > 0 && !/^[a-zA-Z0-9_\s]+$/.test(username.trim()) && !errors.username && (
                  <Text style={[styles.helperText, { color: theme.warning }]}>
                    Username can only contain letters, numbers, underscores, and spaces
                  </Text>
                )}
                {errors?.username && <Text style={[styles.errorText, { color: theme.error }]}>{errors.username}</Text>}

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
                      opacity: loading || isBlocked || !username || !password ? 0.6 : 1, // Restored isBlocked
                    },
                  ]}
                  onPress={handleSignIn}
                  disabled={loading || isBlocked || !username || !password} // Restored isBlocked
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
