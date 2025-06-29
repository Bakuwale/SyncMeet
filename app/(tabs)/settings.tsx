import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ThemeAwareModal from '../../components/ThemeAwareModal';
import { useThemeContext } from '../../components/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../auth-context';

interface SettingItem {
  icon: string;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  showStatus?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  status?: string;
  statusColor?: string;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Audio/Video Settings
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [videoQuality, setVideoQuality] = useState('HD');
  const [audioQuality, setAudioQuality] = useState('High');
  
  // Profile data state
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    phone: string;
    profilePhoto: string | null;
  } | null>(null);
  
  const { theme, setTheme } = useThemeContext();
  const { permissions, requestCameraPermission, requestMicrophonePermission, requestCalendarPermission, requestContactsPermission, showPermissionAlert } = usePermissions();
  const { user, logout, clearLoggedOutStatus } = useAuth();
  const router = useRouter();
  const isDarkTheme = theme === 'dark';

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<any[]>([]);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  // Load profile data on focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('user_profile_data');
      if (storedProfile) {
        const data = JSON.parse(storedProfile);
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const themeColors = {
    background: isDarkTheme ? '#121212' : '#ffffff',
    cardBackground: isDarkTheme ? '#1e1e1e' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    textTertiary: isDarkTheme ? '#888888' : '#999999',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    switchTrackOn: '#007AFF',
    switchTrackOff: isDarkTheme ? '#333333' : '#e0e0e0',
    switchThumbOn: '#ffffff',
    switchThumbOff: isDarkTheme ? '#666666' : '#ffffff',
  };

  const handleEditProfile = () => {
    setModalTitle('Edit Profile');
    setModalOptions([
      { 
        label: 'Change Photo', 
        value: 'photo', 
        icon: 'camera-outline',
        onPress: () => {
          setModalVisible(false);
          router.push('/edit-profile');
        }
      },
      { 
        label: 'Edit Name', 
        value: 'name', 
        icon: 'person-outline',
        onPress: () => {
          setModalVisible(false);
          router.push('/edit-profile');
        }
      },
      { 
        label: 'Edit Email', 
        value: 'email', 
        icon: 'mail-outline',
        onPress: () => {
          setModalVisible(false);
          router.push('/edit-profile');
        }
      },
      { 
        label: 'Cancel', 
        value: 'cancel', 
        icon: 'close-outline',
        onPress: () => setModalVisible(false)
      },
    ]);
    setModalVisible(true);
  };

  const handlePress = (label: string) => {
    let options = [];
    
    switch (label) {
      case 'Personal Information':
        setModalTitle('Personal Information');
        options = [
          { 
            label: 'Edit Profile', 
            value: 'edit', 
            icon: 'person-outline',
            onPress: () => {
              setModalVisible(false);
              router.push('/edit-profile');
            }
          },
          { 
            label: 'Change Password', 
            value: 'password', 
            icon: 'lock-closed-outline',
            onPress: () => {
              setModalVisible(false);
              router.push('/change-password' as any);
            }
          },
          { 
            label: 'Privacy Settings', 
            value: 'privacy', 
            icon: 'shield-outline',
            onPress: () => {
              Alert.alert('Privacy Settings', 'Privacy settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      case 'Security':
        setModalTitle('Security Settings');
        options = [
          { 
            label: 'Two-Factor Authentication', 
            value: '2fa', 
            icon: 'shield-checkmark-outline',
            onPress: () => {
              Alert.alert('Two-Factor Authentication', '2FA setup will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Login History', 
            value: 'history', 
            icon: 'time-outline',
            onPress: () => {
              Alert.alert('Login History', 'Login history will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Active Sessions', 
            value: 'sessions', 
            icon: 'desktop-outline',
            onPress: () => {
              Alert.alert('Active Sessions', 'Active sessions will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      case 'Video':
        setModalTitle('Video Settings');
        options = [
          { 
            label: 'Camera Quality', 
            value: 'quality', 
            icon: 'videocam-outline',
            onPress: () => {
              Alert.alert('Camera Quality', 'Camera quality settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Default Camera', 
            value: 'camera', 
            icon: 'camera-outline',
            onPress: () => {
              Alert.alert('Default Camera', 'Default camera settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Video Effects', 
            value: 'effects', 
            icon: 'sparkles-outline',
            onPress: () => {
              Alert.alert('Video Effects', 'Video effects and filters will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      case 'Audio Settings':
        setModalTitle('Audio Settings');
        options = [
          { 
            label: 'Microphone Settings', 
            value: 'mic', 
            icon: 'mic-outline',
            onPress: () => {
              Alert.alert('Microphone Settings', 'Microphone settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Audio Quality', 
            value: 'quality', 
            icon: 'musical-notes-outline',
            onPress: () => {
              Alert.alert('Audio Quality', 'Audio quality settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Echo Cancellation', 
            value: 'echo', 
            icon: 'volume-high-outline',
            onPress: () => {
              Alert.alert('Echo Cancellation', 'Echo cancellation settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      case 'Screen Sharing':
        setModalTitle('Screen Sharing Settings');
        options = [
          { 
            label: 'Screen Sharing Quality', 
            value: 'quality', 
            icon: 'desktop-outline',
            onPress: () => {
              Alert.alert('Screen Sharing Quality', 'Screen sharing quality settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Permissions', 
            value: 'permissions', 
            icon: 'shield-outline',
            onPress: () => {
              Alert.alert('Screen Sharing Permissions', 'Screen sharing permissions will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      case 'Help & Support':
        setModalTitle('Help & Support');
        options = [
          { 
            label: 'FAQ', 
            value: 'faq', 
            icon: 'help-circle-outline',
            onPress: () => {
              Alert.alert('FAQ', 'Frequently asked questions will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Contact Support', 
            value: 'contact', 
            icon: 'chatbubble-outline',
            onPress: () => {
              Alert.alert('Contact Support', 'Contact support will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Report Bug', 
            value: 'bug', 
            icon: 'bug-outline',
            onPress: () => {
              Alert.alert('Report Bug', 'Bug reporting will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
        break;
      default:
        options = [
          { 
            label: 'Cancel', 
            value: 'cancel', 
            icon: 'close-outline',
            onPress: () => setModalVisible(false)
          },
        ];
    }
    
    setModalOptions(options);
    setModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data from AsyncStorage
              await AsyncStorage.removeItem('user_profile_data');
              await AsyncStorage.removeItem('auth_user');
              await AsyncStorage.removeItem('has_logged_out');
              
              // Reset profile data state
              setProfileData(null);
              
              Alert.alert(
                'Account Deleted',
                'Your account has been deleted successfully.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // The AuthProvider will handle the navigation automatically
              // through the index.tsx routing logic
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handlePermissionRequest = async (permissionType: string) => {
    try {
      let status;
      switch (permissionType) {
        case 'camera':
          status = await requestCameraPermission();
          break;
        case 'microphone':
          status = await requestMicrophonePermission();
          break;
        case 'calendar':
          status = await requestCalendarPermission();
          break;
        case 'contacts':
          status = await requestContactsPermission();
          break;
        default:
          return;
      }

      if (status === 'denied') {
        showPermissionAlert(permissionType.charAt(0).toUpperCase() + permissionType.slice(1));
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const getPermissionStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return '#34C759';
      case 'denied':
        return '#FF3B30';
      case 'restricted':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getPermissionStatusText = (status: string) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'restricted':
        return 'Restricted';
      default:
        return 'Not Determined';
    }
  };

  const handleResetAppState = () => {
    Alert.alert(
      'Reset App State',
      'This will clear your login status and show the signup screen next time you open the app. This is for testing purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await clearLoggedOutStatus();
            Alert.alert('Success', 'App state has been reset. Please restart the app to see the signup screen.');
          }
        }
      ]
    );
  };

  const handleTestAudioVideo = () => {
    Alert.alert(
      'Test Audio/Video',
      'This will test your camera and microphone settings. Make sure you have granted the necessary permissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test Camera', 
          onPress: () => {
            if (cameraEnabled) {
              Alert.alert('Camera Test', 'Camera test initiated. You should see a preview of your camera.');
            } else {
              Alert.alert('Camera Disabled', 'Please enable camera in settings to test.');
            }
          }
        },
        { 
          text: 'Test Microphone', 
          onPress: () => {
            if (microphoneEnabled) {
              Alert.alert('Microphone Test', 'Microphone test initiated. Speak to test audio levels.');
            } else {
              Alert.alert('Microphone Disabled', 'Please enable microphone in settings to test.');
            }
          }
        },
      ]
    );
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-circle-outline',
          label: 'Personal Information',
          onPress: () => handlePress('Personal Information'),
          showArrow: true,
        },
        {
          icon: 'shield-outline',
          label: 'Security',
          onPress: () => handlePress('Security'),
          showArrow: true,
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => {
            setNotificationsEnabled(!notificationsEnabled);
            Alert.alert(
              'Notifications',
              `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Meeting Reminders',
      items: [
        {
          icon: 'calendar-outline',
          label: 'Meeting Reminders',
          onPress: () => {
            setMeetingReminders(!meetingReminders);
            Alert.alert(
              'Meeting Reminders',
              `Meeting reminders ${!meetingReminders ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: meetingReminders,
          onSwitchChange: setMeetingReminders,
        },
        {
          icon: 'volume-high-outline',
          label: 'Sound',
          onPress: () => {
            setSoundEnabled(!soundEnabled);
            Alert.alert(
              'Sound',
              `Sound ${!soundEnabled ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: soundEnabled,
          onSwitchChange: setSoundEnabled,
        },
        {
          icon: 'phone-portrait-outline',
          label: 'Vibration',
          onPress: () => {
            setVibrationEnabled(!vibrationEnabled);
            Alert.alert(
              'Vibration',
              `Vibration ${!vibrationEnabled ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: vibrationEnabled,
          onSwitchChange: setVibrationEnabled,
        },
      ],
    },
    {
      title: 'Permissions',
      items: [
        {
          icon: 'camera-outline',
          label: 'Camera',
          onPress: () => handlePermissionRequest('camera'),
          showArrow: true,
          showStatus: true,
          status: getPermissionStatusText(permissions.camera),
          statusColor: getPermissionStatusColor(permissions.camera),
        },
        {
          icon: 'mic-outline',
          label: 'Microphone',
          onPress: () => handlePermissionRequest('microphone'),
          showArrow: true,
          showStatus: true,
          status: getPermissionStatusText(permissions.microphone),
          statusColor: getPermissionStatusColor(permissions.microphone),
        },
        {
          icon: 'calendar-outline',
          label: 'Calendar',
          onPress: () => handlePermissionRequest('calendar'),
          showArrow: true,
          showStatus: true,
          status: getPermissionStatusText(permissions.calendar),
          statusColor: getPermissionStatusColor(permissions.calendar),
        },
        {
          icon: 'people-outline',
          label: 'Contacts',
          onPress: () => handlePermissionRequest('contacts'),
          showArrow: true,
          showStatus: true,
          status: getPermissionStatusText(permissions.contacts),
          statusColor: getPermissionStatusColor(permissions.contacts),
        },
      ],
    },
    {
      title: 'Meeting Settings',
      items: [
        {
          icon: 'videocam-outline',
          label: 'Video',
          onPress: () => handlePress('Video'),
          showArrow: true,
        },
        {
          icon: 'mic-outline',
          label: 'Audio Settings',
          onPress: () => handlePress('Audio Settings'),
          showArrow: true,
        },
        {
          icon: 'desktop-outline',
          label: 'Screen Sharing',
          onPress: () => handlePress('Screen Sharing'),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Audio/Video Settings',
      items: [
        {
          icon: 'videocam-outline',
          label: 'Camera',
          onPress: () => {
            setCameraEnabled(!cameraEnabled);
            Alert.alert(
              'Camera',
              `Camera ${!cameraEnabled ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: cameraEnabled,
          onSwitchChange: setCameraEnabled,
        },
        {
          icon: 'mic-outline',
          label: 'Microphone',
          onPress: () => {
            setMicrophoneEnabled(!microphoneEnabled);
            Alert.alert(
              'Microphone',
              `Microphone ${!microphoneEnabled ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: microphoneEnabled,
          onSwitchChange: setMicrophoneEnabled,
        },
        {
          icon: 'volume-high-outline',
          label: 'Echo Cancellation',
          onPress: () => {
            setEchoCancellation(!echoCancellation);
            Alert.alert(
              'Echo Cancellation',
              `Echo cancellation ${!echoCancellation ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: echoCancellation,
          onSwitchChange: setEchoCancellation,
        },
        {
          icon: 'musical-notes-outline',
          label: 'Noise Suppression',
          onPress: () => {
            setNoiseSuppression(!noiseSuppression);
            Alert.alert(
              'Noise Suppression',
              `Noise suppression ${!noiseSuppression ? 'enabled' : 'disabled'}`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: noiseSuppression,
          onSwitchChange: setNoiseSuppression,
        },
        {
          icon: 'settings-outline',
          label: 'Video Quality',
          onPress: () => {
            Alert.alert(
              'Video Quality',
              'Select video quality:',
              [
                { text: 'Low (360p)', onPress: () => setVideoQuality('Low') },
                { text: 'Medium (720p)', onPress: () => setVideoQuality('Medium') },
                { text: 'High (1080p)', onPress: () => setVideoQuality('High') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
          showArrow: true,
          showStatus: true,
          status: videoQuality,
          statusColor: themeColors.accent,
        },
        {
          icon: 'musical-note-outline',
          label: 'Audio Quality',
          onPress: () => {
            Alert.alert(
              'Audio Quality',
              'Select audio quality:',
              [
                { text: 'Low', onPress: () => setAudioQuality('Low') },
                { text: 'Medium', onPress: () => setAudioQuality('Medium') },
                { text: 'High', onPress: () => setAudioQuality('High') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
          showArrow: true,
          showStatus: true,
          status: audioQuality,
          statusColor: themeColors.accent,
        },
        {
          icon: 'play-circle-outline',
          label: 'Test Audio/Video',
          onPress: handleTestAudioVideo,
          showArrow: true,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          onPress: () => {
            const newTheme = isDarkTheme ? 'light' : 'dark';
            setTheme(newTheme);
            Alert.alert(
              'Theme Changed',
              `Switched to ${newTheme} mode`,
              [{ text: 'OK' }]
            );
          },
          showSwitch: true,
          switchValue: isDarkTheme,
          onSwitchChange: (value: boolean) => setTheme(value ? 'dark' : 'light'),
        },
        {
          icon: 'language-outline',
          label: 'Language',
          onPress: () => {
            Alert.alert(
              'Language Settings',
              'Language settings will be implemented here. You can choose from English, Spanish, French, and other languages.',
              [
                { text: 'English', onPress: () => Alert.alert('Language', 'English selected') },
                { text: 'Spanish', onPress: () => Alert.alert('Language', 'Spanish selected') },
                { text: 'French', onPress: () => Alert.alert('Language', 'French selected') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
          showArrow: true,
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => handlePress('Help & Support'),
          showArrow: true,
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          onPress: () => {
            Alert.alert(
              'About SyncMeet',
              'SyncMeet v1.0.0\n\nA modern video conferencing app built with React Native and Expo.\n\nFeatures:\n• High-quality video calls\n• Screen sharing\n• Meeting scheduling\n• Calendar integration\n• Dark/Light themes',
              [{ text: 'OK' }]
            );
          },
          showArrow: true,
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          icon: 'log-out-outline',
          label: 'Sign Out',
          onPress: handleLogout,
          showArrow: false,
          destructive: true,
        },
        {
          icon: 'trash-outline',
          label: 'Delete Account',
          onPress: handleDeleteAccount,
          showArrow: false,
          destructive: true,
        },
        {
          icon: 'refresh-outline',
          label: 'Reset App State (Testing)',
          onPress: handleResetAppState,
          showArrow: false,
          destructive: false,
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: themeColors.cardBackground }]}>
        <TouchableOpacity onPress={handleEditProfile} style={styles.profileContent}>
          <Image
            source={
              profileData?.profilePhoto 
                ? { uri: profileData.profilePhoto }
                : require('../../assets/images/profile.jpg')
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: themeColors.textPrimary }]}>
              {profileData?.name || user?.name || user?.email?.split('@')[0] || 'Enter your username'}
            </Text>
            <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>
              {profileData?.email || user?.email || 'Enter your email'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Settings Summary */}
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
          Current Settings
            </Text>
        <View style={[styles.summaryContent, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Theme:</Text>
            <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
              {isDarkTheme ? 'Dark' : 'Light'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Camera:</Text>
            <Text style={[styles.summaryValue, { color: cameraEnabled ? themeColors.success : themeColors.error }]}>
              {cameraEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Microphone:</Text>
            <Text style={[styles.summaryValue, { color: microphoneEnabled ? themeColors.success : themeColors.error }]}>
              {microphoneEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Video Quality:</Text>
            <Text style={[styles.summaryValue, { color: themeColors.accent }]}>{videoQuality}</Text>
        </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Audio Quality:</Text>
            <Text style={[styles.summaryValue, { color: themeColors.accent }]}>{audioQuality}</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {section.title}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: themeColors.cardBackground }]}>
            {section.items.map((item, itemIndex) => (
        <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: themeColors.borderColor }
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.destructive ? '#FF3B30' : themeColors.textPrimary} 
                  />
                  <Text style={[
                    styles.settingLabel, 
                    { color: item.destructive ? '#FF3B30' : themeColors.textPrimary }
                  ]}>
                    {item.label}
            </Text>
      </View>

                <View style={styles.settingItemRight}>
                  {item.showStatus && (
                    <Text style={[styles.statusText, { color: item.statusColor }]}>
                      {item.status}
            </Text>
                  )}
                  
                  {item.showSwitch && (
                    <Switch
                      value={item.switchValue}
                      onValueChange={item.onSwitchChange}
                      trackColor={{ 
                        false: themeColors.switchTrackOff, 
                        true: themeColors.switchTrackOn 
                      }}
                      thumbColor={item.switchValue ? themeColors.switchThumbOn : themeColors.switchThumbOff}
                    />
                  )}
                  
                  {item.showArrow && (
                    <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                  )}
          </View>
        </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Version Info */}
      <View style={styles.versionSection}>
        <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
          SyncMeet v1.0.0
        </Text>
      </View>

      <ThemeAwareModal
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  profileSection: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    fontWeight: '400',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 14,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '400',
  },
  summarySection: {
    margin: 16,
    marginBottom: 28,
  },
  summaryContent: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
