"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
import PhotoUpload from "../components/PhotoUpload"
import { useAuth } from "../components/auth-context"
import axios from "axios"

const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ API Service for user registration - ONLY '/req/signup' is called here
const signupApiService = {
  // Register new user - Enhanced with better error handling and debugging
  registerUser: async (userData) => {
    try {
      console.log("🔄 Attempting to register user with JSON data...")
      
      // Log the request payload for debugging
      console.log("📤 Request payload:", JSON.stringify(userData, null, 2))
      
      const response = await axios.post(`${BASE_URL}/req/signup`, userData, {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "application/json",
        },
        timeout: 30000, // Increased timeout
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors, handle them gracefully
        }
      })
      
      if (response.status === 403) {
        throw new Error('BACKEND_SECURITY_BLOCK')
      }
      
      console.log("✅ Registration response status:", response.status)
      
      // Enhanced logging to understand the response structure
      console.log("✅ Response data type:", typeof response.data)
      console.log("✅ Response data keys:", Object.keys(response.data))
      
      // Log sample of key fields to confirm Axios's automatic JSON parsing
      console.log("✅ Sample accessToken:", response.data.accessToken ? response.data.accessToken.substring(0, 10) + '...' : 'not found')
      console.log("✅ Sample token:", response.data.token ? response.data.token.substring(0, 10) + '...' : 'not found')
      console.log("✅ Sample refreshToken:", response.data.refreshToken ? response.data.refreshToken.substring(0, 10) + '...' : 'not found')
      console.log("✅ User data present:", !!response.data.user)
      console.log("✅ Requires email verification:", !!response.data.requiresEmailVerification)
      
      // Full response data for debugging
      console.log("✅ Registration response data:", JSON.stringify(response.data, null, 2))
      
      // Return the data directly - Axios already parsed the JSON
      return response.data
    } catch (error) {
      console.error("❌ Error registering user:", error.response?.data || error.message)
      
      // Enhanced debugging for 403 errors
      if (error.response?.status === 403 || error.message === 'BACKEND_SECURITY_BLOCK') {
        console.error("🚫 403 FORBIDDEN - BACKEND CONFIGURATION ISSUE:")
        console.error("   → CORS: Server not allowing frontend domain")
        console.error("   → CSRF: Server expecting CSRF tokens")
        console.error("   → WAF: Web Application Firewall blocking request")
        console.error("   → Auth: Endpoint requiring authentication")
        console.error("   → Rate Limit: Too many requests from IP")
        console.error("")
        console.error("🔧 BACKEND FIXES NEEDED:")
        console.error("   1. Configure CORS to allow frontend domain")
        console.error("   2. Disable CSRF for API endpoints")
        console.error("   3. Check WAF/security rules")
        console.error("   4. Verify endpoint accessibility")
        
        // Create a more user-friendly error
        const backendError = new Error('BACKEND_CONFIGURATION_ERROR')
        backendError.userMessage = 'Server configuration issue. Please contact support.'
        throw backendError
      }
      
      // Log detailed error information
      console.error("- Status:", error.response?.status)
      console.error("- Status Text:", error.response?.statusText)
      console.error("- Response Headers:", error.response?.headers)
      console.error("- Response Data:", JSON.stringify(error.response?.data, null, 2))
      console.error("- Request URL:", error.config?.url)
      console.error("- Request Headers:", error.config?.headers)
      console.error("- Error Code:", error.code)
      
      throw error
    }
  },
  // All other API service functions (checkEmailAvailability, uploadProfilePhoto,
  // sendEmailVerification, checkUsernameAvailability) have been removed.
}

