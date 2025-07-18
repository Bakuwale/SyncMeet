import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import Toast from 'react-native-toast-message';
import { useAuth } from '../../components/auth-context';
import ThemeAwareModal from '../../components/ThemeAwareModal';
import { useThemeContext } from '../../components/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { loadNotificationSettings, NotificationSettings } from '../../utils/notifications';

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
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    preference: 'sound',
    enabled: true,
  });
  
  const { theme, setTheme } = useThemeContext();
  const { permissions, requestCameraPermission, requestMicrophonePermission, requestCalendarPermission, requestContactsPermission, showPermissionAlert } = usePermissions();
  const { user, logout } = useAuth();
  const router = useRouter();
  const isDarkTheme = theme === 'dark';

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<any[]>([]);

  // Add modal state for theme-aware alerts
  const [alertModal, setAlertModal] = useState<{visible: boolean, title: string, message: string, options: any[]}>({visible: false, title: '', message: '', options: []});

  const showThemeAlert = (title: string, message: string, options: any[]) => {
    setAlertModal({ visible: true, title, message, options });
  };

  // Remove profile data loading from AsyncStorage

  const loadNotificationSettingsData = async () => {
    try {
      const settings = await loadNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const getCurrentReminderSummary = () => {
    if (!notificationSettings.enabled) {
      return 'Disabled';
    }
    
    switch (notificationSettings.preference) {
      case 'notification-only':
        return 'Notification Only';
      case 'sound':
        return 'Notification + Sound';
      case 'vibration':
        return 'Notification + Vibration';
      case 'sound-vibration':
        return 'Notification + Sound + Vibration';
      default:
        return 'Notification + Sound';
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

  const handlePersonalInfo = () => {
    setModalTitle('Personal Information');
    setModalOptions([
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
          setModalVisible(false);
          router.push('/privacy-settings' as any); // Use string path
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

  const handleSecurity = () => {
    setModalTitle('Security');
    setModalOptions([
      { 
        label: 'Edit Profile', 
        value: 'edit-profile', 
        icon: 'person-outline',
        onPress: () => {
          setModalVisible(false);
          router.push('/edit-profile');
        }
      },
      { 
        label: 'Change Password', 
        value: 'change-password', 
        icon: 'lock-closed-outline',
        onPress: () => {
          setModalVisible(false);
          router.push('/change-password');
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
              setModalVisible(false);
              router.push('/privacy-settings' as any);
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
        setModalTitle('Security');
        options = [
          { 
            label: 'Edit Profile', 
            value: 'edit-profile', 
            icon: 'person-outline',
            onPress: () => {
              setModalVisible(false);
              router.push('/edit-profile');
            }
          },
          { 
            label: 'Change Password', 
            value: 'change-password', 
            icon: 'lock-closed-outline',
            onPress: () => {
              setModalVisible(false);
              router.push('/change-password');
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
            icon: 'musical-note-outline',
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
            label: 'Quality Settings', 
            value: 'quality', 
            icon: 'desktop-outline',
            onPress: () => {
              Alert.alert('Screen Sharing Quality', 'Screen sharing quality settings will be implemented here');
              setModalVisible(false);
            }
          },
          { 
            label: 'Audio Sharing', 
            value: 'audio', 
            icon: 'volume-high-outline',
            onPress: () => {
              Alert.alert('Audio Sharing', 'Audio sharing settings will be implemented here');
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
        return;
    }
    
    setModalOptions(options);
    setModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    showThemeAlert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { label: 'Cancel', value: 'cancel', onPress: () => setAlertModal({ ...alertModal, visible: false }) },
        { label: 'Delete', value: 'delete', destructive: true, onPress: async () => { setAlertModal({ ...alertModal, visible: false }); try { await logout(); Alert.alert('Account Deleted', 'Your account has been deleted successfully.'); } catch (error) { Alert.alert('Error', 'Failed to delete account. Please try again.'); } } },
      ]
    );
  };

  const handlePermissionRequest = async (permissionType: string) => {
    try {
      let status: string = 'denied';
      let permissionLabel = '';
      switch (permissionType) {
        case 'camera':
          status = await requestCameraPermission();
          permissionLabel = 'Camera';
          break;
        case 'microphone':
          status = await requestMicrophonePermission();
          permissionLabel = 'Microphone';
          break;
        case 'calendar':
          status = await requestCalendarPermission();
          permissionLabel = 'Calendar';
          break;
        case 'contacts':
          status = await requestContactsPermission();
          permissionLabel = 'Contacts';
          break;
      }
      if (status !== 'granted') {
        showThemeAlert(
          `${permissionLabel} Permission Required`,
          `Please grant ${permissionLabel.toLowerCase()} permission to use this feature.`,
          [
            { label: 'OK', value: 'ok', onPress: () => setAlertModal({ ...alertModal, visible: false }) }
          ]
        );
      } else {
        showThemeAlert(
          'Permission Granted',
          `${permissionLabel} permission has been granted.`,
          [
            { label: 'OK', value: 'ok', onPress: () => setAlertModal({ ...alertModal, visible: false }) }
          ]
        );
      }
    } catch (error) {
      showThemeAlert(
        'Error',
        `Failed to request ${permissionType} permission.`,
        [
          { label: 'OK', value: 'ok', onPress: () => setAlertModal({ ...alertModal, visible: false }) }
        ]
      );
    }
  };

  const getPermissionStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return themeColors.success;
      case 'denied':
        return themeColors.error;
      case 'undetermined':
        return themeColors.warning;
      case 'restricted':
        return themeColors.warning;
      default:
        return themeColors.textSecondary;
    }
  };

  const getPermissionStatusText = (status: string) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'undetermined':
        return 'Not Set';
      case 'restricted':
        return 'Restricted';
      default:
        return 'Unknown';
    }
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

  const handleThemeToggle = async (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setTheme(newTheme as 'light' | 'dark');
    // No AsyncStorage persistence
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          onPress: () => handleThemeToggle(!isDarkTheme),
          showSwitch: true,
          switchValue: isDarkTheme,
          onSwitchChange: handleThemeToggle,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person-circle-outline',
          label: 'Personal Information',
          onPress: () => router.push('/personal-information' as any),
          showArrow: true,
        },
        {
          icon: 'shield-outline',
          label: 'Security',
          onPress: handleSecurity,
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
          icon: 'settings-outline',
          label: 'Reminder Settings',
          onPress: () => {
            router.push('/reminder-settings');
          },
          showArrow: true,
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
      title: 'Account Actions',
      items: [
        {
          icon: 'log-out-outline',
          label: 'Sign Out',
          onPress: async () => {
            await logout();
            Toast.show({ type: 'success', text1: 'Logged out', text2: 'You have been logged out.' });
            router.replace('/login');
          },
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
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.profileContent}>
          <Image
            source={
              user?.profilePhoto
                ? { uri: user.profilePhoto }
                : require('../../assets/images/profile.jpg')
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: themeColors.textPrimary }]}>
              {user?.fullName || user?.email?.split('@')[0] || 'Enter your username'}
            </Text>
            <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>
              {user?.email || 'Enter your email'}
            </Text>
          </View>
        </View>
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

      <Toast />

      <ThemeAwareModal
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        onClose={() => setModalVisible(false)}
      />

      <ThemeAwareModal
        visible={alertModal.visible}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
        title={alertModal.title}
        options={alertModal.options}
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
