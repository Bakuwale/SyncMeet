"use client"

import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native"
import { useMeetings } from "../../components/MeetingContext"
import { useThemeContext } from "../../components/ThemeContext"

const FILTERS = ["All", "Upcoming", "Past"]
const { width: screenWidth } = Dimensions.get("window")
const BASE_URL = "https://syncmeet-back.onrender.com"

// ✅ Updated API functions to match your backend endpoints
const apiService = {
  // Get user's meetings
  getMyMeetings: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/meetings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error("❌ Error fetching meetings:", error.response?.data || error.message)
      throw error
    }
  },

  // Schedule a new meeting
  scheduleMeeting: async (meetingData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/meetings/schedule`, meetingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error("❌ Error scheduling meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Join meeting by code with email
  joinMeetingByCode: async (meetingCode, email) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/meetings/join/${meetingCode}`, {
        email: email,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error joining meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Get meeting details by code
  getMeetingByCode: async (meetingCode) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/meetings/code/${meetingCode}`)
      return response.data
    } catch (error) {
      console.error("❌ Error getting meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Delete meeting
  deleteMeeting: async (meetingId, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error("❌ Error deleting meeting:", error.response?.data || error.message)
      throw error
    }
  },
}

function isUpcoming(meeting) {
  return new Date(meeting.date || meeting.scheduledTime) > new Date()
}

export default function MeetingsTab() {
  const { meetings, setMeetings, addMeeting } = useMeetings()
  const { theme } = useThemeContext()
  const isDarkTheme = theme === "dark"

  // UI States
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [currentMeeting, setCurrentMeeting] = useState(null)

  // Video Call States
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // Loading States
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ✅ Get user token (you'll need to implement this based on your auth system)
  const getUserToken = () => {
    // This should get the JWT token from your auth context/storage
    // For now, returning null - you need to implement this
    return null // TODO: Implement token retrieval
  }

  const getUserEmail = () => {
    // This should get the current user's email
    // For now, returning a placeholder - you need to implement this
    return "user@example.com" // TODO: Implement email retrieval
  }

  // ✅ Load meetings from backend on component mount
  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    setIsRefreshing(true)
    try {
      const token = getUserToken()
      if (token) {
        const backendMeetings = await apiService.getMyMeetings(token)
        setMeetings(backendMeetings)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load meetings")
    } finally {
      setIsRefreshing(false)
    }
  }

  // ✅ Updated start meeting function
  const handleStartMeeting = async () => {
    setIsLoading(true)
    try {
      const token = getUserToken()
      if (!token) {
        Alert.alert("Error", "Please login to start a meeting")
        return
      }

      const meetingData = {
        title: "Instant Meeting",
        description: "Quick meeting started manually",
        scheduledTime: new Date().toISOString(),
        duration: 30,
        participantsEmails: [getUserEmail()], // Add current user
        isInstant: true,
      }

      const newMeeting = await apiService.scheduleMeeting(meetingData, token)

      // Add to local state
      addMeeting(newMeeting)
      setCurrentMeeting(newMeeting)
      setShowVideoCall(true)

      Alert.alert("Success", "Meeting started successfully!")
    } catch (error) {
      Alert.alert("Error", "Failed to start meeting")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Updated join meeting function
  const handleJoinMeeting = async (meeting) => {
    setIsLoading(true)
    try {
      const userEmail = getUserEmail()
      const meetingCode = meeting.code || meeting.id // Use code if available, fallback to id

      const joinResponse = await apiService.joinMeetingByCode(meetingCode, userEmail)

      setCurrentMeeting(meeting)
      setShowVideoCall(true)

      Alert.alert("Success", `Joined meeting: ${meeting.title}`)
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert("Access Denied", "You are not invited to this meeting")
      } else if (error.response?.status === 404) {
        Alert.alert("Meeting Not Found", "This meeting does not exist")
      } else {
        Alert.alert("Error", "Failed to join meeting")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Add delete meeting function
  const handleDeleteMeeting = async (meetingId) => {
    Alert.alert("Delete Meeting", "Are you sure you want to delete this meeting?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = getUserToken()
            await apiService.deleteMeeting(meetingId, token)

            // Remove from local state
            setMeetings(meetings.filter((m) => m.id !== meetingId))
            Alert.alert("Success", "Meeting deleted successfully")
          } catch (error) {
            if (error.response?.status === 403) {
              Alert.alert("Error", "Only the host can delete this meeting")
            } else {
              Alert.alert("Error", "Failed to delete meeting")
            }
          }
        },
      },
    ])
  }

  const handleEndCall = () => {
    setShowVideoCall(false)
    setShowChat(false)
    setCurrentMeeting(null)
    setIsMuted(false)
    setIsVideoOn(true)
    setIsScreenSharing(false)
    setIsRecording(false)
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement real chat functionality with WebSocket
      // For now, just clear the input
      setChatMessage("")
    }
  }

  const themeColors = {
    background: isDarkTheme ? "#1c1c1c" : "#ffffff",
    cardBackground: isDarkTheme ? "#232323" : "#f8f9fa",
    searchBackground: isDarkTheme ? "#222" : "#f0f0f0",
    filterBackground: isDarkTheme ? "#222" : "#f0f0f0",
    filterActive: "#0a84ff",
    textPrimary: isDarkTheme ? "#fff" : "#000",
    textSecondary: isDarkTheme ? "#aaa" : "#666",
    textTertiary: isDarkTheme ? "#ccc" : "#888",
    borderColor: isDarkTheme ? "#333" : "#e0e0e0",
    videoCallBackground: isDarkTheme ? "#000" : "#1a1a1a",
    controlBackground: isDarkTheme ? "#333" : "#f0f0f0",
    inputBackground: isDarkTheme ? "#2a2a2a" : "#f8f9fa",
    accent: "#007AFF",
  }

  // Helper: returns true if meeting should be visible
  function isVisibleMeeting(meeting) {
    const now = new Date()
    const start = new Date(meeting.date || meeting.scheduledTime)
    const end = new Date(start.getTime() + (meeting.duration || 0) * 60000)
    return end.getTime() + 24 * 60 * 60 * 1000 > now.getTime()
  }

  const filteredMeetings = meetings
    .filter(isVisibleMeeting)
    .filter((m) => (m.title || "").toLowerCase().includes(search.toLowerCase()))
    .filter((m) => {
      if (filter === "Upcoming") return isUpcoming(m)
      if (filter === "Past") return !isUpcoming(m)
      return true
    })

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.meetingTabContentWrapper}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: themeColors.searchBackground }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search meetings"
            placeholderTextColor={themeColors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { backgroundColor: filter === f ? themeColors.filterActive : themeColors.filterBackground },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : themeColors.textSecondary }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Meeting Button */}
        <TouchableOpacity
          style={{
            backgroundColor: themeColors.accent,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            alignItems: "center",
            opacity: isLoading ? 0.6 : 1,
          }}
          onPress={handleStartMeeting}
          disabled={isLoading}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {isLoading ? "Starting Meeting..." : "Start a Meeting"}
          </Text>
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={{
            backgroundColor: themeColors.filterBackground,
            padding: 8,
            borderRadius: 6,
            marginBottom: 16,
            alignItems: "center",
            opacity: isRefreshing ? 0.6 : 1,
          }}
          onPress={loadMeetings}
          disabled={isRefreshing}
        >
          <Text style={{ color: themeColors.textPrimary, fontSize: 12 }}>
            {isRefreshing ? "Refreshing..." : "Refresh Meetings"}
          </Text>
        </TouchableOpacity>

        {/* Meetings List */}
        <FlatList
          data={filteredMeetings}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <MeetingCard
              meeting={item}
              themeColors={themeColors}
              onJoin={() => handleJoinMeeting(item)}
              onDelete={() => handleDeleteMeeting(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 60 }}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={themeColors.textSecondary}
                style={{ marginBottom: 16 }}
              />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary, fontSize: 18, textAlign: "center" }]}>
                No meetings scheduled.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          refreshing={isRefreshing}
          onRefresh={loadMeetings}
        />
      </View>

      {/* Video Call Modal */}
      <Modal visible={showVideoCall} animationType="slide" transparent={false} onRequestClose={handleEndCall}>
        <View style={[styles.videoCallContainer, { backgroundColor: themeColors.videoCallBackground }]}>
          {/* Header */}
          <View style={styles.videoCallHeader}>
            <View style={styles.meetingInfo}>
              <Text style={[styles.meetingTitle, { color: "#fff" }]}>{currentMeeting?.title || "Meeting"}</Text>
              <Text style={[styles.meetingDuration, { color: "#ccc" }]}>00:15:32</Text>
            </View>
            <View style={styles.headerControls}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="people-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Participants Grid */}
          <View style={styles.participantsGrid}>
            <View style={[styles.participantTile, { backgroundColor: "#2a2a2a" }]}>
              <Text style={[styles.participantName, { color: "#fff" }]}>
                {currentMeeting ? "Connected to meeting" : "Loading Participants..."}
              </Text>
            </View>
          </View>

          {/* Chat Panel */}
          {showChat && (
            <View style={[styles.chatPanel, { backgroundColor: themeColors.cardBackground }]}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatTitle, { color: themeColors.textPrimary }]}>Chat</Text>
                <TouchableOpacity onPress={() => setShowChat(false)}>
                  <Ionicons name="close" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.chatMessages}>
                <View style={styles.chatMessage}>
                  <Text style={[styles.chatSender, { color: themeColors.textPrimary }]}>System</Text>
                  <Text style={[styles.chatText, { color: themeColors.textSecondary }]}>
                    Chat functionality is under development.
                  </Text>
                  <Text style={[styles.chatTime, { color: themeColors.textTertiary }]}>Now</Text>
                </View>
              </ScrollView>

              <View style={styles.chatInput}>
                <TextInput
                  style={[
                    styles.chatInputField,
                    { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary },
                  ]}
                  placeholder="Type a message..."
                  placeholderTextColor={themeColors.textSecondary}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                />
                <TouchableOpacity onPress={handleSendMessage}>
                  <Ionicons name="send" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Controls */}
          <View style={[styles.controls, { backgroundColor: themeColors.controlBackground }]}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && { backgroundColor: "#ff3b30" }]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, !isVideoOn && { backgroundColor: "#ff3b30" }]}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, isScreenSharing && { backgroundColor: "#007AFF" }]}
              onPress={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Ionicons name="desktop-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, showChat && { backgroundColor: "#007AFF" }]}
              onPress={() => setShowChat(!showChat)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, isRecording && { backgroundColor: "#ff3b30" }]}
              onPress={() => setIsRecording(!isRecording)}
            >
              <Ionicons name={isRecording ? "stop-circle" : "radio-button-on"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: "#ff3b30" }]} onPress={handleEndCall}>
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function MeetingCard({ meeting, themeColors, onJoin, onDelete }) {
  const now = new Date()
  const start = new Date(meeting.date || meeting.scheduledTime)
  const isUpcoming = start > now
  const status = isUpcoming ? "Upcoming" : "Ended"

  return (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{meeting.title}</Text>
        <View style={[styles.badge, isUpcoming ? styles.badgeUpcoming : styles.badgeEnded]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>{start.toLocaleDateString()}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {meeting.duration} min
        </Text>
      </View>

      {!isUpcoming && (
        <View style={styles.row}>
          <Ionicons name="people" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            {meeting.participantsEmails?.length || 0} participant
            {(meeting.participantsEmails?.length || 0) !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Ionicons name="key" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>{meeting.code || meeting.id}</Text>

        <View style={{ flexDirection: "row", marginLeft: "auto" }}>
          {isUpcoming && (
            <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
              <Text style={styles.joinText}>Join</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.deleteBtn, { marginLeft: 8 }]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      {meeting.description ? (
        <Text style={[styles.desc, { color: themeColors.textTertiary }]}>{meeting.description}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  meetingTabContentWrapper: {},
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    marginTop: 24,
  },
  searchInput: { flex: 1, padding: 8 },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  filterText: { fontWeight: "bold" },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontWeight: "bold", fontSize: 17, flex: 1 },
  badge: {
    marginLeft: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeUpcoming: { backgroundColor: "#0a84ff" },
  badgeEnded: { backgroundColor: "#999" },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: { marginLeft: 8, fontSize: 14 },
  joinBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  deleteBtn: {
    padding: 4,
  },
  desc: { marginTop: 8, fontSize: 14, fontStyle: "italic" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },

  // Video Call Styles
  videoCallContainer: {
    flex: 1,
  },
  videoCallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  meetingDuration: {
    fontSize: 14,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  participantsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 8,
  },
  participantTile: {
    width: (screenWidth - 40) / 2,
    height: 120,
    position: "relative",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  participantName: {
    fontSize: 12,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatPanel: {
    position: "absolute",
    right: 0,
    top: 100,
    bottom: 120,
    width: 300,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  chatMessage: {
    marginBottom: 12,
  },
  chatSender: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  chatText: {
    fontSize: 14,
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 10,
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  chatInputField: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
})
