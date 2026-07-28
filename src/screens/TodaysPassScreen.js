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
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { fetchVisitorAppointments, cancelVisitRequest } from '../constants/services/appointmentservice';

const { width } = Dimensions.get('window');

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseOfficerName = (raw) => {
  if (!raw) return { name: '', department: '', agency: '' };
  const match = String(raw).match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!match) return { name: raw.trim(), department: '', agency: '' };

  const name = match[1].trim();
  const insideParts = match[2].split(',').map((s) => s.trim()).filter(Boolean);

  return {
    name,
    department: insideParts[0] || '',
    agency: insideParts.slice(1).join(', ') || '',
  };
};

const parseVisitDate = (dateStr) => {
  if (!dateStr) return { day: '', dayNum: '', month: '' };
  const [dd, mm, yyyy] = dateStr.split('/');
  const dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    day: dayNames[dateObj.getDay()] || '',
    dayNum: dd,
    month: monthNames[dateObj.getMonth()] || '',
  };
};

/** visitDate is DD/MM/YYYY — true only if it's today's calendar date */
const isTodayDate = (dateStr) => {
  if (!dateStr) return false;
  const [dd, mm, yyyy] = dateStr.split('/');
  const now = new Date();
  return (
    Number(dd) === now.getDate() &&
    Number(mm) === now.getMonth() + 1 &&
    Number(yyyy) === now.getFullYear()
  );
};

// Only fields that actually come from (or are directly derived from) the API response.
// Removed: designation, visitorName, participants — these were hardcoded placeholders
// never populated by fetchVisitorAppointments, so they were dummy data, not real API data.
const mapApiRecordToAppointment = (record) => {
  const officerParts = parseOfficerName(record.officerName);
  const dateParts = parseVisitDate(record.visitDate);

  return {
    id: record.registrationNo,
    registrationNo: record.registrationNo,
    officerName: officerParts.name,
    department: officerParts.department,
    agency: officerParts.agency,
    date: record.visitDate,
    day: dateParts.day,
    dayNum: dateParts.dayNum,
    month: dateParts.month,
    time: record.meetingTime,
    passNo: record.registrationNo,
    visitorAddress: record.visitorAddress || '',
    location: officerParts.agency || officerParts.department,
    purpose: record.purpose || '-',
    status: record.status,           // 'P' | 'Y' | 'N' | 'C'
    statusLabel: record.statusLabel,
  };
};

/** Only VisRN values starting with "I" are supported by the cancel service */
const isCancellable = (appointment) =>
  !!appointment?.registrationNo &&
  String(appointment.registrationNo).startsWith('I') &&
  (appointment.status === 'P' || appointment.status === 'Y');

// ── Approved tab is now first, Pending second ──────────────────────────────
const TABS = [
  { key: 'approved', label: 'Approved', statusCode: 'Y', icon: 'check-circle-outline' },
  { key: 'pending', label: 'Pending', statusCode: 'P', icon: 'clock-outline' },
];

