import { Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [sharingKey, setSharingKey] = useState('');
  const [showMeetScreen, setShowMeetScreen] = useState(false);
  const [showJoinScreen, setShowJoinScreen] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [usePMI, setUsePMI] = useState(false);
  const [meetingID, setMeetingID] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleModal = () => {
    if (visible) return;
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: visible || showSharePopup || showMeetScreen || showJoinScreen
        ? { display: 'none' }
        : {
            backgroundColor: '#1c1c1c',
            borderTopColor: '#444',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 10,
            paddingTop: 5,
          },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#999',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 0,
      },
    });
  }, [visible, showSharePopup, showMeetScreen, showJoinScreen]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.sideSpacer} />
        <Text style={styles.topTitle}>Meetings</Text>
        <TouchableOpacity style={styles.iconButton} onPress={toggleModal}>
          <Entypo name="info-with-circle" size={22} color="#f5f5f7" />
        </TouchableOpacity>
      </View>

      {/* Main Menu */}
      <View style={styles.menuRow}>
        <TouchableOpacity onPress={() => setShowMeetScreen(true)}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FF5C3B' }]}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Meet</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowJoinScreen(true)}>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Entypo name="plus" size={24} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Join</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <MaterialIcons name="calendar-today" size={22} color="#fff" />
          </View>
          <Text style={styles.menuLabel}>Schedule</Text>
        </View>

        <TouchableOpacity onPress={() => setShowSharePopup(true)}>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Feather name="upload" size={22} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Share</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      {visible && (
        <View style={[styles.overlay, styles.bottomOverlay]}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: modalTranslateY }] }]}>
            <Text style={styles.sheetTitle}>Personal Meeting ID</Text>
            <Text style={styles.sheetID}>902-777-4890</Text>

            <View style={styles.actionBox}>
              <TouchableOpacity style={styles.actionRow}>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.actionText}>Start Meeting</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow}>
                <Feather name="share" size={20} color="#fff" />
                <Text style={styles.actionText}>Send Invitation</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow}>
                <Feather name="edit-2" size={20} color="#fff" />
                <Text style={styles.actionText}>Edit Meeting</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Share Popup */}
      {showSharePopup && (
        <View style={[styles.overlay, styles.centerOverlay]}>
          <View style={styles.sharePopup}>
            <Text style={styles.shareTitle}>Share Screen</Text>
            <Text style={styles.shareInstruction}>
              Enter sharing key or meeting ID to share to a Zoom Room.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Sharing key or meeting ID"
              placeholderTextColor="#999"
              value={sharingKey}
              onChangeText={setSharingKey}
              keyboardType="numeric"
              maxLength={10}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setShowSharePopup(false)} style={styles.popupButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowSharePopup(false);
                  setSharingKey('');
                }}
                style={styles.popupButton}
                disabled={sharingKey.length < 10}
              >
                <Text style={[styles.cancelText, { opacity: sharingKey.length < 10 ? 0.4 : 1 }]}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Start a Meeting Screen */}
      {showMeetScreen && (
        <View style={styles.fullScreenModal}>
          <View style={styles.meetHeader}>
            <TouchableOpacity onPress={() => setShowMeetScreen(false)}>
              <Text style={styles.meetCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.meetTitle}>Start a meeting</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Video on</Text>
            <TouchableOpacity onPress={() => setVideoOn(!videoOn)}>
              <View style={[styles.toggle, videoOn ? styles.toggleOn : styles.toggleOff]} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Use personal meeting ID (PMI)</Text>
            <TouchableOpacity onPress={() => setUsePMI(!usePMI)}>
              <View style={[styles.toggle, usePMI ? styles.toggleOn : styles.toggleOff]} />
            </TouchableOpacity>
          </View>

          {usePMI && <Text style={styles.pmiText}>891 774 6184</Text>}

          <TouchableOpacity style={styles.startMeetingBtn}>
            <Text style={styles.startMeetingText}>Start a meeting</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Join Meeting Screen */}
      {showJoinScreen && (
        <View style={styles.fullScreenModal}>
          <View style={styles.meetHeader}>
            <TouchableOpacity onPress={() => setShowJoinScreen(false)}>
              <Text style={styles.meetCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.meetTitle}>Join a Meeting</Text>
            <View style={{ width: 50 }} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Meeting ID"
            placeholderTextColor="#999"
            value={meetingID}
            onChangeText={setMeetingID}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.startMeetingBtn}
            disabled={!meetingID}
            onPress={() => {
              setShowJoinScreen(false);
              setMeetingID('');
              // Join logic goes here
            }}
          >
            <Text style={styles.startMeetingText}>Join Meeting</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sideSpacer: {
    width: 30,
  },
  iconButton: {
    padding: 8,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  menuItem: {
    alignItems: 'center',
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  menuLabel: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomOverlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    height: '40%',
    width: '100%',
    backgroundColor: '#2c2c2c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  sheetID: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 15,
  },
  actionBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#ccc',
    fontSize: 16,
  },
  sharePopup: {
    backgroundColor: '#2c2c2c',
    width: '85%',
    borderRadius: 15,
    padding: 20,
  },
  shareTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  shareInstruction: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1c1c1c',
    padding: 20,
  },
  meetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  meetCancel: {
    color: '#0a84ff',
    fontSize: 16,
  },
  meetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
  },
  toggleOn: {
    backgroundColor: '#34c759',
  },
  toggleOff: {
    backgroundColor: '#333',
  },
  pmiText: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  startMeetingBtn: {
    backgroundColor: '#0a84ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  startMeetingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
