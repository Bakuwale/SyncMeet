
const AGORA_APP_ID = '4d4a26e7f612410abbb6079c8b63cd6d';
const BASE_URL = 'https://syncmeet-back.onrender.com';

class AgoraService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // expo-agora handles initialization automatically
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Agora engine:', error);
      throw error;
    }
  }

  async fetchToken(channelName: string, authToken: string): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/api/agora/token/${channelName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      return data.token || data.agoraToken;
    } catch (error) {
      console.error('Error fetching Agora token:', error);
      throw error;
    }
  }

  async joinChannel(token: string, channelName: string, uid: number = 0): Promise<number> {
    try {
      // expo-agora handles channel joining through the AgoraProvider
      console.log('Joining channel:', channelName);
      return uid;
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  async leaveChannel(): Promise<void> {
    try {
      console.log('Leaving channel');
      // expo-agora handles channel leaving through the AgoraProvider
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  async enableLocalVideo(enabled: boolean): Promise<void> {
    try {
      console.log('Toggle local video:', enabled);
      // expo-agora handles video controls through the AgoraProvider
    } catch (error) {
      console.error('Failed to toggle local video:', error);
      throw error;
    }
  }

  async muteLocalAudioStream(muted: boolean): Promise<void> {
    try {
      console.log('Toggle local audio:', muted);
      // expo-agora handles audio controls through the AgoraProvider
    } catch (error) {
      console.error('Failed to toggle local audio:', error);
      throw error;
    }
  }

  async switchCamera(): Promise<void> {
    try {
      console.log('Switching camera');
      // expo-agora handles camera switching through the AgoraProvider
    } catch (error) {
      console.error('Failed to switch camera:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.isInitialized = false;
      console.log('Agora service destroyed');
    } catch (error) {
      console.error('Failed to destroy Agora engine:', error);
      throw error;
    }
  }

  isEngineInitialized(): boolean {
    return this.isInitialized;
  }
}

export const agoraService = new AgoraService();
export default agoraService; 