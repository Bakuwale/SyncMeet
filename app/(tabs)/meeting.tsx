import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useMeetings } from '../../components/MeetingContext';
import { useThemeContext } from '../../components/ThemeContext';

const FILTERS = ['All', 'Upcoming', 'Past'];
const { width: screenWidth } = Dimensions.get('window');

// Mock participants for video call
const mockParticipants = [
  { id: '1', name: 'You', isHost: true, isMuted: false, isVideoOn: true, isSpeaking: false },
  { id: '2', name: 'John Doe', isHost: false, isMuted: true, isVideoOn: true, isSpeaking: true },
  { id: '3', name: 'Jane Smith', isHost: false, isMuted: false, isVideoOn: false, isSpeaking: false },
  { id: '4', name: 'Mike Johnson', isHost: false, isMuted: false, isVideoOn: true, isSpeaking: false },
  { id: '5', name: 'Sarah Wilson', isHost: false, isMuted: true, isVideoOn: true, isSpeaking: false },
  { id: '6', name: 'David Brown', isHost: false, isMuted: false, isVideoOn: false, isSpeaking: false },
];

// Mock chat messages
const mockChatMessages = [
  { id: '1', sender: 'John Doe', message: 'Can everyone hear me?', timestamp: '2:30 PM' },
  { id: '2', sender: 'You', message: 'Yes, I can hear you clearly', timestamp: '2:31 PM' },
  { id: '3', sender: 'Jane Smith', message: 'I\'m having some audio issues', timestamp: '2:32 PM' },
  { id: '4', sender: 'Mike Johnson', message: 'Try checking your microphone settings', timestamp: '2:33 PM' },
];

function isUpcoming(meeting: any) {
  return new Date(meeting.date) > new Date();
}

