import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeContext } from '../components/ThemeContext';
import { useAuth } from '../components/auth-context';

const { width } = Dimensions.get('window');

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export default function PersonalInformationScreen() {
  const { user, updateUser } = useAuth();
  const { theme } = useThemeContext();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f8fa',
    card: isDark ? '#1e1e1e' : '#fff',
    textPrimary: isDark ? '#fff' : '#222',
    textSecondary: isDark ? '#bbb' : '#666',
    border: isDark ? '#333' : '#ddd',
    divider: isDark ? '#222' : '#e0e0e0',
    icon: isDark ? '#ccc' : '#666',
    avatarBg: isDark ? '#2a2a2a' : '#eee',
    avatarText: isDark ? '#fff' : '#111',
    accent: '#007AFF',
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const initials = getInitials(fullName);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (updateUser) {
      await updateUser({ fullName, email, phone, profilePhoto });
    }
    setEditing(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: colors.textPrimary }]}>Personal Information</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <MaterialIcons name="edit" size={22} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.avatarWrapper} onPress={editing ? pickImage : undefined} activeOpacity={editing ? 0.8 : 1}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.avatarBg, justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={{ fontSize: 40, color: colors.avatarText, fontWeight: '700' }}>{initials}</Text>
              </View>
            )}
            {editing && <Text style={{ color: colors.accent, marginTop: 8 }}>Tap to change photo</Text>}
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoSection}>
            <View style={styles.card}>
              <Ionicons name="person-outline" size={20} color={colors.icon} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Full Name</Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{fullName}</Text>
                )}
              </View>
            </View>
            <View style={styles.card}>
              <Ionicons name="mail-outline" size={20} color={colors.icon} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Email</Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{email}</Text>
                )}
              </View>
            </View>
            <View style={styles.card}>
              <Ionicons name="call-outline" size={20} color={colors.icon} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Phone</Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone Number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{phone}</Text>
                )}
              </View>
            </View>
            {editing && (
              <View style={{ flexDirection: 'row', marginTop: 24 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.border, padding: 14, borderRadius: 10, alignItems: 'center', marginRight: 8 }}
                  onPress={() => setEditing(false)}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: 'bold', fontSize: 17 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginLeft: 8 }}
                  onPress={handleSave}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  avatarWrapper: {
    marginVertical: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    ...SHADOW,
  },
  divider: {
    height: 1,
    width: width * 0.9,
    marginBottom: 20,
  },
  infoSection: {
    width: width * 0.9,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...SHADOW,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 44,
    marginTop: 2,
  },
});
