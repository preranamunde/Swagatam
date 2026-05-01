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

const { width } = Dimensions.get('window');

const OfficerHomeScreen = ({ navigation }) => {
  const [officerData, setOfficerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const namasteAnim = useRef(new Animated.Value(0)).current;

  // Hardcoded email for officer
  const hardcodedEmail = 'officer.kumar@gov.in';

  // Banner images array
  const bannerImages = [
    require('../assets/images/image1.png'),
    require('../assets/images/image2.png'),
    require('../assets/images/image3.png'),
  ];

  useEffect(() => {
    loadOfficerData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

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

  const loadOfficerData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('officerData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setOfficerData(parsedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading officer data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDrawerVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('userRole');
          await AsyncStorage.removeItem('officerData');
          navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
          });
        },
      },
    ]);
  };

  const openDrawer = () => setDrawerVisible(true);

  const MenuOption = ({ iconName, title, onPress, isDanger = false }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
      <Icon name={iconName} size={22} color={isDanger ? '#DC2626' : '#FFFFFF'} />
      <Text style={[styles.menuText, isDanger && styles.menuTextDanger]}>{title}</Text>
      <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  const namasteRotate = namasteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <View style={styles.loader}>
          <Icon name="loading" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
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
              <View style={styles.userSection}>
                <TouchableOpacity 
                  style={styles.avatar}
                  activeOpacity={0.8}
                  onPress={() => { 
                    setDrawerVisible(false); 
                    navigation.navigate('MyProfile'); 
                  }}
                >
                  <Image 
                    source={require('../assets/images/profile.jpeg')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    Suresh Gupta
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {hardcodedEmail}
                  </Text>
                </View>
              </View>
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
                  onPress={() => setDrawerVisible(false)} 
                />
                <MenuOption 
                  iconName="help-circle-outline" 
                  title="Help & Support" 
                  onPress={() => setDrawerVisible(false)} 
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

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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

        {/* Officer Welcome Card with Tricolor Ribbon */}
        <View style={styles.welcomeCardWrapper}>
          <View style={styles.welcomeCardRibbon}>
            {/* Tricolor ribbon on left */}
            <View style={styles.tricolorRibbon}>
              <View style={styles.saffronStripe} />
              <View style={styles.whiteStripe}>
                <Text style={styles.ashokChakra}>☸</Text>
              </View>
              <View style={styles.greenStripe} />
            </View>
            
            <View style={styles.welcomeContent}>
              <Animated.View 
                style={[
                  styles.namasteIconSmall,
                  { transform: [{ rotate: namasteRotate }] }
                ]}
              >
                <Text style={styles.namasteEmojiSmall}>🙏</Text>
              </Animated.View>
              
              <View style={styles.welcomeText}>
                <Text style={styles.greetingRibbon}>
                  Namaste <Text style={styles.nameRibbon}>{officerData?.name?.split(' ')[0] || 'Officer'},</Text>
                </Text>
                <Text style={styles.messageRibbon}>Welcome Back!</Text>
              </View>
            </View>
            
            <View style={styles.ribbonTail} />
          </View>
        </View>

        {/* Main Action Cards - 2 Square Cards */}
        <View style={styles.actionCardsSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
          </View>

          <View style={styles.actionCardsGrid}>
            {/* Approve Appointments Card */}
            <TouchableOpacity 
              style={styles.actionSquareCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ApproveAppointments')}
            >
              <View style={styles.countBubble}>
                <Text style={styles.bubbleCount}>99</Text>
              </View>
              <View style={styles.cardIconWrapper}>
                <Icon name="calendar-check" size={36} color="#3477eb" />
              </View>
              <Text style={styles.actionCardLabel}>Approve{'\n'}Appointments</Text>
            </TouchableOpacity>

            {/* Approved Temp Pass Card */}
            <TouchableOpacity 
              style={styles.actionSquareCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ApprovedTempPassScreen')}
            >
              <View style={styles.countBubble}>
                <Text style={styles.bubbleCount}>92</Text>
              </View>
              <View style={styles.cardIconWrapper}>
                <Icon name="badge-account-horizontal" size={36} color="#3477eb" />
              </View>
              <Text style={styles.actionCardLabel}>Approve{'\n'}Temp Pass</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Visitor Visit Button */}
        <View style={styles.createVisitorSection}>
          <TouchableOpacity 
            style={styles.createVisitorButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CreateVisitorVisit')}
          >
            <View style={styles.createVisitorIcon}>
              <Icon name="account-multiple-plus" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.createVisitorText}>
              <Text style={styles.createVisitorTitle}>Create Visitor Visit</Text>
            </View>
            <Icon name="chevron-right" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Image Banner Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Latest News</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#FF5252',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeCardWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  welcomeCardRibbon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 119, 235, 0.08)',
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
  welcomeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  namasteIconSmall: {
    width: 50,
    height: 50,
    backgroundColor: '#3477eb',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  namasteEmojiSmall: {
    fontSize: 28,
  },
  welcomeText: {
    flex: 1,
  },
  greetingRibbon: {
    fontSize: 16,
    color: '#3477eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  nameRibbon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3477eb',
  },
  messageRibbon: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontWeight: '600',
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
  actionCardsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeaderRow: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLine: {
    width: 4,
    height: 20,
    backgroundColor: '#3477eb',
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3477eb',
  },
  actionCardsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionSquareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  cardIconWrapper: {
    marginBottom: 16,
  },
  countBubble: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#3477eb',
    borderRadius: 20,
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  bubbleCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actionCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  createVisitorSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  createVisitorButton: {
    backgroundColor: '#3477eb',
    borderRadius: 30,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createVisitorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createVisitorText: {
    flex: 1,
  },
  createVisitorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createVisitorSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
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
    backgroundColor: '#3477eb',
    width: 24,
  },
  footer: {
    height: 20,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
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
});

export default OfficerHomeScreen;