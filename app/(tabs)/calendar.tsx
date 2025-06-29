// Calendar functionality without push notifications for Expo Go compatibility

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useMeetings } from '../../components/MeetingContext';
import { useThemeContext } from '../../components/ThemeContext';

type Schedule = {
  id: string;
  name: string;
  reminder: string;
  date: string;
  time: string;
  notificationId: string;
};

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const { meetings, addMeeting } = useMeetings();
  const isDarkTheme = theme === 'dark';

  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [showMeetingDetailsModal, setShowMeetingDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  // Add meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState(new Date());
  const [newMeetingTime, setNewMeetingTime] = useState(new Date());
  const [newMeetingDuration, setNewMeetingDuration] = useState('30');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const themeColors = {
    background: isDarkTheme ? '#121212' : '#ffffff',
    cardBackground: isDarkTheme ? '#1e1e1e' : '#f8f9fa',
    calendarBackground: isDarkTheme ? '#1e1e1e' : '#ffffff',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    textDisabled: isDarkTheme ? '#666666' : '#cccccc',
    accent: '#007AFF',
    accentGreen: '#34C759',
    accentOrange: '#FF9500',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f8f9fa',
  };

  useEffect(() => {
    // Simple reminder system without push notifications
    checkUpcomingMeetings();
  }, [meetings]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const checkUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = meetings.filter(meeting => {
      const meetingTime = new Date(meeting.date);
      const timeDiff = meetingTime.getTime() - now.getTime();
      // Check for meetings in the next 30 minutes
      return timeDiff > 0 && timeDiff <= 30 * 60 * 1000;
    });

    if (upcomingMeetings.length > 0) {
      Alert.alert(
        'Upcoming Meetings',
        `You have ${upcomingMeetings.length} meeting(s) starting soon.`,
        [{ text: 'OK' }]
      );
    }
  };

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Create marked dates for calendar
  const markedDates: Record<string, any> = {
    [todayString]: {
      today: true,
      customStyles: {
        container: { backgroundColor: themeColors.accent },
        text: { color: '#fff', fontWeight: 'bold' },
      },
    },
  };

  // Add meeting markers
  meetings.forEach(meeting => {
    const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
    const isUpcoming = new Date(meeting.date) > new Date();
    
    markedDates[meetingDate] = {
      ...markedDates[meetingDate],
      marked: true,
      dotColor: isUpcoming ? themeColors.accentGreen : themeColors.accentOrange,
      customStyles: {
        container: {
          backgroundColor: isUpcoming ? themeColors.accentGreen + '20' : themeColors.accentOrange + '20',
        },
      },
    };
  });

  // Add selected date styling
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: themeColors.accent,
      selectedTextColor: '#fff',
    };
  }

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const getMeetingsForDate = (dateString: string) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate === dateString;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddMeeting = () => {
    if (!newMeetingTitle.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }

    // Combine date and time
    const combinedDateTime = new Date(newMeetingDate);
    combinedDateTime.setHours(newMeetingTime.getHours(), newMeetingTime.getMinutes(), 0, 0);

    // Add meeting using context
    addMeeting({
      title: newMeetingTitle,
      description: newMeetingDescription,
      date: combinedDateTime,
      duration: parseInt(newMeetingDuration),
      participants: 0,
    });

    // Reset form
    setNewMeetingTitle('');
    setNewMeetingDate(new Date());
    setNewMeetingTime(new Date());
    setNewMeetingDuration('30');
    setNewMeetingDescription('');
    setShowAddMeetingModal(false);
    
    Alert.alert('Success', 'Meeting added to calendar');
  };

  const selectedDateMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];

  const renderMeetingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.meetingCard, { backgroundColor: themeColors.cardBackground }]}
      onPress={() => {
        setSelectedMeeting(item);
        setShowMeetingDetailsModal(true);
      }}
    >
      <View style={styles.meetingCardHeader}>
        <Text style={[styles.meetingTitle, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
        <View style={[styles.meetingStatus, { backgroundColor: new Date(item.date) > new Date() ? themeColors.accentGreen : themeColors.accentOrange }]}>
          <Text style={styles.meetingStatusText}>
            {new Date(item.date) > new Date() ? 'Upcoming' : 'Past'}
          </Text>
        </View>
      </View>
      <View style={styles.meetingDetails}>
        <View style={styles.meetingDetailRow}>
          <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.meetingDetailText, { color: themeColors.textSecondary }]}>
            {formatTime(new Date(item.date))} • {item.duration} min
          </Text>
        </View>
        {item.description && (
          <View style={styles.meetingDetailRow}>
            <Ionicons name="document-text-outline" size={16} color={themeColors.textSecondary} />
            <Text style={[styles.meetingDetailText, { color: themeColors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.accent}
            colors={[themeColors.accent]}
          />
        }
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.background }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Calendar</Text>
            <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
              Manage your meetings and schedule
            </Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <View style={[styles.calendarContainer, { backgroundColor: themeColors.calendarBackground }]}>
            <Calendar
              key={theme}
              style={styles.calendar}
              markingType={'custom'}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              enableSwipeMonths={true}
              hideExtraDays={true}
              disableMonthChange={false}
              firstDay={1}
              hideDayNames={false}
              showWeekNumbers={false}
              disableArrowLeft={false}
              disableArrowRight={false}
              disableAllTouchEventsForDisabledDays={true}
              theme={{
                calendarBackground: themeColors.calendarBackground,
                backgroundColor: themeColors.calendarBackground,
                textSectionTitleColor: themeColors.textPrimary,
                selectedDayBackgroundColor: themeColors.accent,
                selectedDayTextColor: '#fff',
                todayTextColor: themeColors.textPrimary,
                dayTextColor: themeColors.textPrimary,
                textDisabledColor: themeColors.textDisabled,
                dotColor: themeColors.accent,
                arrowColor: themeColors.textPrimary,
                monthTextColor: themeColors.textPrimary,
                textDayHeaderFontWeight: 'bold',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>
        </View>

        {/* Selected Date Meetings */}
        {selectedDate && (
          <View style={styles.meetingsSection}>
            <View style={styles.meetingsHeader}>
              <Text style={[styles.meetingsTitle, { color: themeColors.textPrimary }]}>
                {formatDate(new Date(selectedDate))}
              </Text>
              <View style={styles.meetingsHeaderControls}>
                <TouchableOpacity
                  style={[styles.scrollToTopButton, { backgroundColor: themeColors.accent }]}
                  onPress={scrollToTop}
                >
                  <Ionicons name="arrow-up" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: themeColors.accent }]}
                  onPress={() => setShowAddMeetingModal(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedDateMeetings.length > 0 ? (
              <FlatList
                data={selectedDateMeetings}
                renderItem={renderMeetingItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.meetingsList}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
                  No meetings scheduled for this date
                </Text>
                <TouchableOpacity
                  style={[styles.addMeetingButton, { backgroundColor: themeColors.accent }]}
                  onPress={() => setShowAddMeetingModal(true)}
                >
                  <Text style={styles.addMeetingButtonText}>Add Meeting</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: themeColors.cardBackground }]}
            onPress={() => setShowAddMeetingModal(true)}
          >
            <Ionicons name="add-circle" size={24} color={themeColors.accent} />
            <Text style={[styles.quickActionText, { color: themeColors.textPrimary }]}>Quick Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: themeColors.cardBackground }]}
            onPress={() => setSelectedDate(todayString)}
          >
            <Ionicons name="today" size={24} color={themeColors.accent} />
            <Text style={[styles.quickActionText, { color: themeColors.textPrimary }]}>Today</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Meeting Modal */}
      <Modal
        visible={showAddMeetingModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddMeetingModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.borderColor }]}>
            <TouchableOpacity onPress={() => setShowAddMeetingModal(false)}>
              <Text style={[styles.modalCancel, { color: themeColors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Add Meeting</Text>
            <TouchableOpacity onPress={handleAddMeeting}>
              <Text style={[styles.modalSave, { color: themeColors.accent }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Meeting Title</Text>
              <TextInput
              style={[styles.textInput, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary }]}
              placeholder="Enter meeting title"
                placeholderTextColor={themeColors.textSecondary}
              value={newMeetingTitle}
              onChangeText={setNewMeetingTitle}
            />

            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Date</Text>
            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: themeColors.inputBackground }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateTimeButtonText, { color: themeColors.textPrimary }]}>
                {newMeetingDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Time</Text>
              <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: themeColors.inputBackground }]}
                onPress={() => setShowTimePicker(true)}
              >
              <Text style={[styles.dateTimeButtonText, { color: themeColors.textPrimary }]}>
                {formatTime(newMeetingTime)}
              </Text>
              </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary }]}
              placeholder="30"
              placeholderTextColor={themeColors.textSecondary}
              keyboardType="numeric"
              value={newMeetingDuration}
              onChangeText={setNewMeetingDuration}
            />

            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>Description (optional)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary, height: 80 }]}
              placeholder="Enter meeting description"
              placeholderTextColor={themeColors.textSecondary}
              multiline
              value={newMeetingDescription}
              onChangeText={setNewMeetingDescription}
            />
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker
              value={newMeetingDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setNewMeetingDate(date);
              }}
            />
          )}

              {showTimePicker && (
                <DateTimePicker
              value={newMeetingTime}
                  mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, time) => {
                    setShowTimePicker(false);
                if (time) setNewMeetingTime(time);
                  }}
                />
              )}
        </View>
      </Modal>

      {/* Meeting Details Modal */}
      <Modal
        visible={showMeetingDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMeetingDetailsModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.borderColor }]}>
            <TouchableOpacity onPress={() => setShowMeetingDetailsModal(false)}>
              <Text style={[styles.modalCancel, { color: themeColors.accent }]}>Back</Text>
              </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Meeting Details</Text>
            <View style={{ width: 60 }} />
            </View>

          {selectedMeeting && (
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.detailTitle, { color: themeColors.textPrimary }]}>{selectedMeeting.title}</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                  {formatTime(new Date(selectedMeeting.date))} • {selectedMeeting.duration} minutes
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                  {formatDate(new Date(selectedMeeting.date))}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                  {selectedMeeting.participants || 0} participants
                </Text>
              </View>

              {selectedMeeting.description && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={20} color={themeColors.textSecondary} />
                  <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                    {selectedMeeting.description}
                  </Text>
                </View>
              )}

              {new Date(selectedMeeting.date) > new Date() && (
                <TouchableOpacity style={[styles.joinButton, { backgroundColor: themeColors.accent }]}>
                  <Text style={styles.joinButtonText}>Join Meeting</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
  },
  calendarWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
  },
  meetingsSection: {
    paddingHorizontal: 20,
  },
  meetingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  meetingsHeaderControls: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollToTopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingsList: {
    paddingBottom: 20,
  },
  meetingCard: {
    borderRadius: 12,
    padding: 16,
  },
  meetingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  meetingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meetingStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  meetingDetails: {
    gap: 4,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingDetailText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  addMeetingButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addMeetingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateTimeButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    flex: 1,
  },
  joinButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
