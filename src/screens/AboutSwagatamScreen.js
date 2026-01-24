import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

const AboutSwagatamScreen = ({ navigation }) => {
  const Section = ({ icon, title, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBadge}>
          <Text style={styles.sectionIcon}>{icon}</Text>
        </View>
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
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Swagatam</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🏛️</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Swagatam</Text>
          <Text style={styles.heroSubtitle}>Digital Visitor Management System</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Digital India</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Secure</Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        <Section icon="📖" title="About the System">
          <Text style={styles.text}>
            Swagatam is a Government of India initiative designed to simplify appointment scheduling for citizens. This system bridges the gap between government offices and the public, enabling hassle-free appointments with government officers.
          </Text>
          <Text style={styles.text}>
            The platform eliminates cumbersome procedures by providing a streamlined digital process for requesting and managing appointments. Built on cloud technology by NIC, it features an intuitive interface with robust security measures.
          </Text>
        </Section>

        {/* How It Works */}
        <Section icon="⚙️" title="How It Works">
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Register</Text>
              <Text style={styles.stepText}>Visit Swagatam.gov.in and register with mobile and email</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verify</Text>
              <Text style={styles.stepText}>Confirm registration using OTP sent to your mobile</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Request Appointment</Text>
              <Text style={styles.stepText}>Select office, officer, and preferred date/time slots</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Confirmation</Text>
              <Text style={styles.stepText}>Receive SMS and email alerts when approved</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Visit Office</Text>
              <Text style={styles.stepText}>Print your gate pass and visit at scheduled time</Text>
            </View>
          </View>
        </Section>

        {/* Key Features */}
        <Section icon="✨" title="Key Features">
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>☁️</Text>
              <Text style={styles.featureTitle}>Cloud Based</Text>
              <Text style={styles.featureDesc}>Multi-tenant architecture</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureTitle}>Secure</Text>
              <Text style={styles.featureDesc}>Advanced security features</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>SMS Alerts</Text>
              <Text style={styles.featureDesc}>Real-time notifications</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Reports</Text>
              <Text style={styles.featureDesc}>Comprehensive analytics</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Fast Access</Text>
              <Text style={styles.featureDesc}>Quick registration</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureTitle}>Scalable</Text>
              <Text style={styles.featureDesc}>Highly scalable system</Text>
            </View>
          </View>
        </Section>

        {/* For Organizations */}
        <Section icon="🏢" title="For Organizations">
          <Text style={styles.infoTitle}>Interested in using Swagatam?</Text>
          <Text style={styles.text}>
            Central Government, State Government, and Public Sector organizations can submit their onboarding request online.
          </Text>
          
          <View style={styles.requirementBox}>
            <Text style={styles.requirementTitle}>📋 Requirements</Text>
            <BulletPoint text="Internet connectivity (1 system per 50 visitors/day)" />
            <BulletPoint text="Computer with stable power supply" />
            <BulletPoint text="Printer, webcam, and barcode reader" />
            <BulletPoint text="Wired internet connection" />
          </View>
        </Section>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.nicCard}>
            <View style={styles.nicLogoBox}>
              <Text style={styles.nicLogo}>NIC</Text>
            </View>
            <Text style={styles.nicTitle}>National Informatics Centre</Text>
            <Text style={styles.nicSubtitle}>Ministry of Electronics & IT</Text>
            <View style={styles.divider} />
            <Text style={styles.copyright}>© 2019 NIC. All rights reserved.</Text>
          </View>

          <View style={styles.govInitiative}>
            <Text style={styles.initiativeIcon}>🏛️</Text>
            <Text style={styles.initiativeText}>A Digital India Initiative</Text>
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
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#0A2463',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#EEF2FF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0A2463',
  },
  logoText: {
    fontSize: 50,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2463',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    backgroundColor: '#0A2463',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionIconBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionContent: {
    padding: 20,
  },
  text: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0A2463',
  },
  stepNumber: {
    width: 36,
    height: 36,
    backgroundColor: '#0A2463',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
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
    color: '#0F172A',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 10,
  },
  requirementBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  requirementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A2463',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  footerContainer: {
    marginHorizontal: 16,
    marginTop: 30,
  },
  nicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nicLogoBox: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0A2463',
  },
  nicLogo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A2463',
    letterSpacing: 2,
  },
  nicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  nicSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  copyright: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  govInitiative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A2463',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  initiativeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  initiativeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 20,
  },
});

export default AboutSwagatamScreen;