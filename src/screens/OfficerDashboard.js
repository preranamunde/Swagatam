import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const OfficerDashboard = ({ navigation }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banner images array
  const bannerImages = [
    require('../assets/images/image1.png'),
    require('../assets/images/image2.png'),
    require('../assets/images/image3.png'),
  ];

  useEffect(() => {
    // Auto-rotate banner images every 3 seconds
    const imageInterval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % bannerImages.length
      );
    }, 3000);

    return () => clearInterval(imageInterval);
  }, []);

  // Sample data - replace with actual data from your API
  const appointmentsData = {
    approved: 45,
    pending: 23,
    rejected: 8,
    total: 76,
  };

  const temporaryPassData = {
    approved: 32,
    pending: 15,
    rejected: 5,
    total: 52,
  };

  const StatusCard = ({ icon, label, count, color, onPress }) => (
    <TouchableOpacity
      style={styles.statusCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.statusCardContent}>
        {count > 0 && (
          <View style={[styles.countBadge, { backgroundColor: color }]}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <View style={styles.statusIconCircle}>
          <Icon name={icon} size={32} color="#3477eb" />
        </View>
        <Text style={styles.statusLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#3477eb', '#3477eb']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Officer Dashboard</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appointments Section */}
        <View style={styles.section}>
          <View style={styles.groupCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Icon name="calendar-check" size={20} color="#3477eb" />
                <Text style={styles.sectionTitle}>Appointments</Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>{appointmentsData.total}</Text>
              </View>
            </View>

            <View style={styles.cardsGrid}>
              <StatusCard
                icon="check-circle"
                label="Approved"
                count={appointmentsData.approved}
                color="#10B981"
                onPress={() => navigation.navigate('AppointmentsScreen', { filterStatus: 'Approved' })}
              />
              <StatusCard
                icon="clock-outline"
                label="Pending"
                count={appointmentsData.pending}
                color="#F59E0B"
                onPress={() => navigation.navigate('AppointmentsScreen', { filterStatus: 'Pending' })}
              />
              <StatusCard
                icon="close-circle"
                label="Rejected"
                count={appointmentsData.rejected}
                color="#EF4444"
                onPress={() => navigation.navigate('AppointmentsScreen', { filterStatus: 'Rejected' })}
              />
            </View>
          </View>
        </View>

        {/* Temporary Pass Section */}
        <View style={styles.section}>
          <View style={styles.groupCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Icon name="account-clock" size={20} color="#3477eb" />
                <Text style={styles.sectionTitle}>Temporary Pass</Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>{temporaryPassData.total}</Text>
              </View>
            </View>

            <View style={styles.cardsGrid}>
              <StatusCard
                icon="check-circle"
                label="Approved"
                count={temporaryPassData.approved}
                color="#10B981"
                onPress={() => navigation.navigate('VisitorTemporaryPassScreen', { filterStatus: 'Approved' })}
              />
              <StatusCard
                icon="clock-outline"
                label="Pending"
                count={temporaryPassData.pending}
                color="#F59E0B"
                onPress={() => navigation.navigate('VisitorTemporaryPassScreen', { filterStatus: 'Pending' })}
              />
              <StatusCard
                icon="close-circle"
                label="Rejected"
                count={temporaryPassData.rejected}
                color="#EF4444"
                onPress={() => navigation.navigate('VisitorTemporaryPassScreen', { filterStatus: 'Rejected' })}
              />
            </View>
          </View>
        </View>

        {/* Banners Section */}
        <View style={styles.bannerSection}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerHeaderLeft}>
              <View style={styles.bannerIconBox}>
                <Icon name="image-multiple" size={18} color="#3477eb" />
              </View>
              <Text style={styles.bannerTitle}>Gallery</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (width - 32)
              );
              setCurrentBannerIndex(index);
            }}
            decelerationRate="fast"
            snapToInterval={width - 32}
            snapToAlignment="center"
          >
            {bannerImages.map((banner, index) => (
              <View key={index} style={styles.bannerWrapper}>
                <Image
                  source={banner}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Banner Pagination Dots */}
          <View style={styles.paginationDots}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentBannerIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.recentHeader}>
            <View style={styles.recentHeaderIcon}>
              <Icon name="clock-outline" size={18} color="#3477eb" />
            </View>
            <Text style={styles.recentTitle}>Recent Activity</Text>
          </View>

          <View style={styles.recentContainer}>
            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}>
                <Icon name="check-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Appointment Approved</Text>
                <Text style={styles.recentItemDesc}>Rajesh Kumar - Ministry Block A</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>2 hours ago</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>

            <View style={styles.recentDivider} />

            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}>
                <Icon name="clock-alert" size={20} color="#F59E0B" />
              </View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Pending Review</Text>
                <Text style={styles.recentItemDesc}>Temporary pass awaiting approval</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>5 hours ago</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>

            <View style={styles.recentDivider} />

            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}>
                <Icon name="close-circle" size={20} color="#EF4444" />
              </View>
              <View style={styles.recentContent}>
                <Text style={styles.recentItemTitle}>Request Rejected</Text>
                <Text style={styles.recentItemDesc}>Incomplete documentation provided</Text>
                <View style={styles.recentTimeRow}>
                  <Icon name="clock-outline" size={11} color="#94A3B8" />
                  <Text style={styles.recentItemTime}>Yesterday</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>
          </View>
        </View>

        {/* Footer Badge */}
        <View style={styles.footerBadge}>
          <Icon name="shield-check" size={14} color="#64748B" />
          <Text style={styles.footerBadgeText}>Govt. of India | Official System</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3477eb',
  },
  totalBadge: {
    backgroundColor: '#3477eb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  totalBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3477eb',
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Banners Section Styles
  bannerSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bannerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  bannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3477eb',
  },
  bannerWrapper: {
    width: width - 32,
    marginRight: 0,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    backgroundColor: '#3477eb',
    width: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  recentHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3477eb',
  },
  recentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3477eb',
    marginBottom: 3,
  },
  recentItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 5,
    lineHeight: 16,
    fontWeight: '500',
  },
  recentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentItemTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  footerBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 16,
  },
});

export default OfficerDashboard;