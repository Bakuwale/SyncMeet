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

const dummyContacts = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Zoom Bot' },
  { id: '4', name: 'Michael Techie' },
  { id: '5', name: 'Comfort Bright' },
]

const getAvatarUrl = (name) => {
  const seed = name.toLowerCase().replace(/\s+/g, '')
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

export default function ContactsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>{dummyContacts.length} contacts</Text>
        </View>

        <FlatList
          data={dummyContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
              <Image
                source={{ uri: getAvatarUrl(item.name) }}
                style={styles.avatar}
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Available</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity style={styles.addContactButton} activeOpacity={0.7}>
          <Text style={styles.addContactText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f0f',
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
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '400',
  },
  listContainer: {
    paddingBottom: 80,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
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
    borderColor: '#3399ff',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3399ff',
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
    backgroundColor: '#3399ff',
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
