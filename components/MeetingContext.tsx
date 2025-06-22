import React, { createContext, ReactNode, useContext, useState } from 'react';

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
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeetings = () => {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error('useMeetings must be used within MeetingProvider');
  return ctx;
};

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    // Generate a random 9-digit meeting ID
    const id = Math.floor(100000000 + Math.random() * 900000000).toString();
    setMeetings(prev => [{ ...meeting, id }, ...prev]);
  };

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting }}>
      {children}
    </MeetingContext.Provider>
  );
};
