import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// If you are using DateTimePicker, make sure it's imported
// import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState('30');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Schedule a Meeting</Text>

      <Text style={styles.label}>Meeting Title</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="videocam-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.input}
          placeholder="Enter meeting title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
        <Ionicons name="calendar-outline" size={18} color="#aaa" />
        <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {/* Add your DateTimePicker if necessary */}

      <Text style={styles.label}>Time</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputContainer}>
        <Ionicons name="time-outline" size={18} color="#aaa" />
        <Text style={styles.inputText}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      {/* Add your DateTimePicker if necessary */}

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        style={styles.inputOnly}
        keyboardType="numeric"
        placeholder="30"
        placeholderTextColor="#aaa"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.inputOnly}
        placeholder="Enter meeting description"
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recurring Meeting</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#ffffff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  inputText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  inputOnly: {
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
});
