import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Sample counts - replace with actual data from your API/state
  const appointmentCounts = {
    todays: 3,
    upcoming: 5,
    pending: 2,
    completed: 12,
  };

  const temporaryPassCounts = {
    approved: 8,
    rejected: 1,
    other: 4,
    expired: 3,
  };

  // Banner images
  const banners = [
    require('../assets/images/image1.png'),
    require('../assets/images/image2.png'),
    require('../assets/images/image3.png'),
  ];

  const AppointmentCard = ({ icon, label, count, onPress }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.appointmentCardGradient}>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <View style={styles.appointmentIconBox}>
          <Icon name={icon} size={28} color="#0A2463" />
        </View>
        <Text style={styles.appointmentLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const TemporaryPassCard = ({ icon, label, count, onPress }) => (
    <TouchableOpacity
      style={styles.temporaryCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.temporaryCardGradient}>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <View style={styles.temporaryIconBox}>
          <Icon name={icon} size={28} color="#0A2463" />
        </View>
        <Text style={styles.temporaryLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#0A2463', '#1a3d7a']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* My Appointment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBox}>
                <Icon name="calendar-check" size={18} color="#0A2463" />
              </View>
              <Text style={styles.sectionTitle}>My Appointment</Text>
            </View>
          </View>

          <View style={styles.appointmentGrid}>
            <AppointmentCard
              icon="calendar-today"
              label="Today's"
              count={appointmentCounts.todays}
              onPress={() => navigation.navigate('TodaysPass')}
            />
            <AppointmentCard
              icon="calendar-clock"
              label="Upcoming"
              count={appointmentCounts.upcoming}
              onPress={() => console.log('Upcoming')}
            />
            <AppointmentCard
              icon="timer-sand"
              label="Pending"
              count={appointmentCounts.pending}
              onPress={() => console.log('Pending')}
            />
            <AppointmentCard
              icon="check-circle"
              label="Completed"
              count={appointmentCounts.completed}
              onPress={() => console.log('Completed')}
            />
          </View>
        </View>

        {/* Temporary Pass Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBox}>
                <Icon name="timer-outline" size={18} color="#0A2463" />
              </View>
              <Text style={styles.sectionTitle}>Temporary Pass</Text>
            </View>
          </View>

          <View style={styles.temporaryGrid}>
            <TemporaryPassCard
              icon="check-circle-outline"
              label="Approved"
              count={temporaryPassCounts.approved}
              onPress={() => console.log('Approved')}
            />
            <TemporaryPassCard
              icon="close-circle-outline"
              label="Rejected"
              count={temporaryPassCounts.rejected}
              onPress={() => console.log('Rejected')}
            />
            <TemporaryPassCard
              icon="file-document-multiple"
              label="Other"
              count={temporaryPassCounts.other}
              onPress={() => console.log('Other')}
            />
            <TemporaryPassCard
              icon="timer-off-outline"
              label="Expired"
              count={temporaryPassCounts.expired}
              onPress={() => console.log('Expired')}
            />
          </View>
        </View>

        {/* Banners Section */}
        <View style={styles.bannerSection}>
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
            {banners.map((banner, index) => (
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
            {banners.map((_, index) => (
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

        {/* Recent Updates */}
        <View style={styles.section}>
          <View style={styles.recentHeader}>
            <View style={styles.recentHeaderIcon}>
              <Icon name="clock-outline" size={18} color="#0A2463" />
            </View>
            <Text style={styles.recentTitle}>Recent Updates</Text>
          </View>

          <View style={styles.recentContainer}>
            <View style={styles.recentItem}>
              <View style={styles.recentIconBox}>
                <Icon name="check-circle" size={20} color="#0A2463" />
              </View>
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
              <View style={styles.recentIconBox}>
                <Icon name="clock-alert" size={20} color="#0A2463" />
              </View>
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
              <View style={styles.recentIconBox}>
                <Icon name="information" size={20} color="#0A2463" />
              </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2463',
  },
  // My Appointment Cards
  appointmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  appointmentCard: {
    width: (width - 44) / 2,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  appointmentIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2463',
    textAlign: 'center',
  },
  // Count Badge
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0A2463',
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
  // Temporary Pass Cards
  temporaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  temporaryCard: {
    width: (width - 44) / 2,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  temporaryCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  temporaryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  temporaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2463',
    textAlign: 'center',
  },
  // Banner Section
  bannerSection: {
    marginTop: 20,
    paddingHorizontal: 16,
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
    backgroundColor: '#0A2463',
    width: 24,
  },
  // Recent Updates
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
    color: '#0A2463',
  },
  recentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0A2463',
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2463',
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
    shadowColor: '#0A2463',
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

export default DashboardScreen;