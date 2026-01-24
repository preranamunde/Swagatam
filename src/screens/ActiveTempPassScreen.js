import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

const ActiveTempPassScreen = ({ navigation }) => {
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPersonalData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPersonalData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('personalDetails');
      if (storedData) {
        setPersonalData(JSON.parse(storedData));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading personal data:', error);
      setLoading(false);
    }
  };

  // Hardcoded pass data - you can modify these values
  const passData = {
    passNumber: '69/1/20/2026',
    fromDate: '05/01/2026',
    toDate: '31/03/2026',
    location: 'NIC Headquarter',
    designation: 'Program Manager',
    contact: '7702000723',
    ministry: 'HOD National Scholarship Portal 2.0 NSP 2.0,Tribunals DRT,CAT,CESTAT,NCLAT',
    organization: 'National Informatics Centre',
    associatedWith: 'NetProphets Cyberworks Pvt. Ltd., 6th Floor, Technopolis IT Hub,C-56A/712, Sector-62 Uttar Pradesh- 201301',
    authorityName: 'JAI RAM',
    authorityDesignation: 'CONSULTANT',
  };

  const formatDate = (dateString) => {
    return dateString;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Generate QR code data
  const qrData = JSON.stringify({
    passNo: passData.passNumber,
    name: personalData?.name || 'SURESH GUPTA',
    validity: `${passData.fromDate} To ${passData.toDate}`,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Temporary Pass</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pass Card */}
        <View style={styles.passCard}>
          {/* Watermark */}
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>NON-OFFICIAL</Text>
          </View>

          {/* Header Section */}
          <View style={styles.passHeader}>
            <View style={styles.emblemContainer}>
              <Text style={styles.emblemText}>🇮🇳</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.nonOfficialText}>NON-OFFICIAL</Text>
              <Text style={styles.hindiText}>भारत सरकार</Text>
              <Text style={styles.govText}>Government of India</Text>
              <Text style={styles.ministryHindi}>गृह मंत्रालय</Text>
              <Text style={styles.ministryText}>Ministry of Home Affairs</Text>
            </View>
            <View style={styles.digitalIndiaLogo}>
              <View style={styles.digitalIndiaIcon}>
                <Text style={styles.digitalIndiaIconText}>🇮🇳</Text>
              </View>
              <Text style={styles.digitalIndiaText}>SWAGATAM</Text>
            </View>
          </View>

          {/* Pass Title */}
          <View style={styles.passTitleContainer}>
            <Text style={styles.passTitleText}>Temporary Pass</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Location */}
          <Text style={styles.locationText}>{passData.location}</Text>

          {/* Main Content Section */}
          <View style={styles.mainContent}>
            {/* Left Section - Pass Details and QR */}
            <View style={styles.leftSection}>
              {/* Pass Number */}
              <View style={styles.detailRow}>
                <Text style={styles.labelText}>Pass No. पास संख्या</Text>
                <Text style={styles.valueText}>{passData.passNumber}</Text>
              </View>

              {/* Validity */}
              <View style={styles.detailRow}>
                <Text style={styles.labelText}>Validity पास वैधता</Text>
                <Text style={styles.valueText}>
                  {passData.fromDate} To{'\n'}{passData.toDate}
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData}
                  size={90}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            </View>

            {/* Right Section - Photo and Signature */}
            <View style={styles.rightSection}>
              {/* Photo */}
              <View style={styles.photoContainer}>
                {personalData?.photoUri ? (
                  <Image
                    source={{ uri: personalData.photoUri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      {personalData?.name ? personalData.name.charAt(0) : 'S'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Signature Placeholder */}
              <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>✍️</Text>
              </View>
            </View>
          </View>

          {/* Personal Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Name{'\n'}नाम</Text>
              <Text style={styles.detailValue}>{personalData?.name || 'SURESH GUPTA'}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Designation{'\n'}पदनाम</Text>
              <Text style={styles.detailValue}>{passData.designation}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Contact{'\n'}संपर्क नंबर</Text>
              <Text style={styles.detailValue}>{passData.contact}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Ministry / Deptt.{'\n'}मंत्रालय / विभाग</Text>
              <Text style={styles.detailValue}>{passData.ministry}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Associated with{'\n'}सम्बंधित</Text>
              <Text style={styles.detailValue}>{passData.associatedWith}</Text>
            </View>
          </View>

          {/* Authority Signature */}
          <View style={styles.authoritySection}>
            <View style={styles.stampPlaceholder}>
              <Text style={styles.stampText}>OFFICIAL{'\n'}STAMP</Text>
            </View>
            <View style={styles.authoritySignature}>
              <Text style={styles.authorityName}>{passData.authorityName},</Text>
              <Text style={styles.authorityDesignation}>{passData.authorityDesignation}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <Text style={styles.footerLogoText}>🇮🇳</Text>
            </View>
            <Text style={styles.footerText}>A Digital India Initiative by Government of India.</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => Alert.alert('Download', 'Download functionality coming soon')}
          >
            <Text style={styles.downloadIcon}>📥</Text>
            <Text style={styles.buttonText}>Download Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('Share', 'Share functionality coming soon')}
          >
            <Text style={styles.shareIcon}>📤</Text>
            <Text style={styles.buttonText}>Share Pass</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0A2463',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  passCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0A2463',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '45%',
    left: '15%',
    transform: [{ rotate: '-45deg' }],
    opacity: 0.05,
    zIndex: 0,
  },
  watermarkText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0A2463',
    letterSpacing: 3,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  emblemContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A2463',
  },
  emblemText: {
    fontSize: 28,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  nonOfficialText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  hindiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A2463',
  },
  govText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 2,
  },
  ministryHindi: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0A2463',
  },
  ministryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A2463',
  },
  digitalIndiaLogo: {
    width: 55,
    alignItems: 'center',
  },
  digitalIndiaIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  digitalIndiaIconText: {
    fontSize: 20,
  },
  digitalIndiaText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0A2463',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  passTitleContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  passTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2463',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 130,
    height: 2,
    backgroundColor: '#0A2463',
    marginTop: 3,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
    paddingRight: 10,
  },
  detailRow: {
    marginBottom: 10,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 14,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rightSection: {
    width: 90,
    alignItems: 'center',
  },
  photoContainer: {
    width: 90,
    height: 110,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0A2463',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#64748B',
  },
  signatureBox: {
    width: '100%',
    height: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 16,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginBottom: 10,
  },
  detailItemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    width: '32%',
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 11,
  },
  detailValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 12,
  },
  authoritySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingTop: 6,
  },
  stampPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0A2463',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  stampText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#0A2463',
    textAlign: 'center',
    lineHeight: 10,
  },
  authoritySignature: {
    alignItems: 'center',
  },
  authorityName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2463',
  },
  authorityDesignation: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
  },
  footerLogo: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  footerLogoText: {
    fontSize: 16,
  },
  footerText: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  downloadButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  shareIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ActiveTempPassScreen;