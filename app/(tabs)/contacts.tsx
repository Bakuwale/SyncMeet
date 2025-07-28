import React from 'react'
import {
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { useThemeContext } from '../../components/ThemeContext'
import { useContacts } from '../../components/ContactContext';

// Remove dummyContacts and replace with a placeholder for real data
// Replace FlatList data={dummyContacts} with data={contacts} where contacts is fetched or provided

const getAvatarUrl = (name: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '')
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

export default function ContactsScreen() {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const { contacts, loading, error } = useContacts();

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#0f0f0f' : '#ffffff',
    cardBackground: isDarkTheme ? '#242424' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#888888' : '#666666',
    accent: '#3399ff',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Contacts</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{contacts.length} contacts</Text>
        </View>
        {loading ? (
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center', marginTop: 40 }}>Loading contacts...</Text>
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.contactCard, { backgroundColor: themeColors.cardBackground }]} activeOpacity={0.7}>
                <Image
                  source={{ uri: getAvatarUrl(item.name) }}
                  style={[styles.avatar, { borderColor: themeColors.accent }]}
                />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: themeColors.textPrimary }]}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: themeColors.accent }]}>
                    <Text style={styles.statusText}>Available</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <TouchableOpacity style={[styles.addContactButton, { backgroundColor: themeColors.accent }]} activeOpacity={0.7}>
          <Text style={styles.addContactText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  listContainer: {
    paddingBottom: 80,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  separator: {
    height: 14,
  },
  addContactButton: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3399ff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  addContactText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 36,
  },
})
