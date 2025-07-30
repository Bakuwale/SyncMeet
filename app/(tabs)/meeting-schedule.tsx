import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../components/auth-context';
import { useMeetings } from '../../components/MeetingContext';

interface ScheduledMeeting {
  id: string;
  title: string;
  date: Date;
  duration: number;
  description?: string;
  participants: number;
}

type FilterType = 'all' | 'upcoming' | 'past';

export default function MeetingScheduleScreen() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const { meetings, loading: meetingsLoading } = useMeetings();
  const [filteredMeetings, setFilteredMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (!meetingsLoading) {
      setLoading(false);
      filterMeetings();
    }
  }, [meetings, meetingsLoading]);

  useEffect(() => {
    console.log('MeetingScheduleScreen: Current meetings:', meetings);
    filterMeetings();
  }, [meetings, searchQuery, activeFilter]);

  const filterMeetings = () => {
    console.log('Filtering meetings:', { meetings, searchQuery, activeFilter });
    let filtered = [...meetings];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        meeting.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    const now = new Date();
    switch (activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(meeting => {
          return meeting.date > now;
        });
        break;
      case 'past':
        filtered = filtered.filter(meeting => {
          return meeting.date < now;
        });
        break;
      case 'all':
      default:
        // Show all meetings
        break;
    }

    console.log('Filtered meetings:', filtered);
    setFilteredMeetings(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh meetings
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleJoinMeeting = (meeting: ScheduledMeeting) => {
    const now = new Date();
    if (meeting.date < now) {
      Alert.alert('Meeting Expired', 'This meeting has already ended.');
      return;
    }

    router.push({
      pathname: '/video-call',
      params: { meetingId: meeting.id }
    });
  };

  const handleEditMeeting = (meeting: ScheduledMeeting) => {
    router.push({
      pathname: '/edit-meeting',
      params: { id: meeting.id }
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getMeetingStatus = (date: Date) => {
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (date < now) {
      return { status: 'past', color: '#8E8E93', text: 'PAST' };
    } else if (hoursDiff <= 1) {
      return { status: 'starting', color: '#FF9500', text: 'STARTING SOON' };
    } else if (hoursDiff <= 24) {
      return { status: 'today', color: '#34C759', text: 'TODAY' };
    } else {
      return { status: 'upcoming', color: '#007AFF', text: 'UPCOMING' };
    }
  };

  const renderMeetingCard = ({ item }: { item: ScheduledMeeting }) => {
    const status = getMeetingStatus(item.date);
    const isPast = item.date < new Date();

    return (
      <TouchableOpacity
        style={styles.meetingCard}
        onPress={() => handleJoinMeeting(item)}
        disabled={isPast}
      >
        <View style={styles.cardHeader}>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>
          
          {!isPast && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditMeeting(item)}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {item.description && (
          <Text style={styles.meetingDescription}>{item.description}</Text>
        )}

        <View style={styles.meetingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.detailText}>
              {formatDateTime(item.date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={16} color="#999" />
            <Text style={styles.detailText}>
              Duration: {formatDuration(item.duration)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="key-outline" size={16} color="#999" />
            <Text style={styles.detailText}>
              Meeting ID: {item.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#999" />
            <Text style={styles.detailText}>
              Participants: {item.participants}
            </Text>
          </View>
        </View>

        {!isPast && (
          <View style={styles.joinButton}>
            <Ionicons name="videocam" size={20} color="#007AFF" />
            <Text style={styles.joinButtonText}>
              {status.status === 'starting' ? 'Join Now' : 'Join Meeting'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No meetings found.</Text>
      <Text style={styles.emptyStateSubtext}>
        {activeFilter === 'upcoming' 
          ? 'No upcoming meetings scheduled.' 
          : activeFilter === 'past' 
          ? 'No past meetings found.' 
          : 'No meetings found. Schedule a meeting to get started.'}
      </Text>
    </View>
  );

  const FilterButton = ({ title, filter, isActive }: { title: string; filter: FilterType; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading meetings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetings"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" filter="all" isActive={activeFilter === 'all'} />
        <FilterButton title="Upcoming" filter="upcoming" isActive={activeFilter === 'upcoming'} />
        <FilterButton title="Past" filter="past" isActive={activeFilter === 'past'} />
      </View>

      {/* Meetings List */}
      <FlatList
        data={filteredMeetings}
        renderItem={renderMeetingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  meetingCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetingInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  editButton: {
    padding: 8,
  },
  meetingDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  meetingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
    flex: 1,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
}); 