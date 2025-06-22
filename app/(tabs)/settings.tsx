import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, setTheme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<any[]>([]);

  const handleEdit = () => {
    setModalTitle('Edit Profile');
    setModalOptions([
      { 
        label: 'Change Photo', 
        value: 'photo', 
        icon: 'camera-outline',
        onPress: () => console.log('Change photo pressed')
      },
      { 
        label: 'Edit Name', 
        value: 'name', 
        icon: 'person-outline',
        onPress: () => console.log('Edit name pressed')
      },
      { 
        label: 'Edit Email', 
        value: 'email', 
        icon: 'mail-outline',
        onPress: () => console.log('Edit email pressed')
      },
      { 
        label: 'Cancel', 
        value: 'cancel', 
        icon: 'close-outline' 
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
            onPress: () => console.log('Edit profile pressed')
          },
          { 
            label: 'Change Password', 
            value: 'password', 
            icon: 'lock-closed-outline',
            onPress: () => console.log('Change password pressed')
          },
          { 
            label: 'Privacy Settings', 
            value: 'privacy', 
            icon: 'shield-outline',
            onPress: () => console.log('Privacy settings pressed')
          },
          { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
        ];
        break;
      case 'Security':
        setModalTitle('Security Settings');
        options = [
          { 
            label: 'Two-Factor Authentication', 
            value: '2fa', 
            icon: 'shield-checkmark-outline',
            onPress: () => console.log('Two-factor authentication pressed')
          },
          { 
            label: 'Login History', 
            value: 'history', 
            icon: 'time-outline',
            onPress: () => console.log('Login history pressed')
          },
          { 
            label: 'Active Sessions', 
            value: 'sessions', 
            icon: 'desktop-outline',
            onPress: () => console.log('Active sessions pressed')
          },
          { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
        ];
        break;
      case 'Video':
        setModalTitle('Video Settings');
        options = [
          { 
            label: 'Camera Quality', 
            value: 'quality', 
            icon: 'videocam-outline',
            onPress: () => console.log('Camera quality pressed')
          },
          { 
            label: 'Default Camera', 
            value: 'camera', 
            icon: 'camera-outline',
            onPress: () => console.log('Default camera pressed')
          },
          { 
            label: 'Video Effects', 
            value: 'effects', 
            icon: 'sparkles-outline',
            onPress: () => console.log('Video effects pressed')
          },
          { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
        ];
        break;
      case 'Help & Support':
        setModalTitle('Help & Support');
        options = [
          { 
            label: 'FAQ', 
            value: 'faq', 
            icon: 'help-circle-outline',
            onPress: () => console.log('FAQ pressed')
          },
          { 
            label: 'Contact Support', 
            value: 'contact', 
            icon: 'chatbubble-outline',
            onPress: () => console.log('Contact support pressed')
          },
          { 
            label: 'Report Bug', 
            value: 'bug', 
            icon: 'bug-outline',
            onPress: () => console.log('Report bug pressed')
          },
          { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
        ];
        break;
      default:
        setModalTitle(label);
        options = [
          { 
            label: 'Option 1', 
            value: 'option1', 
            icon: 'checkmark-outline',
            onPress: () => console.log('Option 1 selected')
          },
          { 
            label: 'Option 2', 
            value: 'option2', 
            icon: 'checkmark-outline',
            onPress: () => console.log('Option 2 selected')
          },
          { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
        ];
    }
    
    setModalOptions(options);
    setModalVisible(true);
  };

  const handleDeleteAccount = () => {
    setModalTitle('Delete Account');
    setModalOptions([
      { 
        label: 'Delete My Account', 
        value: 'delete', 
        icon: 'trash-outline',
        destructive: true,
        onPress: () => console.log('Account deleted')
      },
      { label: 'Cancel', value: 'cancel', icon: 'close-outline' },
    ]);
    setModalVisible(true);
  };

  // Define theme colors based on isDarkTheme state
  const themeColors = {
    background: isDarkTheme ? '#0a0a0a' : '#fff',
    cardBackground: isDarkTheme ? '#1a1a1a' : '#f2f2f2',
    textPrimary: isDarkTheme ? '#fff' : '#000',
    textSecondary: isDarkTheme ? '#888' : '#555',
    borderColor: isDarkTheme ? '#222' : '#ccc',
    switchTrackOn: '#2563eb',
    switchTrackOff: isDarkTheme ? '#444' : '#ccc',
    switchThumb: '#fff',
    danger: '#ff4d4f',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={[styles.header, { color: themeColors.textPrimary }]}>Settings</Text>

      {/* Profile Section */}
      <View style={[styles.profileContainer, { backgroundColor: themeColors.cardBackground }]}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={[styles.name, { color: themeColors.textPrimary }]}>Frank</Text>
          <Text style={[styles.email, { color: themeColors.textSecondary }]}>
            frankfatawubakuwaletechijnr@gmail.com
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Account</Text>
      <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: themeColors.borderColor }]}
          onPress={() => handlePress('Personal Information')}
        >
          <Ionicons name="person-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>
              Personal Information
            </Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Update your profile details
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomColor: themeColors.borderColor }]}
          onPress={() => handlePress('Security')}
        >
          <Ionicons name="lock-closed-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>Security</Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Password and authentication
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.item, { borderBottomColor: themeColors.borderColor }]}>
          <Ionicons name="notifications-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>Notifications</Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Manage notification preferences
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
            thumbColor={themeColors.switchThumb}
          />
        </View>

        {/* Theme Switch */}
        <View style={[styles.item, { borderBottomWidth: 0 }]}>
          <Ionicons name="moon-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>Dark Theme</Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Toggle light/dark mode
            </Text>
          </View>
          <Switch
            value={isDarkTheme}
            onValueChange={() => setTheme(isDarkTheme ? 'light' : 'dark')}
            trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
            thumbColor={themeColors.switchThumb}
          />
        </View>
      </View>

      {/* Meeting Section */}
      <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Meeting</Text>
      <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: themeColors.borderColor }]}
          onPress={() => handlePress('Video')}
        >
          <Ionicons name="videocam-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>Video</Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Configure video settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Support</Text>
      <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: themeColors.borderColor }]}
          onPress={() => handlePress('Help & Support')}
        >
          <Ionicons name="help-circle-outline" size={20} color={themeColors.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>Help & Support</Text>
            <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
              Get help and support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 0 }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={themeColors.danger} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: themeColors.danger }]}>Delete Account</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ThemeAwareModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        options={modalOptions}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
  },
});
