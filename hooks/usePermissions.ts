import * as Calendar from 'expo-calendar';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

export interface PermissionsState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  calendar: PermissionStatus;
  contacts: PermissionStatus;
}

export const usePermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: 'undetermined',
    microphone: 'undetermined',
    calendar: 'undetermined',
    contacts: 'undetermined',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  // Update permissions when camera/microphone permissions change
  useEffect(() => {
    if (cameraPermission) {
      setPermissions(prev => ({ 
        ...prev, 
        camera: cameraPermission.status,
        microphone: microphonePermission?.status || 'undetermined'
      }));
    }
  }, [cameraPermission, microphonePermission]);

  const checkAllPermissions = async () => {
    setIsLoading(true);
    try {
      const [calendarStatus, contactsStatus] = await Promise.all([
        Calendar.requestCalendarPermissionsAsync(),
        Contacts.requestPermissionsAsync(),
      ]);

      setPermissions(prev => ({
        ...prev,
        calendar: calendarStatus.status,
        contacts: contactsStatus.status,
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermissionHandler = async () => {
    try {
      const result = await requestCameraPermission();
      return result?.status || 'denied';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return 'denied' as PermissionStatus;
    }
  };

  const requestMicrophonePermissionHandler = async () => {
    try {
      const result = await requestMicrophonePermission();
      return result?.status || 'denied';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return 'denied' as PermissionStatus;
    }
  };

  const requestCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setPermissions(prev => ({ ...prev, calendar: status }));
      return status;
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      return 'denied' as PermissionStatus;
    }
  };

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissions(prev => ({ ...prev, contacts: status }));
      return status;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return 'denied' as PermissionStatus;
    }
  };

  const showPermissionAlert = (permissionName: string) => {
    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs ${permissionName.toLowerCase()} permission to function properly. Please enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => {
          // In a real app, you would open device settings
          console.log('Open device settings');
        }},
      ]
    );
  };

  const hasAllRequiredPermissions = () => {
    return permissions.camera === 'granted' && 
           permissions.microphone === 'granted' && 
           permissions.calendar === 'granted';
  };

  return {
    permissions,
    isLoading,
    requestCameraPermission: requestCameraPermissionHandler,
    requestMicrophonePermission: requestMicrophonePermissionHandler,
    requestCalendarPermission,
    requestContactsPermission,
    showPermissionAlert,
    hasAllRequiredPermissions,
    checkAllPermissions,
  };
}; 