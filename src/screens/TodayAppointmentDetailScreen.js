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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const TodayAppointmentDetailScreen = ({ navigation, route }) => {
  const [personalDetails, setPersonalDetails] = useState(null);
  
  // Get appointment data from navigation params
  const appointmentData = route?.params?.passData || {
    officerName: 'DEEPAK KUMAR',
    designation: 'Scientist F',
    department: 'MHA-Network and VC',
    agency: 'Ministry of Home Affairs',
    date: '30/12/2025',
    day: 'Wednesday',
    dayNum: '30',
    month: 'Dec',
    time: '14:50 - 16:30',
    passNo: 'A/0208/0022/1712547/2025/5397',
    visitorName: 'SURESH GUPTA',
    location: 'North Block',
    purpose: 'Official Meeting',
    participants: 2,
  };

  useEffect(() => {
    loadPersonalDetails();
  }, []);

  const loadPersonalDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem('personalDetails');
      if (storedDetails) {
        const details = JSON.parse(storedDetails);
        setPersonalDetails(details);
        console.log('Loaded personal details:', details);
      }
    } catch (error) {
      console.error('Error loading personal details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0A2463', '#0A2463']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pass Details</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Feather name="more-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Banner */}
        <LinearGradient
          colors={['#00BCD4', '#0097A7']}
          style={styles.topBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bannerText}>गृह मंत्रालय • स्वागत संगठन</Text>
        </LinearGradient>

        {/* Main Pass Card */}
        <View style={styles.passCard}>
          {/* Header Section */}
          <View style={styles.passHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.logoCircle}>
                <Icon name="account-group" size={28} color="#0A2463" />
              </View>
              <View>
                <Text style={styles.logoTitle}>SWAGATAM</Text>
                <Text style={styles.logoSubtitle}>Gateway to Visitor Convenience</Text>
              </View>
            </View>
            
            <View style={styles.headerCenter}>
              <Text style={styles.buildingName}>( Kartavya Bhawan 3 )</Text>
              <Text style={styles.passType}>Daily Visitor Pass</Text>
            </View>

            <View style={styles.headerRight}>
              <Icon name="shield-star" size={50} color="#FF9933" />
            </View>
          </View>

          {/* Main Content - 3 Columns */}
          <View style={styles.mainContent}>
            {/* Left Column - Visitor & Meeting Details */}
            <View style={styles.leftColumn}>
              {/* Registration Number */}
              <View style={styles.regNoSection}>
                <Text style={styles.sectionLabel}>Reg No पंजीकरण संख्या</Text>
                <Text style={styles.regNumber}>{appointmentData.passNo}</Text>
              </View>

              {/* Visitor Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visitor Details आगंतुक विवरण</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Name{'\n'}नाम</Text>
                  <Text style={styles.value}>{personalDetails?.name || appointmentData.visitorName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>F/S Name{'\n'}पिता/पति का नाम</Text>
                  <Text style={styles.value}>{personalDetails?.fatherHusbandName || 'RAJDEO PRASAD'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Gender{'\n'}लिंग</Text>
                  <Text style={styles.value}>{personalDetails?.gender || 'M'}</Text>
                </View>
              </View>

              {/* To Meet Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>To Meet मिलने को</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Officer Name{'\n'}अधिकारी का नाम</Text>
                  <Text style={styles.value}>{appointmentData.officerName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Approving Officer{'\n'}अनुमोदन अधिकारी</Text>
                  <Text style={styles.value} numberOfLines={2}>{appointmentData.officerName}({appointmentData.designation})</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Address{'\n'}पता</Text>
                  <Text style={styles.value} numberOfLines={3}>{appointmentData.department}, {appointmentData.agency}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Purpose / उद्देश्य</Text>
                  <Text style={styles.value}>{appointmentData.purpose.toUpperCase()}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Remark / टिप्पणी</Text>
                  <Text style={styles.value}>ONLINE PASS</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Signature, Officer Visited:{'\n'}अधिकारी के हस्ताक्षर:</Text>
                  <View style={styles.signatureLine} />
                </View>
              </View>
            </View>

            {/* Center Column - Photo & Additional Info */}
            <View style={styles.centerColumn}>
              {/* Valid Duration */}
              <View style={styles.validDurationBox}>
                <Text style={styles.validLabel}>Valid Duration वैध अवधि</Text>
                <Text style={styles.validTime}>{appointmentData.time}</Text>
                <Text style={styles.printedText}>Printed On: {appointmentData.date} 15:23</Text>
              </View>

              {/* Reg Date */}
              <View style={styles.regDateBox}>
                <Text style={styles.regDateLabel}>Reg Date पंजीकरण तिथि</Text>
                <Text style={styles.regDateValue}>{appointmentData.date}</Text>
              </View>

              {/* Photo */}
              <View style={styles.photoBox}>
                {personalDetails?.photoUri ? (
                  <Image 
                    source={{ uri: personalDetails.photoUri }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="account" size={50} color="#94A3B8" />
                  </View>
                )}
              </View>

              {/* Address & Contact Info */}
              <View style={styles.contactSection}>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Address{'\n'}पता</Text>
                  <Text style={styles.contactValue} numberOfLines={4}>
                    {personalDetails?.presentAddress || "**26 'BHAY 'HAND **I, *******'RAM *****'ABAD"}
                  </Text>
                </View>

                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Mobile No.{'\n'}मोबाइल नंबर</Text>
                  <Text style={styles.contactValue}>******0723</Text>
                </View>

                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>ID Details{'\n'}पहचान विवरण</Text>
                  <Text style={styles.contactValue}>
                    {personalDetails?.identityProof || 'PASSPORT'}{'\n'}
                    {personalDetails?.identityProofNumber ? `****${personalDetails.identityProofNumber.slice(-4)}` : '****2620'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column - QR & Validation */}
            <View style={styles.rightColumn}>
              {/* Pass ID */}
              <View style={styles.passIdBox}>
                <Text style={styles.passIdLabel}>PASS ID</Text>
                <Text style={styles.passIdValue}>#{appointmentData.passNo.split('/').pop()}</Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrBox}>
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={appointmentData.passNo}
                    size={110}
                    color="#0A2463"
                    backgroundColor="white"
                  />
                </View>
              </View>

              {/* Valid Date */}
              <View style={styles.validDateBox}>
                <Text style={styles.validDateLabel}>Valid Date{'\n'}वैध तिथि :</Text>
                <Text style={styles.validDateValue}>{appointmentData.date}</Text>
              </View>

              {/* Reception Officer */}
              <View style={styles.receptionBox}>
                <Text style={styles.receptionTitle}>Sr. Reception/{'\n'}Reception Officer</Text>
                <Text style={styles.receptionHindi}>वरिष्ठ स्वागत स्वागत{'\n'}अधिकारी</Text>
                <Text style={styles.officerName}>(Kishan Raj Singh Hada)</Text>
                <Text style={styles.gateInfo}>Gate No.1, Kartavya Bhawan 3</Text>
                <Text style={styles.ejCode}>EJA6SWAP-SWA110.19.11.187</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <LinearGradient
              colors={['#00BCD4', '#0097A7']}
              style={styles.instructionsHeader}
            >
              <Text style={styles.instructionsTitle}>INSTRUCTIONS/दिशा निर्देश</Text>
            </LinearGradient>
            
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsHindi}>
                जिस कार्यालय के लिए पास आवंटित है उसके अलावा आगंतुक सरकारी भवन के अन्य कार्यालयों में ना घूमें और मुलाकात के पश्चात पास को सुरक्षाकर्मी के पास अवश्य जमा करायें।
              </Text>
              <Text style={styles.instructionsEnglish}>
                VISITOR SHOULD NOT ROAM AROUND THE OFFICES IN THE GOVERNMENT BUILDING EXCEPT THE OFFICE TO BE VISITED AND HE/SHE MUST RETURN THE PASS TO SECURITY PERSONNEL AFTER THE VISIT
              </Text>
            </View>
          </View>

          {/* Footer */}
          <LinearGradient
            colors={['#00BCD4', '#0097A7']}
            style={styles.footer}
          >
            <Text style={styles.footerText}>MINISTRY OF HOME AFFAIRS  •  RECEPTION ORGANISATION</Text>
          </LinearGradient>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomSection}>
          <View style={styles.digitalIndiaRow}>
            <Icon name="flag" size={18} color="#FF9933" />
            <Text style={styles.digitalIndiaText}>A Digital India Initiative by Government of India</Text>
          </View>
          
          <Text style={styles.copyrightText}>Copyright © 2019 by NIC. All rights reserved.</Text>
          
          <View style={styles.nicRow}>
            <View style={styles.nicBadge}>
              <Text style={styles.nicText}>NIC</Text>
            </View>
            <View style={styles.nicInfo}>
              <Text style={styles.nicFullName}>NATIONAL</Text>
              <Text style={styles.nicFullName}>INFORMATICS</Text>
              <Text style={styles.nicFullName}>CENTRE</Text>
            </View>
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
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  topBanner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
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
  passHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A2463',
  },
  logoSubtitle: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  buildingName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  passType: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A2463',
  },
  headerRight: {
    width: 50,
    alignItems: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    padding: 16,
  },
  leftColumn: {
    flex: 2.2,
    paddingRight: 12,
    minWidth: 0,
  },
  centerColumn: {
    flex: 1.8,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 0,
  },
  rightColumn: {
    flex: 1.5,
    paddingLeft: 12,
    alignItems: 'center',
    minWidth: 0,
  },
  regNoSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  regNumber: {
    fontSize: 10,
    color: '#0A2463',
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A2463',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    width: 85,
    lineHeight: 11,
    flexShrink: 0,
  },
  value: {
    fontSize: 9,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 12,
    flexWrap: 'wrap',
  },
  signatureLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    marginTop: 8,
  },
  validDurationBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  validLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  validTime: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A2463',
    marginBottom: 3,
  },
  printedText: {
    fontSize: 7,
    color: '#94A3B8',
  },
  regDateBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  regDateLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  regDateValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2463',
  },
  photoBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  photo: {
    width: 110,
    height: 130,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  photoPlaceholder: {
    width: 110,
    height: 130,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactSection: {
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  contactLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    width: 50,
    lineHeight: 10,
    flexShrink: 0,
  },
  contactValue: {
    fontSize: 8,
    color: '#0A2463',
    fontWeight: '600',
    flex: 1,
    lineHeight: 11,
    flexWrap: 'wrap',
  },
  passIdBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  passIdLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  passIdValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2463',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qrBox: {
    marginBottom: 16,
    alignItems: 'center',
  },
  qrCodeContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  validDateBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  validDateLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 11,
  },
  validDateValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A2463',
  },
  receptionBox: {
    alignItems: 'center',
  },
  receptionTitle: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 10,
    marginBottom: 2,
  },
  receptionHindi: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
    marginBottom: 4,
  },
  officerName: {
    fontSize: 8,
    color: '#0A2463',
    fontWeight: '700',
    marginBottom: 3,
  },
  gateInfo: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  ejCode: {
    fontSize: 6,
    color: '#94A3B8',
    fontWeight: '500',
  },
  instructionsSection: {
    marginTop: 8,
  },
  instructionsHeader: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  instructionsContent: {
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  instructionsHindi: {
    fontSize: 8,
    color: '#0A2463',
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  instructionsEnglish: {
    fontSize: 7,
    color: '#0EA5D1',
    textAlign: 'center',
    lineHeight: 11,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomSection: {
    backgroundColor: '#0A2463',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  digitalIndiaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  digitalIndiaText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 9,
    color: '#E2E8F0',
    marginVertical: 12,
  },
  nicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  nicBadge: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nicText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nicInfo: {
    gap: 1,
  },
  nicFullName: {
    fontSize: 7,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomPadding: {
    height: 20,
  },
});

export default TodayAppointmentDetailScreen;