export default function MeetingsTab() {
  const { meetings } = useMeetings();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    cardBackground: isDarkTheme ? '#232323' : '#f8f9fa',
    searchBackground: isDarkTheme ? '#222' : '#f0f0f0',
    filterBackground: isDarkTheme ? '#222' : '#f0f0f0',
    filterActive: '#0a84ff',
    textPrimary: isDarkTheme ? '#fff' : '#000',
    textSecondary: isDarkTheme ? '#aaa' : '#666',
    textTertiary: isDarkTheme ? '#ccc' : '#888',
    borderColor: isDarkTheme ? '#333' : '#e0e0e0',
    videoCallBackground: isDarkTheme ? '#000' : '#1a1a1a',
    controlBackground: isDarkTheme ? '#333' : '#f0f0f0',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f8f9fa',
    accent: '#007AFF',
  };

  // Helper: returns true if meeting should be visible (upcoming or ended within 24 hours)
  function isVisibleMeeting(meeting: any) {
    const now = new Date();
    const start = new Date(meeting.date);
    const end = new Date(start.getTime() + (meeting.duration || 0) * 60000);
    // Show if meeting ends in the future, or ended within the last 24 hours
    return end.getTime() + 24 * 60 * 60 * 1000 > now.getTime();
  }

  const filteredMeetings = meetings
    .filter(isVisibleMeeting)
    .filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(m => {
      if (filter === 'Upcoming') return isUpcoming(m);
      if (filter === 'Past') return !isUpcoming(m);
      return true;
    });

  const handleJoinMeeting = () => {
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    setShowChat(false);
    setIsMuted(false);
    setIsVideoOn(true);
    setIsScreenSharing(false);
    setIsRecording(false);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message
      setChatMessage('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.meetingTabContentWrapper}>
        {/* Search Bar with marginTop */}
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
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { backgroundColor: filter === f ? themeColors.filterActive : themeColors.filterBackground },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText,
                { color: filter === f ? '#fff' : themeColors.textSecondary }
              ]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meetings List */}
        <FlatList
          data={filteredMeetings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MeetingCard meeting={item} themeColors={themeColors} onJoin={handleJoinMeeting} />}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
              <Ionicons name="calendar-outline" size={48} color={themeColors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary, fontSize: 18, textAlign: 'center' }]}>No meetings scheduled.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        />
      </View>

      {/* Video Call Modal */}
      <Modal
        visible={showVideoCall}
        animationType="slide"
        transparent={false}
        onRequestClose={handleEndCall}
      >
        <View style={[styles.videoCallContainer, { backgroundColor: themeColors.videoCallBackground }]}>
          {/* Header */}
          <View style={styles.videoCallHeader}>
            <View style={styles.meetingInfo}>
              <Text style={[styles.meetingTitle, { color: '#fff' }]}>Team Standup</Text>
              <Text style={[styles.meetingDuration, { color: '#ccc' }]}>00:15:32</Text>
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
            {mockParticipants.map((participant, index) => (
              <View key={participant.id} style={styles.participantTile}>
                {participant.isVideoOn ? (
                  <View style={[styles.videoContainer, { backgroundColor: '#2a2a2a' }]}>
                    <Text style={[styles.participantName, { color: '#fff' }]}>{participant.name}</Text>
                    {participant.isSpeaking && <View style={styles.speakingIndicator} />}
                  </View>
                ) : (
                  <View style={[styles.avatarContainer, { backgroundColor: '#2a2a2a' }]}>
                    <Text style={[styles.avatarText, { color: '#fff' }]}>
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                )}
                
                {/* Status indicators */}
                <View style={styles.participantStatus}>
                  {participant.isMuted && (
                    <View style={styles.statusIcon}>
                      <Ionicons name="mic-off" size={12} color="#fff" />
                    </View>
                  )}
                  {participant.isHost && (
                    <View style={[styles.statusIcon, { backgroundColor: '#007AFF' }]}>
                      <Text style={styles.hostText}>H</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
                {mockChatMessages.map(message => (
                  <View key={message.id} style={styles.chatMessage}>
                    <Text style={[styles.chatSender, { color: themeColors.textPrimary }]}>
                      {message.sender}
                    </Text>
                    <Text style={[styles.chatText, { color: themeColors.textSecondary }]}>
                      {message.message}
                    </Text>
                    <Text style={[styles.chatTime, { color: themeColors.textTertiary }]}>
                      {message.timestamp}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.chatInput}>
                <TextInput
                  style={[styles.chatInputField, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary }]}
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
              style={[styles.controlButton, isMuted && { backgroundColor: '#ff3b30' }]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isVideoOn && { backgroundColor: '#ff3b30' }]}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isScreenSharing && { backgroundColor: '#007AFF' }]}
              onPress={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Ionicons name="desktop-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, showChat && { backgroundColor: '#007AFF' }]}
              onPress={() => setShowChat(!showChat)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isRecording && { backgroundColor: '#ff3b30' }]}
              onPress={() => setIsRecording(!isRecording)}
            >
              <Ionicons name={isRecording ? "stop-circle" : "radio-button-on"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: '#ff3b30' }]}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MeetingCard({ meeting, themeColors, onJoin }: { meeting: any; themeColors: any; onJoin: () => void }) {
  const now = new Date();
  const start = new Date(meeting.date);
  const end = new Date(start.getTime() + meeting.duration * 60000);
  const isUpcoming = start > now;
  const status = isUpcoming ? 'Upcoming' : 'Ended';

  return (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{meeting.title}</Text>
        <View style={[styles.badge, isUpcoming ? styles.badgeUpcoming : styles.badgeEnded]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {start.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {meeting.duration} min
        </Text>
      </View>

      {!isUpcoming && (
        <View style={styles.row}>
          <Ionicons name="people" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            {meeting.participants ?? 0} participant{(meeting.participants ?? 0) !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Ionicons name="key" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {meeting.id}
        </Text>
        {isUpcoming && (
          <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>

      {meeting.description ? (
        <Text style={[styles.desc, { color: themeColors.textTertiary }]}>
          {meeting.description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  meetingTabContentWrapper: {},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    marginTop: 24,
  },
  searchInput: { flex: 1, padding: 8 },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  filterText: { fontWeight: 'bold' },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontWeight: 'bold', fontSize: 17, flex: 1 },
  badge: {
    marginLeft: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeUpcoming: { backgroundColor: '#0a84ff' },
  badgeEnded: { backgroundColor: '#999' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: { marginLeft: 8, fontSize: 14 },
  joinBtn: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  joinText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  desc: { marginTop: 8, fontSize: 14, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },

  // Video Call Styles
  videoCallContainer: {
    flex: 1,
  },
  videoCallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  meetingDuration: {
    fontSize: 14,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
  },
  participantTile: {
    width: (screenWidth - 40) / 2,
    height: 120,
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'flex-end',
    padding: 8,
  },
  avatarContainer: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantStatus: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  speakingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatPanel: {
    position: 'absolute',
    right: 0,
    top: 100,
    bottom: 120,
    width: 300,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
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
});