const TodaysPassScreen = ({ navigation }) => {
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [activeTab, setActiveTab] = useState('approved');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [tabSlideAnim] = useState(new Animated.Value(0));

  // ── Cancel flow state ─────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
      return () => {};
    }, [])
  );

  React.useEffect(() => {
    Animated.spring(tabSlideAnim, {
      toValue: activeTab === 'pending' ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [activeTab]);

  const resolveVisRegNo = async () => {
    try {
      const s = await AsyncStorage.getItem('loginSession');
      if (s) {
        const obj = JSON.parse(s);
        const id = obj?.Vis_Reg_No ?? obj?.visRegNo ?? '';
        if (id) return String(id);
      }
      const u = await AsyncStorage.getItem('userData');
      if (u) {
        const obj = JSON.parse(u);
        const id = obj?.visRegNo ?? obj?.Vis_Reg_No ?? '';
        if (id) return String(id);
      }
    } catch (e) {
      console.error('AsyncStorage error:', e.message);
    }
    return '';
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const visRegNo = await resolveVisRegNo();
      if (!visRegNo) {
        throw new Error('Visitor registration number not found. Please log in again.');
      }

      const records = await fetchVisitorAppointments(visRegNo);
      const mapped = (records || []).map(mapApiRecordToAppointment);

      // Only today's appointments belong on this screen
      const todays = mapped.filter((a) => isTodayDate(a.date));

      setPendingList(todays.filter((a) => a.status === 'P'));
      setApprovedList(todays.filter((a) => a.status === 'Y'));

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading appointments:', error.message);
      setErrorMsg(error.message || 'Failed to load appointments.');
      setPendingList([]);
      setApprovedList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData();
  }, []);

  const handlePassCardPress = (appointment) => {
    if (!appointment) {
      Alert.alert('Error', 'Pass data is not available');
      return;
    }
    navigation.navigate('TodayAppointmentDetail', {
      passData: appointment,
      registrationNo: appointment.registrationNo,
    });
  };

  // ── Cancel flow ────────────────────────────────────────────────────────────
  const openCancelModal = (appointment) => {
    setCancelTarget(appointment);
    setCancelReason('');
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelReason('');
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      Alert.alert('Reason required', 'Please enter a reason for cancellation.');
      return;
    }

    try {
      setCancelling(true);
      const visRegNo = await resolveVisRegNo();
      if (!visRegNo) {
        throw new Error('Visitor registration number not found. Please log in again.');
      }
      const message = await cancelVisitRequest(visRegNo, cancelTarget.registrationNo, cancelReason.trim());
      setCancelTarget(null);
      setCancelReason('');
      Alert.alert('Success', message || 'Visit request cancelled successfully.');
      loadAllData();
    } catch (error) {
      Alert.alert('Cancellation failed', error.message || 'Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <Icon name="loading" size={48} color="#3477eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentList = activeTab === 'pending' ? pendingList : approvedList;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <LinearGradient colors={['#3477eb', '#5a94f5']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today's Appointments</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Approved / Pending Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  transform: [{
                    translateX: tabSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (width - 40 - 8) / 2],
                    }),
                  }],
                },
              ]}
            />
            {TABS.map((tab) => {
              const count = tab.key === 'pending' ? pendingList.length : approvedList.length;
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.7}
                >
                  <Icon name={tab.icon} size={18} color={isActive ? '#3477eb' : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  {count > 0 && (
                    <View style={[styles.badge, isActive && styles.badgeActive]}>
                      <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      {errorMsg || currentList.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Icon name={errorMsg ? 'alert-circle-outline' : 'calendar-blank-outline'} size={64} color="#3477eb" />
          </View>
          <Text style={styles.emptyTitle}>
            {errorMsg ? 'Something went wrong' : `No ${activeTab === 'pending' ? 'Pending' : 'Approved'} Appointments Today`}
          </Text>
          <Text style={styles.emptyDesc}>
            {errorMsg || `Today's ${activeTab} passes will appear here`}
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={loadAllData}>
            <Icon name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3477eb']} tintColor="#3477eb" />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {currentList.map((appointment, index) => (
              <View key={appointment.id || index} style={styles.appointmentWrapper}>
                <View style={styles.appointmentSection}>
                  {isCancellable(appointment) && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => openCancelModal(appointment)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.dateTimeCard}
                    onPress={() => handlePassCardPress(appointment)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient colors={['#3477eb', '#5a94f5']} style={styles.dateBox}>
                      <Text style={styles.dayText}>{appointment.day || 'N/A'}</Text>
                      <Text style={styles.dayNumText}>{appointment.dayNum || '00'}</Text>
                      <Text style={styles.monthText}>{appointment.month || 'N/A'}</Text>
                    </LinearGradient>

                    <View style={styles.detailsBox}>
                      <View style={styles.timeRow}>
                        <Icon name="clock-outline" size={16} color="#3477eb" />
                        <Text style={styles.timeText}>{appointment.time || 'N/A'}</Text>
                        {appointment.statusLabel ? (
                          <Text style={styles.statusPill}>{appointment.statusLabel}</Text>
                        ) : null}
                      </View>

                      <View style={styles.nameRow}>
                        <Icon name="account-tie" size={16} color="#3477eb" />
                        <Text style={styles.officerNameText} numberOfLines={1}>
                          {appointment.officerName || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.designationRow}>
                        <Icon name="briefcase" size={14} color="#64748B" />
                        <Text style={styles.designationText} numberOfLines={1}>
                          {appointment.department || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.locationRow}>
                        <Icon name="map-marker" size={14} color="#64748B" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {appointment.location || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.chevronBox}>
                      <Feather name="chevron-right" size={20} color="#94A3B8" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.passCard}>
                    <View style={styles.passHeader}>
                      <View style={styles.passHeaderLeft}>
                        <Icon name="ticket-account" size={18} color="#3477eb" />
                        <Text style={styles.passTitle}>Visitor Pass</Text>
                      </View>
                      <View style={styles.passHeaderRight}>
                        <Text style={styles.passLabel}>PASS ID</Text>
                        <Text style={styles.passNumber}>
                          #{appointment.passNo ? appointment.passNo.split('/').pop() : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.passContent}>
                      {appointment.visitorAddress ? (
                        <View style={styles.purposeBox}>
                          <Icon name="map-marker-outline" size={16} color="#3477eb" />
                          <View style={styles.purposeTextContainer}>
                            <Text style={styles.purposeLabel}>Visitor Address</Text>
                            <Text style={styles.purposeText} numberOfLines={3}>
                              {appointment.visitorAddress}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      <View style={styles.purposeBox}>
                        <Icon name="briefcase-outline" size={16} color="#3477eb" />
                        <View style={styles.purposeTextContainer}>
                          <Text style={styles.purposeLabel}>Purpose</Text>
                          <Text style={styles.purposeText} numberOfLines={3}>
                            {appointment.purpose || '-'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      )}

      {/* ── Cancel confirmation modal ─────────────────────────────────────── */}
      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Visit Request</Text>
            <Text style={styles.modalSubtitle}>
              Pass #{cancelTarget?.passNo ? cancelTarget.passNo.split('/').pop() : ''} with{' '}
              {cancelTarget?.officerName || 'N/A'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for cancellation"
              placeholderTextColor="#94A3B8"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              editable={!cancelling}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={closeCancelModal}
                disabled={cancelling}
              >
                <Text style={styles.modalBtnGhostText}>Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={submitCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnDangerText}>Cancel Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  loadingText: { marginTop: 12, fontSize: 15, fontWeight: '600', color: '#475569' },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#FFFFFF' },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  tabContainer: { paddingHorizontal: 20 },
  tabBackground: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 4, position: 'relative' },
  tabIndicator: {
    position: 'absolute', left: 4, top: 4, bottom: 4, width: (width - 40 - 8) / 2,
    backgroundColor: '#FFFFFF', borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 8, zIndex: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#3477eb' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, minWidth: 20, alignItems: 'center' },
  badgeActive: { backgroundColor: '#3477eb' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  badgeTextActive: { color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(52, 119, 235, 0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#3477eb', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  appointmentWrapper: { marginBottom: 24 },
  appointmentSection: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'visible', position: 'relative',
    shadowColor: '#3477eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  cancelBtn: {
    position: 'absolute', top: 10, right: 10, zIndex: 20,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6,
  },
  dateTimeCard: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#F1F5F9', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  dateBox: { width: 85, paddingVertical: 16, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayNumText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 38 },
  monthText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', marginTop: 1, textTransform: 'uppercase' },
  detailsBox: { flex: 1, padding: 14, justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  timeText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  statusPill: { fontSize: 9, fontWeight: '700', color: '#0EA5D1', backgroundColor: '#ECFEFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  officerNameText: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  designationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  designationText: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  chevronBox: { width: 36, justifyContent: 'center', alignItems: 'center' },
  passCard: { padding: 16 },
  passHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  passHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  passHeaderRight: { alignItems: 'flex-end' },
  passLabel: { fontSize: 9, fontWeight: '600', color: '#94A3B8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  passNumber: { fontSize: 11, fontWeight: '700', color: '#1F2937', backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  passContent: { gap: 12 },
  purposeBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  purposeTextContainer: { flex: 1 },
  purposeLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  purposeText: { fontSize: 14, color: '#1F2937', fontWeight: '600', lineHeight: 18 },

  // ── Cancel modal ───────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 14 },
  modalInput: {
    minHeight: 80, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937',
    textAlignVertical: 'top', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnGhost: { backgroundColor: '#F1F5F9' },
  modalBtnGhostText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalBtnDanger: { backgroundColor: '#EF4444' },
  modalBtnDangerText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default TodaysPassScreen;