import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type User = {
  fullName: string;
  email: string;
  password: string; // This will store the hashed password
  phone?: string;
  profilePhoto?: string | null;
};

type AuthContextType = {
  user: User | null;
  signup: (data: User) => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (user: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  const signup = async (data: User) => {
    // Hash the password before storing
    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data.password
    );
    const userToStore = { ...data, password: passwordHash };
    setUser(userToStore);
    await AsyncStorage.setItem('user', JSON.stringify(userToStore));
    return true;
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const parsed = JSON.parse(data);
      // Hash the input password for comparison
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      if (parsed.email === email && parsed.password === passwordHash) {
        setUser(parsed);
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updated: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 