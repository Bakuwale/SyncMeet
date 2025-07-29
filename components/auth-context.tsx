import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type User = {
  email: string;
  token: string;
  refreshToken?: string;
  fullName?: string;
  profilePhoto?: string | null;
  phone?: string;
  // Allow for additional properties from the backend
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  signup: (data: { 
    fullName: string; 
    email: string; 
    password: string; 
    profilePhoto?: string | null;
    accessToken?: string;
    refreshToken?: string;
    user?: any;
  }) => Promise<boolean>;
  login: (data: { 
    email: string; 
    password: string;
    accessToken?: string;
    refreshToken?: string;
    user?: any;
    expiresIn?: number | string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (user: Partial<User>) => Promise<void>;
  getToken: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

const API_URL = 'https://syncmeet-back.onrender.com';

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

  const signup = async (data: { fullName: string; email: string; password: string; profilePhoto?: string | null; accessToken?: string; refreshToken?: string; user?: any }) => {
    try {
      // If we already have tokens from the API service, use them directly
      if (data.accessToken) {
        // Store both access token and refresh token if available
        await AsyncStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
        }
        
        await AsyncStorage.setItem('email', data.email);
        await AsyncStorage.setItem('fullName', data.fullName || '');
        await AsyncStorage.setItem('profilePhoto', data.profilePhoto || '');
        
        // Store additional user data if available
        if (data.user) {
          if (data.user.phone) {
            await AsyncStorage.setItem('phone', data.user.phone);
          }
          // Store any other user data as needed
        }
        
        // Set user state with the access token
        setUser({ 
          email: data.email, 
          token: data.accessToken, 
          fullName: data.fullName, 
          profilePhoto: data.profilePhoto,
          phone: data.user?.phone
        });
        return true;
      }
      
      // Otherwise make the API call
      // Use a timeout promise to handle network timeouts
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup request timeout')), 30000);
      });
      
      const fetchPromise = fetch(`${API_URL}/req/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.email, // backend expects username
          email: data.email,
          name: data.fullName, // backend expects name
          password: data.password,
        }),
      });
      
      // Race the fetch against the timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      if (!res.ok) throw new Error('Signup failed');
      const result = await res.json();
      
      // Prioritize accessToken or fall back to token
      const token = result.accessToken || result.token;
      if (!token) throw new Error('No token received from server');
      
      // Store tokens
      await AsyncStorage.setItem('token', token);
      if (result.refreshToken) {
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
      }
      
      await AsyncStorage.setItem('email', data.email);
      await AsyncStorage.setItem('fullName', data.fullName || '');
      await AsyncStorage.setItem('profilePhoto', data.profilePhoto || '');
      
      setUser({ email: data.email, token: token, fullName: data.fullName, profilePhoto: data.profilePhoto });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  };

  const login = async ({ 
    email, 
    password, 
    accessToken, 
    refreshToken, 
    user: userData, 
    expiresIn 
  }: { 
    email: string; 
    password: string; 
    accessToken?: string; 
    refreshToken?: string; 
    user?: any; 
    expiresIn?: number | string; 
  }) => {
    try {
      // If we already have tokens from the API service, use them directly
      if (accessToken) {
        console.log("Using pre-provided tokens from API service");
        
        // Store tokens
        await AsyncStorage.setItem('token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }
        
        // Store user data
        await AsyncStorage.setItem('email', email);
        
        // Store additional user data if available
        if (userData) {
          if (userData.fullName) {
            await AsyncStorage.setItem('fullName', userData.fullName);
          }
          if (userData.profilePhoto) {
            await AsyncStorage.setItem('profilePhoto', userData.profilePhoto);
          }
          if (userData.phone) {
            await AsyncStorage.setItem('phone', userData.phone);
          }
        }
        
        // Set user state
        setUser({ 
          email, 
          token: accessToken, 
          refreshToken,
          fullName: userData?.fullName,
          profilePhoto: userData?.profilePhoto,
          phone: userData?.phone
        });
        return true;
      }
      
      // If no tokens provided, make our own API call
      console.log("No tokens provided, making API call");
      
      // Use a timeout promise to handle network timeouts
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timeout')), 30000);
      });
      
      const fetchPromise = fetch(`${API_URL}/req/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      
      // Race the fetch against the timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      if (!res.ok) throw new Error('Login failed');
      const result = await res.json();
      
      // Prioritize accessToken or fall back to token
      const token = result.accessToken || result.token;
      if (!token) throw new Error('No token received from server');
      
      // Store tokens
      await AsyncStorage.setItem('token', token);
      if (result.refreshToken) {
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
      }
      
      // Store user data
      await AsyncStorage.setItem('email', email);
      
      // Store additional user data if available
      if (result.user) {
        if (result.user.fullName) {
          await AsyncStorage.setItem('fullName', result.user.fullName);
        }
        if (result.user.profilePhoto) {
          await AsyncStorage.setItem('profilePhoto', result.user.profilePhoto);
        }
        if (result.user.phone) {
          await AsyncStorage.setItem('phone', result.user.phone);
        }
      }
      
      // Set user state
      setUser({ 
        email, 
        token, 
        refreshToken: result.refreshToken,
        fullName: result.user?.fullName,
        profilePhoto: result.user?.profilePhoto,
        phone: result.user?.phone
      });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    
    // Handle profile photo upload separately if it exists and is a local URI
    if (updated.profilePhoto && updated.profilePhoto.startsWith('file://')) {
      try {
        // Import the file upload service dynamically to avoid circular dependencies
        const { uploadProfilePhoto } = await import('../utils/fileUploadService');
        
        // Upload the profile photo using the dedicated service
        const photoResponse = await uploadProfilePhoto(
          updated.profilePhoto,
          'image/jpeg',
          '/req/user/profile-photo',
          { email: user.email }
        );
        if (photoResponse && photoResponse.photoUrl) {
          // Update the profile photo with the returned URL
          updated.profilePhoto = photoResponse.photoUrl;
        }
      } catch (error) {
        console.error('Error uploading profile photo:', error);
        // Continue with user update even if photo upload fails
      }
    }
    
    // Update the user state and AsyncStorage
    const newUser = { ...user, ...updated };
    setUser(newUser);
    if (updated.fullName !== undefined) await AsyncStorage.setItem('fullName', updated.fullName || '');
    if (updated.profilePhoto !== undefined) await AsyncStorage.setItem('profilePhoto', updated.profilePhoto || '');
    if (updated.phone !== undefined) await AsyncStorage.setItem('phone', updated.phone || '');
  };

  const resetPassword = async (email: string) => {
  try {
    // Use a timeout promise to handle network timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Reset password request timeout')), 30000);
    });
    
    const fetchPromise = fetch(`${API_URL}/req/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    // Race the fetch against the timeout
    const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    if (!res.ok) throw new Error('Reset password request failed');
    return true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};


  const getToken = async () => {
    // First try to get the access token
    const accessToken = await AsyncStorage.getItem('token');
    if (accessToken) {
      return accessToken;
    }
    
    // If no access token, check for refresh token
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (refreshToken) {
      console.warn('Using refresh token instead of access token. Token refresh flow should be implemented.');
      // In a complete implementation, you would use the refresh token to get a new access token
      // For now, just return the refresh token as a fallback
      return refreshToken;
    }
    
    // No tokens available
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading, updateUser, getToken, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};