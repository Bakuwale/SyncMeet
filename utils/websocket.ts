import { API_CONFIG, API_ENDPOINTS } from './api';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  senderId?: string;
  senderName?: string;
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface ParticipantUpdate {
  participantId: string;
  meetingId: string;
  action: 'joined' | 'left' | 'muted' | 'unmuted' | 'video_on' | 'video_off';
  timestamp: string;
}

export interface MeetingNotification {
  id: string;
  type: 'meeting_start' | 'meeting_end' | 'participant_joined' | 'participant_left' | 'chat_message' | 'recording_started' | 'recording_stopped';
  meetingId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface WebSocketHandlers {
  onMessage?: (message: WebSocketMessage) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onParticipantUpdate?: (update: ParticipantUpdate) => void;
  onNotification?: (notification: MeetingNotification) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private handlers: Map<string, WebSocketHandlers> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Connect to a specific WebSocket endpoint
  async connect(endpoint: string, handlers: WebSocketHandlers): Promise<boolean> {
    try {
      const wsUrl = `${API_CONFIG.BASE_URL.replace('http', 'ws')}${endpoint}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected to ${endpoint}`);
        this.reconnectAttempts.set(endpoint, 0);
        this.handlers.set(endpoint, handlers);
        handlers.onConnectionChange?.(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(endpoint, message, handlers);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected from ${endpoint}:`, event.code, event.reason);
        handlers.onConnectionChange?.(false);
        this.attemptReconnect(endpoint, handlers);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${endpoint}:`, error);
        handlers.onError?.(`WebSocket error: ${error}`);
      };

      this.connections.set(endpoint, ws);
      return true;
    } catch (error) {
      console.error(`Failed to connect to WebSocket ${endpoint}:`, error);
      handlers.onError?.(`Failed to connect: ${error}`);
      return false;
    }
  }

  // Disconnect from a specific endpoint
  disconnect(endpoint: string): void {
    const ws = this.connections.get(endpoint);
    if (ws) {
      ws.close();
      this.connections.delete(endpoint);
      this.handlers.delete(endpoint);
      this.reconnectAttempts.delete(endpoint);
    }
  }

  // Disconnect from all endpoints
  disconnectAll(): void {
    this.connections.forEach((ws, endpoint) => {
      ws.close();
    });
    this.connections.clear();
    this.handlers.clear();
    this.reconnectAttempts.clear();
  }

  // Send message to a specific endpoint
  send(endpoint: string, message: WebSocketMessage): boolean {
    const ws = this.connections.get(endpoint);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Check if connected to a specific endpoint
  isConnected(endpoint: string): boolean {
    const ws = this.connections.get(endpoint);
    return ws ? ws.readyState === WebSocket.OPEN : false;
  }

  // Get connection status for all endpoints
  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.connections.forEach((ws, endpoint) => {
      status[endpoint] = ws.readyState === WebSocket.OPEN;
    });
    return status;
  }

  // Handle incoming messages
  private handleMessage(endpoint: string, message: WebSocketMessage, handlers: WebSocketHandlers): void {
    handlers.onMessage?.(message);

    switch (message.type) {
      case 'chat_message':
        handlers.onChatMessage?.(message.data as ChatMessage);
        break;
      case 'participant_update':
        handlers.onParticipantUpdate?.(message.data as ParticipantUpdate);
        break;
      case 'notification':
        handlers.onNotification?.(message.data as MeetingNotification);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  // Attempt to reconnect to a disconnected endpoint
  private attemptReconnect(endpoint: string, handlers: WebSocketHandlers): void {
    const attempts = this.reconnectAttempts.get(endpoint) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(endpoint, attempts + 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect to ${endpoint} (attempt ${attempts + 1})`);
        this.connect(endpoint, handlers);
      }, this.reconnectDelay * (attempts + 1));
    } else {
      console.error(`Max reconnection attempts reached for ${endpoint}`);
      handlers.onError?.(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
    }
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

// Convenience functions for specific WebSocket connections
export const websocket = {
  // Connect to meeting WebSocket
  connectToMeeting: (meetingId: string, handlers: WebSocketHandlers) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.MEETING(meetingId);
    return wsManager.connect(endpoint, handlers);
  },

  // Connect to notifications WebSocket
  connectToNotifications: (handlers: WebSocketHandlers) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.NOTIFICATIONS;
    return wsManager.connect(endpoint, handlers);
  },

  // Connect to chat WebSocket
  connectToChat: (meetingId: string, handlers: WebSocketHandlers) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.CHAT(meetingId);
    return wsManager.connect(endpoint, handlers);
  },

  // Send chat message
  sendChatMessage: (meetingId: string, message: string, senderId: string, senderName: string) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.CHAT(meetingId);
    const wsMessage: WebSocketMessage = {
      type: 'chat_message',
      data: {
        meetingId,
        message,
        senderId,
        senderName,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    return wsManager.send(endpoint, wsMessage);
  },

  // Send participant update
  sendParticipantUpdate: (meetingId: string, action: ParticipantUpdate['action'], participantId: string) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.MEETING(meetingId);
    const wsMessage: WebSocketMessage = {
      type: 'participant_update',
      data: {
        meetingId,
        participantId,
        action,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    return wsManager.send(endpoint, wsMessage);
  },

  // Disconnect from meeting
  disconnectFromMeeting: (meetingId: string) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.MEETING(meetingId);
    wsManager.disconnect(endpoint);
  },

  // Disconnect from notifications
  disconnectFromNotifications: () => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.NOTIFICATIONS;
    wsManager.disconnect(endpoint);
  },

  // Disconnect from chat
  disconnectFromChat: (meetingId: string) => {
    const endpoint = API_ENDPOINTS.WEBSOCKET.CHAT(meetingId);
    wsManager.disconnect(endpoint);
  },

  // Check connection status
  isConnected: (endpoint: string) => wsManager.isConnected(endpoint),
  getConnectionStatus: () => wsManager.getConnectionStatus(),
  disconnectAll: () => wsManager.disconnectAll(),
}; 