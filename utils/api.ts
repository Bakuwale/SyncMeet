import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  // User Management
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    UPDATE_PREFERENCES: '/api/user/preferences',
  },
  // Meeting Management
  MEETINGS: {
    LIST: '/api/meetings',
    CREATE: '/api/meetings',
    GET: (id: string) => `/api/meetings/${id}`,
    UPDATE: (id: string) => `/api/meetings/${id}`,
    DELETE: (id: string) => `/api/meetings/${id}`,
    JOIN: (id: string) => `/api/meetings/${id}/join`,
    LEAVE: (id: string) => `/api/meetings/${id}/leave`,
    PARTICIPANTS: (id: string) => `/api/meetings/${id}/participants`,
    RECORDING: (id: string) => `/api/meetings/${id}/recording`,
  },
  // Calendar Integration
  CALENDAR: {
    EVENTS: '/api/calendar/events',
    SYNC: '/api/calendar/sync',
    INTEGRATION: '/api/calendar/integration',
  },
  // Contacts
  CONTACTS: {
    LIST: '/api/contacts',
    CREATE: '/api/contacts',
    GET: (id: string) => `/api/contacts/${id}`,
    UPDATE: (id: string) => `/api/contacts/${id}`,
    DELETE: (id: string) => `/api/contacts/${id}`,
    SEARCH: '/api/contacts/search',
  },
  // WebSocket endpoints for real-time features
  WEBSOCKET: {
    MEETING: (meetingId: string) => `/ws/meeting/${meetingId}`,
    NOTIFICATIONS: '/ws/notifications',
    CHAT: (meetingId: string) => `/ws/chat/${meetingId}`,
  },
};

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    meetingReminders: boolean;
  };
  audio: {
    defaultMute: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
  };
  video: {
    defaultCamera: 'front' | 'back';
    defaultVideoOn: boolean;
    videoQuality: 'low' | 'medium' | 'high';
  };
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  hostId: string;
  hostName: string;
  participants: Participant[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recordingUrl?: string;
  settings: MeetingSettings;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'co-host' | 'participant';
  status: 'invited' | 'accepted' | 'declined' | 'joined' | 'left';
  joinTime?: string;
  leaveTime?: string;
}

export interface MeetingSettings {
  allowParticipantsToJoinBeforeHost: boolean;
  muteParticipantsOnEntry: boolean;
  enableWaitingRoom: boolean;
  allowScreenSharing: boolean;
  allowRecording: boolean;
  enableChat: boolean;
  enableReactions: boolean;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  // Get authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set authentication token
  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove authentication token
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Create headers for requests
  private async createHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Make HTTP request with retry logic
  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          await this.removeAuthToken();
          throw new Error('Authentication failed. Please login again.');
        }

        // Handle server errors
        if (response.status >= 500 && retryCount < this.retryAttempts) {
          console.warn(`Retrying request (${retryCount + 1}/${this.retryAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.makeRequest(url, options, retryCount + 1);
        }

        return {
          success: false,
          error: responseData.message || `HTTP ${response.status}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: responseData,
        statusCode: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders(includeAuth);
    
    return this.makeRequest<T>(url, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders(includeAuth);
    
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders(includeAuth);
    
    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders(includeAuth);
    
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders(includeAuth);
    
    return this.makeRequest<T>(url, {
      method: 'DELETE',
      headers,
    });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials, false);
    
    if (response.success && response.data) {
      await this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async signup(userData: SignupRequest): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    const response = await this.post(API_ENDPOINTS.AUTH.SIGNUP, userData, false);
    
    if (response.success && response.data) {
      await this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    await this.removeAuthToken();
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post(API_ENDPOINTS.AUTH.REFRESH, {}, false);
    
    if (response.success && response.data) {
      await this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, false);
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword }, false);
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.put<UserProfile>(API_ENDPOINTS.USER.UPDATE_PROFILE, profile);
  }

  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.get<UserPreferences>(API_ENDPOINTS.USER.PREFERENCES);
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.patch<UserPreferences>(API_ENDPOINTS.USER.UPDATE_PREFERENCES, preferences);
  }

  // Meeting methods
  async getMeetings(): Promise<ApiResponse<Meeting[]>> {
    return this.get<Meeting[]>(API_ENDPOINTS.MEETINGS.LIST);
  }

  async createMeeting(meeting: Omit<Meeting, 'id' | 'hostId' | 'hostName' | 'participants' | 'status'>): Promise<ApiResponse<Meeting>> {
    return this.post<Meeting>(API_ENDPOINTS.MEETINGS.CREATE, meeting);
  }

  async getMeeting(id: string): Promise<ApiResponse<Meeting>> {
    return this.get<Meeting>(API_ENDPOINTS.MEETINGS.GET(id));
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<ApiResponse<Meeting>> {
    return this.put<Meeting>(API_ENDPOINTS.MEETINGS.UPDATE(id), updates);
  }

  async deleteMeeting(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(API_ENDPOINTS.MEETINGS.DELETE(id));
  }

  async joinMeeting(id: string): Promise<ApiResponse<{ meetingUrl: string }>> {
    return this.post<{ meetingUrl: string }>(API_ENDPOINTS.MEETINGS.JOIN(id), {});
  }

  async leaveMeeting(id: string): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.MEETINGS.LEAVE(id), {});
  }

  async getMeetingParticipants(id: string): Promise<ApiResponse<Participant[]>> {
    return this.get<Participant[]>(API_ENDPOINTS.MEETINGS.PARTICIPANTS(id));
  }

  // Calendar methods
  async getCalendarEvents(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(API_ENDPOINTS.CALENDAR.EVENTS);
  }

  async syncCalendar(): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.CALENDAR.SYNC, {});
  }

  // Contact methods
  async getContacts(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(API_ENDPOINTS.CONTACTS.LIST);
  }

  async searchContacts(query: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`${API_ENDPOINTS.CONTACTS.SEARCH}?q=${encodeURIComponent(query)}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  // Authentication
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  signup: (userData: SignupRequest) => apiClient.signup(userData),
  logout: () => apiClient.logout(),
  refreshToken: () => apiClient.refreshToken(),
  forgotPassword: (email: string) => apiClient.forgotPassword(email),
  resetPassword: (token: string, newPassword: string) => apiClient.resetPassword(token, newPassword),

  // User
  getUserProfile: () => apiClient.getUserProfile(),
  updateUserProfile: (profile: Partial<UserProfile>) => apiClient.updateUserProfile(profile),
  getUserPreferences: () => apiClient.getUserPreferences(),
  updateUserPreferences: (preferences: Partial<UserPreferences>) => apiClient.updateUserPreferences(preferences),

  // Meetings
  getMeetings: () => apiClient.getMeetings(),
  createMeeting: (meeting: any) => apiClient.createMeeting(meeting),
  getMeeting: (id: string) => apiClient.getMeeting(id),
  updateMeeting: (id: string, updates: any) => apiClient.updateMeeting(id, updates),
  deleteMeeting: (id: string) => apiClient.deleteMeeting(id),
  joinMeeting: (id: string) => apiClient.joinMeeting(id),
  leaveMeeting: (id: string) => apiClient.leaveMeeting(id),
  getMeetingParticipants: (id: string) => apiClient.getMeetingParticipants(id),

  // Calendar
  getCalendarEvents: () => apiClient.getCalendarEvents(),
  syncCalendar: () => apiClient.syncCalendar(),

  // Contacts
  getContacts: () => apiClient.getContacts(),
  searchContacts: (query: string) => apiClient.searchContacts(query),
}; 