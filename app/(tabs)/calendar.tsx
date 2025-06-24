// Required: expo install expo-notifications expo-device

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
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
  const isDarkTheme = theme === 'dark';

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [reminder, setReminder] = useState('');
  const [time, setTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    calendarBackground: isDarkTheme ? '#1c1c1c' : '#ffffff',
    textPrimary: isDarkTheme ? '#fff' : '#000',
    textSecondary: isDarkTheme ? '#aaa' : '#666',
    textDisabled: isDarkTheme ? '#444' : '#ccc',
    accent: '#34c759',
    accentBlue: '#007AFF',
    borderColor: isDarkTheme ? '#333' : '#e0e0e0',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f8f9fa',
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Enable notifications to get reminders.');
      }
    } else {
      Alert.alert('Physical device required for notifications.');
    }
  }

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const markedDates: Record<string, any> = {
    [todayString]: {
      today: true,
      customStyles: {
        container: { backgroundColor: themeColors.accentBlue },
        text: { color: '#fff', fontWeight: 'bold' },
      },
    },
  };

  schedules.forEach(sch => {
    markedDates[sch.date] = {
      ...markedDates[sch.date],
      marked: true,
      dotColor: themeColors.accent,
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: themeColors.accent,
      selectedTextColor: '#fff',
    };
  }

  const handleDayPress = (day: { dateString: string }) => {
    const picked = new Date(day.dateString);
    const now = new Date(todayString);
    if (picked < now) {
      Alert.alert('Invalid Date', 'Please select a future date.');
      setSelectedDate(null);
      setName('');
      setReminder('');
      setTime(null);
      return;
    }
    setSelectedDate(day.dateString);
    setName('');
    setReminder('');
    setTime(null);
  };

  const handleAddSchedule = async () => {
    if (!selectedDate || !name.trim() || !reminder.trim() || !time) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const scheduleDateTime = new Date(selectedDate);
    scheduleDateTime.setHours(time.hours, time.minutes, 0, 0);

    if (scheduleDateTime < new Date()) {
      Alert.alert('Invalid Time', 'Please select a future time.');
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${name}`,
        body: reminder,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { date: scheduleDateTime },
    });

    setSchedules(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: name.trim(),
        reminder: reminder.trim(),
        date: selectedDate,
        time: `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
        notificationId,
      },
    ]);

    setName('');
    setReminder('');
    setTime(null);
    Alert.alert('Scheduled!', 'Your reminder has been set.');
  };

  const handleDeleteSchedule = async (id: string, notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    setSchedules(prev => prev.filter(sch => sch.id !== id));
  };

  const schedulesForDate = selectedDate
    ? schedules.filter(sch => sch.date === selectedDate)
    : [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: themeColors.background }}
        contentContainerStyle={{ backgroundColor: themeColors.background, paddingBottom: 40 }}
      >
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>  
          <Calendar
            key={theme}
            style={{ backgroundColor: themeColors.calendarBackground }}
            markingType={'custom'}
            markedDates={markedDates}
            onDayPress={handleDayPress}
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
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            enableSwipeMonths={true}
          />

          {selectedDate && (
            <View style={styles.inputSection}>
              <Text style={[styles.selectedText, { color: themeColors.textPrimary }]}>Schedule for <Text style={{ color: themeColors.accent }}>{selectedDate}</Text></Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary, borderColor: themeColors.borderColor }]}
                placeholder="Event Name"
                placeholderTextColor={themeColors.textSecondary}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary, borderColor: themeColors.borderColor }]}
                placeholder="Reminder Message"
                placeholderTextColor={themeColors.textSecondary}
                value={reminder}
                onChangeText={setReminder}
              />
              <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.timeButtonText, { color: themeColors.textPrimary }]}> {time ? `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}` : 'Select Time'} </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTime({ hours: selectedTime.getHours(), minutes: selectedTime.getMinutes() });
                    }
                  }}
                />
              )}
              <TouchableOpacity style={[styles.addButton, { backgroundColor: themeColors.accent }]} onPress={handleAddSchedule}>
                <Text style={styles.addButtonText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          )}

          {schedulesForDate.length > 0 && (
            <View style={styles.schedulesSection}>
              <Text style={[styles.schedulesTitle, { color: themeColors.textPrimary }]}>Schedules for {selectedDate}</Text>
              {schedulesForDate.map(item => (
                <View key={item.id} style={[styles.scheduleItem, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
                  <Text style={[styles.scheduleName, { color: themeColors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.scheduleReminder, { color: themeColors.textSecondary }]}>{item.reminder}</Text>
                  <Text style={[styles.scheduleTime, { color: themeColors.accent }]}>{item.time}</Text>
                  <TouchableOpacity onPress={() => handleDeleteSchedule(item.id, item.notificationId)} style={styles.deleteButton}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  timeButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  schedulesSection: {
    marginBottom: 20,
  },
  schedulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scheduleItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleReminder: {
    fontSize: 14,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
