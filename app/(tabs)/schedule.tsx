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
import uuid from 'react-native-uuid';
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
      id: uuid.v4(),
      title,
      date: date.toISOString(),
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
    inputBackground: isDarkTheme ? '#1e1e1e' : '#f1f1f1',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: '#aaa',
    buttonBackground: '#3399ff',
    buttonText: '#ffffff',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Schedule a Meeting</Text>

        {/* Meeting Title */}
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>Meeting Title</Text>
        <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground }]}>
          <Ionicons name="videocam-outline" size={20} color={themeColors.textSecondary} style={styles.icon} />
          <TextInput
            placeholder="Enter meeting title"
            placeholderTextColor={themeColors.textSecondary}
            style={[styles.input, { color: themeColors.textPrimary }]}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date Picker */}
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>Date</Text>
        <TouchableOpacity
          style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground }]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color={themeColors.textSecondary} style={styles.icon} />
          <Text style={[styles.input, { color: themeColors.textPrimary }]}>{date.toLocaleDateString()}</Text>
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
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>Time</Text>
        <TouchableOpacity
          style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground }]}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={20} color={themeColors.textSecondary} style={styles.icon} />
          <Text style={[styles.input, { color: themeColors.textPrimary }]}>
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}

        {/* Duration */}
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>Duration (minutes)</Text>
        <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground }]}>
          <TextInput
            placeholder="30"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="numeric"
            style={[styles.input, { color: themeColors.textPrimary }]}
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        {/* Description */}
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>Description (optional)</Text>
        <View style={[styles.inputContainer, { backgroundColor: themeColors.inputBackground }]}>
          <TextInput
            placeholder="Enter meeting description"
            placeholderTextColor={themeColors.textSecondary}
            style={[styles.input, { color: themeColors.textPrimary }]}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.buttonBackground }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitText, { color: themeColors.buttonText }]}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  icon: { marginRight: 8 },
  input: { fontSize: 14, flex: 1 },
  submitButton: {
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
