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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const TemporaryPassDetailScreen = ({ route, navigation }) => {
  const { passData } = route.params;
  const [personalDetails, setPersonalDetails] = useState(null);

  useEffect(() => {
    loadPersonalDetails();
  }, []);

  const loadPersonalDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem('personalDetails');
      if (storedDetails) {
        setPersonalDetails(JSON.parse(storedDetails));
      }
    } catch (error) {
      console.error('Error loading personal details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#2563eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Temporary Pass Details</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Feather name="download" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Pass Card */}
        <View style={styles.passCard}>
          {/* Top Banner */}
          <LinearGradient
            colors={['#00BCD4', '#0097A7']}
            style={styles.topBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bannerText}>NON-OFFICIAL • गृह मंत्रालय</Text>
          </LinearGradient>

          {/* Header Section with Government of India */}
          <View style={styles.cardHeader}>
            <View style={styles.govtSection}>
              <View style={styles.emblemCircle}>
                <Icon name="shield-star" size={32} color="#FF9933" />
              </View>
              <View style={styles.govtTextSection}>
                <Text style={styles.govtMainText}>Government of India</Text>
                <Text style={styles.govtHindiText}>भारत सरकार</Text>
                <Text style={styles.ministryText}>Ministry of Home Affairs</Text>
                <Text style={styles.passTypeMain}>Temporary Pass</Text>
              </View>
            </View>
            
            <View style={styles.locationSection}>
              <Text style={styles.locationText}>NIC Headquarter</Text>
            </View>
          </View>

          {/* Main Body */}
          <View style={styles.mainBody}>
            {/* Pass Number and Photo Row */}
            <View style={styles.topRow}>
              <View style={styles.passNumberSection}>
                <Text style={styles.passLabel}>Pass No. पास संख्या</Text>
                <Text style={styles.passNumber}>TP/{passData.id}/20/2026</Text>
                
                <Text style={styles.validityLabel}>Validity पास वैधता</Text>
                <Text style={styles.validityValue}>
                  {passData.date} To{'\n'}{passData.validUntil}
                </Text>
              </View>

              {/* Photo */}
              <View style={styles.photoSection}>
                {personalDetails?.photoUri ? (
                  <Image 
                    source={{ uri: personalDetails.photoUri }} 
                    style={styles.photoPlaceholder}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="account" size={50} color="#94A3B8" />
                  </View>
                )}
                
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(passData.status) }]}>
                  <Text style={styles.statusText}>{passData.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {/* Main Content Area */}
            <View style={styles.contentArea}>
              {/* Left Column - Visitor Details */}
              <View style={styles.leftColumn}>
                {/* Visitor Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Visitor Details आगंतुक विवरण</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name नाम</Text>
                    <Text style={styles.infoValue}>{personalDetails?.name || passData.visitorName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Designation पदनाम</Text>
                    <Text style={styles.infoValue}>{passData.passType}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Contact संपर्क नंबर</Text>
                    <Text style={styles.infoValue}>{personalDetails?.email || '7702000723'}</Text>
                  </View>
                </View>

                {/* Visit Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Visit Details विवरण</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Purpose उद्देश्य</Text>
                    <Text style={styles.infoValue}>{passData.purpose}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Department विभाग</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{passData.department}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date & Time तारीख और समय</Text>
                    <Text style={styles.infoValue}>{passData.date}, {passData.time}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Valid Until वैध तक</Text>
                    <Text style={styles.infoValue}>{passData.validUntil}</Text>
                  </View>
                </View>

                {/* Associated Organization */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Associated With संबद्ध</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Organization संगठन</Text>
                    <Text style={styles.infoValue} numberOfLines={3}>
                      {personalDetails?.presentAddress || 'NetProphets Cyberworks Pvt. Ltd., 6th Floor, Technopolis IT Hub C-56A/712, Sector-62 Uttar Pradesh- 201301'}
                    </Text>
                  </View>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                  <View style={styles.signRow}>
                    <View style={styles.signBox}>
                      <Text style={styles.signLabel}>Signature, Officer Visited:</Text>
                      <Text style={styles.signLabelHindi}>अधिकारी के हस्ताक्षर:</Text>
                      <View style={styles.signLine} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Right Column - QR and Additional Info */}
              <View style={styles.rightColumn}>
                {/* Valid Duration Box */}
                <View style={styles.durationBox}>
                  <View style={styles.stampCircle}>
                    <Icon name="seal" size={28} color="#0A2463" />
                  </View>
                  <Text style={styles.durationTitle}>Valid Duration</Text>
                  <Text style={styles.durationHindi}>वैध अवधि</Text>
                  <Text style={styles.durationTime}>{passData.time}</Text>
                  <View style={styles.dividerLine} />
                  <Text style={styles.regDate}>Reg Date: {passData.date}</Text>
                  <Text style={styles.printedOn}>Printed On: {passData.date} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>

                {/* Identity Details */}
                <View style={styles.identityBox}>
                  <Text style={styles.identityTitle}>ID Details पहचान विवरण</Text>
                  <Text style={styles.identityType}>{personalDetails?.identityProof || 'PASSPORT'}</Text>
                  <Text style={styles.identityNumber}>
                    {personalDetails?.identityProofNumber ? `****${personalDetails.identityProofNumber.slice(-4)}` : '****2620'}
                  </Text>
                </View>

                {/* QR Code */}
                <View style={styles.qrSection}>
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={`TP/${passData.id}/20/2026-${personalDetails?.name || passData.visitorName}-${passData.department}`}
                      size={100}
                      color="#0A2463"
                      backgroundColor="white"
                    />
                  </View>
                  <Text style={styles.qrLabel}>Valid Date वैध तिथि:</Text>
                  <Text style={styles.qrDate}>{passData.date}</Text>
                </View>

                {/* Consultant Info */}
                <View style={styles.consultantBox}>
                  <Text style={styles.consultantName}>JAI RAM</Text>
                  <Text style={styles.consultantRole}>CONSULTANT</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.instructionsSection}>
            <LinearGradient
              colors={['#00BCD4', '#0097A7']}
              style={styles.instructionHeader}
            >
              <Text style={styles.instructionTitle}>INSTRUCTIONS / दिशा निर्देश</Text>
            </LinearGradient>
            
            <View style={styles.instructionContent}>
              <Text style={styles.hindiInstruction}>
                जिस कार्यालय के लिए पास आवंटित है उसके अलावा आगंतुक सरकारी भवन के अन्य कार्यालयों में ना घूमें और मुलाकात के पश्चात पास को सुरक्षाकर्मी के पास अवश्य जमा करायें।
              </Text>
              <Text style={styles.englishInstruction}>
                VISITOR SHOULD NOT ROAM AROUND THE OFFICES IN THE GOVERNMENT BUILDING EXCEPT THE OFFICE TO BE VISITED AND HE/SHE MUST RETURN THE PASS TO SECURITY PERSONNEL AFTER THE VISIT
              </Text>
            </View>
          </View>

          {/* Footer */}
          <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.footer}>
            <Text style={styles.footerText}>A Digital India Initiative by Government of India</Text>
          </LinearGradient>
        </View>

        {/* Action Buttons (Only for Pending Status) */}
        {passData.status === 'Pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.approveButton} activeOpacity={0.8}>
              <Icon name="check-circle" size={22} color="#FFFFFF" />
              <Text style={styles.approveButtonText}>Approve Pass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.rejectButton} activeOpacity={0.8}>
              <Icon name="close-circle" size={22} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>Reject Pass</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.nicSection}>
            <View style={styles.nicBadge}>
              <Text style={styles.nicText}>NIC</Text>
            </View>
            <View>
              <Text style={styles.nicName}>NATIONAL</Text>
              <Text style={styles.nicName}>INFORMATICS</Text>
              <Text style={styles.nicName}>CENTRE</Text>
            </View>
          </View>
          
          <Text style={styles.copyright}>Copyright © 2026 by NIC. All rights reserved.</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  passCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  topBanner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  cardHeader: {
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  govtSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emblemCircle: {
    marginRight: 12,
  },
  govtTextSection: {
    flex: 1,
  },
  govtMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A2463',
    letterSpacing: 0.3,
  },
  govtHindiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  ministryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 4,
  },
  passTypeMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A2463',
    textDecorationLine: 'underline',
  },
  locationSection: {
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2463',
  },
  mainBody: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  passNumberSection: {
    flex: 1,
  },
  passLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  passNumber: {
    fontSize: 9,
    color: '#0A2463',
    fontWeight: '800',
    marginBottom: 12,
  },
  validityLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  validityValue: {
    fontSize: 9,
    color: '#0A2463',
    fontWeight: '800',
    lineHeight: 13,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 110,
    height: 135,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  contentArea: {
    flexDirection: 'row',
    gap: 14,
  },
  leftColumn: {
    flex: 1.6,
  },
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A2463',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 7.5,
    color: '#64748B',
    fontWeight: '600',
    width: 85,
    lineHeight: 10,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 8,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 11,
  },
  signatureSection: {
    marginTop: 10,
  },
  signRow: {
    marginTop: 8,
  },
  signBox: {
    flex: 1,
  },
  signLabel: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    lineHeight: 9,
  },
  signLabelHindi: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 9,
  },
  signLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    borderStyle: 'dotted',
  },
  durationBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  stampCircle: {
    marginBottom: 8,
  },
  durationTitle: {
    fontSize: 9,
    color: '#0A2463',
    fontWeight: '800',
  },
  durationHindi: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  durationTime: {
    fontSize: 11,
    color: '#0A2463',
    fontWeight: '900',
    marginBottom: 8,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: 6,
  },
  regDate: {
    fontSize: 7.5,
    color: '#0A2463',
    fontWeight: '700',
    marginBottom: 3,
  },
  printedOn: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '600',
  },
  identityBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  identityTitle: {
    fontSize: 8,
    color: '#78350F',
    fontWeight: '700',
    marginBottom: 4,
  },
  identityType: {
    fontSize: 9,
    color: '#78350F',
    fontWeight: '800',
    marginBottom: 2,
  },
  identityNumber: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '900',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  qrWrapper: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 7.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  qrDate: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A2463',
  },
  consultantBox: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  consultantName: {
    fontSize: 9,
    color: '#0A2463',
    fontWeight: '800',
    marginBottom: 2,
  },
  consultantRole: {
    fontSize: 7.5,
    color: '#64748B',
    fontWeight: '600',
  },
  instructionsSection: {
    marginTop: 8,
  },
  instructionHeader: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  instructionContent: {
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  hindiInstruction: {
    fontSize: 7.5,
    color: '#0A2463',
    textAlign: 'center',
    lineHeight: 11,
    marginBottom: 8,
    fontWeight: '600',
  },
  englishInstruction: {
    fontSize: 7,
    color: '#0EA5D1',
    textAlign: 'center',
    lineHeight: 10,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actionButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomInfo: {
    backgroundColor: '#3477eb',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nicBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  nicText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3477eb',
  },
  nicName: {
    fontSize: 7,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyright: {
    fontSize: 8,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});

export default TemporaryPassDetailScreen;