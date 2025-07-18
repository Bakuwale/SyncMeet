import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import {
    cancelMeetingReminder,
    initializeNotifications,
    loadNotificationSettings,
    scheduleMeetingReminder,
    updateMeetingReminder,
} from '../utils/notifications';

export type Meeting = {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  participants: number;
};

type MeetingContextType = {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  deleteMeeting: (id: string) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeetings = () => {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error('useMeetings must be used within MeetingProvider');
  return ctx;
};

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with an empty array (no dummy meetings)
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Initialize notifications on app start
  useEffect(() => {
    initializeNotifications();
  }, []);

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    // Generate a random 9-digit meeting ID
    const id = Math.floor(100000000 + Math.random() * 900000000).toString();
    const newMeeting = { ...meeting, id };
    
    setMeetings(prev => [newMeeting, ...prev]);

    // Schedule notification for the new meeting
    try {
      const notificationSettings = await loadNotificationSettings();
      const notificationId = await scheduleMeetingReminder(
        newMeeting.id,
        newMeeting.title,
        newMeeting.date,
        notificationSettings
      );
      if (notificationId) {
        Toast.show({
          type: 'success',
          text1: 'Meeting reminder set for 5 minutes before your meeting.',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to schedule reminder.',
        text2: 'Try again later.',
        position: 'bottom',
      });
    }
  };

  const deleteMeeting = async (id: string) => {
    // Cancel notification before deleting meeting
    try {
      await cancelMeetingReminder(id);
    } catch (error) {
      console.error('Error cancelling notification for deleted meeting:', error);
    }
    
    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === id ? { ...meeting, ...updates } : meeting
    );
    setMeetings(updatedMeetings);

    // Update notification if meeting time or title changed
    if (updates.date || updates.title) {
      try {
        const updatedMeeting = updatedMeetings.find(m => m.id === id);
        if (updatedMeeting) {
          const notificationSettings = await loadNotificationSettings();
          await updateMeetingReminder(
            updatedMeeting.id,
            updatedMeeting.title,
            updatedMeeting.date,
            notificationSettings
          );
        }
      } catch (error) {
        console.error('Error updating notification for meeting:', error);
      }
    }
  };

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, deleteMeeting, updateMeeting }}>
      {children}
      <Toast />
    </MeetingContext.Provider>
  );
};
