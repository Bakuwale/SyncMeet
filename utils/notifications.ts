// NOTIFICATIONS MODULE
// ====================
// Expo Go (SDK 53+) does NOT support push/remote notifications (expo-notifications) on Android/iOS.
// Only local notifications may work, but most features are unavailable in Expo Go.
// To test push notifications, you MUST use a custom development build (EAS Dev Client):
// https://docs.expo.dev/develop/development-builds/introduction/
// All notification code in this file will show a toast and return early if running in Expo Go.
// This is by design to prevent crashes and confusion for developers.
//
// For full notification support, build your app with EAS and test on a real device.
// ====================
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import Toast from 'react-native-toast-message';

// Add this at the top of the file for TypeScript global extension
declare global {
  // eslint-disable-next-line no-var
  var __expoGoNotificationWarned: boolean | undefined;
}

// Notification preference types - updated to support combinations
export type NotificationPreference = 'notification-only' | 'sound' | 'vibration' | 'sound-vibration';

// Interface for notification preferences
export interface NotificationSettings {
  preference: NotificationPreference;
  enabled: boolean;
}

// Interface for meeting reminder data
export interface MeetingReminder {
  meetingId: string;
  title: string;
  date: Date;
  notificationId: string;
}

// Storage keys
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const SCHEDULED_REMINDERS_KEY = 'scheduled_reminders';

// Configure notification behavior
if (Constants.appOwnership !== 'expo') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} else {
  // Expo Go: warn once at startup
  if (!global.__expoGoNotificationWarned) {
    Toast.show({
      type: 'error',
      text1: 'expo-notifications: Android remote notification functionality removed in SDK 53 for Expo Go.',
      text2: 'Use a custom development build with EAS to test push notifications.',
      position: 'bottom',
    });
    global.__expoGoNotificationWarned = true;
  }
}

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Constants.appOwnership === 'expo') {
    Toast.show({
      type: 'error',
      text1: 'Push notifications are disabled in Expo Go.',
      text2: 'Use a development build.',
      position: 'bottom',
    });
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Notifications are disabled.',
        text2: 'Please enable permissions in your settings.',
        position: 'bottom',
      });
      return false;
    }
    
    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meeting-reminders', {
        name: 'Meeting Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Save notification settings
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

// Load notification settings
export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  
  // Default settings
  return {
    preference: 'sound',
    enabled: true,
  };
};

// Save scheduled reminders
export const saveScheduledReminders = async (reminders: MeetingReminder[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SCHEDULED_REMINDERS_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving scheduled reminders:', error);
  }
};

// Load scheduled reminders
export const loadScheduledReminders = async (): Promise<MeetingReminder[]> => {
  try {
    const reminders = await AsyncStorage.getItem(SCHEDULED_REMINDERS_KEY);
    if (reminders) {
      return JSON.parse(reminders);
    }
  } catch (error) {
    console.error('Error loading scheduled reminders:', error);
  }
  
  return [];
};

// Configure notification based on user preference
const configureNotificationContent = (
  title: string,
  body: string,
  data: any,
  preference: NotificationPreference
): Notifications.NotificationContentInput => {
  const content: Notifications.NotificationContentInput = {
    title,
    body,
    data,
  };

  switch (preference) {
    case 'notification-only':
      content.sound = undefined;
      content.vibrate = undefined;
      break;
    case 'sound':
      content.sound = 'default';
      content.vibrate = undefined;
      break;
    case 'vibration':
      content.sound = undefined;
      if (Platform.OS === 'android') {
        content.vibrate = [0, 500, 500, 500];
      }
      break;
    case 'sound-vibration':
      content.sound = 'default';
      if (Platform.OS === 'android') {
        content.vibrate = [0, 500, 500, 500];
      }
      break;
  }

  return content;
};

