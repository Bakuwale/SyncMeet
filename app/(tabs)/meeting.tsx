import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function MeetingScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="videocam" size={64} color="#007AFF" />
      <Text style={styles.title}>Start or Join a Meeting</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>New Meeting</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline}>
        <Text style={styles.buttonOutlineText}>Join with ID</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonOutlineText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
})
