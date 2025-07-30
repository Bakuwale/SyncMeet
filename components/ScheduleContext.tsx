import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type ScheduledMeeting = {
  id: string;
  topic: string;
  date: Date;
  duration: number;
  hostVideo: boolean;
  participantVideo: boolean;
};

interface ScheduleContextType {
  scheduledMeetings: ScheduledMeeting[];
  setScheduledMeetings: React.Dispatch<React.SetStateAction<ScheduledMeeting[]>>;
  addScheduledMeeting: (meeting: Omit<ScheduledMeeting, 'id'>) => Promise<void>;
  updateScheduledMeeting: (id: string, updates: Partial<ScheduledMeeting>) => Promise<void>;
  deleteScheduledMeeting: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshMeetings: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);
  // Add loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Import api from utils
  const [api, setApi] = useState<any>(null);
  
  // Load API on mount
  useEffect(() => {
    const loadApi = async () => {
      const { api } = await import('../utils/api');
      setApi(api);
    };
    loadApi();
  }, []);

  // Fetch scheduled meetings from API when api is loaded
  React.useEffect(() => {
    if (api) {
      refreshMeetings();
    }
  }, [api]);

  // Function to refresh meetings from API
  const refreshMeetings = async () => {
    if (!api) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getMeetings();
      
      if (response.success && response.data) {
        // Transform the API response to match ScheduledMeeting type
        const formattedMeetings = response.data.map(meeting => ({
          id: meeting.id,
          topic: meeting.title,
          date: new Date(meeting.startTime),
          duration: meeting.duration,
          hostVideo: meeting.settings?.defaultVideoOn || false,
          participantVideo: !meeting.settings?.muteParticipantsOnEntry || false,
        }));
        
        setScheduledMeetings(formattedMeetings);
      } else {
        setError(response.error || 'Failed to fetch meetings');
        console.error('API Error:', response.error);
      }
    } catch (err) {
      setError('An error occurred while fetching meetings');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new scheduled meeting
  const addScheduledMeeting = async (meeting: Omit<ScheduledMeeting, 'id'>) => {
    if (!api) return;
    
    try {
      setLoading(true);
      
      // Format meeting data for API
      const apiMeeting = {
        title: meeting.topic,
        description: '',
        startTime: meeting.date.toISOString(),
        endTime: new Date(meeting.date.getTime() + meeting.duration * 60000).toISOString(),
        duration: meeting.duration,
        settings: {
          defaultVideoOn: meeting.hostVideo,
          muteParticipantsOnEntry: !meeting.participantVideo,
        }
      };
      
      const response = await api.createMeeting(apiMeeting);
      
      if (response.success) {
        // Refresh meetings to get the updated list
        await refreshMeetings();
      } else {
        setError(response.error || 'Failed to create meeting');
        console.error('API Error:', response.error);
      }
    } catch (err) {
      setError('An error occurred while creating the meeting');
      console.error('Create Meeting Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing scheduled meeting
  const updateScheduledMeeting = async (id: string, updates: Partial<ScheduledMeeting>) => {
    if (!api) return;
    
    try {
      setLoading(true);
      
      // Format updates for API
      const apiUpdates: any = {};
      
      if (updates.topic) apiUpdates.title = updates.topic;
      if (updates.date) apiUpdates.startTime = updates.date.toISOString();
      if (updates.duration) {
        apiUpdates.duration = updates.duration;
        if (updates.date) {
          apiUpdates.endTime = new Date(updates.date.getTime() + updates.duration * 60000).toISOString();
        }
      }
      
      if (updates.hostVideo !== undefined || updates.participantVideo !== undefined) {
        apiUpdates.settings = {};
        if (updates.hostVideo !== undefined) apiUpdates.settings.defaultVideoOn = updates.hostVideo;
        if (updates.participantVideo !== undefined) apiUpdates.settings.muteParticipantsOnEntry = !updates.participantVideo;
      }
      
      const response = await api.updateMeeting(id, apiUpdates);
      
      if (response.success) {
        // Refresh meetings to get the updated list
        await refreshMeetings();
      } else {
        setError(response.error || 'Failed to update meeting');
        console.error('API Error:', response.error);
      }
    } catch (err) {
      setError('An error occurred while updating the meeting');
      console.error('Update Meeting Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a scheduled meeting
  const deleteScheduledMeeting = async (id: string) => {
    if (!api) return;
    
    try {
      setLoading(true);
      
      const response = await api.deleteMeeting(id);
      
      if (response.success) {
        // Refresh meetings to get the updated list
        await refreshMeetings();
      } else {
        setError(response.error || 'Failed to delete meeting');
        console.error('API Error:', response.error);
      }
    } catch (err) {
      setError('An error occurred while deleting the meeting');
      console.error('Delete Meeting Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScheduleContext.Provider value={{
      scheduledMeetings,
      setScheduledMeetings,
      addScheduledMeeting,
      updateScheduledMeeting,
      deleteScheduledMeeting,
      loading,
      error,
      refreshMeetings
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}