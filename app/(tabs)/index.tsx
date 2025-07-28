"use client"

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { useThemeContext } from "../../components/ThemeContext"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ API Service for Home Screen
const homeApiService = {
  // Create new meeting
  createMeeting: async (isPersonal = false, videoOn = true) => {
    try {
      const token = await AsyncStorage.getItem('token')
      const email = await AsyncStorage.getItem('email')
      
      const response = await axios.post(`${BASE_URL}/api/meetings`, {
        isPersonal,
        videoEnabled: videoOn,
        hostEmail: email,
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error creating meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Validate meeting exists
  validateMeeting: async (meetingId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/meetings/${meetingId}`)
      return response.data
    } catch (error: any) {
      console.error("❌ Error validating meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Get recent meetings
  getRecentMeetings: async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await axios.get(`${BASE_URL}/api/meetings/my/recent`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error fetching recent meetings:", error.response?.data || error.message)
      return [] // Return empty array on error
    }
  },

  // Get personal meeting room
  getPersonalMeetingRoom: async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await axios.get(`${BASE_URL}/api/meetings/my/personal`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error fetching personal meeting room:", error.response?.data || error.message)
      return null
    }
  }
}

export default function HomeScreen() {
  const { theme } = useThemeContext()
  const isDarkTheme = theme === "dark"
  const [meetModalVisible, setMeetModalVisible] = useState(false)
  const [joinModalVisible, setJoinModalVisible] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [usePMI, setUsePMI] = useState(false)
  const [meetingId, setMeetingId] = useState("")
  const [joinAudio, setJoinAudio] = useState(false)
  const [turnOffVideo, setTurnOffVideo] = useState(false)
  const [userName, setUserName] = useState("")
  const [recentMeetingIds, setRecentMeetingIds] = useState<string[]>([])
  const [showMeetingIdDropdown, setShowMeetingIdDropdown] = useState(false)
  const [usePersonalLink, setUsePersonalLink] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [shareMeetingId, setShareMeetingId] = useState("")
  const [shareInputFocused, setShareInputFocused] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [editMeetingModalVisible, setEditMeetingModalVisible] = useState(false)
  
  // ✅ New state variables for backend integration
  const [personalMeetingId, setPersonalMeetingId] = useState("")
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [loadingRecentMeetings, setLoadingRecentMeetings] = useState(false)
  const [validatingMeeting, setValidatingMeeting] = useState(false)

  // ✅ Load data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load recent meetings
      setLoadingRecentMeetings(true)
      const recentMeetings = await homeApiService.getRecentMeetings()
      if (recentMeetings && Array.isArray(recentMeetings)) {
        // Extract meeting IDs from the response
        const meetingIds = recentMeetings.map(meeting => meeting.meetingId || meeting.id)
        setRecentMeetingIds(meetingIds)
      }

      // Load personal meeting room
      const personalRoom = await homeApiService.getPersonalMeetingRoom()
      if (personalRoom && personalRoom.meetingId) {
        setPersonalMeetingId(personalRoom.meetingId)
      }
    } catch (error) {
      console.error("❌ Error loading initial data:", error)
    } finally {
      setLoadingRecentMeetings(false)
    }
  }

  const [editRequirePasscode, setEditRequirePasscode] = useState(true)
  const [editPasscode, setEditPasscode] = useState("YyXSh4")
  const [editWaitingRoom, setEditWaitingRoom] = useState(true)
  const [editOnlyAuthUsers, setEditOnlyAuthUsers] = useState(false)
  const [editHostVideo, setEditHostVideo] = useState(false)
  const [editParticipantVideo, setEditParticipantVideo] = useState(false)

  const durationOptions = [15, 30, 45, 60, 90, 120]
  const timeZoneOptions = ["GMT+0", "GMT+1", "GMT+2", "GMT-1", "GMT-5", "GMT+8"]
  const repeatOptions = ["None", "Weekly", "Monthly"]
  const calendarOptions = ["Zoom", "Google", "Outlook", "Other"]

  const router = useRouter()

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? "#232323" : "#ffffff",
    cardBackground: isDarkTheme ? "#292929" : "#f8f9fa",
    textPrimary: isDarkTheme ? "#ffffff" : "#000000",
    textSecondary: isDarkTheme ? "#bbbbbb" : "#666666",
    borderColor: isDarkTheme ? "#393939" : "#e0e0e0",
    inputBackground: isDarkTheme ? "#292929" : "#f8f9fa",
    inputText: isDarkTheme ? "#ffffff" : "#000000",
    placeholderText: isDarkTheme ? "#888888" : "#999999",
    popupBackground: isDarkTheme ? "#232323" : "#fff",
    popupCard: isDarkTheme ? "#292929" : "#fff",
    popupText: isDarkTheme ? "#fff" : "#222",
    popupSecondary: isDarkTheme ? "#bbb" : "#666",
    popupButton: isDarkTheme ? "#393939" : "#e0e0e0",
    popupButtonText: isDarkTheme ? "#fff" : "#007AFF",
    popupCancel: isDarkTheme ? "#393939" : "#e0e0e0",
    popupCancelText: isDarkTheme ? "#fff" : "#000",
    popupOk: isDarkTheme ? "#1877f2" : "#1877f2",
    popupOkText: "#fff",
    popupShadow: isDarkTheme ? "#000" : "#bbb",
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: themeColors.textPrimary }]}>Meetings</Text>
        <Pressable onPress={() => setInfoModalVisible(true)}>
          <Ionicons name="information-circle-outline" size={24} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <ActionButton
          icon={<Ionicons name="videocam" size={28} color="#fff" />}
          label="Meet"
          color="#f26c4f"
          onPress={() => setMeetModalVisible(true)}
        />
        <ActionButton
          icon={<Ionicons name="add" size={28} color="#fff" />}
          label="Join"
          color="#3a8fff"
          onPress={() => setJoinModalVisible(true)}
        />
        <ActionButton
          icon={<MaterialIcons name="calendar-today" size={24} color="#fff" />}
          label="Schedule"
          color="#3a8fff"
          onPress={() => router.push("/schedule")}
        />
        <ActionButton
          icon={<Ionicons name="arrow-up" size={24} color="#fff" />}
          label="Share"
          color="#3a8fff"
          onPress={() => setShareModalVisible(true)}
        />
      </View>

      {/* Meet Full-Screen Modal */}
      <Modal
        visible={meetModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMeetModalVisible(false)}
      >
        <View style={[styles.zoomModalContainer, { backgroundColor: themeColors.background }]}>
          {/* Header Bar */}
          <View
            style={[
              styles.zoomModalHeaderBar,
              { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor },
            ]}
          >
            <Pressable
              onPress={() => setMeetModalVisible(false)}
              style={styles.zoomModalCancelPressable}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.zoomModalCancel}>Cancel</Text>
            </Pressable>
            <Text style={[styles.zoomModalHeaderTitle, { color: themeColors.textPrimary }]}>New Meeting</Text>
            <View style={{ width: 60 }} /> {/* Spacer for symmetry */}
          </View>

          {/* Toggles */}
          <View style={[styles.zoomModalOptionsContainer, { backgroundColor: themeColors.background }]}>
            <View style={styles.zoomModalOptionRow}>
              <Text style={[styles.zoomModalOptionLabel, { color: themeColors.textPrimary }]}>Video On</Text>
              <Switch
                value={videoOn}
                onValueChange={setVideoOn}
                thumbColor={videoOn ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            <View style={[styles.zoomModalDivider, { backgroundColor: themeColors.borderColor }]} />
            <View style={styles.zoomModalOptionRow}>
              <Text style={[styles.zoomModalOptionLabel, { color: themeColors.textPrimary }]}>
                Use Personal Meeting ID (PMI)
              </Text>
              <Switch
                value={usePMI}
                onValueChange={setUsePMI}
                thumbColor={usePMI ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            {usePMI && (
              <Text style={[styles.zoomModalPMI, { color: themeColors.textSecondary }]}>
                Your Personal Meeting ID: {personalMeetingId || "Loading..."}
              </Text>
            )}
            <View style={[styles.zoomModalDivider, { backgroundColor: themeColors.borderColor }]} />
          </View>

          {/* Start Meeting Button */}
          <TouchableOpacity
            style={styles.zoomModalStartButton}
            onPress={async () => {
              try {
                setCreatingRoom(true)
                
                // ✅ Create meeting via backend API
                const meetingData = await homeApiService.createMeeting(usePMI, videoOn)
                
                setMeetModalVisible(false)
                setCreatingRoom(false)
                
                router.push({
                  pathname: "/video-call",
                  params: {
                    meetingId: meetingData.meetingId || meetingData.id,
                    userName: "Host",
                    videoOn: videoOn ? "true" : "false",
                    usePMI: usePMI ? "true" : "false",
                    isHost: "true",
                  },
                })
              } catch (error: any) {
                setCreatingRoom(false)
                console.error("❌ Error starting meeting:", error)
                Alert.alert(
                  "Error",
                  "Failed to start meeting. Please check your connection and try again."
                )
              }
            }}
            disabled={creatingRoom}
          >
            <Text style={styles.zoomModalStartButtonText}>{creatingRoom ? "Starting..." : "Start a Meeting"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Join Meeting Modal */}
      <Modal
        visible={joinModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={[styles.joinModalContainer, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View
            style={[
              styles.joinModalHeaderBar,
              { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor },
            ]}
          >
            <Pressable
              onPress={() => setJoinModalVisible(false)}
              style={styles.joinModalBackPressable}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={26} color="#3a8fff" />
            </Pressable>
            <Text style={[styles.joinModalHeaderTitle, { color: themeColors.textPrimary }]}>Join a meeting</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content Container */}
          <ScrollView style={styles.joinModalContent} showsVerticalScrollIndicator={false}>
            {/* Meeting ID Section */}
            <View style={styles.joinModalSection}>
              <Text style={[styles.joinModalSectionTitle, { color: themeColors.textPrimary }]}>
                Meeting ID or Personal Link
              </Text>
              {/* Meeting ID Input */}
              <View
                style={[
                  styles.joinModalInputWrapper,
                  { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor },
                ]}
              >
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color={themeColors.textSecondary}
                  style={styles.joinModalInputIcon}
                />
                <TextInput
                  style={[styles.joinModalInput, { color: themeColors.inputText }]}
                  placeholder={usePersonalLink ? "Personal link name" : "Meeting ID"}
                  placeholderTextColor={themeColors.placeholderText}
                  value={meetingId}
                  onChangeText={setMeetingId}
                  keyboardType="numeric"
                  editable={!usePersonalLink || true}
                  autoCapitalize={usePersonalLink ? "none" : "words"}
                />
                {!usePersonalLink && (
                  <Pressable onPress={() => setShowMeetingIdDropdown((v) => !v)} style={styles.joinModalDropdownButton}>
                    <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                  </Pressable>
                )}
              </View>

              {/* Recent Meeting IDs Dropdown */}
              {showMeetingIdDropdown && !usePersonalLink && (
                <View
                  style={[
                    styles.meetingIdDropdown,
                    { backgroundColor: themeColors.cardBackground, borderColor: themeColors.borderColor },
                  ]}
                >
                  {recentMeetingIds.length === 0 ? (
                    <Text style={[styles.meetingIdDropdownEmpty, { color: themeColors.textSecondary }]}>
                      No recent IDs
                    </Text>
                  ) : (
                    recentMeetingIds.map((id, idx) => (
                      <Pressable
                        key={id + idx}
                        style={[styles.meetingIdDropdownItem, { borderBottomColor: themeColors.borderColor }]}
                        onPress={() => {
                          setMeetingId(id)
                          setShowMeetingIdDropdown(false)
                        }}
                      >
                        <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
                        <Text style={[styles.meetingIdDropdownText, { color: themeColors.textPrimary }]}>{id}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {/* Personal Link Toggle */}
              <TouchableOpacity
                style={styles.joinModalLinkToggle}
                onPress={() => {
                  setUsePersonalLink((prev) => {
                    setMeetingId("")
                    setShowMeetingIdDropdown(false)
                    return !prev
                  })
                }}
              >
                <Ionicons
                  name={usePersonalLink ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={usePersonalLink ? "#3a8fff" : themeColors.textSecondary}
                />
                <Text style={[styles.joinModalLinkName, { color: themeColors.textPrimary }]}>
                  Join with a personal link name
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Name Section */}
            <View style={styles.joinModalSection}>
              <Text style={[styles.joinModalSectionTitle, { color: themeColors.textPrimary }]}>Your Name</Text>
              <View
                style={[
                  styles.joinModalInputWrapper,
                  { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={themeColors.textSecondary}
                  style={styles.joinModalInputIcon}
                />
                <TextInput
                  style={[styles.joinModalInput, { color: themeColors.inputText }]}
                  placeholder="Enter Your Name Here"
                  placeholderTextColor={themeColors.placeholderText}
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Join Options Section */}
            <View style={styles.joinModalSection}>
              <Text style={[styles.joinModalSectionTitle, { color: themeColors.textPrimary }]}>Join Options</Text>
              <View style={[styles.joinModalOptionRow, { borderBottomColor: themeColors.borderColor }]}>
                <View style={styles.joinModalOptionContent}>
                  <Ionicons name="mic-outline" size={20} color={themeColors.textSecondary} />
                  <Text style={[styles.joinModalOptionLabel, { color: themeColors.textPrimary }]}>
                    Don't connect to audio
                  </Text>
                </View>
                <Switch
                  value={joinAudio}
                  onValueChange={setJoinAudio}
                  thumbColor={joinAudio ? "#3a8fff" : "#888"}
                  trackColor={{ true: "#b3d8ff", false: "#ccc" }}
                />
              </View>

              <View style={styles.joinModalOptionRow}>
                <View style={styles.joinModalOptionContent}>
                  <Ionicons name="videocam-outline" size={20} color={themeColors.textSecondary} />
                  <Text style={[styles.joinModalOptionLabel, { color: themeColors.textPrimary }]}>
                    Turn off my video
                  </Text>
                </View>
                <Switch
                  value={turnOffVideo}
                  onValueChange={setTurnOffVideo}
                  thumbColor={turnOffVideo ? "#3a8fff" : "#888"}
                  trackColor={{ true: "#b3d8ff", false: "#ccc" }}
                />
              </View>
            </View>

            {/* Info Text */}
            <View style={styles.joinModalInfoSection}>
              <Ionicons name="information-circle-outline" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.joinModalInfoText, { color: themeColors.textSecondary }]}>
                If you received an invitation link, tap on the link to join the meeting
              </Text>
            </View>
          </ScrollView>

          {/* Join Button */}
          <View
            style={[
              styles.joinModalButtonContainer,
              { backgroundColor: themeColors.background, borderTopColor: themeColors.borderColor },
            ]}
          >
            <TouchableOpacity
              style={[styles.joinModalJoinButton, (!meetingId || validatingMeeting) && { opacity: 0.5, backgroundColor: "#ccc" }]}
              disabled={!meetingId || validatingMeeting}
              onPress={async () => {
                if (!userName) {
                  Alert.alert("Name Required", "Please enter your name to join the meeting")
                  return
                }

                try {
                  setValidatingMeeting(true)
                  
                  // ✅ Validate meeting exists via backend API
                  await homeApiService.validateMeeting(meetingId.trim())
                  
                  setJoinModalVisible(false)
                  setValidatingMeeting(false)

                  // ✅ Enhanced navigation with all meeting details pre-filled
                  router.push({
                    pathname: "/video-call",
                    params: {
                      // Meeting details from join modal
                      meetingId: meetingId.trim(),
                      userName: userName.trim(),

                      // Audio/Video preferences
                      joinAudio: joinAudio ? "true" : "false",
                      turnOffVideo: turnOffVideo ? "true" : "false",
                      cameraOn: turnOffVideo ? "false" : "true", // Inverse of turnOffVideo
                      isMuted: joinAudio ? "false" : "true", // Inverse of joinAudio

                      // Meeting type and role
                      isHost: "false",
                      usePersonalLink: usePersonalLink ? "true" : "false",

                      // Additional context for video call screen
                      joinedFromModal: "true", // Flag to indicate this came from join modal
                      meetingTitle: usePersonalLink ? `${meetingId}'s Personal Room` : `Meeting ${meetingId}`,

                      // Pre-fill settings for video call screen
                      autoJoin: "true", // Automatically attempt to join
                      skipSettings: "true", // Skip the pre-call settings screen
                    },
                  })
                } catch (error: any) {
                  setValidatingMeeting(false)
                  console.error("❌ Error validating meeting:", error)
                  
                  if (error.response?.status === 404) {
                    Alert.alert(
                      "Meeting Not Found",
                      "The meeting ID you entered does not exist or has ended. Please check the meeting ID and try again."
                    )
                  } else {
                    Alert.alert(
                      "Error",
                      "Unable to validate meeting. Please check your connection and try again."
                    )
                  }
                }
              }}
            >
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.joinModalJoinButtonText}>
                {validatingMeeting ? "Validating..." : "Join Meeting"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Screen Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "position"}
            style={styles.shareModalOverlay}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          >
            <View
              style={[
                styles.shareModalCardSmall,
                {
                  backgroundColor: themeColors.popupCard,
                  shadowColor: themeColors.popupShadow,
                },
              ]}
            >
              <Text style={[styles.shareModalHeaderInCard, { color: themeColors.popupText }]}>Share screen</Text>
              <Text style={[styles.shareModalMessage, { color: themeColors.popupSecondary }]} accessibilityRole="text">
                Enter sharing key or meeting ID to share to a Zoom Room.
              </Text>
              <TextInput
                style={[
                  styles.shareModalInput,
                  { backgroundColor: themeColors.inputBackground, color: themeColors.inputText },
                ]}
                placeholder="Sharing Key or meeting ID"
                placeholderTextColor={themeColors.placeholderText}
                value={shareMeetingId}
                onChangeText={setShareMeetingId}
                keyboardType="default"
                accessibilityLabel="Sharing Key or meeting ID"
                accessible
                onFocus={() => setShareInputFocused(true)}
                onBlur={() => setShareInputFocused(false)}
                returnKeyType="done"
              />
              <View style={styles.shareModalButtonRow}>
                <TouchableOpacity
                  style={[styles.shareModalCancelButton, { backgroundColor: themeColors.popupCancel }]}
                  onPress={() => {
                    setShareModalVisible(false)
                    setShareMeetingId("")
                  }}
                  accessibilityLabel="Cancel"
                  accessible
                >
                  <Text style={[styles.shareModalCancelButtonText, { color: themeColors.popupCancelText }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.shareModalOkButton,
                    { backgroundColor: themeColors.popupOk },
                    !shareMeetingId && { opacity: 0.5 },
                  ]}
                  disabled={!shareMeetingId}
                  accessibilityLabel="OK"
                  accessible
                  onPress={() => {
                    setShareModalVisible(false)
                    setShareMeetingId("")
                    alert("Screen sharing started (simulated)!")
                  }}
                >
                  <Text style={[styles.shareModalOkButtonText, { color: themeColors.popupOkText }]}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Info Bottom Sheet Modal */}
      <Modal
        visible={infoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setInfoModalVisible(false)}>
          <View style={styles.infoModalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.infoModalSheet,
                  { backgroundColor: themeColors.popupCard, shadowColor: themeColors.popupShadow },
                ]}
              >
                <Text style={[styles.infoModalLabel, { color: themeColors.popupSecondary }]}>Personal meeting ID</Text>
                <Text style={[styles.infoModalId, { color: themeColors.popupText }]}>{personalMeetingId || "Loading..."}</Text>
                <View style={{ flex: 1, width: "100%", justifyContent: "flex-start" }}>
                  <View style={[styles.infoModalActions, { backgroundColor: themeColors.cardBackground }]}>
                    <Pressable style={styles.infoModalActionRow}>
                      <Text style={[styles.infoModalActionText, { color: themeColors.popupText }]}>Start meeting</Text>
                      <MaterialIcons name="calendar-today" size={22} color={themeColors.popupText} />
                    </Pressable>
                    <Pressable style={styles.infoModalActionRow}>
                      <Text style={[styles.infoModalActionText, { color: themeColors.popupText }]}>
                        Send invitation
                      </Text>
                      <MaterialIcons name="share" size={22} color={themeColors.popupText} />
                    </Pressable>
                    <Pressable
                      style={styles.infoModalActionRow}
                      onPress={() => {
                        setInfoModalVisible(false)
                        setTimeout(() => setEditMeetingModalVisible(true), 300)
                      }}
                    >
                      <Text style={[styles.infoModalActionText, { color: themeColors.popupText }]}>Edit meeting</Text>
                      <FontAwesome name="pencil" size={20} color={themeColors.popupText} />
                    </Pressable>
                  </View>
                </View>
                <Pressable style={styles.infoModalCancel} onPress={() => setInfoModalVisible(false)}>
                  <Text style={[styles.infoModalCancelText, { color: themeColors.popupText }]}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Meeting Modal */}
      <Modal
        visible={editMeetingModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditMeetingModalVisible(false)}
      >
        <View style={styles.editModalContainer}>
          {/* Header */}
          <View style={styles.editModalHeaderBar}>
            <Pressable onPress={() => setEditMeetingModalVisible(false)}>
              <Text style={styles.editModalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.editModalHeaderTitle}>Personal meeting ID</Text>
            <Pressable onPress={() => setEditMeetingModalVisible(false)}>
              <Text style={styles.editModalSave}>Save</Text>
            </Pressable>
          </View>
          <View style={styles.editModalContent}>
            {/* PMI Section */}
            <Text style={styles.editModalSectionLabel}>Personal meeting ID (PMI)</Text>
            <View style={styles.editModalPMIBox}>
              <Text style={styles.editModalPMI}>{personalMeetingId || "Loading..."}</Text>
            </View>
            {/* Security Section */}
            <Text style={styles.editModalSectionLabel}>Security</Text>
            <View style={styles.editModalRowBetween}>
              <View>
                <Text style={styles.editModalRowTitle}>Require meeting passcode</Text>
                <Text style={styles.editModalRowDesc}>
                  Only users who have the invite link or passcode can join the meeting
                </Text>
              </View>
              <Switch
                value={editRequirePasscode}
                onValueChange={setEditRequirePasscode}
                thumbColor={editRequirePasscode ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Passcode</Text>
              <Text style={styles.editModalRowValue}>{editPasscode}</Text>
            </View>
            <View style={styles.editModalRowBetween}>
              <View>
                <Text style={styles.editModalRowTitle}>Enable waiting room</Text>
                <Text style={styles.editModalRowDesc}>Only users admitted by the host can join the meeting</Text>
              </View>
              <Switch
                value={editWaitingRoom}
                onValueChange={setEditWaitingRoom}
                thumbColor={editWaitingRoom ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Only allow authenticated users</Text>
              <Switch
                value={editOnlyAuthUsers}
                onValueChange={setEditOnlyAuthUsers}
                thumbColor={editOnlyAuthUsers ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            {/* Video Section */}
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Host video on</Text>
              <Switch
                value={editHostVideo}
                onValueChange={setEditHostVideo}
                thumbColor={editHostVideo ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Participant video on</Text>
              <Switch
                value={editParticipantVideo}
                onValueChange={setEditParticipantVideo}
                thumbColor={editParticipantVideo ? "#3a8fff" : "#888"}
                trackColor={{ true: "#b3d8ff", false: "#ccc" }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: { icon: React.ReactNode; label: string; color: string; onPress?: () => void }) {
  const { theme } = useThemeContext()
  const isDarkTheme = theme === "dark"

  return (
    <View style={styles.actionButtonWrapper}>
      <Pressable
        style={({ pressed }) => [styles.actionButton, { backgroundColor: color }, pressed && { opacity: 0.85 }]}
        onPress={onPress}
      >
        {icon}
      </Pressable>
      <Text style={[styles.actionLabel, { color: isDarkTheme ? "#ffffff" : "#000000" }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    paddingHorizontal: 16,
    position: "relative",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    marginTop: 0,
    width: "100%",
    paddingHorizontal: 0,
  },
  actionButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    width: 56,
    height: 56,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 0,
  },
  zoomModalContainer: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: "flex-start",
  },
  zoomModalHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  zoomModalCancel: {
    color: "#3a8fff",
    fontSize: 17,
    fontWeight: "600",
  },
  zoomModalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginLeft: 10,
  },
  zoomModalCancelPressable: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "flex-start",
    justifyContent: "center",
    marginRight: 10,
  },
  zoomModalOptionsContainer: {
    marginTop: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  zoomModalOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 0,
  },
  zoomModalOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  zoomModalPMI: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 18,
    marginTop: -8,
    marginBottom: 8,
  },
  zoomModalDivider: {
    height: 1,
    width: "100%",
  },
  zoomModalStartButton: {
    backgroundColor: "#1877f2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: 36,
    marginHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomModalStartButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  joinModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 0,
  },
  joinModalHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  joinModalBackPressable: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  joinModalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginLeft: -40,
  },
  joinModalContent: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 18,
  },
  joinModalSection: {
    marginBottom: 28,
  },
  joinModalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  joinModalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  joinModalInputIcon: {
    marginRight: 12,
  },
  joinModalInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  joinModalDropdownButton: {
    padding: 8,
    marginLeft: 8,
  },
  meetingIdDropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 8,
    marginHorizontal: 0,
    maxHeight: 200,
  },
  meetingIdDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  meetingIdDropdownText: {
    fontSize: 16,
    marginLeft: 12,
  },
  meetingIdDropdownEmpty: {
    fontSize: 15,
    padding: 16,
    textAlign: "center",
  },
  joinModalLinkToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  joinModalLinkName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  joinModalOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  joinModalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  joinModalOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  joinModalInfoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  joinModalInfoText: {
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  joinModalButtonContainer: {
    padding: 18,
    borderTopWidth: 1,
  },
  joinModalJoinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877f2",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#1877f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinModalJoinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareModalCardSmall: {
    width: "88%",
    height: Dimensions.get("window").height * 0.35,
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: "center",
  },
  shareModalHeaderInCard: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  shareModalMessage: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },
  shareModalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
  },
  shareModalCancelButton: {
    flex: 1,
    backgroundColor: "#393939",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shareModalCancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  shareModalOkButton: {
    flex: 1,
    backgroundColor: "#1877f2",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shareModalOkButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  shareModalInput: {
    backgroundColor: "#232323",
    color: "#fff",
    fontSize: 17,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    width: "100%",
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  infoModalSheet: {
    width: "100%",
    height: Dimensions.get("window").height * 0.42,
    backgroundColor: "#232323",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 12,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoModalLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 6,
  },
  infoModalId: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 2,
  },
  infoModalActions: {
    width: "100%",
    backgroundColor: "#292929",
    borderRadius: 16,
    marginBottom: 18,
    paddingVertical: 2,
  },
  infoModalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
  },
  infoModalActionText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
  infoModalCancel: {
    alignItems: "center",
    width: "100%",
    paddingVertical: 14,
    marginBottom: 2,
    backgroundColor: "transparent",
  },
  infoModalCancelText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: "#232323",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  editModalHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: "#232323",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
    elevation: 2,
    zIndex: 10,
  },
  editModalCancel: {
    color: "#3a8fff",
    fontSize: 17,
    fontWeight: "600",
  },
  editModalHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginLeft: -30,
  },
  editModalSave: {
    color: "#3a8fff",
    fontSize: 17,
    fontWeight: "600",
  },
  editModalContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  editModalSectionLabel: {
    color: "#bbb",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  editModalPMIBox: {
    backgroundColor: "#292929",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  editModalPMI: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  editModalRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 2,
  },
  editModalRowTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  editModalRowDesc: {
    color: "#bbb",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
    maxWidth: 200,
  },
  editModalRowValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
})