// Schedule a meeting reminder
export const scheduleMeetingReminder = async (
  meetingId: string,
  title: string,
  date: Date,
  settings: NotificationSettings
): Promise<string | null> => {
  // Expo Go (SDK 53+): No push/remote notifications, only local notifications if supported
  if (Constants.appOwnership === 'expo') {
    Toast.show({
      type: 'error',
      text1: 'Push notifications are not available in Expo Go (SDK 53+).',
      text2: 'Use a custom development build (EAS) for full notification support.',
      position: 'bottom',
    });
    return null;
  }
  try {
    // Check if notifications are enabled
    if (!settings.enabled) {
      Toast.show({
        type: 'error',
        text1: 'Notifications are disabled.',
        text2: 'Please enable permissions in your settings.',
        position: 'bottom',
      });
      return null;
    }

    // Request permissions if not already granted
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      // Toast already shown in requestNotificationPermissions
      return null;
    }

    // Calculate trigger time (5 minutes before meeting)
    const triggerTime = new Date(date.getTime() - 5 * 60 * 1000);
    
    // Don't schedule if the meeting is in the past
    if (triggerTime <= new Date()) {
      Toast.show({
        type: 'error',
        text1: 'Meeting time has already passed.',
        text2: 'Cannot schedule a reminder for a past meeting.',
        position: 'bottom',
      });
      return null;
    }

    // Configure notification based on user preference
    const notificationConfig: Notifications.NotificationRequestInput = {
      content: configureNotificationContent(
        'Meeting Reminder',
        `Your meeting "${title}" starts in 5 minutes`,
        { meetingId, title, date: date.toISOString() },
        settings.preference
      ),
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: triggerTime },
    };

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
    
    // Apply vibration fallback for iOS when vibration is enabled
    if ((settings.preference === 'vibration' || settings.preference === 'sound-vibration') && Platform.OS === 'ios') {
      // For iOS, we'll schedule a separate vibration at the same time
      setTimeout(() => {
        Vibration.vibrate([0, 500, 500, 500]);
      }, triggerTime.getTime() - Date.now());
    }
    
    // Save the reminder
    const reminders = await loadScheduledReminders();
    const newReminder: MeetingReminder = {
      meetingId,
      title,
      date,
      notificationId,
    };
    
    await saveScheduledReminders([...reminders, newReminder]);
    
    console.log(`Scheduled reminder for meeting: ${title} at ${triggerTime} with preference: ${settings.preference}`);
    return notificationId;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to schedule reminder.',
      text2: 'Try again later.',
      position: 'bottom',
    });
    return null;
  }
};

// Cancel a meeting reminder
export const cancelMeetingReminder = async (meetingId: string): Promise<void> => {
  try {
    const reminders = await loadScheduledReminders();
    const reminder = reminders.find(r => r.meetingId === meetingId);
    
    if (reminder) {
      // Cancel the notification
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      
      // Remove from stored reminders
      const updatedReminders = reminders.filter(r => r.meetingId !== meetingId);
      await saveScheduledReminders(updatedReminders);
      
      console.log(`Cancelled reminder for meeting: ${reminder.title}`);
    }
  } catch (error) {
    console.error('Error cancelling meeting reminder:', error);
  }
};

// Update a meeting reminder (for rescheduled meetings)
export const updateMeetingReminder = async (
  meetingId: string,
  title: string,
  date: Date,
  settings: NotificationSettings
): Promise<string | null> => {
  try {
    // Cancel existing reminder
    await cancelMeetingReminder(meetingId);
    
    // Schedule new reminder
    return await scheduleMeetingReminder(meetingId, title, date, settings);
  } catch (error) {
    console.error('Error updating meeting reminder:', error);
    return null;
  }
};

// Send a test notification
export const sendTestNotification = async (settings: NotificationSettings): Promise<string> => {
  if (Constants.appOwnership === 'expo') {
    Toast.show({
      type: 'error',
      text1: 'Push notifications are disabled in Expo Go.',
      text2: 'Use a development build.',
      position: 'bottom',
    });
    return 'expo-go-disabled';
  }
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // Configure notification based on user preference
    const notificationConfig: Notifications.NotificationRequestInput = {
      content: configureNotificationContent(
        'Test Notification',
        'This is a test notification.',
        {},
        settings.preference
      ),
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 2 * 1000) }, // Send after 2 seconds
    };

    const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
    
    // Apply vibration fallback for iOS or when vibration is enabled
    if (settings.preference === 'vibration' || settings.preference === 'sound-vibration') {
      if (Platform.OS === 'ios') {
        // iOS doesn't support vibration in notification content, so we use Vibration API
        setTimeout(() => {
          Vibration.vibrate([0, 500, 500, 500]);
        }, 2000); // Vibrate when notification should appear
      }
    }

    console.log('Test notification scheduled with settings:', settings.preference);
    return notificationId;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to send test notification.',
      text2: 'Check your notification permissions.',
      position: 'bottom',
    });
    throw error;
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Clear all scheduled notifications
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await saveScheduledReminders([]);
    console.log('All notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Initialize notification system
export const initializeNotifications = async (): Promise<void> => {
  if (Constants.appOwnership === 'expo') {
    Toast.show({
      type: 'error',
      text1: 'Push notifications are disabled in Expo Go.',
      text2: 'Use a development build.',
      position: 'bottom',
    });
    return;
  }
  try {
    // Request permissions on app start
    await requestNotificationPermissions();
    
    // Load and validate existing reminders
    const reminders = await loadScheduledReminders();
    const validReminders = reminders.filter(reminder => {
      const reminderTime = new Date(reminder.date.getTime() - 5 * 60 * 1000);
      return reminderTime > new Date();
    });
    
    // Save back only valid reminders
    if (validReminders.length !== reminders.length) {
      await saveScheduledReminders(validReminders);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}; 