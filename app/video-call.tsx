import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../components/auth-context';

const { width, height } = Dimensions.get('window');

// Fallback component when camera is not available
const CameraFallback = ({ onVideoToggle }: { onVideoToggle: (enabled: boolean) => void }) => (
  <View style={styles.cameraContainer}>
    <View style={styles.errorContainer}>
      <Ionicons name="videocam-off" size={48} color="#FF3B30" />
      <Text style={styles.errorText}>
        Camera not available
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => onVideoToggle(false)}
      >
        <Text style={styles.retryButtonText}>Disable Camera</Text>
      </TouchableOpacity>
    </View>
  </View>
);

function VideoCallScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [isInCall, setIsInCall] = useState(false);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (meetingId) {
      initializeCall();
    }
  }, [meetingId]);

  // Request permission on component mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const initializeCall = async () => {
    if (!meetingId) {
      Alert.alert('Error', 'No meeting ID provided');
      router.back();
      return;
    }

    setJoining(true);
    
    try {
      // Simulate joining a call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInCall(true);
    } catch (error) {
      console.error('Error joining call:', error);
      Alert.alert('Error', 'Failed to join call');
      router.back();
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveCall = async () => {
    setLeaving(true);
    try {
      // Simulate leaving a call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsInCall(false);
      router.back();
    } catch (error) {
      console.error('Error leaving call:', error);
    } finally {
      setLeaving(false);
    }
  };

  const handleToggleVideo = () => {
    setLocalVideoEnabled(!localVideoEnabled);
  };

  const handleToggleAudio = () => {
    setLocalAudioEnabled(!localAudioEnabled);
  };

  const handleSwitchCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  if (joining) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Joining meeting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInCall) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing call...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Local Video */}
        <View style={styles.localVideoContainer}>
          {localVideoEnabled ? (
            <View style={styles.cameraContainer}>
              {!permission ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Requesting camera permission...
                  </Text>
                </View>
              ) : !permission.granted ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="videocam-off" size={48} color="#FF3B30" />
                  <Text style={styles.errorText}>
                    We need your permission to show the camera
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={requestPermission}
                  >
                    <Text style={styles.retryButtonText}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={facing}
                  onCameraReady={handleCameraReady}
                >
                  {isCameraReady && (
                    <View style={styles.controlsOverlay}>
                      <View style={styles.bottomControls}>
                        <TouchableOpacity
                          style={styles.flipButton}
                          onPress={handleSwitchCamera}
                        >
                          <Ionicons name="camera-reverse" size={20} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </CameraView>
              )}
              
              {/* Camera status indicator */}
              {!isCameraReady && permission?.granted && (
                <View style={styles.statusOverlay}>
                  <Text style={styles.statusText}>Initializing camera...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.videoOffContainer}>
              <Ionicons name="videocam-off" size={48} color="#999" />
              <Text style={styles.videoOffText}>Camera is off</Text>
              <TouchableOpacity 
                style={styles.enableCameraButton}
                onPress={() => setLocalVideoEnabled(true)}
              >
                <Text style={styles.enableCameraButtonText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.participantName}>
            {user?.fullName || user?.email} (You)
          </Text>
        </View>

        {/* Main Video Area */}
        <View style={styles.mainVideoContainer}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={64} color="#fff" />
            <Text style={styles.videoPlaceholderText}>Main Video Area</Text>
            <Text style={styles.meetingInfoText}>
              Meeting ID: {meetingId}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          {/* Video Toggle */}
          <TouchableOpacity
            style={[styles.controlButton, !localVideoEnabled && styles.controlButtonDisabled]}
            onPress={handleToggleVideo}
            disabled={leaving}
          >
            <Ionicons
              name={localVideoEnabled ? "videocam" : "videocam-off"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Audio Toggle */}
          <TouchableOpacity
            style={[styles.controlButton, !localAudioEnabled && styles.controlButtonDisabled]}
            onPress={handleToggleAudio}
            disabled={leaving}
          >
            <Ionicons
              name={localAudioEnabled ? "mic" : "mic-off"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Switch Camera */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSwitchCamera}
            disabled={leaving}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Leave Call */}
          <TouchableOpacity
            style={[styles.controlButton, styles.leaveButton]}
            onPress={handleLeaveCall}
            disabled={leaving}
          >
            {leaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="call" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Meeting Info */}
      <View style={styles.meetingInfo}>
        <Text style={styles.meetingInfoText}>
          Meeting: {meetingId}
        </Text>
        <Text style={styles.meetingInfoText}>
          Participants: 1
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    zIndex: 10,
  },
  mainVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
  },
  camera: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    color: '#fff',
  },
  retryButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
  },
  videoOffText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    color: '#999',
  },
  enableCameraButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  enableCameraButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flipButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  participantName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#666',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  meetingInfo: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  meetingInfoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default VideoCallScreen;
