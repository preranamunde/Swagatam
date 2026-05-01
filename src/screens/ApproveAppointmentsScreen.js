import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const ApproveAppointmentsScreen = ({ navigation }) => {
  // State for appointments with approval status
  const [appointments, setAppointments] = useState([
    {
      id: '1',
      day: 'Wednesday',
      date: '23',
      month: 'Jul',
      time: '14:00 - 16:30',
      visitorName: 'Ravi Sharma',
      location: 'Arthur Road',
      additionalParticipants: 1,
      status: 'Pending',
      // Additional fields for detail screen
      purpose: 'Business Meeting',
      department: 'Administration',
    },
    {
      id: '2',
      day: 'Wednesday',
      date: '23',
      month: 'Jul',
      time: '9:30 - 11:00',
      visitorName: 'Anand Gupta',
      location: 'Arthur Road',
      additionalParticipants: 1,
      status: 'Pending',
      purpose: 'Document Submission',
      department: 'HR Department',
    },
    {
      id: '3',
      day: 'Wednesday',
      date: '23',
      month: 'Jul',
      time: '14:00 - 16:30',
      visitorName: 'Vishal Mali',
      location: 'Arthur Road',
      additionalParticipants: 1,
      status: 'Pending',
      purpose: 'Technical Consultation',
      department: 'IT Department',
    },
    {
      id: '4',
      day: 'Wednesday',
      date: '23',
      month: 'Jul',
      time: '5:00 - 7:30',
      visitorName: 'Ravi Sharma',
      location: 'Arthur Road',
      additionalParticipants: 1,
      status: 'Pending',
      purpose: 'Project Discussion',
      department: 'Project Wing',
    },
    {
      id: '5',
      day: 'Thursday',
      date: '24',
      month: 'Jul',
      time: '10:00 - 12:00',
      visitorName: 'Priya Desai',
      location: 'Ministry Block B',
      additionalParticipants: 2,
      status: 'Pending',
      purpose: 'Vendor Meeting',
      department: 'Procurement',
    },
    {
      id: '6',
      day: 'Thursday',
      date: '24',
      month: 'Jul',
      time: '15:00 - 17:00',
      visitorName: 'Amit Patel',
      location: 'Ministry Block A',
      additionalParticipants: 0,
      status: 'Pending',
      purpose: 'Training Session',
      department: 'Training Center',
    },
  ]);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentVisitorName, setCurrentVisitorName] = useState('');

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

  const handleApprove = (appointmentId, visitorName) => {
    // Show success dialog
    setCurrentVisitorName(visitorName);
    setShowSuccessDialog(true);

    // Update appointment status to Approved
    setAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'Approved' }
          : appointment
      )
    );

    // Auto-hide dialog after 2 seconds
    setTimeout(() => {
      setShowSuccessDialog(false);
    }, 2000);
  };

  const SuccessDialog = () => (
    <Modal
      visible={showSuccessDialog}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSuccessDialog(false)}
    >
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.dialogTitle}>Approved Successfully!</Text>
          <Text style={styles.dialogMessage}>
            Appointment for {currentVisitorName} has been approved.
          </Text>
          <TouchableOpacity
            style={styles.dialogButton}
            onPress={() => setShowSuccessDialog(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.dialogButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AppointmentCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.appointmentCard} 
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to VisitorDetailScreen only if status is Pending
        if (item.status === 'Pending') {
          // Format data to match VisitorDetailScreen expected format
          const visitorData = {
            ...item,
            dateNum: item.date,
            // Convert time format if needed
            time: item.time,
          };
          navigation.navigate('VisitorDailyPassDetail', { passData: visitorData });
        } else {
          navigation.navigate('TodayAppointmentDetail', { appointment: item });
        }
      }}
    >
      <View style={styles.cardContent}>
        {/* Left Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dayText}>{item.day}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.monthText}>{item.month}</Text>
        </View>

        {/* Middle Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.timeRow}>
            <Icon name="clock-outline" size={16} color="#64748B" />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          <View style={styles.visitorRow}>
            <Icon name="account" size={16} color="#1E293B" />
            <Text style={styles.visitorName}>{item.visitorName}</Text>
          </View>

          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color="#64748B" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {item.additionalParticipants > 0 && (
            <View style={styles.participantsRow}>
              <Icon name="account-multiple" size={16} color="#64748B" />
              <Text style={styles.participantsText}>
                {item.additionalParticipants} additional participant{item.additionalParticipants > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Right Section - Approve Button or Status */}
        <View style={styles.rightSection}>
          {item.status === 'Pending' ? (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(item.id, item.visitorName)}
              activeOpacity={0.7}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
          <Feather name="chevron-right" size={24} color="#94A3B8" style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#3477eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approve Appointments</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Appointments List */}
      <FlatList
        data={appointments}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>No appointments found</Text>
          </View>
        }
      />

      {/* Success Dialog */}
      <SuccessDialog />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    minHeight: 120,
  },
  dateSection: {
    backgroundColor: '#3477eb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  contentSection: {
    flex: 1,
    padding: 12,
    gap: 6,
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 12,
  },
  approveButton: {
    backgroundColor: '#3477eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chevron: {
    marginTop: 8,
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
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ApproveAppointmentsScreen;