import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacySettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Privacy Settings</Text>
      </View>

      <Text style={styles.description}>
        Manage how your profile and meeting activity are visible to others. More detailed privacy controls are coming soon.
      </Text>

      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Allow others to find me by email</Text>
        <Switch value={false} disabled />
      </View>

      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Show profile picture to others</Text>
        <Switch value={false} disabled />
      </View>

      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Show meeting activity to contacts</Text>
        <Switch value={false} disabled />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 30,
  },
  optionRow: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
});
