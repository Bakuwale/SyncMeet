import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
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
import { useMeetings } from '../../components/MeetingContext';
import { useThemeContext } from '../../components/ThemeContext';

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

  const handleSubmit = () => {
    if (!title || !duration) {
      Alert.alert('Error', 'Please fill in the meeting title and duration.');
      return;
    }

    const newMeeting = {
      title,
      date: date,
      duration: parseInt(duration),
      participants: 0,
      description,
    };

    addMeeting(newMeeting);
    Alert.alert('Meeting Scheduled', 'Your meeting has been added to the list.');

    // Reset inputs
    setTitle('');
    setDate(new Date());
    setDuration('30');
    setDescription('');
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.buttonBackground }]}
          onPress={handleSubmit}
        >
          <Ionicons name="calendar" size={20} color={themeColors.buttonText} style={styles.buttonIcon} />
          <Text style={[styles.submitText, { color: themeColors.buttonText }]}>Schedule Meeting</Text>
        </TouchableOpacity>
      </ScrollView>
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
});
