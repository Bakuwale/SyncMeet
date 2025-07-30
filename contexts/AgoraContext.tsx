import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../components/auth-context';
import { agoraService } from '../lib/agora';
import { requestPermissions } from '../utils/permissions';

interface AgoraContextType {
  // State
  isInCall: boolean;
  channelName: string | null;
  token: string | null;
  participants: Participant[];
  localVideoEnabled: boolean;
  localAudioEnabled: boolean;
  
  // Actions
  joinMeeting: (meetingId: string) => Promise<boolean>;
  leaveMeeting: () => Promise<void>;
  toggleLocalVideo: () => Promise<void>;
  toggleLocalAudio: () => Promise<void>;
  switchCamera: () => Promise<void>;
  
  // Loading states
  joining: boolean;
  leaving: boolean;
}

interface Participant {
  uid: number;
  username: string;
  isLocal: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

const AgoraContext = createContext<AgoraContextType | undefined>(undefined);

export const useAgora = () => {
  const context = useContext(AgoraContext);
  if (!context) {
    throw new Error('useAgora must be used within an AgoraProvider');
  }
  return context;
};

interface AgoraProviderProps {
  children: ReactNode;
}

export const AgoraProvider: React.FC<AgoraProviderProps> = ({ children }) => {
  const { user, getToken } = useAuth();
  
  // State
  const [isInCall, setIsInCall] = useState(false);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  
  // Loading states
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Safety check for user
  const safeUser = user || { email: 'unknown', fullName: 'Unknown User' };

  // Join meeting
  const joinMeeting = async (meetingId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a meeting');
      return false;
    }

    setJoining(true);
    
    try {
      // Step 1: Check permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert("Permissions Required", "Please allow camera and microphone access to join the call.");
        return false;
      }

      // Step 2: Initialize Agora engine
      await agoraService.initialize();

      // Step 3: Join meeting via backend
      const authToken = await getToken();
      const joinResponse = await fetch(`https://syncmeet-back.onrender.com/api/meetings/join/${meetingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!joinResponse.ok) {
        throw new Error(`Failed to join meeting: ${joinResponse.status}`);
      }

      const joinData = await joinResponse.json();
      const channelName = joinData.channelName || meetingId;

      // Step 4: Fetch Agora token
      const agoraToken = await agoraService.fetchToken(channelName, authToken);

      // Step 5: Join Agora channel
      await agoraService.joinChannel(agoraToken, channelName);

      // Step 6: Update state
      setChannelName(channelName);
      setToken(agoraToken);
      setIsInCall(true);
      
      // Step 7: Add local participant
      const localParticipant: Participant = {
        uid: 0,
        username: safeUser.fullName || safeUser.email,
        isLocal: true,
        videoEnabled: localVideoEnabled,
        audioEnabled: localAudioEnabled,
      };
      
      setParticipants([localParticipant]);

      return true;
    } catch (error) {
      console.error('Error joining meeting:', error);
      Alert.alert('Error', 'Failed to join meeting. Please try again.');
      return false;
    } finally {
      setJoining(false);
    }
  };

  // Leave meeting
  const leaveMeeting = async (): Promise<void> => {
    if (!channelName) return;

    setLeaving(true);
    
    try {
      // Leave Agora channel
      await agoraService.leaveChannel();

      // Leave via backend
      const authToken = await getToken();
      await fetch(`https://syncmeet-back.onrender.com/api/meetings/leave/${channelName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error leaving meeting:', error);
    } finally {
      // Reset state
      setIsInCall(false);
      setChannelName(null);
      setToken(null);
      setParticipants([]);
      setLeaving(false);
    }
  };

  // Toggle local video
  const toggleLocalVideo = async (): Promise<void> => {
    try {
      const newState = !localVideoEnabled;
      setLocalVideoEnabled(newState);
      
      // Update Agora engine
      await agoraService.enableLocalVideo(newState);
      
      // Update local participant
      setParticipants(prev => 
        prev.map(p => 
          p.isLocal ? { ...p, videoEnabled: newState } : p
        )
      );
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Toggle local audio
  const toggleLocalAudio = async (): Promise<void> => {
    try {
      const newState = !localAudioEnabled;
      setLocalAudioEnabled(newState);
      
      // Update Agora engine
      await agoraService.muteLocalAudioStream(newState);
      
      // Update local participant
      setParticipants(prev => 
        prev.map(p => 
          p.isLocal ? { ...p, audioEnabled: newState } : p
        )
      );
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  // Switch camera
  const switchCamera = async (): Promise<void> => {
    try {
      await agoraService.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInCall) {
        leaveMeeting();
      }
    };
  }, []);

  const value: AgoraContextType = {
    // State
    isInCall,
    channelName,
    token,
    participants,
    localVideoEnabled,
    localAudioEnabled,
    
    // Actions
    joinMeeting,
    leaveMeeting,
    toggleLocalVideo,
    toggleLocalAudio,
    switchCamera,
    
    // Loading states
    joining,
    leaving,
  };

  return (
    <AgoraContext.Provider value={value}>
      {children}
    </AgoraContext.Provider>
  );
}; 