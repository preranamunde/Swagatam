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

const VisitorTemporaryPassScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Hardcoded sample data for temporary passes
  const [temporaryPassData, setTemporaryPassData] = useState([
    {
      id: '1',
      visitorName: 'Anil Mehta',
      vendorName: 'ElectroPro Services',
      purpose: 'Contractor Work - Electrical',
      date: '2026-01-27',
      from: '08:00 AM',
      to: '06:00 PM',
      status: 'Pending',
      department: 'Maintenance Department',
    },
    {
      id: '2',
      visitorName: 'Ramesh Yadav',
      vendorName: 'QuickDeliver Logistics',
      purpose: 'Delivery - Office Supplies',
      date: '2026-01-27',
      from: '11:00 AM',
      to: '02:00 PM',
      status: 'Pending',
      department: 'Admin Block',
    },
    {
      id: '3',
      visitorName: 'Kavita Desai',
      vendorName: 'TechSupport Solutions',
      purpose: 'IT Support - Server Maintenance',
      date: '2026-01-26',
      from: '09:00 AM',
      to: '05:00 PM',
      status: 'Approved',
      department: 'IT Department',
    },
    {
      id: '4',
      visitorName: 'Sanjay Kumar',
      vendorName: 'SecureAudit Corp',
      purpose: 'Security Audit',
      date: '2026-01-26',
      from: '10:00 AM',
      to: '04:00 PM',
      status: 'Approved',
      department: 'Security Wing',
    },
    {
      id: '5',
      visitorName: 'Deepak Sharma',
      vendorName: 'Unknown Vendor',
      purpose: 'Unauthorized Entry Request',
      date: '2026-01-25',
      from: '02:00 PM',
      to: '05:00 PM',
      status: 'Rejected',
      department: 'Restricted Zone',
    },
    {
      id: '6',
      visitorName: 'Pooja Singh',
      vendorName: 'ExpressDoc Services',
      purpose: 'Expired Documents',
      date: '2026-01-25',
      from: '12:00 PM',
      to: '03:00 PM',
      status: 'Rejected',
      department: 'Admin Block',
    },
  ]);

  // Listen for updates from VisitorDetailScreen
  useEffect(() => {
    if (route.params?.updatedPass) {
      const updatedPass = route.params.updatedPass;
      setTemporaryPassData(prevPasses =>
        prevPasses.map(pass =>
          pass.id === updatedPass.id
            ? { ...pass, status: updatedPass.status }
            : pass
        )
      );
      // Clear the param to avoid re-triggering
      navigation.setParams({ updatedPass: undefined });
    }
  }, [route.params?.updatedPass]);

  // Filter passes based on search query only
  const filteredPasses = temporaryPassData.filter(pass => {
    const searchLower = searchQuery.toLowerCase().trim();
    return searchQuery === '' || 
      pass.visitorName.toLowerCase().includes(searchLower) ||
      pass.vendorName.toLowerCase().includes(searchLower) ||
      pass.purpose.toLowerCase().includes(searchLower) ||
      pass.status.toLowerCase().includes(searchLower) ||
      pass.department.toLowerCase().includes(searchLower) ||
      pass.date.includes(searchLower);
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
    console.log('Refresh temporary passes');
  };

  const TemporaryPassCard = ({ item }) => {
    console.log('Card Item:', item.visitorName, item.vendorName, item.from, item.to);
    
    return (
    <TouchableOpacity 
      style={styles.passCard}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate based on status
        if (item.status === 'Approved') {
          // Approved passes go to TemporaryPassDetail
          navigation.navigate('TemporaryPassDetail', { passData: item });
        } else {
          // Pending and Rejected passes go to VisitorDetailScreen
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
            time: item.from, // Use 'from' as the time
            status: item.status,
          };
          navigation.navigate('VisitorDailyPassDetail', { 
            passData: visitorData,
            source: 'VisitorTemporaryPass' // Specify the source screen
          });
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
          </View>

          <View style={styles.visitorRow}>
            <Icon name="account" size={16} color="#3477eb" />
            <Text style={styles.visitorName}>{item.visitorName}</Text>
          </View>

          <View style={styles.vendorRow}>
            <Icon name="domain" size={14} color="#64748B" />
            <Text style={styles.vendorText} numberOfLines={1}>{item.vendorName}</Text>
          </View>
          
          <View style={styles.purposeRow}>
            <Icon name="text-box-outline" size={14} color="#64748B" />
            <Text style={styles.purposeText}>{item.purpose}</Text>
          </View>

          <View style={styles.departmentRow}>
            <Icon name="office-building" size={14} color="#64748B" />
            <Text style={styles.departmentText}>{item.department}</Text>
          </View>

          <View style={styles.durationRow}>
            <Icon name="clock-time-four-outline" size={14} color="#64748B" />
            <Text style={styles.durationText} numberOfLines={1}>{item.from} - {item.to}</Text>
          </View>
        </View>

        {/* Right Chevron - Vertically Centered */}
        <View style={styles.chevronContainer}>
          <Feather name="chevron-right" size={24} color="#3477eb" />
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#5a94f5']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Temporary Pass</Text>
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
            placeholder="Search by name, vendor, purpose, status, date..."
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
        renderItem={({ item }) => <TemporaryPassCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="card-account-details-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>No temporary passes found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No passes available'}
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
  passCard: {
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
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vendorText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
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
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#1e293b',
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

export default VisitorTemporaryPassScreen;