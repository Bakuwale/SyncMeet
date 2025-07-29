"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from "react-native"
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import axios from "axios"
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const BASE_URL = "https://syncmeet-back.onrender.com"

// Agora App ID - Will be obtained from the backend
const AGORA_APP_ID = "" // Will be dynamically set when joining a meeting

// ✅ Updated API Service with correct endpoint paths
const videoCallApiService = {
  // Join meeting - matches /req/meetings/join/**
  joinMeeting: async (meetingCode, email) => {
    try {
      const response = await axios.post(`${BASE_URL}/req/meetings/join/${meetingCode}`, {
        email: email,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error joining meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Leave meeting - matches /req/meetings/**
  leaveMeeting: async (meetingCode, email) => {
    try {
      const response = await axios.post(`${BASE_URL}/req/meetings/leave/${meetingCode}`, {
        email: email,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error leaving meeting:", error.response?.data || error.message)
      throw error
    }
  },

  // Get meeting participants - matches /req/participants/**
  getMeetingParticipants: async (meetingCode) => {
    try {
      const response = await axios.get(`${BASE_URL}/req/participants/${meetingCode}`)
      return response.data
    } catch (error) {
      console.error("❌ Error fetching participants:", error.response?.data || error.message)
      throw error
    }
  },

  // Get Agora token - matches /req/agora/token/**
  getAgoraToken: async (meetingCode, userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/req/agora/token/${meetingCode}/${userId}`)
      return response.data
    } catch (error) {
      console.error("❌ Error getting Agora token:", error.response?.data || error.message)
      throw error
    }
  },

  // Update participant status - matches /req/participants/**
  updateParticipantStatus: async (meetingCode, email, status) => {
    try {
      const response = await axios.put(`${BASE_URL}/req/participants/${meetingCode}/status`, {
        email: email,
        isMuted: status.isMuted,
        cameraOn: status.cameraOn,
      })
      return response.data
    } catch (error) {
      console.error("❌ Error updating participant status:", error.response?.data || error.message)
      throw error
    }
  },

  // Start/Stop recording - matches /req/meetings/**
  toggleRecording: async (meetingCode, action) => {
    try {
      const response = await axios.post(`${BASE_URL}/req/meetings/${meetingCode}/recording`, {
        action: action, // 'start' or 'stop'
      })
      return response.data
    } catch (error) {
      console.error("❌ Error toggling recording:", error.response?.data || error.message)
      throw error
    }
  },

  // Send chat message - matches /req/meetings/**
  sendChatMessage: async (meetingCode, message, sender) => {
    try {
      const response = await axios.post(`${BASE_URL}/req/meetings/${meetingCode}/chat`, {
        message,
        sender,
        timestamp: new Date().toISOString(),
      })
      return response.data
    } catch (error) {
      console.error("❌ Error sending chat message:", error.response?.data || error.message)
      throw error
    }
  },

  // Send reaction - matches /req/meetings/**
  sendReaction: async (meetingCode, reaction, sender) => {
    try {
      const response = await axios.post(`${BASE_URL}/req/meetings/${meetingCode}/reaction`, {
        reaction,
        sender,
        timestamp: new Date().toISOString(),
      })
      return response.data
    } catch (error) {
      console.error("❌ Error sending reaction:", error.response?.data || error.message)
      throw error
    }
  },
}

export default function VideoCallScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // ✅ Extract parameters from navigation (pre-filled from join modal)
  const {
    meetingId: paramMeetingId,
    userName: paramUserName,
    meetingTitle: paramMeetingTitle,
    joinAudio,
    turnOffVideo,
    cameraOn: paramCameraOn,
    isMuted: paramIsMuted,
    isHost,
    joinedFromModal,
    autoJoin,
    skipSettings,
  } = params

  // Call states
  const [inCall, setInCall] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionError, setConnectionError] = useState(null)

  // Audio/Video states - ✅ Initialize with pre-filled values
  const [isMuted, setIsMuted] = useState(paramIsMuted === "true" || joinAudio === "false")
  const [cameraOn, setCameraOn] = useState(paramCameraOn !== "false" && turnOffVideo !== "true")
  const [speakerOn, setSpeakerOn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [cameraPosition, setCameraPosition] = useState("front")

  // UI states
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  // Data states - ✅ Initialize with pre-filled values
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [meetingId, setMeetingId] = useState(paramMeetingId || "")
  const [meetingTitle, setMeetingTitle] = useState(paramMeetingTitle || "")
  const [currentUser, setCurrentUser] = useState({
    name: paramUserName || "You",
    email: paramUserName || "user@example.com",
    id: "user_1",
    isHost: isHost === "true",
  })

  // Backend integration states
  const [agoraToken, setAgoraToken] = useState(null)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  // Agora specific states
  const [engine, setEngine] = useState(null)
  const [uid, setUid] = useState(Math.floor(Math.random() * 100000))
  const [remoteUsers, setRemoteUsers] = useState([])
  const [joinSucceed, setJoinSucceed] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  
  // Request camera and microphone permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "SyncMeet needs access to your camera to enable video calls.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        )
        
        const microphoneGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "SyncMeet needs access to your microphone to enable audio in calls.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        )
        
        if (
          cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          microphoneGranted === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setPermissionsGranted(true)
          return true
        } else {
          Alert.alert(
            "Permissions Required",
            "Camera and microphone permissions are required for video calls.",
            [{ text: "OK" }]
          )
          return false
        }
      } catch (err) {
        console.warn(err)
        return false
      }
    } else {
      // iOS permissions are handled by the SDK
      setPermissionsGranted(true)
      return true
    }
  }

  // Refs
  const callTimer = useRef(null)
  const chatScrollRef = useRef(null)
  const wsRef = useRef(null)

  // Initialize Agora engine
  const initializeAgoraEngine = async () => {
    try {
      // Request permissions first
      const permissionsGranted = await requestPermissions()
      if (!permissionsGranted) {
        console.error("Permissions not granted")
        return false
      }
      
      // Get Agora App ID from backend
      try {
        const tokenData = await videoCallApiService.getAgoraToken(meetingId, currentUser.email)
        // Create RTC engine instance with App ID from token response
        const rtcEngine = await RtcEngine.create(tokenData.appId || "")
        setEngine(rtcEngine)
      } catch (error) {
        console.error("Failed to get Agora App ID:", error)
        return false
      }
      
      // Enable video
      await rtcEngine.enableVideo()
      
      // Set channel profile to live broadcasting
      await rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
      
      // Set client role to broadcaster (all participants can send audio/video)
      await rtcEngine.setClientRole(ClientRole.Broadcaster)
      
      // Register event listeners
      rtcEngine.addListener('Warning', (warn) => {
        console.log('Warning', warn)
      })
      
      rtcEngine.addListener('Error', (err) => {
        console.error('Error', err)
      })
      
      rtcEngine.addListener('UserJoined', (uid, elapsed) => {
        console.log('UserJoined', uid, elapsed)
        // Add new user to remote users list
        setRemoteUsers((previousUsers) => {
          // Check if user already exists
          if (previousUsers.indexOf(uid) === -1) {
            return [...previousUsers, uid]
          }
          return previousUsers
        })
      })
      
      rtcEngine.addListener('UserOffline', (uid, reason) => {
        console.log('UserOffline', uid, reason)
        // Remove user from remote users list
        setRemoteUsers((previousUsers) => 
          previousUsers.filter((user) => user !== uid)
        )
      })
      
      rtcEngine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed)
        setJoinSucceed(true)
      })
      
      return true
    } catch (error) {
      console.error('Failed to initialize Agora engine', error)
      return false
    }
  }
  
  // Join Agora channel
  const joinAgoraChannel = async (token) => {
    if (!engine) {
      console.error('Agora engine not initialized')
      return false
    }
    
    try {
      // Join channel with token, channel name (meeting ID), optional info, and UID
      await engine.joinChannel(token, meetingId, null, uid)
      return true
    } catch (error) {
      console.error('Failed to join Agora channel', error)
      return false
    }
  }
  
  // Leave Agora channel
  const leaveAgoraChannel = async () => {
    if (!engine) return
    
    try {
      await engine.leaveChannel()
      setJoinSucceed(false)
      setRemoteUsers([])
    } catch (error) {
      console.error('Failed to leave Agora channel', error)
    }
  }
  
  // Cleanup Agora engine
  const destroyAgoraEngine = async () => {
    if (!engine) return
    
    try {
      await leaveAgoraChannel()
      await engine.destroy()
      setEngine(null)
    } catch (error) {
      console.error('Failed to destroy Agora engine', error)
    }
  }
  
  // ✅ Auto-join effect when component mounts with pre-filled data
  useEffect(() => {
    if (autoJoin === "true" && meetingId && currentUser.name && skipSettings === "true") {
      handleJoinCall()
    }
    
    // Initialize Agora engine
    initializeAgoraEngine()
    
    // Cleanup on component unmount
    return () => {
      destroyAgoraEngine()
    }
  }, [autoJoin, meetingId, currentUser.name, skipSettings])

  // ✅ Initialize WebSocket connection for real-time features
  useEffect(() => {
    if (inCall && meetingId) {
      initializeWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [inCall, meetingId])

  // Timer effect for call duration
  useEffect(() => {
    if (inCall) {
      callTimer.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callTimer.current) {
        clearInterval(callTimer.current)
      }
      setCallDuration(0)
    }

    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current)
      }
    }
  }, [inCall])

  // ✅ Initialize WebSocket for real-time communication
  const initializeWebSocket = () => {
    try {
      const wsUrl = `${BASE_URL.replace("https://", "wss://")}/ws`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected to:", wsUrl)
        wsRef.current.send(
          JSON.stringify({
            type: "subscribe",
            meetingCode: meetingId,
            userEmail: currentUser.email,
          }),
        )
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
      }

      wsRef.current.onclose = () => {
        console.log("🔌 WebSocket disconnected")
      }
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error)
    }
  }

  // ✅ Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "participant_joined":
        setParticipants((prev) => [...prev, data.participant])
        break
      case "participant_left":
        setParticipants((prev) => prev.filter((p) => p.email !== data.participantEmail))
        break
      case "participant_status_updated":
        setParticipants((prev) => prev.map((p) => (p.email === data.participantEmail ? { ...p, ...data.status } : p)))
        break
      case "chat_message":
        setChatMessages((prev) => [...prev, data.message])
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true })
        }, 100)
        break
      case "reaction":
        Alert.alert("Reaction", `${data.sender} sent ${data.reaction}`)
        break
      case "recording_status":
        setIsRecording(data.isRecording)
        break
      default:
        console.log("Unknown WebSocket message:", data)
    }
  }

  // ✅ Load meeting participants from backend
  const loadParticipants = async () => {
    if (!meetingId) return

    setIsLoadingParticipants(true)
    try {
      const participantsData = await videoCallApiService.getMeetingParticipants(meetingId)
      setParticipants(participantsData)
    } catch (error) {
      console.error("Failed to load participants:", error)
    } finally {
      setIsLoadingParticipants(false)
    }
  }

  // ✅ Get Agora token for video calling
  const getAgoraToken = async () => {
    try {
      const tokenData = await videoCallApiService.getAgoraToken(meetingId, currentUser.email)
      setAgoraToken(tokenData.token)
      
      // If we have an App ID in the response, update our engine
      if (tokenData.appId && !engine) {
        try {
          const rtcEngine = await RtcEngine.create(tokenData.appId)
          setEngine(rtcEngine)
          
          // Enable video
          await rtcEngine.enableVideo()
          
          // Set channel profile to live broadcasting
          await rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
          
          // Set client role to broadcaster (all participants can send audio/video)
          await rtcEngine.setClientRole(ClientRole.Broadcaster)
          
          // Register event listeners
          rtcEngine.addListener('Warning', (warn) => {
            console.log('Warning', warn)
          })
          
          rtcEngine.addListener('Error', (err) => {
            console.error('Error', err)
          })
          
          rtcEngine.addListener('UserJoined', (uid, elapsed) => {
            console.log('UserJoined', uid, elapsed)
            // Add new user to remote users list
            setRemoteUsers((previousUsers) => {
              // Check if user already exists
              if (previousUsers.indexOf(uid) === -1) {
                return [...previousUsers, uid]
              }
              return previousUsers
            })
          })
          
          rtcEngine.addListener('UserOffline', (uid, reason) => {
            console.log('UserOffline', uid, reason)
            // Remove user from remote users list
            setRemoteUsers((previousUsers) => 
              previousUsers.filter((user) => user !== uid)
            )
          })
          
          rtcEngine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
            console.log('JoinChannelSuccess', channel, uid, elapsed)
            setJoinSucceed(true)
          })
        } catch (engineError) {
          console.error('Failed to initialize Agora engine with App ID:', engineError)
        }
      }
      
      return tokenData.token
    } catch (error) {
      console.error("Failed to get Agora token:", error)
      return null
    }
  }

  // Format call duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Switch camera (front/back) using Agora
  const switchCamera = async () => {
    if (!engine || !joinSucceed) {
      Alert.alert("Not Connected", "You must be in a call to switch camera.")
      return
    }
    
    try {
      // Use Agora's switchCamera method
      await engine.switchCamera()
      
      const newPosition = cameraPosition === "front" ? "back" : "front"
      setCameraPosition(newPosition)
      Alert.alert("Camera Switched", `Switched to ${newPosition} camera`)
    } catch (error) {
      console.error("Failed to switch camera:", error)
      Alert.alert("Error", "Failed to switch camera. Please try again.")
    }
  }

  // Handle more options menu
  const handleMoreOptions = () => {
    Alert.alert("Video Options", "Choose an option:", [
      {
        text: "Switch Camera",
        onPress: switchCamera,
      },
      {
        text: "Video Settings",
        onPress: () => Alert.alert("Video Settings", "Video quality and effects settings would go here"),
      },
      {
        text: "Pin Video",
        onPress: () => Alert.alert("Pin Video", "Video has been pinned to main view"),
      },
      {
        text: "Full Screen",
        onPress: () => Alert.alert("Full Screen", "Entering full screen mode"),
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // ✅ Enhanced join call function with backend integration and Agora
  const handleJoinCall = async () => {
    if (!meetingId.trim()) {
      Alert.alert("Meeting ID Required", "Please enter a meeting ID to join.")
      return
    }

    if (!currentUser.name || !currentUser.email) {
      Alert.alert("User Info Required", "Please provide your name and email.")
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Join the meeting via API first
      const joinResponse = await videoCallApiService.joinMeeting(meetingId, currentUser.email)
      console.log("✅ Joined meeting:", joinResponse)

      // Get Agora token - this will also initialize the engine with the App ID if needed
      const token = await getAgoraToken()
      if (!token) {
        throw new Error("Failed to get video call token")
      }
      
      // Initialize Agora engine if not already initialized
      if (!engine) {
        const initialized = await initializeAgoraEngine()
        if (!initialized) {
          throw new Error("Failed to initialize video call engine")
        }
      }
      
      // Join Agora channel
      const joinedChannel = await joinAgoraChannel(token)
      if (!joinedChannel) {
        throw new Error("Failed to join video channel")
      }

      // Load participants
      await loadParticipants()
      setInCall(true)
      setIsConnecting(false)

      Alert.alert("Success", "Successfully joined the meeting!")
    } catch (error) {
      setIsConnecting(false)
      setConnectionError(error.message)

      if (error.response?.status === 403) {
        Alert.alert("Access Denied", "You are not invited to this meeting or the meeting is locked.")
      } else if (error.response?.status === 404) {
        Alert.alert("Meeting Not Found", "This meeting does not exist or has ended.")
      } else {
        Alert.alert("Connection Failed", "Failed to join the meeting. Please try again.")
      }
    }
  }

  // ✅ Enhanced leave call function with backend integration and Agora
  const handleLeaveCall = () => {
    Alert.alert("Leave Meeting", "Are you sure you want to leave this meeting?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            // Leave the Agora channel
            await leaveAgoraChannel()
            
            // Leave the meeting via API
            await videoCallApiService.leaveMeeting(meetingId, currentUser.email)

            // Close WebSocket connection
            if (wsRef.current) {
              wsRef.current.close()
            }

            // Reset all states
            setInCall(false)
            setCallDuration(0)
            setShowParticipants(false)
            setShowChat(false)
            setIsRecording(false)
            setIsScreenSharing(false)
            setParticipants([])
            setChatMessages([])
            setJoinSucceed(false)
            setRemoteUsers([])

            router.back()
          } catch (error) {
            console.error("Error leaving meeting:", error)
            setInCall(false)
            router.back()
          }
        },
      },
    ])
  }

  // ✅ Enhanced toggle mute with backend integration and Agora
  const handleToggleMute = async () => {
    if (!engine || !joinSucceed) {
      Alert.alert("Not Connected", "You must be in a call to toggle audio.")
      return
    }
    
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    try {
      // Update Agora engine audio state
      await engine.enableLocalAudio(!newMutedState)
      
      // Update backend status
      await videoCallApiService.updateParticipantStatus(meetingId, currentUser.email, {
        isMuted: newMutedState,
        cameraOn: cameraOn,
      })

      Alert.alert("Audio", newMutedState ? "Microphone muted" : "Microphone unmuted")
    } catch (error) {
      console.error("Failed to toggle mute:", error)
      setIsMuted(!newMutedState)
      
      // Try to revert Agora engine state
      try {
        await engine.enableLocalAudio(newMutedState)
      } catch (e) {
        console.error("Failed to revert audio state:", e)
      }
    }
  }

  // ✅ Enhanced toggle camera with backend integration and Agora
  const handleToggleCamera = async () => {
    if (!engine || !joinSucceed) {
      Alert.alert("Not Connected", "You must be in a call to toggle video.")
      return
    }
    
    const newCameraState = !cameraOn
    setCameraOn(newCameraState)

    try {
      // Update Agora engine video state
      await engine.enableLocalVideo(newCameraState)
      
      // Update backend status
      await videoCallApiService.updateParticipantStatus(meetingId, currentUser.email, {
        isMuted: isMuted,
        cameraOn: newCameraState,
      })

      Alert.alert("Camera", newCameraState ? "Camera turned on" : "Camera turned off")
    } catch (error) {
      console.error("Failed to toggle camera:", error)
      setCameraOn(!newCameraState)
      
      // Try to revert Agora engine state
      try {
        await engine.enableLocalVideo(!newCameraState)
      } catch (e) {
        console.error("Failed to revert video state:", e)
      }
    }
  }

  // Toggle speaker function
  const handleToggleSpeaker = () => {
    setSpeakerOn(!speakerOn)
    Alert.alert("Speaker", speakerOn ? "Speaker turned off" : "Speaker turned on")
  }

  // ✅ Enhanced recording with backend integration
  const handleToggleRecording = async () => {
    if (isRecording) {
      Alert.alert("Stop Recording", "Are you sure you want to stop recording?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          onPress: async () => {
            try {
              await videoCallApiService.toggleRecording(meetingId, "stop")
              setIsRecording(false)
              Alert.alert("Recording Stopped", "Meeting recording has been stopped.")
            } catch (error) {
              console.error("Failed to stop recording:", error)
              Alert.alert("Error", "Failed to stop recording. Please try again.")
            }
          },
        },
      ])
    } else {
      Alert.alert("Start Recording", "This meeting will be recorded. All participants will be notified.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            try {
              await videoCallApiService.toggleRecording(meetingId, "start")
              setIsRecording(true)
              Alert.alert("Recording Started", "Meeting is now being recorded.")
            } catch (error) {
              console.error("Failed to start recording:", error)
              Alert.alert("Error", "Failed to start recording. Please try again.")
            }
          },
        },
      ])
    }
  }

  // Toggle screen sharing
  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      setIsScreenSharing(false)
      Alert.alert("Screen Share Stopped", "You stopped sharing your screen.")
    } else {
      Alert.alert("Share Screen", "You are about to share your screen with all participants.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            setIsScreenSharing(true)
            Alert.alert("Screen Share Started", "You are now sharing your screen.")
          },
        },
      ])
    }
  }

  // ✅ Enhanced send chat message with backend integration
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSendingMessage(true)

    const tempMessage = {
      id: Date.now(),
      text: messageText,
      sender: currentUser.name,
      senderEmail: currentUser.email,
      timestamp: new Date().toLocaleTimeString(),
      isOwn: true,
      sending: true,
    }

    setChatMessages((prev) => [...prev, tempMessage])

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      await videoCallApiService.sendChatMessage(meetingId, messageText, currentUser.email)
      setChatMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, sending: false } : msg)))
    } catch (error) {
      console.error("Failed to send message:", error)
      setChatMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setIsSendingMessage(false)
    }
  }

  // ✅ Enhanced send reaction with backend integration
  const handleSendReaction = async (reaction) => {
    setShowReactions(false)

    try {
      await videoCallApiService.sendReaction(meetingId, reaction, currentUser.email)
      Alert.alert("Reaction Sent", `You sent ${reaction}`)
    } catch (error) {
      console.error("Failed to send reaction:", error)
      Alert.alert("Error", "Failed to send reaction. Please try again.")
    }
  }

  // Invite participants
  const handleInviteParticipants = () => {
    Alert.alert("Invite Participants", `Meeting ID: ${meetingId}\nShare this ID with others to join the meeting.`, [
      {
        text: "Copy ID",
        onPress: () => {
          Alert.alert("Copied", "Meeting ID copied to clipboard!")
        },
      },
      {
        text: "Share Link",
        onPress: () => {
          Alert.alert("Share", "Opening share dialog...")
        },
      },
      { text: "Close", style: "cancel" },
    ])
  }

  // Security options
  const handleSecurityOptions = () => {
    Alert.alert("Security Options", "Choose security settings for this meeting", [
      {
        text: "Lock Meeting",
        onPress: () => {
          Alert.alert("Meeting Locked", "Meeting has been locked.")
        },
      },
      {
        text: "Enable Waiting Room",
        onPress: () => {
          Alert.alert("Waiting Room Enabled", "Waiting room has been enabled.")
        },
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // ✅ Show connection error state
  if (connectionError) {
    return (
      <SafeAreaView style={styles.connectingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1f1f23" />
        <View style={styles.connectingContent}>
          <MaterialIcons name="error-outline" size={48} color="#FF1744" style={{ marginBottom: 16 }} />
          <Text style={styles.connectingText}>Connection Failed</Text>
          <Text style={styles.connectingSubtext}>{connectionError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleJoinCall}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (isConnecting) {
    return (
      <SafeAreaView style={styles.connectingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1f1f23" />
        <View style={styles.connectingContent}>
          <Text style={styles.connectingText}>Connecting...</Text>
          <Text style={styles.connectingSubtext}>Please wait while we connect you to the meeting</Text>
          <Text style={styles.meetingInfo}>Meeting: {meetingTitle || meetingId}</Text>
          <Text style={styles.meetingInfo}>User: {currentUser.name}</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!inCall) {
    return (
      <SafeAreaView style={styles.preCallContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1f1f23" />
        <KeyboardAvoidingView style={styles.preCallContent} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.preCallVideoContainer}>
            {cameraOn ? (
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraPreviewText}>Camera Preview</Text>
                <Text style={styles.cameraStatusText}>
                  {cameraPosition === "front" ? "Front Camera" : "Back Camera"}
                </Text>
                <Text style={styles.cameraNote}>(Camera access will be added with proper permissions)</Text>
              </View>
            ) : (
              <>
                <Text style={styles.preCallVideoText}>Your camera is off</Text>
                <TouchableOpacity style={styles.preCallCameraBtn} onPress={handleToggleCamera}>
                  <MaterialIcons name="videocam-off" size={32} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {cameraOn && (
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.switchCameraBtnLarge} onPress={switchCamera}>
                  <MaterialIcons name="flip-camera-ios" size={28} color="#fff" />
                  <Text style={styles.controlButtonLabel}>Switch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreOptionsBtnLarge} onPress={handleMoreOptions}>
                  <MaterialIcons name="more-vert" size={28} color="#fff" />
                  <Text style={styles.controlButtonLabel}>Options</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.preCallInfo}>
            <TextInput
              style={styles.meetingTitleInput}
              placeholder="Meeting Title (Optional)"
              placeholderTextColor="#999"
              value={meetingTitle}
              onChangeText={setMeetingTitle}
            />
            <TextInput
              style={styles.meetingIdInput}
              placeholder="Enter Meeting ID"
              placeholderTextColor="#999"
              value={meetingId}
              onChangeText={setMeetingId}
            />
          </View>

          <View style={styles.preCallControls}>
            <TouchableOpacity
              style={[styles.preCallControlBtn, isMuted && styles.preCallControlBtnActive]}
              onPress={handleToggleMute}
            >
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#FF1744" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.preCallControlBtn, !cameraOn && styles.preCallControlBtnActive]}
              onPress={handleToggleCamera}
            >
              <MaterialIcons
                name={cameraOn ? "videocam" : "videocam-off"}
                size={24}
                color={!cameraOn ? "#FF1744" : "#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.preCallControlBtn, speakerOn && styles.preCallControlBtnActive]}
              onPress={handleToggleSpeaker}
            >
              <MaterialIcons
                name={speakerOn ? "volume-up" : "volume-off"}
                size={24}
                color={speakerOn ? "#2D8CFF" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.joinBtn, (!meetingId.trim() || isConnecting) && styles.joinBtnDisabled]}
            onPress={handleJoinCall}
            disabled={!meetingId.trim() || isConnecting}
          >
            <Text style={styles.joinBtnText}>{isConnecting ? "Connecting..." : "Join Meeting"}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.callContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
            </View>
          )}
          {isScreenSharing && (
            <View style={styles.sharingIndicator}>
              <MaterialIcons name="screen-share" size={16} color="#00D924" />
              <Text style={styles.sharingText}>Sharing</Text>
            </View>
          )}
        </View>
        <View style={styles.topBarCenter}>
          <Text style={styles.meetingTime}>{formatDuration(callDuration)}</Text>
          {meetingTitle && <Text style={styles.meetingTitleTop}>{meetingTitle}</Text>}
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarBtn} onPress={handleSecurityOptions}>
            <MaterialIcons name="security" size={20} color="#00D924" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarBtn}>
            <MaterialIcons name="signal-wifi-4-bar" size={20} color="#00D924" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Video Area */}
      <View style={styles.videoArea}>
        {/* Main Speaker View */}
        <View style={styles.mainVideoContainer}>
          {joinSucceed ? (
            cameraOn ? (
              // Local video stream using Agora RtcLocalView
              <RtcLocalView.SurfaceView 
                style={styles.mainVideoStream} 
                channelId={meetingId}
                renderMode={VideoRenderMode.Hidden}
              />
            ) : (
              // Camera off - show avatar
              <View style={styles.videoPlaceholder}>
                {isScreenSharing ? (
                  <View style={styles.screenShareContainer}>
                    <MaterialIcons name="screen-share" size={48} color="#00D924" />
                    <Text style={styles.screenShareText}>Screen Sharing Active</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {currentUser?.name
                          ? currentUser.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "You"}
                      </Text>
                    </View>
                    <Text style={styles.participantNameMain}>{currentUser?.name || "You"}</Text>
                    {isMuted && (
                      <View style={styles.micIndicator}>
                        <Ionicons name="mic-off" size={16} color="#FF1744" />
                      </View>
                    )}
                  </>
                )}
              </View>
            )
          ) : (
            // Not connected to Agora yet
            <View style={styles.mainVideoPlaceholder}>
              <Text style={styles.mainVideoText}>Waiting to connect...</Text>
              <Text style={styles.cameraNote}>(Video will appear when connected)</Text>
            </View>
          )}

          {/* Video Controls Overlay */}
          <View style={styles.videoOverlay}>
            {cameraOn && (
              <TouchableOpacity style={styles.switchCameraBtnOverlay} onPress={switchCamera}>
                <MaterialIcons name="flip-camera-ios" size={20} color="#fff" />
              </TouchableOpacity>
            )}

            <View style={styles.rightControls}>
              <TouchableOpacity style={styles.pinBtn}>
                <MaterialIcons name="push-pin" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreBtn} onPress={handleMoreOptions}>
                <MaterialIcons name="more-vert" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Thumbnail Videos - Remote Participants */}
        {(participants.length > 0 || remoteUsers.length > 0) && (
          <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
            {/* Agora Remote Users */}
            {joinSucceed && remoteUsers.map((uid) => (
              <View key={`agora-${uid}`} style={styles.thumbnailVideo}>
                {/* Remote video stream */}
                <RtcRemoteView.SurfaceView
                  style={styles.thumbnailVideoStream}
                  uid={uid}
                  channelId={meetingId}
                  renderMode={VideoRenderMode.Hidden}
                  zOrderMediaOverlay={true}
                />
                
                {/* Find matching participant info if available */}
                {participants.find(p => p.uid === uid) && (
                  <>
                    <Text style={styles.thumbnailName} numberOfLines={1}>
                      {participants.find(p => p.uid === uid)?.name || "Unknown"}
                    </Text>
                    {participants.find(p => p.uid === uid)?.isMuted && (
                      <View style={styles.thumbnailMicOff}>
                        <Ionicons name="mic-off" size={12} color="#FF1744" />
                      </View>
                    )}
                    {participants.find(p => p.uid === uid)?.isHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>Host</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}
            
            {/* Participants without video streams yet */}
            {participants
              .filter(participant => !remoteUsers.includes(participant.uid))
              .map((participant) => (
                <View key={participant.id || participant.email} style={styles.thumbnailVideo}>
                  <View style={styles.thumbnailAvatar}>
                    <Text style={styles.thumbnailAvatarText}>
                      {participant.name
                        ? participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "U"}
                    </Text>
                  </View>
                  <Text style={styles.thumbnailName} numberOfLines={1}>
                    {participant.name || "Unknown"}
                  </Text>
                  {participant.isMuted && (
                    <View style={styles.thumbnailMicOff}>
                      <Ionicons name="mic-off" size={12} color="#FF1744" />
                    </View>
                  )}
                  {participant.isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  )}
                </View>
              ))}
          </ScrollView>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsRow}>
          {/* Mute Button */}
          <TouchableOpacity style={[styles.controlBtn, isMuted && styles.controlBtnActive]} onPress={handleToggleMute}>
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#FF1744" : "#fff"} />
            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          {/* Video Button */}
          <TouchableOpacity
            style={[styles.controlBtn, !cameraOn && styles.controlBtnActive]}
            onPress={handleToggleCamera}
          >
            <MaterialIcons
              name={cameraOn ? "videocam" : "videocam-off"}
              size={24}
              color={!cameraOn ? "#FF1744" : "#fff"}
            />
            <Text style={[styles.controlLabel, !cameraOn && styles.controlLabelActive]}>
              {cameraOn ? "Stop Video" : "Start Video"}
            </Text>
          </TouchableOpacity>

          {/* Security Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={handleSecurityOptions}>
            <MaterialIcons name="security" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Security</Text>
          </TouchableOpacity>

          {/* Participants Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowParticipants(!showParticipants)}>
            <MaterialIcons name="people" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Participants</Text>
            {participants.length > 0 && (
              <View style={styles.participantCount}>
                <Text style={styles.participantCountText}>{participants.length + 1}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Chat Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowChat(!showChat)}>
            <MaterialIcons name="chat" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Chat</Text>
            {chatMessages.length > 0 && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>{chatMessages.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={handleToggleScreenShare}>
            <MaterialIcons name="screen-share" size={24} color={isScreenSharing ? "#00D924" : "#fff"} />
            <Text style={[styles.controlLabel, isScreenSharing && { color: "#00D924" }]}>
              {isScreenSharing ? "Stop Share" : "Share Screen"}
            </Text>
          </TouchableOpacity>

          {/* Record Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={handleToggleRecording}>
            <MaterialIcons name="fiber-manual-record" size={24} color={isRecording ? "#FF1744" : "#fff"} />
            <Text style={[styles.controlLabel, isRecording && { color: "#FF1744" }]}>
              {isRecording ? "Stop Record" : "Record"}
            </Text>
          </TouchableOpacity>

          {/* Reactions Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowReactions(!showReactions)}>
            <MaterialIcons name="emoji-emotions" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Reactions</Text>
          </TouchableOpacity>

          {/* Invite Button */}
          <TouchableOpacity style={styles.controlBtn} onPress={handleInviteParticipants}>
            <MaterialIcons name="person-add" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Invite</Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity style={styles.endCallBtn} onPress={handleLeaveCall}>
            <MaterialIcons name="call-end" size={24} color="#fff" />
            <Text style={styles.controlLabel}>End</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Participants Panel */}
      {showParticipants && (
        <View style={styles.participantsPanel}>
          <View style={styles.participantsPanelHeader}>
            <Text style={styles.participantsPanelTitle}>
              Participants ({participants.length + 1}){isLoadingParticipants && " (Loading...)"}
            </Text>
            <TouchableOpacity onPress={() => setShowParticipants(false)}>
              <AntDesign name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.participantsList}>
            {/* Current User */}
            <View style={styles.participantItem}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>
                  {currentUser?.name
                    ? currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "You"}
                </Text>
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{currentUser?.name || "You"} (You)</Text>
                <Text style={styles.participantStatus}>{currentUser.isHost ? "Host" : "Participant"}</Text>
              </View>
              <View style={styles.participantControls}>
                <Ionicons name={isMuted ? "mic-off" : "mic"} size={16} color={isMuted ? "#FF1744" : "#00D924"} />
                <MaterialIcons
                  name={cameraOn ? "videocam" : "videocam-off"}
                  size={16}
                  color={cameraOn ? "#00D924" : "#FF1744"}
                />
              </View>
            </View>

            {/* Other Participants */}
            {participants.map((participant) => (
              <View key={participant.id || participant.email} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {participant.name
                      ? participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name || "Unknown"}</Text>
                  {participant.isHost && <Text style={styles.participantStatus}>Host</Text>}
                </View>
                <View style={styles.participantControls}>
                  <Ionicons
                    name={participant.isMuted ? "mic-off" : "mic"}
                    size={16}
                    color={participant.isMuted ? "#FF1744" : "#00D924"}
                  />
                  <MaterialIcons
                    name={participant.cameraOn ? "videocam" : "videocam-off"}
                    size={16}
                    color={participant.cameraOn ? "#00D924" : "#FF1744"}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Chat Panel */}
      {showChat && (
        <View style={styles.chatPanel}>
          <View style={styles.chatPanelHeader}>
            <Text style={styles.chatPanelTitle}>Chat</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <AntDesign name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView ref={chatScrollRef} style={styles.chatMessages} showsVerticalScrollIndicator={false}>
            {chatMessages.length === 0 ? (
              <Text style={styles.noChatText}>No messages yet. Start the conversation!</Text>
            ) : (
              chatMessages.map((message) => (
                <View key={message.id} style={[styles.chatMessage, message.isOwn && styles.ownChatMessage]}>
                  <Text style={styles.chatSender}>{message.sender}</Text>
                  <Text style={styles.chatText}>{message.text}</Text>
                  <View style={styles.chatMessageFooter}>
                    <Text style={styles.chatTime}>{message.timestamp}</Text>
                    {message.sending && <Text style={styles.sendingIndicator}>Sending...</Text>}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
              editable={!isSendingMessage}
            />
            <TouchableOpacity
              style={[styles.chatSendBtn, (!newMessage.trim() || isSendingMessage) && styles.chatSendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reactions Panel */}
      {showReactions && (
        <View style={styles.reactionsPanel}>
          <View style={styles.reactionsPanelHeader}>
            <Text style={styles.reactionsPanelTitle}>Reactions</Text>
            <TouchableOpacity onPress={() => setShowReactions(false)}>
              <AntDesign name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.reactionsGrid}>
            {["👍", "👏", "❤️", "😂", "😮", "😢", "👎", "🎉"].map((reaction) => (
              <TouchableOpacity key={reaction} style={styles.reactionBtn} onPress={() => handleSendReaction(reaction)}>
                <Text style={styles.reactionEmoji}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Connecting screen
  connectingContainer: {
    flex: 1,
    backgroundColor: "#1f1f23",
  },
  connectingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  connectingText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  connectingSubtext: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  meetingInfo: {
    color: "#2D8CFF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  retryBtn: {
    backgroundColor: "#2D8CFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#404040",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 16,
  },

  // Pre-call styles
  preCallContainer: {
    flex: 1,
    backgroundColor: "#1f1f23",
  },
  preCallContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  preCallVideoContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: "#2d2d30",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
    overflow: "hidden",
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cameraPreviewText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
  cameraStatusText: {
    color: "#2D8CFF",
    fontSize: 14,
    marginBottom: 4,
  },
  cameraNote: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  preCallVideoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  preCallCameraBtn: {
    backgroundColor: "#404040",
    padding: 15,
    borderRadius: 50,
  },

  // Camera Controls
  cameraControls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchCameraBtnLarge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    minWidth: 80,
  },
  moreOptionsBtnLarge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    minWidth: 80,
  },
  controlButtonLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },

  preCallInfo: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  meetingTitleInput: {
    backgroundColor: "#2d2d30",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    textAlign: "center",
  },
  meetingIdInput: {
    backgroundColor: "#2d2d30",
    color: "#fff",
    fontSize: 16,
    padding: 15,
    borderRadius: 8,
    width: "100%",
    textAlign: "center",
  },
  preCallControls: {
    flexDirection: "row",
    marginBottom: 40,
  },
  preCallControlBtn: {
    backgroundColor: "#404040",
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  preCallControlBtnActive: {
    backgroundColor: "#FF1744",
  },
  joinBtn: {
    backgroundColor: "#2D8CFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  joinBtnDisabled: {
    backgroundColor: "#666",
  },
  joinBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // In-call styles
  callContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  topBarLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF1744",
    marginRight: 6,
  },
  recordingText: {
    color: "#FF1744",
    fontSize: 12,
    fontWeight: "500",
  },
  sharingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  sharingText: {
    color: "#00D924",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  meetingTime: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  meetingTitleTop: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  topBarBtn: {
    marginLeft: 12,
  },
  videoArea: {
    flex: 1,
  },
  mainVideoContainer: {
    flex: 1,
    position: "relative",
  },
  mainVideoStream: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  mainVideoPlaceholder: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  mainVideoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  screenShareContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  screenShareText: {
    color: "#00D924",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  participantNameMain: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
  micIndicator: {
    backgroundColor: "rgba(255, 23, 68, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Video Controls Overlay
  videoOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  switchCameraBtnOverlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 25,
    minWidth: 50,
    alignItems: "center",
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  moreBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },

  thumbnailContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    maxHeight: 120,
  },
  thumbnailVideo: {
    width: 80,
    height: 100,
    backgroundColor: "#2d2d30",
    borderRadius: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  remoteVideoStream: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  thumbnailVideoStream: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  thumbnailAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  thumbnailAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  thumbnailName: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  thumbnailMicOff: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(255, 23, 68, 0.9)",
    borderRadius: 8,
    padding: 2,
  },
  hostBadge: {
    position: "absolute",
    top: 2,
    left: 2,
    backgroundColor: "#FF9500",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hostBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  bottomControls: {
    backgroundColor: "#1c1c1e",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  controlBtn: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: "relative",
    marginHorizontal: 4,
  },
  controlBtnActive: {
    backgroundColor: "rgba(255, 23, 68, 0.2)",
    borderRadius: 8,
  },
  controlLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  controlLabelActive: {
    color: "#FF1744",
  },
  participantCount: {
    position: "absolute",
    top: -2,
    right: 8,
    backgroundColor: "#FF1744",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  participantCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  chatBadge: {
    position: "absolute",
    top: -2,
    right: 8,
    backgroundColor: "#2D8CFF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chatBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  endCallBtn: {
    backgroundColor: "#FF1744",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // Participants Panel
  participantsPanel: {
    position: "absolute",
    right: 0,
    top: 60,
    bottom: 100,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "#2d2d30",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  participantsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  participantsPanelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  participantStatus: {
    color: "#FF9500",
    fontSize: 12,
    marginTop: 2,
  },
  participantControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Chat Panel
  chatPanel: {
    position: "absolute",
    right: 0,
    top: 60,
    bottom: 100,
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: "#2d2d30",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  chatPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  chatPanelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatMessages: {
    flex: 1,
    padding: 12,
  },
  noChatText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  chatMessage: {
    backgroundColor: "#404040",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ownChatMessage: {
    backgroundColor: "#2D8CFF",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  chatSender: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  chatText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  chatMessageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTime: {
    color: "#999",
    fontSize: 10,
  },
  sendingIndicator: {
    color: "#2D8CFF",
    fontSize: 10,
    fontStyle: "italic",
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#404040",
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: "#404040",
    color: "#fff",
    padding: 12,
    borderRadius: 20,
    marginRight: 8,
    maxHeight: 100,
  },
  chatSendBtn: {
    backgroundColor: "#2D8CFF",
    padding: 12,
    borderRadius: 20,
  },
  chatSendBtnDisabled: {
    backgroundColor: "#666",
  },

  // Reactions Panel
  reactionsPanel: {
    position: "absolute",
    bottom: 120,
    right: 16,
    backgroundColor: "#2d2d30",
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
  },
  reactionsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reactionsPanelTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reactionBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#404040",
    marginBottom: 8,
  },
  reactionEmoji: {
    fontSize: 20,
  },
})
