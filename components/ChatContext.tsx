import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
};

type ChatContextType = {
  messages: ChatMessage[];
  sendMessage: (msg: string) => void;
  loading: boolean;
  error: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching chat history
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setMessages([]); // TODO: Replace with real API/WebSocket fetch
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate sending a message
  const sendMessage = (msg: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You', // TODO: Replace with real user info
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    // TODO: Send message to backend/WebSocket
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loading, error }}>
      {children}
    </ChatContext.Provider>
  );
}; 