import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ScheduledMeeting = {
  topic: string;
  date: Date;
  duration: number;
  hostVideo: boolean;
  participantVideo: boolean;
};

interface ScheduleContextType {
  scheduledMeetings: ScheduledMeeting[];
  setScheduledMeetings: React.Dispatch<React.SetStateAction<ScheduledMeeting[]>>;
  loading: boolean;
  error: string | null;
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

  // Fetch scheduled meetings from API (simulate with setTimeout for now)
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setScheduledMeetings([]); // TODO: Replace with real API call
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <ScheduleContext.Provider value={{ scheduledMeetings, setScheduledMeetings, loading, error }}>
      {children}
    </ScheduleContext.Provider>
  );
} 