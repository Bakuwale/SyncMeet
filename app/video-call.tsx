import { Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

// --- CONFIG ---
const MOCK_PARTICIPANTS = [
  { id: '1', name: 'You (Host)' },
  { id: '2', name: 'Jane Doe' },
  { id: '3', name: 'John Smith' },
];
const REACTIONS = ['👍', '👏', '😂', '😮', '❤️', '🎉'];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MEETING_INFO = {
  username: 'You (Host)',
  meetingId: '123-456-789',
  host: 'You',
  passcode: '123456',
  invite: 'https://invite.zoom.us/j/123456789',
  security: 'End-to-end encrypted',
};

const MORE_MENU_ITEMS = [
  { icon: <MaterialIcons name="admin-panel-settings" size={24} color="#00eaff" />, label: 'Host Tools' },
  { icon: <MaterialCommunityIcons name="closed-caption" size={24} color="#00eaff" />, label: 'Captions & Translations' },
  { icon: <Ionicons name="settings-outline" size={24} color="#00eaff" />, label: 'Meeting Settings' },
  { icon: <Feather name="phone-off" size={24} color="#ff3b30" />, label: 'Disconnect Audio' },
];

// --- STUBS for SDK methods (replace with real SDK calls if available) ---
const toggleSpeaker = (speakerOn: boolean, setSpeakerOn: React.Dispatch<React.SetStateAction<boolean>>) => {
  setSpeakerOn((prev: boolean) => !prev);
  ToastAndroid.show(`Speaker ${!speakerOn ? 'On' : 'Off'}`, ToastAndroid.SHORT);
};
const flipCamera = (isFront: boolean, setIsFront: React.Dispatch<React.SetStateAction<boolean>>) => {
  setIsFront((prev: boolean) => !prev);
  ToastAndroid.show(`Camera: ${!isFront ? 'Front' : 'Back'}`, ToastAndroid.SHORT);
};
const leaveMeeting = (setInCall: React.Dispatch<React.SetStateAction<boolean>>) => {
  setInCall(false);
  ToastAndroid.show('Call Ended', ToastAndroid.SHORT);
};
const toggleVideo = (cameraOn: boolean, setCameraOn: React.Dispatch<React.SetStateAction<boolean>>) => setCameraOn((prev: boolean) => !prev);
const toggleAudio = (isMuted: boolean, setIsMuted: React.Dispatch<React.SetStateAction<boolean>>) => setIsMuted((prev: boolean) => !prev);
const startScreenShare = () => ToastAndroid.show('Screen sharing not supported in this demo.', ToastAndroid.SHORT);
const showCC = () => ToastAndroid.show('Captions toggled (demo)', ToastAndroid.SHORT);
const openWhiteboard = () => ToastAndroid.show('Whiteboard opened (demo)', ToastAndroid.SHORT);
const openApps = () => ToastAndroid.show('Apps integration coming soon!', ToastAndroid.SHORT);
const openDocuments = () => ToastAndroid.show('Document sharing coming soon!', ToastAndroid.SHORT);
const openNotes = () => ToastAndroid.show('Notes opened (demo)', ToastAndroid.SHORT);

export default function VideoCallScreen() {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Jane Doe', text: 'Hi everyone!' },
    { id: '2', sender: 'You', text: 'Hello 👋' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsAnim = useRef(new Animated.Value(1)).current;

  // Show/hide controls logic
  const showControls = () => {
    setControlsVisible(true);
    Animated.timing(controlsAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    // Auto-hide after 3 seconds
    setTimeout(() => {
      Animated.timing(controlsAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setControlsVisible(false));
    }, 3000);
  };
  
  // Show reaction briefly on screen
  React.useEffect(() => {
    if (lastReaction) {
      const timeout = setTimeout(() => setLastReaction(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [lastReaction]);
  
  // Animate transitions between screens
  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };
  
  React.useEffect(() => {
    animateIn();
  }, []);

  // --- LANDING SCREEN (Preview/Join/Start) ---
  if (!inCall) {
    return (
      <LinearGradient
        colors={['#232526', '#0f2027', '#000000']}
        style={styles.gradientBg}
      >
        <Animated.View style={[styles.landingContainer, { opacity: fadeAnim }]}>  
          <View style={styles.logoCircle}>
            <Ionicons name="videocam" size={44} color="#00eaff" />
          </View>
          <Text style={styles.title}>Video Call Ready</Text>
          <Text style={styles.subtitle}>Start or join a call</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setInCall(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start Call</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // --- IN-CALL UI (Zoom-like) ---
  return (
    <View style={[styles.callContainer, { backgroundColor: isDark ? '#111' : '#fff' }]}>  
      {/* Tap area to show/hide controls */}
      <TouchableOpacity
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
        activeOpacity={1}
        onPress={showControls}
      />
      {/* Header Controls */}
      {controlsVisible && (
        <Animated.View style={[styles.headerRow, { opacity: controlsAnim, zIndex: 10 }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setInCall(false)}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => toggleSpeaker(speakerOn, setSpeakerOn)}>
            <Ionicons name={speakerOn ? "volume-high" : "volume-mute"} size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => flipCamera(isFrontCamera, setIsFrontCamera)}>
            <MaterialCommunityIcons name="camera-flip" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomLabelWrap} onPress={() => setShowMeetingInfo(true)}>
            <Text style={styles.zoomLabel}>Zoom</Text>
            <Ionicons name="chevron-down" size={18} color="#fff" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.endBtnHeader} onPress={() => leaveMeeting(setInCall)}>
            <Text style={styles.endBtnHeaderText}>End</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* Video Area */}
      <View style={styles.videoArea}>
        {cameraOn ? (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-outline" size={80} color="#555" />
            <Text style={styles.videoPlaceholderText}>Video feed would be here</Text>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <FontAwesome name="user-circle" size={100} color="#444" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderName}>You</Text>
          </View>
        )}
        {/* Show reaction overlay */}
        {lastReaction && (
          <View style={styles.reactionOverlay}>
            <Text style={styles.reactionText}>{lastReaction}</Text>
          </View>
        )}
      </View>
      {/* Bottom Controls */}
      {controlsVisible && (
        <Animated.View style={[styles.controlsRowWrap, { opacity: controlsAnim, zIndex: 10 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.controlsRow}
          >
            <TouchableOpacity
              style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
              onPress={() => toggleAudio(isMuted, setIsMuted)}
            >
              <Feather name={isMuted ? 'mic-off' : 'mic'} size={22} color={isMuted ? '#ff3b30' : '#fff'} />
              <Text style={styles.iconLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, !cameraOn && styles.controlBtnActive]}
              onPress={() => toggleVideo(cameraOn, setCameraOn)}
            >
              <Feather name={cameraOn ? 'video' : 'video-off'} size={22} color={cameraOn ? '#fff' : '#ff3b30'} />
              <Text style={styles.iconLabel}>{cameraOn ? 'Stop Video' : 'Start Video'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowParticipants(true)}>
              <FontAwesome name="users" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Participants</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowChat(true)}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowReactions(true)}>
              <Entypo name="emoji-happy" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Reactions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={startScreenShare}>
              <Feather name="monitor" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Share Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={showCC}>
              <MaterialCommunityIcons name="closed-caption" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Show CC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={openWhiteboard}>
              <FontAwesome5 name="chalkboard-teacher" size={20} color="#fff" />
              <Text style={styles.iconLabel}>Whiteboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={openApps}>
              <MaterialIcons name="apps" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={openDocuments}>
              <MaterialIcons name="insert-drive-file" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={openNotes}>
              <MaterialIcons name="note" size={22} color="#fff" />
              <Text style={styles.iconLabel}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowMore(true)}>
              <Entypo name="dots-three-horizontal" size={22} color="#fff" />
              <Text style={styles.iconLabel}>More</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
      {/* More Menu Bottom Sheet */}
      <Modal visible={showMore} animationType="slide" transparent onRequestClose={() => setShowMore(false)}>
        <View style={styles.moreMenuOverlay}>
          <View style={styles.moreMenuSheet}>
            <Text style={styles.moreMenuTitle}>More</Text>
            {MORE_MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={styles.moreMenuItem}
                onPress={() => {
                  setShowMore(false);
                  ToastAndroid.show(`${item.label} (demo)`, ToastAndroid.SHORT);
                }}
              >
                {item.icon}
                <Text style={styles.moreMenuItemLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.moreMenuCancel} onPress={() => setShowMore(false)}>
              <Text style={styles.moreMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Reactions Modal */}
      <Modal visible={showReactions} animationType="fade" transparent onRequestClose={() => setShowReactions(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.reactionsSheet}>
            <Text style={styles.modalTitle}>Reactions</Text>
            <View style={styles.reactionsRow}>
              {REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionBtn}
                  onPress={() => {
                    setLastReaction(emoji);
                    setShowReactions(false);
                  }}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowReactions(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide" transparent onRequestClose={() => setShowChat(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Chat</Text>
            <FlatList
              data={chatMessages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.chatRow}>
                  <Text style={styles.chatSender}>{item.sender}:</Text>
                  <Text style={styles.chatText}>{item.text}</Text>
                </View>
              )}
              style={{ flex: 1, marginBottom: 12, width: '100%' }}
            />
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => {
                  if (chatInput.trim()) {
                    setChatMessages(msgs => [
                      ...msgs,
                      { id: Date.now().toString(), sender: 'You', text: chatInput.trim() },
                    ]);
                    setChatInput('');
                  }
                }}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  if (chatInput.trim()) {
                    setChatMessages(msgs => [
                      ...msgs,
                      { id: Date.now().toString(), sender: 'You', text: chatInput.trim() },
                    ]);
                    setChatInput('');
                  }
                }}
              >
                <Ionicons name="send" size={22} color="#00eaff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowChat(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {/* Participants Modal */}
      <Modal visible={showParticipants} animationType="slide" transparent onRequestClose={() => setShowParticipants(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Participants</Text>
            <FlatList
              data={MOCK_PARTICIPANTS}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.participantRow}>
                  <FontAwesome name="user" size={20} color="#00eaff" style={{ marginRight: 12 }} />
                  <Text style={styles.participantName}>{item.name}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowParticipants(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Meeting Info Dropdown */}
      <Modal visible={showMeetingInfo} animationType="fade" transparent onRequestClose={() => setShowMeetingInfo(false)}>
        <View style={styles.meetingInfoOverlay}>
          <View style={styles.meetingInfoSheet}>
            <Text style={styles.meetingInfoTitle}>Meeting Info</Text>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Username:</Text><Text style={styles.meetingInfoValue}>{MEETING_INFO.username}</Text></View>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Meeting ID:</Text><Text style={styles.meetingInfoValue}>{MEETING_INFO.meetingId}</Text></View>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Host:</Text><Text style={styles.meetingInfoValue}>{MEETING_INFO.host}</Text></View>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Passcode:</Text><Text style={styles.meetingInfoValue}>{MEETING_INFO.passcode}</Text></View>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Invite:</Text><Text style={[styles.meetingInfoValue, { color: '#00eaff' }]}>{MEETING_INFO.invite}</Text></View>
            <View style={styles.meetingInfoRow}><Text style={styles.meetingInfoLabel}>Security:</Text><Text style={styles.meetingInfoValue}>{MEETING_INFO.security}</Text></View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowMeetingInfo(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(20,20,20,0.85)',
    shadowColor: '#00eaff',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#00eaff',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 32,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#00eaff',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#00eaff',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
  },
  callContainer: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 18,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(10,10,10,0.98)',
    zIndex: 20,
  },
  headerBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(30,30,30,0.7)',
  },
  zoomLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232526',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  zoomLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 2,
    letterSpacing: 0.5,
  },
  endBtnHeader: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 8,
  },
  endBtnHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  meetingInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingInfoSheet: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#181a1b',
    borderRadius: 18,
    padding: 24,
    alignItems: 'flex-start',
    shadowColor: '#00eaff',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  meetingInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  meetingInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  meetingInfoLabel: {
    color: '#aaa',
    fontWeight: 'bold',
    width: 90,
    fontSize: 15,
  },
  meetingInfoValue: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    flexWrap: 'wrap',
  },
  videoArea: {
    flex: 1,
    backgroundColor: '#181a1b',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  videoPlaceholderText: {
    color: '#888',
    fontSize: 16,
    marginTop: 12,
  },
  placeholderName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 12,
  },
  reactionOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  reactionText: {
    fontSize: 64,
    textShadowColor: '#000',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 2 },
  },
  controlsRowWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,10,0.92)',
    paddingVertical: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  controlBtn: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 6,
  },
  iconLabel: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  moreMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  moreMenuSheet: {
    width: '100%',
    backgroundColor: '#181a1b',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    alignItems: 'flex-start',
  },
  moreMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    alignSelf: 'center',
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  moreMenuItemLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
  moreMenuCancel: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: '#232526',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  moreMenuCancelText: {
    color: '#00eaff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#181a1b',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  chatSender: {
    color: '#00eaff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    width: '100%',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#232526',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 8,
  },
  reactionsSheet: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#181a1b',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  reactionBtn: {
    marginHorizontal: 10,
    backgroundColor: '#232526',
    borderRadius: 24,
    padding: 12,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  closeBtn: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: '#232526',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: '#00eaff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});