import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Image,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { checkProfileStatus } from '../constants/services/profileStatusService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const namasteAnim = useRef(new Animated.Value(0)).current;

  // Banner images array
  const bannerImages = [
    require('../assets/images/image1.png'),
    require('../assets/images/image2.png'),
    require('../assets/images/image3.png'),
  ];

  useEffect(() => {
    loadUserData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Namaste animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(namasteAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(namasteAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-rotate banner images every 3 seconds
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % bannerImages.length
      );
    }, 3000);

    return () => clearInterval(imageInterval);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (drawerVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible]);

  // ── Real-time profile check via API ────────────────────────────────────────
  const loadUserData = async () => {
    try {
      setLoading(true);

      // Step 1: Get loginSession saved after login
      const session = await AsyncStorage.getItem('loginSession');
      if (!session) {
        console.warn('No loginSession found — redirecting to profile creation');
        setUserData(null);
        setLoading(false);
        return;
      }

      const { Vis_Reg_No, Name, Mobile, Email } = JSON.parse(session);
      console.log('Loaded session — Vis_Reg_No:', Vis_Reg_No);

      // Step 2: Call API to check if profile is complete
      const isComplete = await checkProfileStatus(Vis_Reg_No);
      console.log('Profile complete?', isComplete);

      if (isComplete) {
        // Profile complete — try local personalDetails first, fallback to session data
        const storedData = await AsyncStorage.getItem('personalDetails');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        } else {
          // Use session data for display (name, email from login response)
          setUserData({ name: Name, mobile: Mobile, email: Email });
        }
      } else {
        // Profile incomplete — show "Complete Your Profile" screen
        setUserData(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('PersonalDetails', { editMode: true, userData });
  };

  const handleCreateProfile = () => {
    navigation.navigate('PersonalDetails');
  };

  const handleLogout = () => {
    setDrawerVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.multiRemove(['loginSession', 'userData', 'personalDetails', 'userRole']);
          navigation.reset({
            index: 0,
            routes: [{ name: 'VisitorLogin' }],
          });
        },
      },
    ]);
  };

  const openDrawer = () => setDrawerVisible(true);

  const handleApplyForPass = () => {
    navigation.navigate('CreateAppointment');
  };

  const handleApplyForTemporaryPass = () => {
    navigation.navigate('TemporaryPassInstructions');
  };

  const handleProfileClick = () => {
    setDrawerVisible(false);
    navigation.navigate('MyProfile');
  };

  const MenuOption = ({ iconName, iconLib = 'MaterialCommunityIcons', title, onPress, isDanger = false }) => {
    const IconComponent =
      iconLib === 'Ionicons' ? Ionicons :
      iconLib === 'Feather' ? Feather :
      iconLib === 'MaterialIcons' ? MaterialIcons :
      Icon;

    return (
      <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
        <IconComponent name={iconName} size={22} color={isDanger ? '#DC2626' : '#FFFFFF'} />
        <Text style={[styles.menuText, isDanger && styles.menuTextDanger]}>{title}</Text>
        <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    );
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return 'Guest';
    return fullName.split(' ')[0];
  };

  const namasteRotate = namasteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
        <View style={styles.loader}>
          <Icon name="loading" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Swagatam</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.centerContent}>
          <Animated.View style={[styles.emptyCard, { opacity: fadeAnim }]}>
            <View style={styles.emptyIcon}>
              <Icon name="account-circle-outline" size={50} color="#FFFFFF" />
            </View>

            <Text style={styles.emptyTitle}>Complete Your Profile</Text>
            <Text style={styles.emptyDesc}>
              Create your profile to access all visitor management features
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={20} color="#0A2463" />
                <Text style={styles.benefitText}>Digital pass creation</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={20} color="#0A2463" />
                <Text style={styles.benefitText}>Instant notifications</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={20} color="#0A2463" />
                <Text style={styles.benefitText}>QR verification</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleCreateProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Create Profile</Text>
              <Icon name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.btnSecondaryText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Side Drawer */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.drawerHeader}>
              <TouchableOpacity
                style={styles.userSection}
                onPress={handleProfileClick}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  {userData?.photoUri ? (
                    <Image source={{ uri: userData.photoUri }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="account" size={28} color="#3477eb" />
                    </View>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userData?.name || 'User'}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {userData?.email || 'user@email.com'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDrawerVisible(false)} style={styles.closeBtn}>
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.menuGroup}>
                <Text style={styles.menuLabel}>MENU</Text>
                <MenuOption
                  iconName="view-dashboard-outline"
                  title="Dashboard"
                  onPress={() => { setDrawerVisible(false); navigation.navigate('Dashboard'); }}
                />
                <MenuOption
                  iconName="information-outline"
                  title="About Swagatam"
                  onPress={() => { setDrawerVisible(false); navigation.navigate('AboutSwagatam'); }}
                />
                <MenuOption
                  iconName="phone-outline"
                  title="Contact Us"
                  onPress={() => { setDrawerVisible(false); navigation.navigate('ContactUs'); }}
                />
                <MenuOption
                  iconName="help-circle-outline"
                  title="Help & Support"
                  onPress={() => { setDrawerVisible(false); navigation.navigate('HelpSupport'); }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.menuGroup}>
                <Text style={styles.menuLabel}>OTHER</Text>
                <MenuOption
                  iconName="share-variant-outline"
                  title="Share App"
                  onPress={() => setDrawerVisible(false)}
                />
                <MenuOption
                  iconName="star-outline"
                  title="Rate Us"
                  onPress={() => setDrawerVisible(false)}
                />
                <MenuOption
                  iconName="cellphone-information"
                  title="App Info"
                  onPress={() => setDrawerVisible(false)}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.menuGroup}>
                <MenuOption
                  iconName="logout"
                  title="Logout"
                  onPress={handleLogout}
                  isDanger={true}
                />
              </View>

              <Text style={styles.version}>v2.1.0</Text>
            </ScrollView>
          </Animated.View>

          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />
        </View>
      </Modal>

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentAll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
              <Feather name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Swagatam</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.langBtn} activeOpacity={0.7}>
                <Icon name="translate" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                <View style={styles.notifDot} />
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Tagline Card with Namaste */}
        <View style={styles.taglineCardWrapper}>
          <View style={styles.taglineCardRibbon}>
            {/* Tricolor ribbon on left */}
            <View style={styles.tricolorRibbon}>
              <View style={styles.saffronStripe} />
              <View style={styles.whiteStripe}>
                <Text style={styles.ashokChakra}>☸</Text>
              </View>
              <View style={styles.greenStripe} />
            </View>

            <View style={styles.taglineContentRibbon}>
              <Animated.View
                style={[
                  styles.namasteIconSmall,
                  { transform: [{ rotate: namasteRotate }] }
                ]}
              >
                <Text style={styles.namasteEmojiSmall}>🙏</Text>
              </Animated.View>

              <View style={styles.textRibbon}>
                <Text style={styles.greetingRibbon}>
                  Namaste <Text style={styles.nameRibbon}>{getFirstName(userData?.name)}</Text>
                </Text>
                <Text style={styles.messageRibbon}>
                  Make An Appointment with{' '}
                  <Text style={styles.govHighlight}>Government</Text>
                </Text>
              </View>
            </View>

            <View style={styles.ribbonTail} />
          </View>
        </View>

        {/* Pass Management Section - Alternating Layout */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
          </View>
          <View style={styles.passManagementContainer}>
            {/* Today's Appointments - LEFT ALIGNED */}
            <TouchableOpacity
              style={styles.passRowLeft}
              onPress={() => navigation.navigate('TodaysPass')}
              activeOpacity={0.85}
            >
              <View style={styles.passImageBox}>
                <View style={styles.passImageBackground}>
                  <Icon name="calendar-check" size={50} color="#FFFFFF" />
                  <View style={styles.appointmentBadge}>
                    <Icon name="clock-outline" size={12} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <View style={styles.passTextCard}>
                <Text style={styles.passLabel}>Today's Appointments</Text>
                <Text style={styles.passDescription}>View your scheduled appointments for today</Text>
              </View>
            </TouchableOpacity>

            {/* Make An Appointment - RIGHT ALIGNED */}
            <TouchableOpacity
              style={styles.passRowRight}
              onPress={handleApplyForPass}
              activeOpacity={0.85}
            >
              <View style={styles.passTextCardRight}>
                <Text style={styles.passLabelRight}>Make An Appointment</Text>
                <Text style={styles.passDescriptionRight}>Schedule a new appointment</Text>
              </View>
              <View style={styles.passImageBox}>
                <View style={styles.passImageBackground}>
                  {/* Icon size matched to 50 (was 42) so this box reads the
                      same visual weight/size as the other two Quick Actions
                      boxes — the outer box was already a fixed 165x115, only
                      the icon inside it was smaller. */}
                  <Icon name="card-account-details" size={50} color="#FFFFFF" />
                  <View style={styles.appointmentPencilIcon}>
                    <Icon name="pencil" size={16} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* My Active Passes - LEFT ALIGNED */}
            <TouchableOpacity
              style={styles.passRowLeft}
              onPress={() => navigation.navigate('MyActivePasses')}
              activeOpacity={0.85}
            >
              <View style={styles.passImageBox}>
                <View style={styles.passImageBackground}>
                  <Icon name="badge-account-horizontal" size={50} color="#FFFFFF" />
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>
              </View>
              <View style={styles.passTextCard}>
                <Text style={styles.passLabel}>My Active Passes</Text>
                <Text style={styles.passDescription}>View all your active and approved passes</Text>
              </View>
            </TouchableOpacity>

          {/* Apply For Temporary Pass - RIGHT ALIGNED */}
{/* Hidden from UI — code kept for later re-enable */}
{false && (
  <TouchableOpacity
    style={styles.passRowRight}
    onPress={() => navigation.navigate('TemporaryPass')}
    activeOpacity={0.85}
  >
    <View style={styles.passTextCardRight}>
      <Text style={styles.passLabelRight}>Apply For Temporary Pass</Text>
      <Text style={styles.passDescriptionRight}>Get temporary access for walk-ins</Text>
    </View>
    <View style={styles.passImageBox}>
      <View style={styles.passImageBackground}>
        <Icon name="badge-account-horizontal" size={36} color="#FFFFFF" />
        <View style={styles.tempBadge}>
          <Text style={styles.tempBadgeText}>TEMP</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
)}
          </View>
        </View>

        {/* Image Banner Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Latest Updates</Text>
            </View>
          </View>

          <View style={styles.bannerContainer}>
            <Image
              source={bannerImages[currentImageIndex]}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerDots}>
              {bannerImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3477eb',
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 12,
  },
  headerWrapper: {
    backgroundColor: '#3477eb',
    paddingBottom: 2,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#3477eb',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#3477eb',
  },
  taglineCardWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  taglineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 36, 99, 0.08)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '100%',
    backgroundColor: 'rgba(10, 36, 99, 0.02)',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3477eb',
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#3477eb',
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3477eb',
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#0A2463',
    borderBottomRightRadius: 20,
  },
  taglineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  namasteIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  namasteIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#3477eb',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 2,
  },
  namasteEmoji: {
    fontSize: 32,
  },
  iconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(10, 36, 99, 0.15)',
    zIndex: 1,
  },
  taglineTextContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  helloText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3477eb',
    marginRight: 6,
  },
  userName2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2463',
  },
  messageContainer: {
    gap: 2,
  },
  makeAppointment: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3477eb',
    letterSpacing: 0.3,
  },
  withGovernmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  withText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666',
    fontStyle: 'italic',
  },
  governmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A2463',
    letterSpacing: 0.5,
  },
  decorativeDots: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -15 }],
    gap: 4,
  },
  dotPattern: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(10, 36, 99, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentAll: {
    paddingBottom: 30,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0A2463',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#0A2463',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlayTouch: {
    flex: 1,
  },
  drawer: {
    width: 280,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#3477eb',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuScroll: {
    flex: 1,
    backgroundColor: '#3477eb',
  },
  menuGroup: {
    paddingVertical: 8,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    letterSpacing: 1.2,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  menuTextDanger: {
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLine: {
    width: 4,
    height: 20,
    backgroundColor: '#0A2463',
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A2463',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A2463',
  },
  passManagementContainer: {
    gap: 24,
  },
  passRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  passRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    justifyContent: 'flex-end',
  },
  passImageBox: {
    width: 165,
    height: 130,
    // Locks the box to this exact size no matter what row/flex context it
    // sits in, so it can never get squeezed smaller than its siblings.
    flexShrink: 0,
  },
  passImageBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3477eb',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appointmentBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3477eb',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  appointmentPencilIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3477eb',
    borderRadius: 14,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3477eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tempBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3477eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tempBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  passTextCard: {
    flex: 1,
    height: 130,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
  },
  passTextCardRight: {
    flex: 1,
    height: 130,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  passLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 6,
  },
  passLabelRight: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 6,
    textAlign: 'right',
  },
  passDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
  passDescriptionRight: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    textAlign: 'right',
  },
  bannerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#0A2463',
    width: 24,
  },
  footer: {
    height: 20,
  },
  taglineCardRibbon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  tricolorRibbon: {
    width: 12,
    height: '100%',
  },
  saffronStripe: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  whiteStripe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenStripe: {
    flex: 1,
    backgroundColor: '#138808',
  },
  ashokChakra: {
    fontSize: 8,
    color: '#000080',
  },
  taglineContentRibbon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  namasteIconSmall: {
    width: 50,
    height: 50,
    backgroundColor: '#0A2463',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  namasteEmojiSmall: {
    fontSize: 28,
  },
  textRibbon: {
    flex: 1,
  },
  greetingRibbon: {
    fontSize: 16,
    color: '#0A2463',
    fontWeight: '600',
    marginBottom: 4,
  },
  nameRibbon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2463',
  },
  messageRibbon: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  govHighlight: {
    fontWeight: '700',
    color: '#0A2463',
  },
  ribbonTail: {
    width: 0,
    height: 0,
    borderTopWidth: 45,
    borderBottomWidth: 45,
    borderLeftWidth: 15,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
});

export default HomeScreen;