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
  return (
    <ScheduleContext.Provider value={{ scheduledMeetings, setScheduledMeetings }}>
      {children}
    </ScheduleContext.Provider>
  );
} 