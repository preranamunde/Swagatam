import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const AppointmentsScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Hardcoded sample data
  const [appointmentsData, setAppointmentsData] = useState([
    {
      id: '1',
      visitorName: 'Rajesh Kumar',
      purpose: 'Meeting with Joint Secretary',
      date: '2026-01-27',
      time: '10:30 AM',
      status: 'Pending',
      department: 'Ministry Block A',
    },
    {
      id: '2',
      visitorName: 'Priya Sharma',
      purpose: 'Document Submission',
      date: '2026-01-27',
      time: '02:00 PM',
      status: 'Pending',
      department: 'Ministry Block B',
    },
    {
      id: '3',
      visitorName: 'Amit Patel',
      purpose: 'Project Discussion',
      date: '2026-01-26',
      time: '11:00 AM',
      status: 'Approved',
      department: 'Ministry Block C',
    },
    {
      id: '4',
      visitorName: 'Sunita Verma',
      purpose: 'Consultation Meeting',
      date: '2026-01-26',
      time: '03:30 PM',
      status: 'Approved',
      department: 'Ministry Block A',
    },
    {
      id: '5',
      visitorName: 'Vikram Singh',
      purpose: 'Contract Review',
      date: '2026-01-25',
      time: '09:00 AM',
      status: 'Rejected',
      department: 'Ministry Block D',
    },
    {
      id: '6',
      visitorName: 'Neha Gupta',
      purpose: 'Budget Proposal',
      date: '2026-01-25',
      time: '04:00 PM',
      status: 'Rejected',
      department: 'Ministry Block B',
    },
  ]);

  // Listen for updates from VisitorDetailScreen
  useEffect(() => {
    if (route.params?.updatedPass) {
      const updatedPass = route.params.updatedPass;
      setAppointmentsData(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === updatedPass.id
            ? { ...appointment, status: updatedPass.status }
            : appointment
        )
      );
      // Clear the param to avoid re-triggering
      navigation.setParams({ updatedPass: undefined });
    }
  }, [route.params?.updatedPass]);

  // Filter appointments based on search query only
  const filteredAppointments = appointmentsData.filter(apt => {
    const searchLower = searchQuery.toLowerCase().trim();
    return searchQuery === '' || 
      apt.visitorName.toLowerCase().includes(searchLower) ||
      apt.purpose.toLowerCase().includes(searchLower) ||
      apt.status.toLowerCase().includes(searchLower) ||
      apt.department.toLowerCase().includes(searchLower) ||
      apt.date.includes(searchLower);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const handleRefresh = () => {
    console.log('Refresh appointments');
  };

  const AppointmentCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.appointmentCard}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate based on status
        if (item.status === 'Approved') {
          // Approved appointments go to TodayAppointmentDetail
          navigation.navigate('TodayAppointmentDetail', { appointment: item });
        } else {
          // Pending and Rejected appointments go to VisitorDetailScreen
          // Format data to match VisitorDetailScreen expected format
          const dateObj = new Date(item.date);
          const visitorData = {
            ...item,
            day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
            dateNum: dateObj.getDate().toString(),
            month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
            visitorName: item.visitorName,
            department: item.department,
            purpose: item.purpose,
            time: item.time,
            status: item.status,
          };
          navigation.navigate('VisitorDailyPassDetail', { passData: visitorData });
        }
      }}
    >
      {/* Status Badge - Top Right Corner */}
      <View style={[styles.statusBadgeCorner, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusTextCorner}>{item.status}</Text>
      </View>

      <View style={styles.cardContentWrapper}>
        {/* Left Content */}
        <View style={styles.cardLeftContent}>
          <View style={styles.dateTimeRow}>
            <Icon name="calendar" size={14} color="#64748B" />
            <Text style={styles.cardDate}>{item.date}</Text>
            <View style={styles.cardTimeDot} />
            <Icon name="clock-outline" size={14} color="#64748B" />
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>

          <View style={styles.visitorRow}>
            <Icon name="account" size={16} color="#3477eb" />
            <Text style={styles.visitorName}>{item.visitorName}</Text>
          </View>
          
          <View style={styles.purposeRow}>
            <Icon name="text-box-outline" size={14} color="#64748B" />
            <Text style={styles.purposeText}>{item.purpose}</Text>
          </View>

          <View style={styles.departmentRow}>
            <Icon name="office-building" size={14} color="#64748B" />
            <Text style={styles.departmentText}>{item.department}</Text>
          </View>
        </View>

        {/* Right Chevron - Vertically Centered */}
        <View style={styles.chevronContainer}>
          <Feather name="chevron-right" size={24} color="#3477eb" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#5a94f5']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, purpose, status, date..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No appointments available'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#3477eb',
    fontWeight: '500',
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#3477eb',
    position: 'relative',
  },
  statusBadgeCorner: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 10,
  },
  statusTextCorner: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeftContent: {
    flex: 1,
    gap: 6,
    paddingRight: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardTimeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  cardTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3477eb',
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  purposeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  departmentText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
  },
});

export default AppointmentsScreen;