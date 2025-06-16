import { Ionicons } from '@expo/vector-icons';
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

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const handleEdit = () => {
    console.log('Edit pressed');
  };

  const handlePress = (label: string) => {
    console.log(`${label} pressed`);
    Alert.alert(label, `You pressed ${label}`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
      ],
    );
  };

  // Define theme colors based on isDarkTheme state
  const theme = {
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
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={[styles.header, { color: theme.textPrimary }]}>Settings</Text>

      {/* Profile Section */}
      <View style={[styles.profileContainer, { backgroundColor: theme.cardBackground }]}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>Frank</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            frankfatawubakuwaletechijnr@gmail.com
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.borderColor }]}
          onPress={() => handlePress('Personal Information')}
        >
          <Ionicons name="person-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
              Personal Information
            </Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Update your profile details
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.borderColor }]}
          onPress={() => handlePress('Security')}
        >
          <Ionicons name="lock-closed-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>Security</Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Password and authentication
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.item, { borderBottomColor: theme.borderColor }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>Notifications</Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Manage notification preferences
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={theme.switchThumb}
          />
        </View>

        {/* Theme Switch */}
        <View style={[styles.item, { borderBottomWidth: 0 }]}>
          <Ionicons name="moon-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>Dark Theme</Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Toggle light/dark mode
            </Text>
          </View>
          <Switch
            value={isDarkTheme}
            onValueChange={() => setIsDarkTheme(!isDarkTheme)}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={theme.switchThumb}
          />
        </View>
      </View>

      {/* Meeting Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Meeting</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.borderColor }]}
          onPress={() => handlePress('Video')}
        >
          <Ionicons name="videocam-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>Video</Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Configure video settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.borderColor }]}
          onPress={() => handlePress('Help & Support')}
        >
          <Ionicons name="help-circle-outline" size={20} color={theme.textPrimary} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>Help & Support</Text>
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              Get help and support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 0 }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.danger }]}>Delete Account</Text>
          </View>
        </TouchableOpacity>
      </View>
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
