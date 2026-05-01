import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Platform, Image, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { checkProfileStatus } from '../constants/services/visitorRegisterService';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [profileStatus, setProfileStatus]           = useState(null);
  const [dialogVisible, setDialogVisible]           = useState(false);
  const [dialogLoading, setDialogLoading]           = useState(false);

  const appointmentCounts = {
    todays: 3, upcoming: 5, pending: 2, completed: 12,
  };

  const temporaryPassCounts = {
    approved: 8, rejected: 1, other: 4, expired: 3,
  };

  const banners = [
    require('../assets/images/image1.png'),
    require('../assets/images/image2.png'),
    require('../assets/images/image3.png'),
  ];

  useEffect(() => {
    const fetchProfileStatus = async () => {
      setDialogLoading(true);
      try {
        const result  = await checkProfileStatus('102');
        const message = result?.[0]?.Result ?? 'No response received';
        setProfileStatus(message);
      } catch (e) {
        setProfileStatus('Error: ' + e.message);
      } finally {
        setDialogLoading(false);
        setDialogVisible(true);
      }
    };
    fetchProfileStatus();
  }, []);

  const AppointmentCard = ({ icon, label, count, onPress }) => (
    <TouchableOpacity style={styles.appointmentCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.appointmentCardGradient}>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <View style={styles.appointmentIconBox}>
          <Icon name={icon} size={28} color="#2563eb" />
        </View>
        <Text style={styles.appointmentLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const TemporaryPassCard = ({ icon, label, count, onPress }) => (
    <TouchableOpacity style={styles.temporaryCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.temporaryCardGradient}>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <View style={styles.temporaryIconBox}>
          <Icon name={icon} size={28} color="#2563eb" />
        </View>
        <Text style={styles.temporaryLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#3477eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* My Appointment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBox}>
                <Icon name="calendar-check" size={18} color="#3477eb" />
              </View>
              <Text style={styles.sectionTitle}>My Appointment</Text>
            </View>
          </View>
          <View style={styles.appointmentGrid}>
            <AppointmentCard icon="calendar-today"  label="Today's"   count={appointmentCounts.todays}    onPress={() => navigation.navigate('TodaysPass')} />
            <AppointmentCard icon="calendar-clock"  label="Upcoming"  count={appointmentCounts.upcoming}  onPress={() => console.log('Upcoming')} />
            <AppointmentCard icon="timer-sand"      label="Pending"   count={appointmentCounts.pending}   onPress={() => console.log('Pending')} />
            <AppointmentCard icon="check-circle"    label="Completed" count={appointmentCounts.completed} onPress={() => console.log('Completed')} />
          </View>
        </View>

        {/* Temporary Pass */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBox}>
                <Icon name="timer-outline" size={18} color="#3477eb" />
              </View>
              <Text style={styles.sectionTitle}>Temporary Pass</Text>
            </View>
          </View>
          <View style={styles.temporaryGrid}>
            <TemporaryPassCard icon="check-circle-outline"      label="Approved" count={temporaryPassCounts.approved} onPress={() => console.log('Approved')} />
            <TemporaryPassCard icon="close-circle-outline"      label="Rejected" count={temporaryPassCounts.rejected} onPress={() => console.log('Rejected')} />
            <TemporaryPassCard icon="file-document-multiple"    label="Other"    count={temporaryPassCounts.other}    onPress={() => console.log('Other')} />
            <TemporaryPassCard icon="timer-off-outline"         label="Expired"  count={temporaryPassCounts.expired}  onPress={() => console.log('Expired')} />
          </View>
        </View>

        {/* Banners */}
        <View style={styles.bannerSection}>
          <Text style={styles.bannerTitle}>Latest Updates</Text>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setCurrentBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 32)));
            }}
            decelerationRate="fast" snapToInterval={width - 32} snapToAlignment="center"
          >
            {banners.map((banner, index) => (
              <View key={index} style={styles.bannerWrapper}>
                <Image source={banner} style={styles.bannerImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {banners.map((_, index) => (
              <View key={index} style={[styles.dot, currentBannerIndex === index && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Recent Updates */}
        <View style={styles.section}>
          <View style={styles.recentHeader}>
            <View style={styles.recentHeaderIcon}>
              <Icon name="clock-outline" size={18} color="#3477eb" />
            </View>
            <Text style={styles.recentTitle}>Recent Updates</Text>
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}><Icon name="check-circle" size={20} color="#3477eb" /></View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Pass Approved</Text>
                <Text style={styles.recentItemDesc}>Ministry Block-A access granted</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>2 hours ago</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>
            <View style={styles.recentDivider} />
            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}><Icon name="clock-alert" size={20} color="#3477eb" /></View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Pending Review</Text>
                <Text style={styles.recentItemDesc}>Your request is under review</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>5 hours ago</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>
            <View style={styles.recentDivider} />
            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}><Icon name="information" size={20} color="#0A2463" /></View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Profile Updated</Text>
                <Text style={styles.recentItemDesc}>Contact information changed</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>Yesterday</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>
          </View>
        </View>

        <View style={styles.footerBadge}>
          <Icon name="shield-check" size={14} color="#64748B" />
          <Text style={styles.footerBadgeText}>Govt. of India | Official System</Text>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ── Profile Status Dialog ── */}
      {dialogVisible && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <View style={styles.dialogIconCircle}>
              <Icon name="account-check-outline" size={32} color="#3477eb" />
            </View>
            <Text style={styles.dialogTitle}>Profile Status</Text>
            <Text style={styles.dialogVisNo}>Visitor No: 1192563</Text>
            <View style={styles.dialogDivider} />
            <Text style={styles.dialogMessage}>
              {dialogLoading ? 'Fetching status...' : profileStatus}
            </Text>
            <TouchableOpacity
              style={styles.dialogButton}
              onPress={() => setDialogVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.dialogButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F1F5F9' },
  headerGradient:       { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16 },
  header:               { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton:           { width: 40, height: 40, justifyContent: 'center' },
  headerTitle:          { fontSize: 19, fontWeight: '700', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  headerRight:          { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  scrollView:           { flex: 1 },
  scrollContent:        { paddingBottom: 16 },
  section:              { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionHeaderLeft:    { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionIconBox:       { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  sectionTitle:         { fontSize: 16, fontWeight: '700', color: '#0A2463' },
  appointmentGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  appointmentCard:      { width: (width - 44) / 2, height: 110, borderRadius: 14, backgroundColor: '#FFFFFF', overflow: 'hidden', elevation: 4 },
  appointmentCardGradient: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  appointmentIconBox:   { width: 56, height: 56, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appointmentLabel:     { fontSize: 14, fontWeight: '700', color: '#0A2463', textAlign: 'center' },
  countBadge:           { position: 'absolute', top: 8, right: 8, backgroundColor: '#0A2463', borderRadius: 12, minWidth: 24, height: 24, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  countBadgeText:       { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  temporaryGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  temporaryCard:        { width: (width - 44) / 2, height: 110, borderRadius: 14, backgroundColor: '#FFFFFF', overflow: 'hidden', elevation: 4 },
  temporaryCardGradient:{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  temporaryIconBox:     { width: 56, height: 56, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  temporaryLabel:       { fontSize: 14, fontWeight: '700', color: '#0A2463', textAlign: 'center' },
  bannerSection:        { marginTop: 20, paddingHorizontal: 16 },
  bannerTitle:          { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 10 },
  bannerWrapper:        { width: width - 32 },
  bannerImage:          { width: '100%', height: 160, borderRadius: 14, backgroundColor: '#E2E8F0' },
  paginationDots:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
  dot:                  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  activeDot:            { backgroundColor: '#0A2463', width: 24 },
  recentHeader:         { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  recentHeaderIcon:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  recentTitle:          { fontSize: 16, fontWeight: '700', color: '#0A2463' },
  recentContainer:      { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, elevation: 2 },
  recentItem:           { flexDirection: 'row', alignItems: 'center', gap: 11 },
  recentIconBox:        { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  recentContent:        { flex: 1 },
  recentItemTitle:      { fontSize: 14, fontWeight: '700', color: '#0A2463', marginBottom: 3 },
  recentItemDesc:       { fontSize: 12, color: '#64748B', marginBottom: 5, lineHeight: 16, fontWeight: '500' },
  recentTimeRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentItemTime:       { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  recentDivider:        { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  footerBadge:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingVertical: 10, borderRadius: 10, marginHorizontal: 16, marginTop: 20, elevation: 1 },
  footerBadgeText:      { fontSize: 11, color: '#64748B', fontWeight: '500' },
  bottomPadding:        { height: 16 },

  // Dialog
  dialogOverlay:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  dialogBox:            { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '85%', alignItems: 'center', elevation: 10 },
  dialogIconCircle:     { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  dialogTitle:          { fontSize: 20, fontWeight: '700', color: '#0A2463', marginBottom: 4 },
  dialogVisNo:          { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 14 },
  dialogDivider:        { width: '100%', height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 },
  dialogMessage:        { fontSize: 15, color: '#334155', textAlign: 'center', marginBottom: 24, lineHeight: 22, fontWeight: '500' },
  dialogButton:         { backgroundColor: '#3477eb', paddingVertical: 12, paddingHorizontal: 48, borderRadius: 12, elevation: 2 },
  dialogButtonText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default DashboardScreen;