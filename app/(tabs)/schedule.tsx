import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useMeetings } from '../../components/MeetingContext';
import { useThemeContext } from '../../components/ThemeContext';
import { getScheduledNotifications, loadNotificationSettings, scheduleMeetingReminder } from '../../utils/notifications';

export default function ScheduleMeetingScreen() {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const { addMeeting } = useMeetings();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('30');
  const [description, setDescription] = useState('');
  const [nextReminder, setNextReminder] = useState<Date | null>(null);

  useEffect(() => {
    const fetchNextReminder = async () => {
      const scheduled = await getScheduledNotifications();
      const now = new Date();
      const future = scheduled
        .map(n => {
          if (n.trigger && typeof n.trigger === 'object' && 'date' in n.trigger) {
            return new Date(n.trigger.date);
          }
          if (n.trigger && typeof n.trigger === 'number') {
            return new Date(Date.now() + n.trigger * 1000);
          }
          return null;
        })
        .filter((d): d is Date => !!d && d > now)
        .sort((a, b) => a.getTime() - b.getTime());
      setNextReminder(future.length > 0 ? future[0] : null);
    };
    fetchNextReminder();
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updatedDate = new Date(date);
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setDate(updatedDate);
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDate(updatedDate);
    }
  };







  
  const handleSubmit = async () => {
    if (!title || !duration) {
      Alert.alert('Error', 'Please fill in the meeting title and duration.');
      return;
    }

    try {
      // Try multiple API endpoints in case one is not working
      const endpoints = [
        'https://syncmeet-back.onrender.com/api/meetings/schedule',
        'https://syncmeet-back.onrender.com/req/meetings',
        'https://syncmeet-back.onrender.com/api/meetings'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          // Add timeout to the fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              startTime: date.toISOString(),
              endTime: new Date(date.getTime() + parseInt(duration) * 60000).toISOString(),
              duration: parseInt(duration),
              description: description || '',
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          }
        } catch (error) {
          console.log(`Failed with endpoint ${endpoint}:`, error);
          lastError = error;
          response = null;
        }
      }
      
      if (!response) {
        throw new Error(`All API endpoints failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
      }

      console.log('API Response status:', response.status);
      console.log('API Response statusText:', response.statusText);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('API Response text length:', responseText.length);
      console.log('API Response text:', responseText);
      
      // If response is empty, try a fallback approach
      if (!responseText || responseText.trim() === '') {
        console.log('Empty response from API, using fallback approach');
        // Create a local meeting with a generated ID
        const fallbackMeetingId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newMeeting = {
          id: fallbackMeetingId,
          title,
          date: new Date(date),
          duration: parseInt(duration),
          participants: 0,
          description: description || '',
        };

        console.log('Adding fallback meeting to context:', newMeeting);
        await addMeeting(newMeeting);
        console.log('Fallback meeting added successfully');
        
        Alert.alert(
          'Meeting Scheduled (Offline)', 
          `Your meeting has been scheduled locally!\nMeeting ID: ${fallbackMeetingId}\n\nNote: This meeting was created offline as the server is currently unavailable.`,
          [{ text: 'OK' }]
        );

        // Reset inputs
        setTitle('');
        setDate(new Date());
        setDuration('30');
        setDescription('');
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        console.error('Response text was:', responseText);
        throw new Error(`Invalid JSON response from server: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      // Check if we have a meeting ID in the response
      const meetingId = data.data?.id || data.id || data.meetingId;
      if (!meetingId) {
        throw new Error('No meeting ID received from server');
      }

      console.log('API Response data:', data);
      console.log('Extracted meeting ID:', meetingId);

      // Create meeting object with the received meetingId
      const newMeeting = {
        id: meetingId, // Use the meetingId from backend
        title,
        date: new Date(date), // Ensure it's a proper Date object
        duration: parseInt(duration),
        participants: 0,
        description: description || '',
      };

      console.log('Adding meeting to context:', newMeeting);
      await addMeeting(newMeeting);
      console.log('Meeting added successfully');
      
      // Schedule notification reminder
      try {
        const notificationSettings = await loadNotificationSettings();
        if (notificationSettings.enabled) {
          const notificationId = await scheduleMeetingReminder(
            newMeeting.id,
            newMeeting.title,
            newMeeting.date,
            notificationSettings
          );
          
          if (notificationId) {
            console.log('Meeting reminder scheduled successfully');
          }
        }
      } catch (error) {
        console.error('Error scheduling meeting reminder:', error);
      }
      
      Alert.alert(
        'Meeting Scheduled', 
        `Your meeting has been scheduled successfully!\nMeeting ID: ${meetingId}`,
        [{ text: 'OK' }]
      );

      // Reset inputs
      setTitle('');
      setDate(new Date());
      setDuration('30');
      setDescription('');
      
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to schedule meeting. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const themeColors = {
    background: isDarkTheme ? '#121212' : '#ffffff',
    cardBackground: isDarkTheme ? '#1e1e1e' : '#f8f9fa',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f1f1f1',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    textTertiary: isDarkTheme ? '#888888' : '#999999',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    buttonBackground: '#007AFF',
    buttonText: '#ffffff',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Next Reminder Display */}
        {nextReminder && (
          <View style={{ marginBottom: 16, padding: 16, backgroundColor: themeColors.cardBackground, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: themeColors.textPrimary, fontWeight: 'bold', fontSize: 16 }}>Next Reminder</Text>
            <Text style={{ color: themeColors.textSecondary, marginTop: 4 }}>
              You’ll be reminded on {nextReminder.toLocaleDateString()} at {nextReminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Schedule a Meeting</Text>
          <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
            Create a new meeting and add it to your calendar
          </Text>
        </View>

        {/* Meeting Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Meeting Title *</Text>
          <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
            <Ionicons name="videocam-outline" size={20} color={themeColors.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="Enter meeting title"
              placeholderTextColor={themeColors.textTertiary}
              style={[styles.input, { color: themeColors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Date and Time Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Date & Time</Text>
          
          {/* Date Picker */}
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={themeColors.textSecondary} style={styles.icon} />
            <Text style={[styles.input, { color: themeColors.textPrimary }]}>{date.toLocaleDateString()}</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangeDate}
            />
          )}

          {/* Time Picker */}
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor, marginTop: 12 }]}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialIcons name="access-time" size={20} color={themeColors.textSecondary} style={styles.icon} />
            <Text style={[styles.input, { color: themeColors.textPrimary }]}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeTime}
            />
          )}
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Duration (minutes)</Text>
          <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
            <Ionicons name="time-outline" size={20} color={themeColors.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="30"
              placeholderTextColor={themeColors.textTertiary}
              keyboardType="numeric"
              style={[styles.input, { color: themeColors.textPrimary }]}
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Description (optional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.borderColor }]}>
            <Ionicons name="document-text-outline" size={20} color={themeColors.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="Enter meeting description"
              placeholderTextColor={themeColors.textTertiary}
              style={[styles.input, { color: themeColors.textPrimary }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Notification Info */}
        <View style={[styles.notificationInfo, { backgroundColor: themeColors.cardBackground }]}>
          <Ionicons name="notifications-outline" size={20} color={themeColors.accent} style={styles.icon} />
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, { color: themeColors.textPrimary }]}>
              Meeting Reminder
            </Text>
            <Text style={[styles.notificationDescription, { color: themeColors.textSecondary }]}>
              You'll receive a notification 5 minutes before this meeting starts
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.buttonBackground }]}
          onPress={handleSubmit}
        >
          <Ionicons name="calendar" size={20} color={themeColors.buttonText} style={styles.buttonIcon} />
          <Text style={[styles.submitText, { color: themeColors.buttonText }]}>Schedule Meeting</Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    paddingTop: 20,
  },
  heading: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: { 
    marginRight: 12,
  },
  input: { 
    fontSize: 16, 
    flex: 1,
    paddingVertical: 0,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitText: { 
    fontSize: 18, 
    fontWeight: '700',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
