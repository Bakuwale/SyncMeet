import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  name?: string;
  profilePhoto?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasLoggedOut: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  clearLoggedOutStatus: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const USER_KEY = 'auth_user';
const LOGGED_OUT_KEY = 'has_logged_out';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Check for existing user data
        const userData = await AsyncStorage.getItem(USER_KEY);
        const loggedOutStatus = await AsyncStorage.getItem(LOGGED_OUT_KEY);
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
        
        if (loggedOutStatus) {
          setHasLoggedOut(JSON.parse(loggedOutStatus));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For demo, accept any email/password
      const userData = { email };
      setUser(userData);
      setHasLoggedOut(false);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(LOGGED_OUT_KEY, JSON.stringify(false));
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      // For demo, just log in
      const userData = { email };
      setUser(userData);
      setHasLoggedOut(false);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(LOGGED_OUT_KEY, JSON.stringify(false));
      return true;
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setHasLoggedOut(true);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.setItem(LOGGED_OUT_KEY, JSON.stringify(true));
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    // For demo, always succeed
    return true;
  };

  const clearLoggedOutStatus = async () => {
    try {
      setHasLoggedOut(false);
      await AsyncStorage.removeItem(LOGGED_OUT_KEY);
    } catch (error) {
      console.error('Error clearing logged out status:', error);
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      hasLoggedOut, 
      login, 
      signup, 
      logout, 
      resetPassword, 
      clearLoggedOutStatus,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add default export
export default AuthProvider; 