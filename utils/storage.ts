import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  MEETINGS: 'meetings',
  USER_PREFERENCES: 'user_preferences',
  RECENT_MEETINGS: 'recent_meetings',
  CONTACTS: 'contacts',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications',
  AUDIO_SETTINGS: 'audio_settings',
  VIDEO_SETTINGS: 'video_settings',
  CALENDAR_SETTINGS: 'calendar_settings',
} as const;

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    meetingReminders: boolean;
  };
  audio: {
    defaultMute: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
  };
  video: {
    defaultCamera: 'front' | 'back';
    defaultVideoOn: boolean;
    videoQuality: 'low' | 'medium' | 'high';
  };
  calendar: {
    syncWithDevice: boolean;
    defaultDuration: number;
    reminderTime: number;
  };
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    meetingReminders: true,
  },
  audio: {
    defaultMute: false,
    echoCancellation: true,
    noiseSuppression: true,
  },
  video: {
    defaultCamera: 'front',
    defaultVideoOn: true,
    videoQuality: 'medium',
  },
  calendar: {
    syncWithDevice: true,
    defaultDuration: 30,
    reminderTime: 5,
  },
};

// Storage utility class
class StorageManager {
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Meeting-specific methods
  async saveMeetings(meetings: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.MEETINGS, meetings);
  }

  async getMeetings(): Promise<any[]> {
    const meetings = await this.getItem<any[]>(STORAGE_KEYS.MEETINGS);
    return meetings || [];
  }

  async addMeeting(meeting: any): Promise<void> {
    const meetings = await this.getMeetings();
    meetings.unshift(meeting);
    await this.saveMeetings(meetings);
  }

  async updateMeeting(meetingId: string, updates: any): Promise<void> {
    const meetings = await this.getMeetings();
    const index = meetings.findIndex(m => m.id === meetingId);
    if (index !== -1) {
      meetings[index] = { ...meetings[index], ...updates };
      await this.saveMeetings(meetings);
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const meetings = await this.getMeetings();
    const filteredMeetings = meetings.filter(m => m.id !== meetingId);
    await this.saveMeetings(filteredMeetings);
  }

  // Recent meetings methods
  async saveRecentMeetings(meetingIds: string[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.RECENT_MEETINGS, meetingIds);
  }

  async getRecentMeetings(): Promise<string[]> {
    const recentMeetings = await this.getItem<string[]>(STORAGE_KEYS.RECENT_MEETINGS);
    return recentMeetings || [];
  }

  async addRecentMeeting(meetingId: string): Promise<void> {
    const recentMeetings = await this.getRecentMeetings();
    const filtered = recentMeetings.filter(id => id !== meetingId);
    filtered.unshift(meetingId);
    // Keep only last 10 recent meetings
    const limited = filtered.slice(0, 10);
    await this.saveRecentMeetings(limited);
  }

  // User preferences methods
  async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const current = await this.getUserPreferences();
    const updated = { ...current, ...preferences };
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const preferences = await this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    return preferences || DEFAULT_PREFERENCES;
  }

  async updateTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.saveUserPreferences({ theme });
  }

  async updateNotificationSettings(settings: Partial<UserPreferences['notifications']>): Promise<void> {
    const current = await this.getUserPreferences();
    const updated = {
      ...current,
      notifications: { ...current.notifications, ...settings }
    };
    await this.saveUserPreferences(updated);
  }

  async updateAudioSettings(settings: Partial<UserPreferences['audio']>): Promise<void> {
    const current = await this.getUserPreferences();
    const updated = {
      ...current,
      audio: { ...current.audio, ...settings }
    };
    await this.saveUserPreferences(updated);
  }

  async updateVideoSettings(settings: Partial<UserPreferences['video']>): Promise<void> {
    const current = await this.getUserPreferences();
    const updated = {
      ...current,
      video: { ...current.video, ...settings }
    };
    await this.saveUserPreferences(updated);
  }

  async updateCalendarSettings(settings: Partial<UserPreferences['calendar']>): Promise<void> {
    const current = await this.getUserPreferences();
    const updated = {
      ...current,
      calendar: { ...current.calendar, ...settings }
    };
    await this.saveUserPreferences(updated);
  }

  // Contacts methods
  async saveContacts(contacts: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.CONTACTS, contacts);
  }

  async getContacts(): Promise<any[]> {
    const contacts = await this.getItem<any[]>(STORAGE_KEYS.CONTACTS);
    return contacts || [];
  }

  async addContact(contact: any): Promise<void> {
    const contacts = await this.getContacts();
    contacts.push(contact);
    await this.saveContacts(contacts);
  }

  async updateContact(contactId: string, updates: any): Promise<void> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c.id === contactId);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      await this.saveContacts(contacts);
    }
  }

  async deleteContact(contactId: string): Promise<void> {
    const contacts = await this.getContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    await this.saveContacts(filteredContacts);
  }

  // Utility methods
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  async exportData(): Promise<any> {
    try {
      const data: any = {};
      
      for (const key of Object.values(STORAGE_KEYS)) {
        data[key] = await this.getItem(key);
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data: any): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          await this.setItem(key, value);
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Export convenience functions
export const saveMeetings = (meetings: any[]) => storage.saveMeetings(meetings);
export const getMeetings = () => storage.getMeetings();
export const addMeeting = (meeting: any) => storage.addMeeting(meeting);
export const updateMeeting = (meetingId: string, updates: any) => storage.updateMeeting(meetingId, updates);
export const deleteMeeting = (meetingId: string) => storage.deleteMeeting(meetingId);

export const saveUserPreferences = (preferences: Partial<UserPreferences>) => storage.saveUserPreferences(preferences);
export const getUserPreferences = () => storage.getUserPreferences();
export const updateTheme = (theme: 'light' | 'dark' | 'system') => storage.updateTheme(theme);
export const updateNotificationSettings = (settings: Partial<UserPreferences['notifications']>) => storage.updateNotificationSettings(settings);
export const updateAudioSettings = (settings: Partial<UserPreferences['audio']>) => storage.updateAudioSettings(settings);
export const updateVideoSettings = (settings: Partial<UserPreferences['video']>) => storage.updateVideoSettings(settings);
export const updateCalendarSettings = (settings: Partial<UserPreferences['calendar']>) => storage.updateCalendarSettings(settings);

export const saveContacts = (contacts: any[]) => storage.saveContacts(contacts);
export const getContacts = () => storage.getContacts();
export const addContact = (contact: any) => storage.addContact(contact);
export const updateContact = (contactId: string, updates: any) => storage.updateContact(contactId, updates);
export const deleteContact = (contactId: string) => storage.deleteContact(contactId); 