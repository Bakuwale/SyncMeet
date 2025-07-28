import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Contact = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
};

type ContactContextType = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error('useContacts must be used within ContactProvider');
  return ctx;
};

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setContacts([]); // TODO: Replace with real API call
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <ContactContext.Provider value={{ contacts, loading, error }}>
      {children}
    </ContactContext.Provider>
  );
}; 