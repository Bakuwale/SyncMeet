import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { themeColors, useThemeContext } from '../components/ThemeContext';

const NOTIFICATION_OPTIONS = [
  { key: 'notification-only', label: 'Notification Only (silent)' },
  { key: 'sound', label: 'Notification + Sound' },
  { key: 'vibration', label: 'Notification + Vibration' },
  { key: 'sound-vibration', label: 'Notification + Sound + Vibration' },
];

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const colors = themeColors[theme];
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
      paddingTop: Platform.OS === 'android' ? 16 : 0,
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: Platform.OS === 'android' ? 8 : -4,
      padding: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      marginTop: 10,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      marginTop: 4,
      marginBottom: 8,
      color: colors.textSecondary,
    },
    card: {
      borderRadius: 10,
      padding: 16,
      marginBottom: 20,
      backgroundColor: colors.cardBackground,
    },
    cardLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
      color: colors.textPrimary,
    },
    prefRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginTop: 10,
      borderWidth: 1,
      borderRadius: 8,
    },
    prefText: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
    testButton: {
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      backgroundColor: colors.accent,
    },
    testButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors]);

  const [enabled, setEnabled] = useState(true);
  const [preference, setPreference] = useState('sound');
  const [loading, setLoading] = useState(false);

  // Simulate loading/saving settings (replace with real logic as needed)
  useEffect(() => {
    // Optionally load settings from storage here
  }, []);

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    // Optionally save to storage
  };

  const handleSelect = (key: string) => {
    setPreference(key);
    // Optionally save to storage
  };

  const handleTest = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Test notification sent!',
        position: 'bottom',
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <Ionicons name="notifications" size={38} color={colors.accent} style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Reminder Settings</Text>
          <Text style={styles.subtitle}>Configure how you receive reminders</Text>
        </View>

        {/* Enable Switch */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Enable Reminders</Text>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.borderColor, true: colors.accent }}
            thumbColor={enabled ? colors.accent : colors.accent}
          />
        </View>

        {/* Notification Preferences */}
        {enabled && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Notification Type</Text>
            {NOTIFICATION_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.prefRow,
                  { borderColor: preference === option.key ? colors.accent : colors.borderColor },
                ]}
                onPress={() => handleSelect(option.key)}
              >
                <Text style={styles.prefText}>{option.label}</Text>
                {preference === option.key && (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Test Button */}
        {enabled && (
          <TouchableOpacity
            style={[styles.testButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleTest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

