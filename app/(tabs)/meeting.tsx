import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMeetings } from '../../components/MeetingContext';
import { useThemeContext } from '../../components/ThemeContext';

const FILTERS = ['All', 'Upcoming', 'Past'];

function isUpcoming(meeting: any) {
  return new Date(meeting.date) > new Date();
}

export default function MeetingsTab() {
  const { meetings } = useMeetings();
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Theme-aware colors
  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    cardBackground: isDarkTheme ? '#232323' : '#f8f9fa',
    searchBackground: isDarkTheme ? '#222' : '#f0f0f0',
    filterBackground: isDarkTheme ? '#222' : '#f0f0f0',
    filterActive: '#0a84ff',
    textPrimary: isDarkTheme ? '#fff' : '#000',
    textSecondary: isDarkTheme ? '#aaa' : '#666',
    textTertiary: isDarkTheme ? '#ccc' : '#888',
    borderColor: isDarkTheme ? '#333' : '#e0e0e0',
  };

  const filteredMeetings = meetings
    .filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(m => {
      if (filter === 'Upcoming') return isUpcoming(m);
      if (filter === 'Past') return !isUpcoming(m);
      return true;
    });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.meetingTabContentWrapper}>
        {/* Search Bar (now above filter bar) */}
        <View style={[styles.searchBar, { marginTop: 32, marginBottom: 8, backgroundColor: themeColors.searchBackground }]}> 
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search meetings"
            placeholderTextColor={themeColors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Bar (now below search bar) */}
        <View style={styles.filterBar}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn, 
                { backgroundColor: themeColors.filterBackground },
                filter === f && { backgroundColor: themeColors.filterActive }
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText, 
                { color: themeColors.textSecondary },
                filter === f && { color: '#fff' }
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meeting List */}
        <FlatList
          data={filteredMeetings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MeetingCard meeting={item} themeColors={themeColors} />}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No meetings found.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </View>
  );
}

function MeetingCard({ meeting, themeColors }: { meeting: any; themeColors: any }) {
  const now = new Date();
  const start = new Date(meeting.date);
  const end = new Date(start.getTime() + meeting.duration * 60000);
  const isUpcoming = start > now;
  const status = isUpcoming ? 'Upcoming' : 'Ended';

  return (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{meeting.title}</Text>
        <View style={[styles.badge, isUpcoming ? styles.badgeUpcoming : styles.badgeEnded]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>{start.toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="time" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {meeting.duration} min
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="people" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          {meeting.participants} participant{meeting.participants > 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="key" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>{meeting.id}</Text>
        <TouchableOpacity style={styles.joinBtn}>
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </View>
      {meeting.description ? (
        <Text style={[styles.desc, { color: themeColors.textTertiary }]}>{meeting.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  meetingTabContentWrapper: {
    marginTop: 32,
    alignItems: 'center',
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 10 
  },
  searchInput: { flex: 1, padding: 8 },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    marginBottom: 10,
    width: '95%',
    alignSelf: 'center',
  },
  filterBtn: { 
    paddingVertical: 6, 
    paddingHorizontal: 18, 
    borderRadius: 20 
  },
  filterText: { fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  title: { fontWeight: 'bold', fontSize: 17, flex: 1 },
  badge: { marginLeft: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeUpcoming: { backgroundColor: '#34c759' },
  badgeEnded: { backgroundColor: '#aaa' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { marginLeft: 6, fontSize: 15 },
  joinBtn: { marginLeft: 'auto', backgroundColor: '#0a84ff', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  joinText: { color: '#fff', fontWeight: 'bold' },
  desc: { marginTop: 8, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 16 },
});

