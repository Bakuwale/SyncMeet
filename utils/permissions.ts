import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';

export const requestPermissions = async () => {
  try {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    return cameraStatus === 'granted' && audioStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export const checkPermissions = async () => {
  try {
    const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.getPermissionsAsync();
    return cameraStatus === 'granted' && audioStatus === 'granted';
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}; 