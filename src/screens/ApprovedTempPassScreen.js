import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const ApprovedTempPassScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentVisitorName, setCurrentVisitorName] = useState('');

  // State for temporary passes with approval status
  const [tempPasses, setTempPasses] = useState([
    {
      id: '1',
      visitorName: 'Kavita Desai',
      purpose: 'IT Support - Server Maintenance',
      date: '2026-01-26',
      day: 'Sunday',
      dateNum: '26',
      month: 'Jan',
      time: '09:00 AM',
      status: 'Pending',
      department: 'IT Department',
    },
    {
      id: '2',
      visitorName: 'Sanjay Kumar',
      purpose: 'Security Audit',
      date: '2026-01-26',
      day: 'Sunday',
      dateNum: '26',
      month: 'Jan',
      time: '10:00 AM',
      status: 'Pending',
      department: 'Security Wing',
    },
    {
      id: '3',
      visitorName: 'Meera Nair',
      purpose: 'Building Inspection',
      date: '2026-01-27',
      day: 'Monday',
      dateNum: '27',
      month: 'Jan',
      time: '08:30 AM',
      status: 'Pending',
      department: 'Infrastructure Wing',
    },
    {
      id: '4',
      visitorName: 'Rahul Mishra',
      purpose: 'Equipment Installation',
      date: '2026-01-27',
      day: 'Monday',
      dateNum: '27',
      month: 'Jan',
      time: '01:00 PM',
      status: 'Pending',
      department: 'Technical Department',
    },
    {
      id: '5',
      visitorName: 'Anita Reddy',
      purpose: 'Training Session',
      date: '2026-01-28',
      day: 'Tuesday',
      dateNum: '28',
      month: 'Jan',
      time: '10:00 AM',
      status: 'Pending',
      department: 'Training Center',
    },
    {
      id: '6',
      visitorName: 'Vijay Singh',
      purpose: 'Maintenance Work - HVAC',
      date: '2026-01-28',
      day: 'Tuesday',
      dateNum: '28',
      month: 'Jan',
      time: '07:00 AM',
      status: 'Pending',
      department: 'Maintenance Department',
    },
  ]);

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

  // Filter passes based on search query
  const filteredPasses = tempPasses.filter(pass => {
    const searchLower = searchQuery.toLowerCase().trim();
    return searchQuery === '' || 
      pass.visitorName.toLowerCase().includes(searchLower) ||
      pass.purpose.toLowerCase().includes(searchLower) ||
      pass.department.toLowerCase().includes(searchLower) ||
      pass.date.includes(searchLower);
  });

  const handleRefresh = () => {
    console.log('Refresh temporary passes');
  };

  const handleApprove = (passId, visitorName) => {
    // Show success dialog
    setCurrentVisitorName(visitorName);
    setShowSuccessDialog(true);

    // Update pass status to Approved
    setTempPasses(prevPasses =>
      prevPasses.map(pass =>
        pass.id === passId
          ? { ...pass, status: 'Approved' }
          : pass
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
            Temporary pass for {currentVisitorName} has been approved.
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

  const ApprovedPassCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.passCard}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to VisitorDetailScreen only if status is Pending
        if (item.status === 'Pending') {
          navigation.navigate('VisitorDetailScreen', { passData: item });
        } else {
          navigation.navigate('TemporaryPassDetail', { passData: item });
        }
      }}
    >
      <View style={styles.cardContent}>
        {/* Left Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dayText}>{item.day}</Text>
          <Text style={styles.dateText}>{item.dateNum}</Text>
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
            <Text style={styles.visitorName} numberOfLines={1} ellipsizeMode="tail">{item.visitorName}</Text>
          </View>

          <View style={styles.purposeRow}>
            <Icon name="text-box-outline" size={16} color="#64748B" />
            <Text style={styles.purposeText} numberOfLines={1} ellipsizeMode="tail">{item.purpose}</Text>
          </View>

          <View style={styles.departmentRow}>
            <Icon name="office-building" size={16} color="#64748B" />
            <Text style={styles.departmentText} numberOfLines={1} ellipsizeMode="tail">{item.department}</Text>
          </View>
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
          <Text style={styles.headerTitle}>Approve Temp Passes</Text>
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
            placeholder="Search temporary passes..."
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

      {/* Temporary Passes List */}
      <FlatList
        data={filteredPasses}
        renderItem={({ item }) => <ApprovedPassCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>No temporary passes found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No temporary passes available'}
            </Text>
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
  passCard: {
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
    height: 120,
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
    flex: 1,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purposeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
    numberOfLines: 1,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  departmentText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
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
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
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

export default ApprovedTempPassScreen;