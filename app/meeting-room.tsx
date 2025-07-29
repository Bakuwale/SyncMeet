import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSchedule } from '../components/ScheduleContext';
import { useThemeContext } from '../components/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MeetingRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const { scheduledMeetings } = useSchedule();

  // Meeting state
  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showControls, setShowControls] = useState(true);

  // Load meeting data
  useEffect(() => {
    if (id && scheduledMeetings.length > 0) {
      const foundMeeting = scheduledMeetings.find(m => m.id === id);
      if (foundMeeting) {
        setMeeting(foundMeeting);
        // Simulate participants
        setParticipants([
          { id: '1', name: 'You (Host)', isHost: true, isMuted: false, isVideoOn: true },
          { id: '2', name: 'Participant 1', isHost: false, isMuted: true, isVideoOn: false },
        ]);
        setIsLoading(false);
      } else {
        Alert.alert('Error', 'Meeting not found');
        router.back();
      }
    }
  }, [id, scheduledMeetings]);

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (isConnected) {
        Alert.alert('Leave Meeting', 'Are you sure you want to leave this meeting?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isConnected]);

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    if (showControls && isConnected) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showControls, isConnected]);

  // Join meeting
  const joinMeeting = () => {
    setIsJoining(true);
    // Simulate joining process
    setTimeout(() => {
      setIsJoining(false);
      setIsConnected(true);
    }, 2000);
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#121212' : '#f5f5f5',
    card: isDarkTheme ? '#1e1e1e' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    subtext: isDarkTheme ? '#aaaaaa' : '#666666',
    border: isDarkTheme ? '#333333' : '#e0e0e0',
    primary: '#007AFF',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    controlBackground: 'rgba(0, 0, 0, 0.5)',
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Loading meeting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Join Meeting
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={[styles.joinCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.meetingTitle, { color: themeColors.text }]}>
            {meeting?.topic}
          </Text>
          <Text style={[styles.meetingInfo, { color: themeColors.subtext }]}>
            {new Date(meeting?.date).toLocaleString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' • '}
            {meeting?.duration} min
          </Text>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: themeColors.text }]}>Video</Text>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: isVideoOn ? themeColors.success : themeColors.danger }]}
                onPress={() => setIsVideoOn(!isVideoOn)}
              >
                <Text style={styles.optionButtonText}>{isVideoOn ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: themeColors.text }]}>Audio</Text>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: isMuted ? themeColors.danger : themeColors.success }]}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Text style={styles.optionButtonText}>{isMuted ? 'Muted' : 'On'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: themeColors.primary }]}
            onPress={joinMeeting}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.joinButtonText}>Join Meeting</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* Main video view (placeholder) */}
        <View style={styles.mainVideo}>
          <Text style={styles.videoPlaceholderText}>Main Video Feed</Text>
        </View>

        {/* Participant thumbnails */}
        <View style={styles.thumbnailContainer}>
          {participants.map((participant) => (
            <View key={participant.id} style={styles.thumbnail}>
              <Text style={styles.thumbnailText}>{participant.name}</Text>
              {participant.isMuted && (
                <View style={styles.thumbnailIcon}>
                  <Ionicons name="mic-off" size={16} color="#ffffff" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Meeting info */}
        <View style={[styles.meetingInfoBar, { backgroundColor: themeColors.controlBackground }]}>
          <Text style={styles.meetingInfoText}>{meeting?.topic}</Text>
          <Text style={styles.meetingInfoText}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Controls */}
        {showControls && (
          <View style={[styles.controlsContainer, { backgroundColor: themeColors.controlBackground }]}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              <Ionicons
                name={isVideoOn ? 'videocam' : 'videocam-off'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.controlText}>
                {isVideoOn ? 'Stop Video' : 'Start Video'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsScreenSharing(!isScreenSharing)}
            >
              <MaterialIcons name="screen-share" size={24} color="#ffffff" />
              <Text style={styles.controlText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setParticipants([...participants])}
            >
              <Ionicons name="people" size={24} color="#ffffff" />
              <Text style={styles.controlText}>
                Participants ({participants.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: themeColors.danger }]}
              onPress={() => {
                Alert.alert('Leave Meeting', 'Are you sure you want to leave this meeting?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Leave', style: 'destructive', onPress: () => router.back() },
                ]);
              }}
            >
              <MaterialIcons name="call-end" size={24} color="#ffffff" />
              <Text style={styles.controlText}>Leave</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  joinCard: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  meetingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meetingInfo: {
    fontSize: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  optionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  joinButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  videoPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: screenWidth * 0.25,
  },
  thumbnail: {
    height: screenHeight * 0.1,
    backgroundColor: '#555555',
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  thumbnailText: {
    color: '#ffffff',
    fontSize: 12,
  },
  thumbnailIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 2,
  },
  meetingInfoBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  meetingInfoText: {
    color: '#ffffff',
    fontSize: 14,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  controlText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
});