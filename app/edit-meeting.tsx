import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSchedule } from '../components/ScheduleContext';
import { useThemeContext } from '../components/ThemeContext';

export default function EditMeetingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const {
    scheduledMeetings,
    updateScheduledMeeting,
    loading,
  } = useSchedule();

  // Form state
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('30');
  const [hostVideo, setHostVideo] = useState(false);
  const [participantVideo, setParticipantVideo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load meeting data
  useEffect(() => {
    if (id && scheduledMeetings.length > 0) {
      const meeting = scheduledMeetings.find(m => m.id === id);
      if (meeting) {
        setTopic(meeting.topic);
        setDate(new Date(meeting.date));
        setDuration(meeting.duration.toString());
        setHostVideo(meeting.hostVideo);
        setParticipantVideo(meeting.participantVideo);
        setIsLoading(false);
      } else {
        Alert.alert('Error', 'Meeting not found');
        router.back();
      }
    }
  }, [id, scheduledMeetings]);

  // Date and time picker handlers
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!topic || !duration) {
      Alert.alert('Error', 'Please fill in the meeting topic and duration.');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'Meeting ID is missing');
      return;
    }

    setIsSaving(true);

    try {
      await updateScheduledMeeting(id, {
        topic,
        date,
        duration: parseInt(duration),
        hostVideo,
        participantVideo,
      });

      Alert.alert('Success', 'Meeting updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update meeting');
    } finally {
      setIsSaving(false);
    }
  };

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#121212' : '#f5f5f5',
    card: isDarkTheme ? '#1e1e1e' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    subtext: isDarkTheme ? '#aaaaaa' : '#666666',
    border: isDarkTheme ? '#333333' : '#e0e0e0',
    inputBackground: isDarkTheme ? '#2a2a2a' : '#f0f0f0',
    primary: '#007AFF',
    danger: '#FF3B30',
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Loading meeting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              Edit Meeting
            </Text>
            <View style={styles.headerRight} />
          </View>

          <View style={[styles.formContainer, { backgroundColor: themeColors.card }]}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Meeting Topic</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Enter meeting topic"
                placeholderTextColor={themeColors.subtext}
                value={topic}
                onChangeText={setTopic}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Date</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: themeColors.text }}>{formatDate(date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Time</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: themeColors.text }}>{formatTime(date)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Enter duration in minutes"
                placeholderTextColor={themeColors.subtext}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Video Options</Text>
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: themeColors.text }]}>
                  Host Video
                </Text>
                <Switch
                  value={hostVideo}
                  onValueChange={setHostVideo}
                  trackColor={{ false: '#767577', true: themeColors.primary }}
                  thumbColor={hostVideo ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: themeColors.text }]}>
                  Participant Video
                </Text>
                <Switch
                  value={participantVideo}
                  onValueChange={setParticipantVideo}
                  trackColor={{ false: '#767577', true: themeColors.primary }}
                  thumbColor={participantVideo ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: themeColors.border }]}
              onPress={() => router.back()}
              disabled={isSaving || loading}
            >
              <Text style={[styles.cancelButtonText, { color: themeColors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
              onPress={handleSubmit}
              disabled={isSaving || loading}
            >
              {isSaving || loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});