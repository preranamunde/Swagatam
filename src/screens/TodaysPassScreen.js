import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Image,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const TodaysPassScreen = ({ navigation }) => {
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAllData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load both pass data and personal details in parallel
      const [passResult, detailsResult] = await Promise.all([
        AsyncStorage.getItem('todaysPass'),
        AsyncStorage.getItem('personalDetails')
      ]);

      console.log('Pass Data from Storage:', passResult);
      console.log('Personal Details from Storage:', detailsResult);

      // Set pass data
      if (passResult) {
        const parsedPass = JSON.parse(passResult);
        setPassData(parsedPass);
        console.log('Parsed Pass Data:', parsedPass);
      } else {
        // Default data if no pass found
        const defaultData = {
          appointments: [
            {
              id: '1',
              officerName: 'DEEPAK KUMAR',
              designation: 'Scientist F',
              department: 'MHA-Network and VC',
              agency: 'Ministry of Home Affairs',
              date: '30/12/2025',
              day: 'Wednesday',
              dayNum: '30',
              month: 'Dec',
              time: '14:50 - 16:30',
              passNo: 'A/0208/0022/1712547/2025/5397',
              visitorName: 'SURESH GUPTA',
              location: 'North Block',
              purpose: 'Official Meeting',
              participants: 2,
            },
            {
              id: '2',
              officerName: 'RAJESH SHARMA',
              designation: 'Director',
              department: 'IT Department',
              agency: 'Ministry of Electronics',
              date: '30/12/2025',
              day: 'Wednesday',
              dayNum: '30',
              month: 'Dec',
              time: '15:00 - 18:00',
              passNo: 'A/0208/0022/1712548/2025/5398',
              visitorName: 'RAJESH KUMAR',
              location: 'South Block',
              purpose: 'Document Submission',
              participants: 1,
            },
          ],
        };
        setPassData(defaultData);
        console.log('Using Default Pass Data');
      }

      // Set personal details
      if (detailsResult) {
        const parsedDetails = JSON.parse(detailsResult);
        setPersonalDetails(parsedDetails);
        console.log('Parsed Personal Details:', parsedDetails);
      } else {
        console.log('No Personal Details Found');
      }

      // Animate fade in after data is loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Error', 
        'Failed to load pass details. Please try again.',
        [
          { text: 'Retry', onPress: () => loadAllData() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData();
  }, []);

  const handlePassCardPress = (passItem) => {
    if (!passItem) {
      Alert.alert('Error', 'Pass data is not available');
      return;
    }
    navigation.navigate('TodayAppointmentDetail', { passData: passItem });
  };

  const debugStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage Keys:', keys);
      
      const allData = await AsyncStorage.multiGet(keys);
      console.log('All AsyncStorage Data:', allData);
    } catch (error) {
      console.error('Debug Storage Error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
        <Icon name="loading" size={48} color="#0A2463" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!passData || !passData.appointments || passData.appointments.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
        
        <LinearGradient
          colors={['#0A2463', '#1a3d7a']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Today's Appointments</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Icon name="calendar-blank-outline" size={64} color="#0A2463" />
          </View>
          <Text style={styles.emptyTitle}>No Appointments Today</Text>
          <Text style={styles.emptyDesc}>Your approved passes will appear here</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Icon name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Request New Pass</Text>
          </TouchableOpacity>
          
          {/* Debug button - remove in production */}
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.emptyBtn, { backgroundColor: '#64748B', marginTop: 10 }]} 
              onPress={debugStorage}
            >
              <Text style={styles.emptyBtnText}>Debug Storage</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0A2463', '#0A2463']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today's Appointments</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A2463']}
            tintColor="#0A2463"
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {passData.appointments.map((appointment, index) => (
            <View key={appointment.id || index} style={styles.appointmentWrapper}>
              {/* Main Content Container */}
              <View style={styles.appointmentSection}>
                {/* Date & Time Card - Horizontal */}
                <TouchableOpacity
                  style={styles.dateTimeCard}
                  onPress={() => handlePassCardPress(appointment)}
                  activeOpacity={0.85}
                >
                  {/* Left Side - Date Box */}
                  <LinearGradient
                    colors={['#0A2463', '#1E3A8A']}
                    style={styles.dateBox}
                  >
                    <Text style={styles.dayText}>{appointment.day || 'N/A'}</Text>
                    <Text style={styles.dayNumText}>{appointment.dayNum || '00'}</Text>
                    <Text style={styles.monthText}>{appointment.month || 'N/A'}</Text>
                  </LinearGradient>

                  {/* Right Side - Details */}
                  <View style={styles.detailsBox}>
                    {/* Time */}
                    <View style={styles.timeRow}>
                      <Icon name="clock-outline" size={16} color="#0A2463" />
                      <Text style={styles.timeText}>{appointment.time || 'N/A'}</Text>
                    </View>

                    {/* Officer Name */}
                    <View style={styles.nameRow}>
                      <Icon name="account-tie" size={16} color="#0A2463" />
                      <Text style={styles.officerNameText} numberOfLines={1}>
                        {appointment.officerName || 'N/A'}
                      </Text>
                    </View>

                    {/* Designation */}
                    <View style={styles.designationRow}>
                      <Icon name="briefcase" size={14} color="#64748B" />
                      <Text style={styles.designationText} numberOfLines={1}>
                        {appointment.designation || 'N/A'}
                      </Text>
                    </View>

                    {/* Location */}
                    <View style={styles.locationRow}>
                      <Icon name="map-marker" size={14} color="#64748B" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {appointment.location || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Chevron Arrow */}
                  <View style={styles.chevronBox}>
                    <Feather name="chevron-right" size={20} color="#94A3B8" />
                  </View>
                </TouchableOpacity>

                {/* Visitor Pass Card - Optimized Layout */}
                <View style={styles.passCard}>
                  <View style={styles.passHeader}>
                    <View style={styles.passHeaderLeft}>
                      <Icon name="ticket-account" size={18} color="#0A2463" />
                      <Text style={styles.passTitle}>Visitor Pass</Text>
                    </View>
                    <View style={styles.passHeaderRight}>
                      <Text style={styles.passLabel}>PASS ID</Text>
                      <Text style={styles.passNumber}>
                        #{appointment.passNo ? appointment.passNo.split('/').pop() : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Main Content: Photo, Name below Photo, QR Code, ID below QR */}
                  <View style={styles.passContent}>
                    <View style={styles.topRow}>
                      {/* Left - Photo with Name below */}
                      <View style={styles.photoSection}>
                        <View style={styles.photoContainer}>
                          {personalDetails?.photoUri ? (
                            <Image 
                              source={{ uri: personalDetails.photoUri }} 
                              style={styles.visitorPhoto}
                              resizeMode="cover"
                              onError={(e) => {
                                console.log('Image Load Error:', e.nativeEvent.error);
                              }}
                            />
                          ) : (
                            <View style={styles.photoPlaceholder}>
                              <Icon name="account" size={50} color="#94A3B8" />
                            </View>
                          )}
                          <View style={styles.verifiedBadge}>
                            <Icon name="check-circle" size={18} color="#10B981" />
                          </View>
                        </View>
                        
                        {/* Name below Photo */}
                        <Text style={styles.visitorNameText}>
                          {appointment.visitorName || 'SURESH GUPTA'}
                        </Text>
                      </View>

                      {/* Right - QR Code with ID below */}
                      <View style={styles.qrSection}>
                        <View style={styles.qrContainer}>
                          {appointment.passNo ? (
                            <QRCode
                              value={appointment.passNo}
                              size={110}
                              color="#0A2463"
                              backgroundColor="white"
                            />
                          ) : (
                            <View style={{ width: 110, height: 110, justifyContent: 'center', alignItems: 'center' }}>
                              <Icon name="qrcode" size={70} color="#CBD5E1" />
                            </View>
                          )}
                        </View>
                        <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
                        
                        {/* ID Number below QR */}
                        <View style={styles.idNumberRow}>
                          <Icon name="card-account-details" size={14} color="#64748B" />
                          <Text style={styles.idNumberLabel}>ID:</Text>
                          <Text style={styles.idNumberValue}>
                            {personalDetails?.identityProof || '9146158801'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Purpose Box */}
                    <View style={styles.purposeBox}>
                      <Icon name="briefcase" size={14} color="#0A2463" />
                      <Text style={styles.purposeText}>
                        {appointment.purpose || 'Official Meeting'}
                      </Text>
                    </View>
                  </View>

                  {/* Pass Footer Info */}
                  <View style={styles.passFooter}>
                    <View style={styles.passFooterItem}>
                      <Icon name="account-group" size={12} color="#64748B" />
                      <Text style={styles.passFooterText}>
                        +{appointment.participants || 0} guest{appointment.participants !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
         
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(10,36,99,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0A2463',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Appointment Wrapper
  appointmentWrapper: {
    marginBottom: 24,
  },
  // Appointment Section
  appointmentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  // Date & Time Card
  dateTimeCard: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#F1F5F9',
  },
  dateBox: {
    width: 85,
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  detailsBox: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A2463',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  officerNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A2463',
    flex: 1,
  },
  designationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  designationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  chevronBox: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Visitor Pass Card
  passCard: {
    padding: 16,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  passHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2463',
  },
  passHeaderRight: {
    alignItems: 'flex-end',
  },
  passLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A2463',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  // Main Pass Content
  passContent: {
    gap: 12,
  },
  // Top Row: Photo + QR
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  // Photo Section with Name
  photoSection: {
    alignItems: 'center',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
  },
  visitorPhoto: {
    width: 130,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  photoPlaceholder: {
    width: 130,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  visitorNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2463',
    textAlign: 'center',
    width: 130,
  },
  // QR Section with ID
  qrSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  qrLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  idNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  idNumberLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  idNumberValue: {
    fontSize: 13,
    color: '#0A2463',
    fontWeight: '700',
  },
  purposeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  purposeText: {
    fontSize: 13,
    color: '#0A2463',
    fontWeight: '600',
    flex: 1,
  },
  // Pass Footer
  passFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  passFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  // Footer Badge
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default TodaysPassScreen;