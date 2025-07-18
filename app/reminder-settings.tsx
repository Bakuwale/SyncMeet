import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useThemeContext } from '../components/ThemeContext';
import {
  NotificationSettings,
  NotificationPreference,
  loadNotificationSettings,
  requestNotificationPermissions,
  saveNotificationSettings,
  sendTestNotification,
} from '../utils/notifications';

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [settings, setSettings] = useState<NotificationSettings>({
    preference: 'sound',
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const saved = await loadNotificationSettings();
        setSettings(saved);
      } catch {
        // Optionally show error
      }
    };
    fetchSettings();
  }, []);

  const applySettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    try {
      await saveNotificationSettings(newSettings);
    } catch {
      Alert.alert('Error', 'Saving failed!');
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        return Alert.alert('Permission denied', 'Enable notifications in device settings.');
      }
    }
    applySettings({ ...settings, enabled });
  };

  const runTest = async () => {
    if (!settings.enabled) {
      return Toast.show({
        type: 'error',
        text1: 'Notifications Off',
        text2: 'Enable them first.',
        position: 'bottom',
      });
    }

    setLoading(true);
    try {
      await sendTestNotification(settings);
      const msgMap = {
        'notification-only': 'Silent test sent.',
        sound: 'Sound test sent.',
        vibration: 'Vibration test sent.',
        'sound-vibration': 'Sound + vibration test sent.',
      };
      Toast.show({
        type: 'success',
        text1: msgMap[settings.preference],
        position: 'bottom',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Test failed',
        text2: 'Check notification permissions.',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    background: isDark ? '#121212' : '#FFF',
    card: isDark ? '#1E1E1E' : '#F9F9F9',
    text: isDark ? '#FFF' : '#111',
    subText: isDark ? '#999' : '#555',
    accent: '#007AFF',
    border: isDark ? '#333' : '#DDD',
    switchTrack: '#007AFF',
    switchThumb: '#FFF',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={isDark ? ['#121212', '#1E1E1E'] : ['#FFF', '#F7F9FA']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.accent} />
            </TouchableOpacity>
            <Ionicons name="notifications" size={38} color={colors.accent} />
            <Text style={[styles.title, { color: colors.text }]}>Reminder Settings</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              Configure how you receive reminders
            </Text>
          </View>

          {/* Enable Switch */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Enable Reminders</Text>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.switchTrack }}
              thumbColor={settings.enabled ? colors.switchThumb : colors.switchThumb}
            />
          </View>

          {/* Notification Preferences */}
          {settings.enabled && (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardLabel, { color: colors.text }]}>Notification Type</Text>
              {(Object.keys({
                'notification-only': '',
                sound: '',
                vibration: '',
                'sound-vibration': '',
              }) as NotificationPreference[]).map(pref => (
                <TouchableOpacity
                  key={pref}
                  onPress={() => applySettings({ ...settings, preference: pref })}
                  style={[
                    styles.prefRow,
                    {
                      borderColor:
                        settings.preference === pref ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.prefText, { color: colors.text }]}>{pref}</Text>
                  {settings.preference === pref && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Test Button */}
          {settings.enabled && (
            <TouchableOpacity
              onPress={runTest}
              style={[
                styles.testButton,
                {
                  backgroundColor: colors.accent,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>
                {loading ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  gradient: {
    flex: 1,
    padding: 20,
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
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
    borderRadius: 10,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
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
  },
  testButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
