import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type User = {
  email: string;
  token: string;
  fullName?: string;
  profilePhoto?: string | null;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  signup: (data: { fullName: string; email: string; password: string; profilePhoto?: string | null }) => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (user: Partial<User>) => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

const API_URL = 'http://localhost:8080'; // Change to your backend URL if needed

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const email = await AsyncStorage.getItem('email');
      const fullName = await AsyncStorage.getItem('fullName');
      const profilePhoto = await AsyncStorage.getItem('profilePhoto');
      const phone = await AsyncStorage.getItem('phone');
      if (token && email) {
        setUser({ email, token, fullName: fullName || undefined, profilePhoto: profilePhoto || undefined, phone: phone || undefined });
      }
      setLoading(false);
    })();
  }, []);

  const signup = async (data: { fullName: string; email: string; password: string; profilePhoto?: string | null }) => {
    try {
      const res = await fetch(`${API_URL}/req/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.email, // backend expects username
          email: data.email,
          password: data.password,
        }),
      });
      if (!res.ok) throw new Error('Signup failed');
      const result = await res.json();
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('email', data.email);
      await AsyncStorage.setItem('fullName', data.fullName || '');
      await AsyncStorage.setItem('profilePhoto', data.profilePhoto || '');
      setUser({ email: data.email, token: result.token, fullName: data.fullName, profilePhoto: data.profilePhoto });
      return true;
    } catch (e) {
      return false;
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await fetch(`${API_URL}/req/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const result = await res.json();
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('email', email);
      setUser({ email, token: result.token });
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('fullName');
    await AsyncStorage.removeItem('profilePhoto');
    await AsyncStorage.removeItem('phone');
  };

  const updateUser = async (updated: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    if (updated.fullName !== undefined) await AsyncStorage.setItem('fullName', updated.fullName || '');
    if (updated.profilePhoto !== undefined) await AsyncStorage.setItem('profilePhoto', updated.profilePhoto || '');
    if (updated.phone !== undefined) await AsyncStorage.setItem('phone', updated.phone || '');
  };

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading, updateUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}; 