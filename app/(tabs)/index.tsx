import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
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
  View
} from 'react-native';
import { useThemeContext } from '../../components/ThemeContext';

const PERSONAL_MEETING_ID = '891 774 6184';

export default function HomeScreen() {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const [meetModalVisible, setMeetModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [usePMI, setUsePMI] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [joinAudio, setJoinAudio] = useState(false);
  const [turnOffVideo, setTurnOffVideo] = useState(false);
  const [userName, setUserName] = useState('');
  const [recentMeetingIds, setRecentMeetingIds] = useState(['123 456 7890', '987 654 3210', '555 666 7777']);
  const [showMeetingIdDropdown, setShowMeetingIdDropdown] = useState(false);
  const [usePersonalLink, setUsePersonalLink] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleTopic, setScheduleTopic] = useState('Zoom Meeting');
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [scheduleDuration, setScheduleDuration] = useState(30); // in minutes
  const [scheduleTimeZone, setScheduleTimeZone] = useState('GMT+0');
  const [scheduleRepeat, setScheduleRepeat] = useState('None');
  const [scheduleUsePMI, setScheduleUsePMI] = useState(false);
  const [schedulePasscode, setSchedulePasscode] = useState('123456');
  const [scheduleWaitingRoom, setScheduleWaitingRoom] = useState(true);
  const [scheduleHostVideo, setScheduleHostVideo] = useState(true);
  const [scheduleParticipantVideo, setScheduleParticipantVideo] = useState(false);
  const [scheduleCalendar, setScheduleCalendar] = useState('Zoom');
  const [scheduleAdvancedJoinBeforeHost, setScheduleAdvancedJoinBeforeHost] = useState(false);
  const [scheduleAdvancedMuteOnEntry, setScheduleAdvancedMuteOnEntry] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showTimeZoneDropdown, setShowTimeZoneDropdown] = useState(false);
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMeetingId, setShareMeetingId] = useState('');
  const [shareInputFocused, setShareInputFocused] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [editMeetingModalVisible, setEditMeetingModalVisible] = useState(false);
  const [editRequirePasscode, setEditRequirePasscode] = useState(true);
  const [editPasscode, setEditPasscode] = useState('YyXSh4');
  const [editWaitingRoom, setEditWaitingRoom] = useState(true);
  const [editOnlyAuthUsers, setEditOnlyAuthUsers] = useState(false);
  const [editHostVideo, setEditHostVideo] = useState(false);
  const [editParticipantVideo, setEditParticipantVideo] = useState(false);

  const durationOptions = [15, 30, 45, 60, 90, 120];
  const timeZoneOptions = ['GMT+0', 'GMT+1', 'GMT+2', 'GMT-1', 'GMT-5', 'GMT+8'];
  const repeatOptions = ['None', 'Daily', 'Weekly', 'Monthly'];
  const calendarOptions = ['Zoom', 'Google', 'Outlook', 'Other'];

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#232323' : '#ffffff',
    cardBackground: isDarkTheme ? '#292929' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    borderColor: isDarkTheme ? '#393939' : '#e0e0e0',
    inputBackground: isDarkTheme ? '#292929' : '#f8f9fa',
    inputText: isDarkTheme ? '#ffffff' : '#000000',
    placeholderText: isDarkTheme ? '#888888' : '#999999',
  };

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
          onPress={() => setScheduleModalVisible(true)}
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
          <View style={[styles.zoomModalHeaderBar, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
            <Pressable
              onPress={() => setMeetModalVisible(false)}
              style={styles.zoomModalCancelPressable}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.zoomModalCancel}>Cancel</Text>
            </Pressable>
            <Text style={[styles.zoomModalHeaderTitle, { color: themeColors.textPrimary }]}>Start a meeting</Text>
            <View style={{ width: 60 }} /> {/* Spacer for symmetry */}
          </View>

          {/* Options */}
          <View style={[styles.zoomModalOptionsContainer, { backgroundColor: themeColors.background }]}>
            <View style={styles.zoomModalOptionRow}>
              <Text style={[styles.zoomModalOptionLabel, { color: themeColors.textPrimary }]}>Video on</Text>
              <Switch
                value={videoOn}
                onValueChange={setVideoOn}
                thumbColor={videoOn ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            <View style={[styles.zoomModalDivider, { backgroundColor: themeColors.borderColor }]} />
            <View style={styles.zoomModalOptionRow}>
              <Text style={[styles.zoomModalOptionLabel, { color: themeColors.textPrimary }]}>Use personal meeting ID (PMI)</Text>
              <Switch
                value={usePMI}
                onValueChange={setUsePMI}
                thumbColor={usePMI ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            {usePMI && (
              <Text style={[styles.zoomModalPMI, { color: themeColors.textSecondary }]}>{PERSONAL_MEETING_ID}</Text>
            )}
            <View style={[styles.zoomModalDivider, { backgroundColor: themeColors.borderColor }]} />
          </View>

          {/* Start Meeting Button */}
          <TouchableOpacity style={styles.zoomModalStartButton} onPress={() => setMeetModalVisible(false)}>
            <Text style={styles.zoomModalStartButtonText}>Start a meeting</Text>
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
          <View style={[styles.joinModalHeaderBar, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
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

          {/* Meeting ID Input */}
          <View style={styles.joinModalInputWrapper}>
            <TextInput
              style={[styles.joinModalInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
              placeholder={usePersonalLink ? 'Personal link name' : 'Meeting ID'}
              placeholderTextColor={themeColors.placeholderText}
              value={meetingId}
              onChangeText={setMeetingId}
              keyboardType="numeric"
              editable={!usePersonalLink || true}
              autoCapitalize={usePersonalLink ? 'none' : 'words'}
            />
            {!usePersonalLink && (
              <Pressable onPress={() => setShowMeetingIdDropdown(v => !v)} style={styles.joinModalInputIcon}>
                <Ionicons name="chevron-down" size={20} color={themeColors.placeholderText} />
              </Pressable>
            )}
            {showMeetingIdDropdown && !usePersonalLink && (
              <View style={styles.meetingIdDropdown}>
                {recentMeetingIds.length === 0 ? (
                  <Text style={styles.meetingIdDropdownEmpty}>No recent IDs</Text>
                ) : (
                  recentMeetingIds.map((id, idx) => (
                    <Pressable
                      key={id + idx}
                      style={styles.meetingIdDropdownItem}
                      onPress={() => {
                        setMeetingId(id);
                        setShowMeetingIdDropdown(false);
                      }}
                    >
                      <Text style={styles.meetingIdDropdownText}>{id}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Personal Link Name */}
          <Pressable onPress={() => {
            setUsePersonalLink((prev) => {
              setMeetingId('');
              setShowMeetingIdDropdown(false);
              return !prev;
            });
          }}>
            <Text style={[styles.joinModalLinkName, usePersonalLink && styles.joinModalLinkNameActive]}>Join with a personal link name</Text>
          </Pressable>

          {/* User Name Input */}
          <View style={styles.joinModalUserNameWrapper}>
            <TextInput
              style={[styles.joinModalUserNameInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
              placeholder="Enter Your Name Here"
              placeholderTextColor={themeColors.placeholderText}
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Disabled Join Button */}
          <TouchableOpacity style={[styles.joinModalJoinButton, !meetingId && { opacity: 0.5 }]} disabled={!meetingId}>
            <Text style={styles.joinModalJoinButtonText}>Join</Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.joinModalInfoText}>
            If you received an invitation link, tap on the link to join the meeting
          </Text>

          {/* Join Options */}
          <Text style={styles.joinModalInfoText}>Join options</Text>
          <View style={styles.joinModalOptionRow}>
            <Text style={styles.joinModalOptionLabel}>Don't connect to audio</Text>
            <Switch
              value={joinAudio}
              onValueChange={setJoinAudio}
              thumbColor={joinAudio ? '#3a8fff' : '#888'}
              trackColor={{ true: '#b3d8ff', false: '#ccc' }}
            />
          </View>
          <View style={styles.joinModalOptionRow}>
            <Text style={styles.joinModalOptionLabel}>Turn off my video</Text>
            <Switch
              value={turnOffVideo}
              onValueChange={setTurnOffVideo}
              thumbColor={turnOffVideo ? '#3a8fff' : '#888'}
              trackColor={{ true: '#b3d8ff', false: '#ccc' }}
            />
          </View>
        </View>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        visible={scheduleModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.scheduleModalContainer}>
          {/* Header */}
          <View style={styles.scheduleModalHeaderBar}>
            <Pressable
              onPress={() => setScheduleModalVisible(false)}
              style={styles.scheduleModalBackPressable}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={26} color="#3a8fff" />
            </Pressable>
            <Text style={styles.scheduleModalHeaderTitle}>Schedule Meeting</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form Fields */}
          <ScrollView style={styles.scheduleModalForm} keyboardShouldPersistTaps="handled">
            {/* Topic */}
            <Text style={styles.scheduleModalLabel}>Topic</Text>
            <TextInput
              style={[styles.scheduleModalInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
              value={scheduleTopic}
              onChangeText={setScheduleTopic}
              placeholder="Meeting Topic"
              placeholderTextColor={themeColors.placeholderText}
            />

            {/* Date */}
            <Text style={styles.scheduleModalLabel}>Date</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar" size={20} color="#3a8fff" />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={scheduleDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setScheduleDate(selectedDate);
                }}
              />
            )}

            {/* Start Time */}
            <Text style={styles.scheduleModalLabel}>Start Time</Text>
            <Pressable onPress={() => setShowTimePicker(true)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time" size={20} color="#3a8fff" />
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={scheduleDate}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const newDate = new Date(scheduleDate);
                    newDate.setHours(selectedTime.getHours());
                    newDate.setMinutes(selectedTime.getMinutes());
                    setScheduleDate(newDate);
                  }
                }}
              />
            )}

            {/* Duration */}
            <Text style={styles.scheduleModalLabel}>Duration</Text>
            <Pressable onPress={() => setShowDurationDropdown(v => !v)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleDuration} min</Text>
              <Ionicons name="chevron-down" size={20} color="#3a8fff" />
            </Pressable>
            {showDurationDropdown && (
              <View style={styles.scheduleModalDropdownMenu}>
                {durationOptions.map((d) => (
                  <Pressable key={d} style={styles.scheduleModalDropdownItem} onPress={() => { setScheduleDuration(d); setShowDurationDropdown(false); }}>
                    <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{d} min</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Custom Duration Input */}
            <TextInput
              style={[styles.scheduleModalInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
              value={String(scheduleDuration)}
              onChangeText={v => setScheduleDuration(Number(v.replace(/[^0-9]/g, '')))}
              keyboardType="numeric"
              placeholder="Custom duration (min)"
              placeholderTextColor={themeColors.placeholderText}
            />

            {/* Time Zone */}
            <Text style={styles.scheduleModalLabel}>Time Zone</Text>
            <Pressable onPress={() => setShowTimeZoneDropdown(v => !v)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleTimeZone}</Text>
              <Ionicons name="chevron-down" size={20} color="#3a8fff" />
            </Pressable>
            {showTimeZoneDropdown && (
              <View style={styles.scheduleModalDropdownMenu}>
                {timeZoneOptions.map((tz) => (
                  <Pressable key={tz} style={styles.scheduleModalDropdownItem} onPress={() => { setScheduleTimeZone(tz); setShowTimeZoneDropdown(false); }}>
                    <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{tz}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Repeat */}
            <Text style={styles.scheduleModalLabel}>Repeat</Text>
            <Pressable onPress={() => setShowRepeatDropdown(v => !v)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleRepeat}</Text>
              <Ionicons name="chevron-down" size={20} color="#3a8fff" />
            </Pressable>
            {showRepeatDropdown && (
              <View style={styles.scheduleModalDropdownMenu}>
                {repeatOptions.map((r) => (
                  <Pressable key={r} style={styles.scheduleModalDropdownItem} onPress={() => { setScheduleRepeat(r); setShowRepeatDropdown(false); }}>
                    <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Use PMI */}
            <View style={styles.scheduleModalSwitchRow}>
              <Text style={styles.scheduleModalLabel}>Use Personal Meeting ID (PMI)</Text>
              <Switch
                value={scheduleUsePMI}
                onValueChange={setScheduleUsePMI}
                thumbColor={scheduleUsePMI ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>

            {/* Passcode */}
            <Text style={styles.scheduleModalLabel}>Passcode</Text>
            <TextInput
              style={[styles.scheduleModalInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
              value={schedulePasscode}
              onChangeText={setSchedulePasscode}
              placeholder="Passcode"
              placeholderTextColor={themeColors.placeholderText}
            />

            {/* Waiting Room */}
            <View style={styles.scheduleModalSwitchRow}>
              <Text style={styles.scheduleModalLabel}>Waiting Room</Text>
              <Switch
                value={scheduleWaitingRoom}
                onValueChange={setScheduleWaitingRoom}
                thumbColor={scheduleWaitingRoom ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>

            {/* Video */}
            <Text style={styles.scheduleModalLabel}>Video</Text>
            <View style={styles.scheduleModalVideoRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>Host</Text>
              <Switch
                value={scheduleHostVideo}
                onValueChange={setScheduleHostVideo}
                thumbColor={scheduleHostVideo ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
              <Text style={[styles.scheduleModalPickerText, { marginLeft: 24, color: themeColors.textPrimary }]}>Participant</Text>
              <Switch
                value={scheduleParticipantVideo}
                onValueChange={setScheduleParticipantVideo}
                thumbColor={scheduleParticipantVideo ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>

            {/* Calendar */}
            <Text style={styles.scheduleModalLabel}>Calendar</Text>
            <Pressable onPress={() => setShowCalendarDropdown(v => !v)} style={styles.scheduleModalPickerRow}>
              <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{scheduleCalendar}</Text>
              <Ionicons name="chevron-down" size={20} color="#3a8fff" />
            </Pressable>
            {showCalendarDropdown && (
              <View style={styles.scheduleModalDropdownMenu}>
                {calendarOptions.map((c) => (
                  <Pressable key={c} style={styles.scheduleModalDropdownItem} onPress={() => { setScheduleCalendar(c); setShowCalendarDropdown(false); }}>
                    <Text style={[styles.scheduleModalPickerText, { color: themeColors.textPrimary }]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Advanced Options */}
            <Text style={styles.scheduleModalLabel}>Advanced Options</Text>
            <View style={styles.scheduleModalSwitchRow}>
              <Text style={styles.scheduleModalPickerText}>Allow join before host</Text>
              <Switch
                value={scheduleAdvancedJoinBeforeHost}
                onValueChange={setScheduleAdvancedJoinBeforeHost}
                thumbColor={scheduleAdvancedJoinBeforeHost ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            <View style={styles.scheduleModalSwitchRow}>
              <Text style={styles.scheduleModalPickerText}>Mute participants on entry</Text>
              <Switch
                value={scheduleAdvancedMuteOnEntry}
                onValueChange={setScheduleAdvancedMuteOnEntry}
                thumbColor={scheduleAdvancedMuteOnEntry ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
          </ScrollView>
          {/* Schedule Button */}
          <TouchableOpacity style={styles.scheduleModalButton} onPress={() => setScheduleModalVisible(false)}>
            <Text style={styles.scheduleModalButtonText}>Schedule</Text>
          </TouchableOpacity>
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
            style={styles.shareModalOverlay}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
          >
            <View style={styles.shareModalCardSmall}>
              <Text style={styles.shareModalHeaderInCard}>Share screen</Text>
              <Text style={styles.shareModalMessage} accessibilityRole="text">
                Enter sharing key or meeting ID to share to a Zoom Room.
              </Text>
              <TextInput
                style={[styles.shareModalInput, { backgroundColor: themeColors.inputBackground, color: themeColors.inputText }]}
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
                  style={styles.shareModalCancelButton}
                  onPress={() => {
                    setShareModalVisible(false);
                    setShareMeetingId('');
                  }}
                  accessibilityLabel="Cancel"
                  accessible
                >
                  <Text style={styles.shareModalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareModalOkButton, !shareMeetingId && { opacity: 0.5 }]}
                  disabled={!shareMeetingId}
                  accessibilityLabel="OK"
                  accessible
                  onPress={() => {
                    setShareModalVisible(false);
                    setShareMeetingId('');
                    alert('Screen sharing started (simulated)!');
                  }}
                >
                  <Text style={styles.shareModalOkButtonText}>OK</Text>
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
              <View style={styles.infoModalSheet}>
                <Text style={styles.infoModalLabel}>Personal meeting ID</Text>
                <Text style={styles.infoModalId}>{PERSONAL_MEETING_ID}</Text>
                <View style={{flex: 1, width: '100%', justifyContent: 'flex-start'}}>
                  <View style={styles.infoModalActions}>
                    <Pressable style={styles.infoModalActionRow}>
                      <Text style={styles.infoModalActionText}>Start meeting</Text>
                      <MaterialIcons name="calendar-today" size={22} color="#fff" />
                    </Pressable>
                    <Pressable style={styles.infoModalActionRow}>
                      <Text style={styles.infoModalActionText}>Send invitation</Text>
                      <MaterialIcons name="share" size={22} color="#fff" />
                    </Pressable>
                    <Pressable style={styles.infoModalActionRow}
                      onPress={() => {
                        setInfoModalVisible(false);
                        setTimeout(() => setEditMeetingModalVisible(true), 300);
                      }}
                    >
                      <Text style={styles.infoModalActionText}>Edit meeting</Text>
                      <FontAwesome name="pencil" size={20} color="#fff" />
                    </Pressable>
                  </View>
                </View>
                <Pressable style={styles.infoModalCancel} onPress={() => setInfoModalVisible(false)}>
                  <Text style={styles.infoModalCancelText}>Cancel</Text>
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
              <Text style={styles.editModalPMI}>{PERSONAL_MEETING_ID}</Text>
            </View>
            {/* Security Section */}
            <Text style={styles.editModalSectionLabel}>Security</Text>
            <View style={styles.editModalRowBetween}>
              <View>
                <Text style={styles.editModalRowTitle}>Require meeting passcode</Text>
                <Text style={styles.editModalRowDesc}>Only users who have the invite link or passcode can join the meeting</Text>
              </View>
              <Switch
                value={editRequirePasscode}
                onValueChange={setEditRequirePasscode}
                thumbColor={editRequirePasscode ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
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
                thumbColor={editWaitingRoom ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Only allow authenticated users</Text>
              <Switch
                value={editOnlyAuthUsers}
                onValueChange={setEditOnlyAuthUsers}
                thumbColor={editOnlyAuthUsers ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            {/* Video Section */}
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Host video on</Text>
              <Switch
                value={editHostVideo}
                onValueChange={setEditHostVideo}
                thumbColor={editHostVideo ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
            <View style={styles.editModalRowBetween}>
              <Text style={styles.editModalRowTitle}>Participant video on</Text>
              <Switch
                value={editParticipantVideo}
                onValueChange={setEditParticipantVideo}
                thumbColor={editParticipantVideo ? '#3a8fff' : '#888'}
                trackColor={{ true: '#b3d8ff', false: '#ccc' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: React.ReactNode; label: string; color: string; onPress?: () => void }) {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  
  return (
    <View style={styles.actionButtonWrapper}>
      <Pressable
        style={({ pressed }) => [styles.actionButton, { backgroundColor: color }, pressed && { opacity: 0.85 }]}
        onPress={onPress}
      >
        {icon}
      </Pressable>
      <Text style={[styles.actionLabel, { color: isDarkTheme ? '#ffffff' : '#000000' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
    position: 'relative',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    marginTop: 0,
    width: '100%',
    paddingHorizontal: 0,
  },
  actionButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    width: 56,
    height: 56,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 0,
  },
  zoomModalContainer: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
  },
  zoomModalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  zoomModalCancel: {
    color: '#3a8fff',
    fontSize: 17,
    fontWeight: '600',
  },
  zoomModalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginLeft: 10,
  },
  zoomModalCancelPressable: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 10,
  },
  zoomModalOptionsContainer: {
    marginTop: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  zoomModalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 0,
  },
  zoomModalOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  zoomModalPMI: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 18,
    marginTop: -8,
    marginBottom: 8,
  },
  zoomModalDivider: {
    height: 1,
    width: '100%',
  },
  zoomModalStartButton: {
    backgroundColor: '#1877f2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: 36,
    marginHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomModalStartButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  joinModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 0,
  },
  joinModalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: -23,
    paddingBottom: 0,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  joinModalBackPressable: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  joinModalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginLeft: -30,
  },
  joinModalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginHorizontal: 18,
    backgroundColor: 'transparent',
  },
  joinModalInput: {
    flex: 1,
    fontSize: 16,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  joinModalInputIcon: {
    padding: 8,
  },
  meetingIdDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#292929',
    borderRadius: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 4,
    marginHorizontal: 0,
    maxHeight: 180,
  },
  meetingIdDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  meetingIdDropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  meetingIdDropdownEmpty: {
    color: '#888',
    fontSize: 15,
    padding: 12,
    textAlign: 'center',
  },
  scheduleModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  scheduleModalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: '#232323',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
    elevation: 2,
    zIndex: 10,
  },
  scheduleModalBackPressable: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scheduleModalHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginLeft: -30,
  },
  scheduleModalForm: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  scheduleModalLabel: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  scheduleModalInput: {
    backgroundColor: '#292929',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  scheduleModalPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#292929',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
    marginTop: 2,
  },
  scheduleModalPickerText: {
    color: '#fff',
    fontSize: 16,
  },
  scheduleModalSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
  },
  scheduleModalVideoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  scheduleModalButton: {
    backgroundColor: '#1877f2',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleModalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  scheduleModalDropdownMenu: {
    backgroundColor: '#292929',
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  scheduleModalDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalCardSmall: {
    width: '88%',
    height: Dimensions.get('window').height * 0.35,
    backgroundColor: '#292929',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: 'center',
  },
  shareModalHeaderInCard: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  shareModalMessage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareModalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
  },
  shareModalCancelButton: {
    flex: 1,
    backgroundColor: '#393939',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  shareModalOkButton: {
    flex: 1,
    backgroundColor: '#1877f2',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalOkButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  shareModalInput: {
    backgroundColor: '#232323',
    color: '#fff',
    fontSize: 17,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    width: '100%',
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  infoModalSheet: {
    width: '100%',
    height: Dimensions.get('window').height * 0.42,
    backgroundColor: '#232323',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  infoModalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  infoModalId: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 2,
  },
  infoModalActions: {
    width: '100%',
    backgroundColor: '#292929',
    borderRadius: 16,
    marginBottom: 18,
    paddingVertical: 2,
  },
  infoModalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
  },
  infoModalActionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  infoModalCancel: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  infoModalCancelText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: '#232323',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  editModalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: '#232323',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
    elevation: 2,
    zIndex: 10,
  },
  editModalCancel: {
    color: '#3a8fff',
    fontSize: 17,
    fontWeight: '600',
  },
  editModalHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginLeft: -30,
  },
  editModalSave: {
    color: '#3a8fff',
    fontSize: 17,
    fontWeight: '600',
  },
  editModalContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  editModalSectionLabel: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  editModalPMIBox: {
    backgroundColor: '#292929',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  editModalPMI: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  editModalRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 2,
  },
  editModalRowTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  editModalRowDesc: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
    maxWidth: 200,
  },
  editModalRowValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});