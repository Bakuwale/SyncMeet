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
  // Initialize with some sample meetings
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily team standup meeting to discuss progress and blockers',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      participants: 8,
    },
    {
      id: '2',
      title: 'Project Review',
      description: 'Weekly project review with stakeholders',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      participants: 12,
    },
    {
      id: '3',
      title: 'Client Meeting',
      description: 'Meeting with client to discuss requirements',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (past meeting)
      duration: 45,
      participants: 5,
    },
  ]);

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    // Generate a random 9-digit meeting ID
    const id = Math.floor(100000000 + Math.random() * 900000000).toString();
    setMeetings(prev => [{ ...meeting, id }, ...prev]);
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === id ? { ...meeting, ...updates } : meeting
    ));
  };

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, deleteMeeting, updateMeeting }}>
      {children}
    </MeetingContext.Provider>
  );
};
