import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Participant = {
  id: string;
  name: string;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOn?: boolean;
};

type ParticipantContextType = {
  participants: Participant[];
  addParticipant: (p: Participant) => void;
  removeParticipant: (id: string) => void;
  loading: boolean;
  error: string | null;
};

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const useParticipants = () => {
  const ctx = useContext(ParticipantContext);
  if (!ctx) throw new Error('useParticipants must be used within ParticipantProvider');
  return ctx;
};

export const ParticipantProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching participants
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setParticipants([]); // TODO: Replace with real API/WebSocket fetch
      setLoading(false);
    }, 1000);
  }, []);

  const addParticipant = (p: Participant) => {
    setParticipants((prev) => [...prev, p]);
    // TODO: Notify backend/WebSocket
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    // TODO: Notify backend/WebSocket
  };

  return (
    <ParticipantContext.Provider value={{ participants, addParticipant, removeParticipant, loading, error }}>
      {children}
    </ParticipantContext.Provider>
  );
}; 