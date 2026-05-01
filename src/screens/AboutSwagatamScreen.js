import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const AboutSwagatamScreen = ({ navigation }) => {
  const Section = ({ icon, title, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={20} color="#3477eb" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const BulletPoint = ({ text }) => (
    <View style={styles.bulletContainer}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
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
          <Text style={styles.headerTitle}>About Swagatam</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="office-building" size={48} color="#3477eb" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Swagatam</Text>
          <Text style={styles.heroSubtitle}>Digital Visitor Management System</Text>
          <Text style={styles.heroDescription}>
            Government of India • Ministry of Home Affairs
          </Text>
        </View>

        {/* Introduction */}
        <Section icon="information-outline" title="About the System">
          <Text style={styles.text}>
            Swagatam is a Government of India initiative designed to simplify appointment scheduling for citizens. This system bridges the gap between government offices and the public, enabling hassle-free appointments with government officers.
          </Text>
          <Text style={styles.text}>
            The platform eliminates cumbersome procedures by providing a streamlined digital process for requesting and managing appointments. Built on cloud technology by NIC, it features an intuitive interface with robust security measures.
          </Text>
        </Section>

        {/* How It Works */}
        <Section icon="cog-outline" title="How It Works">
          <View style={styles.stepCard}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Register</Text>
              <Text style={styles.stepText}>Visit Swagatam.gov.in and register with mobile and email</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verify</Text>
              <Text style={styles.stepText}>Confirm registration using OTP sent to your mobile</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Request Appointment</Text>
              <Text style={styles.stepText}>Select office, officer, and preferred date/time slots</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Confirmation</Text>
              <Text style={styles.stepText}>Receive SMS and email alerts when approved</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Visit Office</Text>
              <Text style={styles.stepText}>Print your gate pass and visit at scheduled time</Text>
            </View>
          </View>
        </Section>

        {/* Key Features */}
        <Section icon="star-outline" title="Key Features">
          <View style={styles.featuresList}>
            <View style={styles.featureLine}>
              <Icon name="cloud-outline" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Cloud Based</Text>
                <Text style={styles.featureDesc}>Multi-tenant cloud architecture</Text>
              </View>
            </View>

            <View style={styles.featureLine}>
              <Icon name="shield-lock-outline" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure</Text>
                <Text style={styles.featureDesc}>Advanced security features</Text>
              </View>
            </View>

            <View style={styles.featureLine}>
              <Icon name="message-alert-outline" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>SMS Alerts</Text>
                <Text style={styles.featureDesc}>Real-time notifications</Text>
              </View>
            </View>

            <View style={styles.featureLine}>
              <Icon name="chart-line" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Reports</Text>
                <Text style={styles.featureDesc}>Comprehensive analytics</Text>
              </View>
            </View>

            <View style={styles.featureLine}>
              <Icon name="lightning-bolt-outline" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fast Access</Text>
                <Text style={styles.featureDesc}>Quick registration process</Text>
              </View>
            </View>

            <View style={styles.featureLine}>
              <Icon name="arrow-expand-all" size={24} color="#3477eb" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Scalable</Text>
                <Text style={styles.featureDesc}>Highly scalable system</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* For Organizations */}
        <Section icon="office-building-outline" title="For Organizations">
          <Text style={styles.infoTitle}>Interested in using Swagatam?</Text>
          <Text style={styles.text}>
            Central Government, State Government, and Public Sector organizations can submit their onboarding request online.
          </Text>
          
          <View style={styles.requirementBox}>
            <Text style={styles.requirementTitle}>System Requirements</Text>
            <BulletPoint text="Internet connectivity (1 system per 50 visitors/day)" />
            <BulletPoint text="Computer with stable power supply" />
            <BulletPoint text="Printer, webcam, and barcode reader" />
            <BulletPoint text="Wired internet connection recommended" />
          </View>
        </Section>

        {/* Benefits */}
        <Section icon="check-circle-outline" title="Why Choose Swagatam">
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Icon name="clock-fast" size={24} color="#3477eb" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Save Time</Text>
                <Text style={styles.benefitText}>Eliminate waiting in long queues</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Icon name="shield-check-outline" size={24} color="#3477eb" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Secure & Safe</Text>
                <Text style={styles.benefitText}>Your data is protected with encryption</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Icon name="cellphone-check" size={24} color="#3477eb" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Easy to Use</Text>
                <Text style={styles.benefitText}>Simple and intuitive interface</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Icon name="bell-ring-outline" size={24} color="#3477eb" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Real-time Updates</Text>
                <Text style={styles.benefitText}>Get instant notifications via SMS and email</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Footer with NIC Logo */}
        <View style={styles.footerContainer}>
          <Image 
            source={require('../assets/images/niclogo.jpeg')} 
            style={styles.nicLogo}
            resizeMode="contain"
          />

          <View style={styles.copyrightBox}>
            <Text style={styles.copyright}>© 2019-2026 National Informatics Centre. All rights reserved.</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
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
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3477eb',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionContent: {
    padding: 20,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepNumberBox: {
    width: 40,
    height: 40,
    backgroundColor: '#3477eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  featuresList: {
    gap: 0,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  requirementBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3477eb',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  benefitsContainer: {
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  benefitContent: {
    flex: 1,
    marginLeft: 14,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  footerContainer: {
    backgroundColor: '#F8FAFC',
    marginTop: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  nicLogo: {
    width: '100%',
    height: 120,
    marginBottom: 10,
    borderRadius:20,
  },
  copyrightBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default AboutSwagatamScreen;