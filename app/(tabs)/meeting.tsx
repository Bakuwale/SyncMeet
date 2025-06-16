import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function MeetingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meetings</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#aaa" />
        <TextInput
          placeholder="Search meetings..."
          placeholderTextColor="#777"
          style={styles.searchInput}
        />
        <Ionicons name="add-circle" size={28} color="#0A84FF" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['All', 'Upcoming', 'Past', 'Recurring'].map((tab, index) => (
          <TouchableOpacity key={index}>
            <Text style={[styles.tabText, index === 0 && styles.activeTab]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable Meeting List */}
      <ScrollView style={{ flex: 1 }}>
        <MeetingCard
          title="Weekly Team Standup"
          date="Fri, May 16"
          time="7:35 AM • 30 min"
          participants="2 participants"
          id="ABC123"
          status="Ended"
          statusColor="#666"
        />
        <MeetingCard
          title="Product Demo"
          date="Sat, May 17"
          time="6:35 AM • 60 min"
          participants="1 participant"
          id="XYZ789"
          status="Upcoming"
          statusColor="#0A84FF"
        />
      </ScrollView>
    </View>
  )
}

function MeetingCard({ title, date, time, participants, id, status, statusColor }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <Text style={styles.cardDetail}><Ionicons name="calendar-outline" /> {date}</Text>
      <Text style={styles.cardDetail}><Ionicons name="time-outline" /> {time}</Text>
      <Text style={styles.cardDetail}><Ionicons name="people-outline" /> {participants}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.meetingId}>Meeting ID: {id}</Text>
        <TouchableOpacity>
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabText: {
    fontSize: 14,
    color: '#aaa',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
    color: '#0A84FF',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetail: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  meetingId: {
    fontSize: 13,
    fontWeight: '500',
    color: '#bbb',
  },
  joinText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
})