export default function SignupScreen() {
  const router = useRouter()
  const { signup } = useAuth()

  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // UI states
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Validation states
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirm?: string
    terms?: string
  }>({})
  const [fieldTouched, setFieldTouched] = useState({
    fullName: false,
    email: false, // Retained for client-side format validation and blur
    password: false,
    confirm: false,
  })

  // Real-time validation states - Removed email availability checks as API call is removed
  // const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  // const [emailChecking, setEmailChecking] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "#999" })

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start()
  }, [])

  // Removed real-time email availability check useEffect as its API call is removed.
  // useEffect(() => { ... }, [email, fieldTouched.email])

  // ✅ Real-time password strength check (client-side only)
  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({ score: 0, text: "", color: "#999" })
    }
  }, [password])

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

  // ✅ Enhanced password strength calculation (client-side only)
  const calculatePasswordStrength = (pwd) => {
    let score = 0
    const feedback = []
    const suggestions = []

    // Length check
    if (pwd.length >= 12) score += 2
    else if (pwd.length >= 8) score += 1
    else {
      feedback.push("8+ characters")
      suggestions.push("Use at least 8 characters (12+ for better security)")
    }

    // Lowercase check
    if (/[a-z]/.test(pwd)) score += 1
    else {
      feedback.push("lowercase")
      suggestions.push("Add lowercase letters (a-z)")
    }

    // Uppercase check
    if (/[A-Z]/.test(pwd)) score += 1
    else {
      feedback.push("uppercase")
      suggestions.push("Add uppercase letters (A-Z)")
    }

    // Number check
    if (/\d/.test(pwd)) score += 1
    else {
      feedback.push("number")
      suggestions.push("Add numbers (0-9)")
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1
    else {
      feedback.push("special char")
      suggestions.push("Add special characters (!@#$%^&*(),.?\":{}|<>)")
    }

    // Penalize common patterns
    if (/^123|abc|qwerty|password|admin|welcome/i.test(pwd)) {
      score = Math.max(0, score - 1)
      suggestions.push("Avoid common words and patterns")
    }

    // Penalize repeated characters
    if (/(.)(\1{2,})/.test(pwd)) {
      score = Math.max(0, score - 1)
      suggestions.push("Avoid repeating characters (e.g., 'aaa', '111')")
    }

    const strengthLevels = [
      { text: "Very Weak", color: "#FF3B30" },
      { text: "Weak", color: "#FF9500" },
      { text: "Fair", color: "#FFCC00" },
      { text: "Good", color: "#30D158" },
      { text: "Strong", color: "#34C759" },
    ]

    // Cap score at 5
    score = Math.min(score, 4)

    return {
      score,
      text: strengthLevels[score]?.text || "Very Weak",
      color: strengthLevels[score]?.color || "#FF3B30",
      feedback: feedback.length > 0 
        ? `Missing: ${feedback.join(", ")}` 
        : suggestions.length > 0 
          ? `Suggestion: ${suggestions[0]}` 
          : "All requirements met!",
    }
  }

  // ✅ Enhanced validation with comprehensive checks (client-side only)
  const validate = () => {
    const errs: {
      fullName?: string
      email?: string
      password?: string
      confirm?: string
      terms?: string
    } = {}

    // Full name validation
    if (!fullName.trim()) {
      errs.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      errs.fullName = "Full name can only contain letters and spaces"
    }

    // Email validation (client-side only, no email availability check API call)
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      // More specific email validation with better error messages
      if (email.includes(' ')) {
        errs.email = "Email cannot contain spaces"
      } else if (!email.includes('@')) {
        errs.email = "Email must contain an @ symbol"
      } else if (email.indexOf('@') === 0) {
        errs.email = "Email must have a username before the @ symbol"
      } else if (email.indexOf('@') === email.length - 1) {
        errs.email = "Email must have a domain after the @ symbol"
      } else if (!email.substring(email.indexOf('@')).includes('.')) {
        errs.email = "Email domain must contain a dot (.)"
      } else {
        errs.email = "Please enter a valid email address"
      }
    }
    // Removed specific check for emailAvailable === false as that API call is removed.
    // This will now be handled by backend 409 Conflict if email is duplicate.


    // Password validation
    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters"
    } else if (passwordStrength.score < 3) {
      errs.password = "Password is too weak. Please choose a stronger password"
    }

    // Confirm password validation
    if (!confirm) {
      errs.confirm = "Please confirm your password"
    } else if (password !== confirm) {
      errs.confirm = "Passwords do not match"
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      errs.terms = "You must accept the Terms of Service and Privacy Policy"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Debounce function to prevent multiple rapid submissions
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ✅ Enhanced account creation with backend integration - ONLY calling /req/signup
  const handleCreateAccount = debounce(async () => {
    if (!validate()) return
    
    // Prevent multiple submissions
    if (loading) {
      // Provide feedback when user tries to submit multiple times
      Alert.alert("Please wait", "Your account is being created...")
      return
    }
    
    setLoading(true)

    try {
      // ✅ Prepare user data as JSON object
      const userData = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: email.trim().toLowerCase(), // Add username field explicitly to match backend expectations
        password: password,
        acceptedTerms: acceptTerms,
        registrationSource: 'mobile_app',
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      };

      // Note: Profile photo upload would need to be handled separately
      // or through a different endpoint when using JSON content type
      // For now, we'll focus on fixing the registration issue

      const registrationResponse = await signupApiService.registerUser(userData);

      // ✅ Handle successful registration
      const { user, accessToken, refreshToken, requiresEmailVerification } = registrationResponse
      
      // Reset form fields after successful registration
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirm('')
      setProfilePhoto(null)
      setAcceptTerms(false)
      
      // Log the response structure to help with debugging
      console.log("✅ Registration response keys:", Object.keys(registrationResponse))
      console.log("✅ Access token available:", !!accessToken)
      console.log("✅ Refresh token available:", !!refreshToken)
      console.log("✅ User data available:", !!user)

      // ✅ Use auth context to complete signup
      const signupData = {
        fullName: fullName.trim(), // Changed from 'name' to 'fullName' to match auth context
        email: email.trim().toLowerCase(), // Ensure email is lowercase to match registration
        password: password,
        profilePhoto: profilePhoto, // Still passed to auth context if needed internally
        accessToken,
        refreshToken,
        user,
      }

      console.log("✅ Passing signup data to auth context with token:", accessToken ? "[TOKEN AVAILABLE]" : "[NO TOKEN]")
      const signupSuccess = await signup(signupData)

      setLoading(false)

      if (signupSuccess) {
        // ✅ Handle email verification requirement (logic remains, but the 'sendEmailVerification' API call is removed)
        if (requiresEmailVerification) {
          Alert.alert(
            "Account Created Successfully!",
            "Please check your email and click the verification link to activate your account. You can still use the app, but some features may be limited until verified.",
            [
              {
                text: "Resend Email",
                style: "default",
                onPress: async () => {
                  // No API call to resend email, as per your request to only use /req/signup
                  Alert.alert("Feature Unavailable", "Resend email verification is not supported from this screen directly.")
                },
              },
              {
                text: "Continue",
                style: "default",
                onPress: () => router.replace("/(tabs)"),
              },
            ],
          )
        } else {
          // ✅ Direct login for verified accounts
          Alert.alert("Welcome to SyncMeet!", `Hello ${fullName}! Your account has been created successfully.`, [
            {
              text: "Get Started",
              onPress: () => router.replace("/(tabs)"),
            },
          ])
        }
      } else {
        throw new Error("Signup failed in auth context")
      }
    } catch (error: any) {
      setLoading(false)
      
      // Log detailed error information for debugging
      console.error("❌ Signup error details:")
      console.error("- Error message:", error.message)
      console.error("- Status:", error.response?.status)
      console.error("- Status Text:", error.response?.statusText)
      console.error("- Response Data:", JSON.stringify(error.response?.data, null, 2))
      console.error("- Stack:", error.stack)

      // ✅ Handle different error scenarios with enhanced backend error detection
      let errorMessage = "Account creation failed. Please try again."

      // Specifically handle JSON parsing errors
      if (error.message && error.message.includes('JSON')) {
        console.error("❌ JSON PARSING ERROR DETECTED:", error.message)
        console.error("- Original response:", error.response?.data)
        errorMessage = "There was an error processing the server response. Please try again or contact support."
      }
      // Handle enhanced backend configuration errors
      else if (error.message === 'BACKEND_CONFIGURATION_ERROR') {
        errorMessage = "Server configuration issue. Our team has been notified. Please try again later or contact support."
      } else if (error.response?.status === 400) {
        // Validation errors from backend
        const backendErrors = error.response.data?.errors || {}
        if (backendErrors.email) {
          setErrors((prev) => ({ ...prev, email: backendErrors.email }))
          errorMessage = "Email validation failed. Please check your email address."
        } else if (backendErrors.password) {
          setErrors((prev) => ({ ...prev, password: backendErrors.password }))
          errorMessage = "Password validation failed. Please choose a stronger password."
        } else {
          errorMessage = error.response.data?.message || "Invalid registration data."
        }
      } else if (error.response?.status === 409) {
        // Email already exists (handled by /req/signup directly now)
        setErrors((prev) => ({ ...prev, email: "This email is already registered" }))
        errorMessage = "An account with this email already exists. Please use a different email or try logging in."
      } else if (error.response?.status === 429) {
        // Rate limiting
        errorMessage = "Too many registration attempts. Please wait a few minutes and try again."
      } else if (error.response?.status === 403) {
        // Enhanced 403 error handling
        errorMessage = "Server access denied. This appears to be a backend configuration issue. Please contact support or try again later."
        console.error("🚨 403 FORBIDDEN: Backend server configuration blocking signup requests")
      } else if (!error.response) {
        // Network error (no response from server)
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. The server is taking too long to respond. Please try again later."
        } else if (error.message.includes('Network Error')) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else {
          errorMessage = "Connection error. Please check your internet connection and try again later."
        }
        console.error("🌐 Network/Connection Error:", error.code, error.message)
      }

      Alert.alert("Registration Failed", errorMessage)
      console.error("Signup error:", error)
    }
  }, 500) // 500ms debounce delay

  // ✅ Handle profile photo selection (client-side only)
  const handlePhotoSelected = (photoUri: string) => {
    // Store the photo URI locally - we'll handle the actual upload separately
    // after account creation using a dedicated endpoint that supports multipart/form-data
    setProfilePhoto(photoUri)
    setShowPhotoUpload(false)
    
    // Inform user about photo upload limitation
    if (photoUri) {
      Alert.alert(
        "Photo Upload Notice",
        "Your profile photo will be saved locally but won't be uploaded during registration. You can upload it after creating your account.",
        [{ text: "OK", style: "default" }]
      )
    }
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
                <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: theme.placeholder }]}>Join SyncMeet and start connecting</Text>

                {/* Profile Photo Upload */}
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
                <Text style={{ color: theme.placeholder, textAlign: "center", marginBottom: 16 }}>
                  Tap to add profile photo (optional)
                </Text>
              </View>

              <View style={styles.form}>
                {/* Full Name Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor:
                        errors.fullName || (fieldTouched.fullName && !fullName.trim()) ? theme.error : theme.divider,
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.placeholder}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text)
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                    }}
                    onBlur={() => setFieldTouched((prev) => ({ ...prev, fullName: true }))}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                {errors.fullName && <Text style={[styles.errorText, { color: theme.error }]}>{errors.fullName}</Text>}

                {/* Email Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      // Border color now only reflects client-side validation errors
                      borderColor:
                        errors.email || (fieldTouched.email && !email.trim())
                          ? theme.error
                          : theme.divider, // Adjusted emailAvailable logic
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
                      setFieldTouched((prev) => ({ ...prev, email: true }))
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={() => setFieldTouched((prev) => ({ ...prev, email: true }))}
                    returnKeyType="next"
                  />
                  {/* Removed ActivityIndicator and checkmark/close icons for email availability */}
                </View>

                {/* Email validation helpers */}
                {fieldTouched.email && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !errors.email && (
                  <Text style={[styles.helperText, { color: theme.warning }]}>
                    {email.includes(' ') ? "Email cannot contain spaces" :
                     !email.includes('@') ? "Email must contain an @ symbol" :
                     email.indexOf('@') === 0 ? "Email must have a username before the @ symbol" :
                     email.indexOf('@') === email.length - 1 ? "Email must have a domain after the @ symbol" :
                     !email.substring(email.indexOf('@')).includes('.') ? "Email domain must contain a dot (.)" :
                     "Please enter a valid email address (e.g. user@example.com)"}
                  </Text>
                )}
                {/* Removed success/error messages for email availability as the API call is removed */}
                {errors.email && <Text style={[styles.errorText, { color: theme.error }]}>{errors.email}</Text>}

                {/* Password Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor:
                        errors.password || (fieldTouched.password && !password) ? theme.error : theme.divider,
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
                      setFieldTouched((prev) => ({ ...prev, password: true }))
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    secureTextEntry={!showPassword}
                    onBlur={() => setFieldTouched((prev) => ({ ...prev, password: true }))}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.placeholder} />
                  </TouchableOpacity>
                </View>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.passwordStrengthFill,
                          {
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}
                {fieldTouched.password && password.length > 0 && passwordStrength.score < 3 && (
                  <Text style={[styles.helperText, { color: theme.warning }]}>{passwordStrength.feedback}</Text>
                )}
                {errors.password && <Text style={[styles.errorText, { color: theme.error }]}>{errors.password}</Text>}

                {/* Confirm Password Input */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      borderColor:
                        errors.confirm || (fieldTouched.confirm && !confirm)
                          ? theme.error
                          : confirm && password === confirm
                            ? theme.success
                            : theme.divider,
                    },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.placeholder}
                    value={confirm}
                    onChangeText={(text) => {
                      setConfirm(text)
                      setFieldTouched((prev) => ({ ...prev, confirm: true }))
                      if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }))
                    }}
                    secureTextEntry={!showConfirmPassword}
                    onBlur={() => setFieldTouched((prev) => ({ ...prev, confirm: true }))}
                    returnKeyType="done"
                    onSubmitEditing={handleCreateAccount}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={theme.placeholder} />
                  </TouchableOpacity>
                  {confirm && password === confirm && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.success} style={{ marginRight: 12 }} />
                  )}
                </View>

                {/* Password match indicator */}
                {confirm.length > 0 && (
                  <Text style={[styles.helperText, { color: password === confirm ? theme.success : theme.error }]}>
                    {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </Text>
                )}
                {errors.confirm && <Text style={[styles.errorText, { color: theme.error }]}>{errors.confirm}</Text>}

                {/* Terms and Conditions */}
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={acceptTerms ? "checkbox" : "square-outline"}
                    size={20}
                    color={acceptTerms ? theme.accent : theme.placeholder}
                  />
                  <Text style={[styles.termsText, { color: theme.placeholder }]}>
                    I agree to the{" "}
                    <Text style={{ color: theme.accent, textDecorationLine: "underline" }}>Terms of Service</Text> and{" "}
                    <Text style={{ color: theme.accent, textDecorationLine: "underline" }}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text style={[styles.errorText, { color: theme.error }]}>{errors.terms}</Text>}

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[
                    styles.signUpBtn,
                    {
                      backgroundColor: theme.btn,
                      opacity: loading || !fullName || !email || !password || !confirm || !acceptTerms ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleCreateAccount}
                  disabled={loading || !fullName || !email || !password || !confirm || !acceptTerms}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color={theme.btnText} size="small" />
                      <Text style={[styles.loadingText, { color: theme.btnText }]}>Creating account...</Text>
                    </View>
                  ) : (
                    <Text style={[styles.signUpText, { color: theme.btnText }]}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign In Link */}
              <View style={styles.bottomRow}>
                <Text style={{ color: theme.placeholder }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={[styles.signinText, { color: theme.accent }]}>Sign in</Text>
                </TouchableOpacity>
              </View>

              {/* Photo Upload Modal */}
              <PhotoUpload
                visible={showPhotoUpload}
                currentPhoto={profilePhoto || undefined}
                onPhotoSelected={handlePhotoSelected}
                onClose={() => setShowPhotoUpload(false)}
              />
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
  photoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  photoImg: { width: 90, height: 90, borderRadius: 45 },
  photoAddIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  form: {},
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
  passwordStrengthContainer: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    textAlign: "right",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  signUpBtn: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  signUpText: { fontSize: 18, fontWeight: "bold" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signinText: { fontWeight: "bold" },
})
