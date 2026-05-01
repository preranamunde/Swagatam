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
  
  const appointmentData = route?.params?.passData || {
    officerName: 'DEEPAK KUMAR',
    designation: 'Scientist F',
    department: 'MHA-Network and VC',
    agency: 'Ministry of Home Affairs',
    date: '30/12/2025',
    day: 'Wednesday',
    dayNum: '30',
    month: 'Dec',
    time: '14:50 - 17:50',
    passNo: 'A/0208/0022/1712547/2025/5397',
    visitorName: 'SURESH GUPTA',
    location: 'North Block',
    purpose: 'Meeting',
    participants: 2,
  };

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
      
      {/* Header */}
      <LinearGradient colors={['#3477eb', '#2563eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pass Details</Text>
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
            <Text style={styles.bannerText}>गृह मंत्रालय • स्वागत संगठन</Text>
          </LinearGradient>

          {/* Header Row with Logo and Building Name */}
          <View style={styles.cardHeader}>
            <View style={styles.logoSection}>
              <Icon name="account-group" size={22} color="#0A2463" />
              <View>
                <Text style={styles.logoTitle}>SWAGATAM</Text>
                <Text style={styles.logoSubtitle}>Gateway to Visitor Convenience</Text>
              </View>
            </View>
            
            <View style={styles.centerSection}>
              <Text style={styles.buildingText}>( Kartavya Bhawan 3 )</Text>
              <Text style={styles.passTypeText}>Daily Visitor Pass</Text>
            </View>

            <Icon name="shield-star" size={36} color="#FF9933" />
          </View>

          {/* Main Body - Registration Number at top */}
          <View style={styles.mainBody}>
            <View style={styles.regNoRow}>
              <View style={styles.regNoLeft}>
                <Text style={styles.regLabel}>Reg No पंजीकरण संख्या</Text>
                <Text style={styles.regNumber}>{appointmentData.passNo}</Text>
              </View>
              
              {/* Photo in top right corner */}
              <View style={styles.photoCorner}>
                {personalDetails?.photoUri ? (
                  <Image 
                    source={{ uri: personalDetails.photoUri }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="account" size={40} color="#94A3B8" />
                  </View>
                )}
              </View>
            </View>

            {/* Content Area - Two Columns */}
            <View style={styles.contentArea}>
              {/* Left Column - Visitor & Meeting Details */}
              <View style={styles.leftColumn}>
                {/* Visitor Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Visitor Details आगंतुक विवरण</Text>
                  
                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Name नाम</Text>
                    <Text style={styles.fieldValue}>{personalDetails?.name || appointmentData.visitorName}</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>F/S Name पिता/पति का नाम</Text>
                    <Text style={styles.fieldValue}>{personalDetails?.fatherHusbandName || 'RAJDEO PRASAD'}</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Gender लिंग</Text>
                    <Text style={styles.fieldValue}>{personalDetails?.gender || 'M'}</Text>
                  </View>
                </View>

                {/* To Meet Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>To Meet मिलने को</Text>
                  
                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Officer Name अधिकारी का नाम</Text>
                    <Text style={styles.fieldValue}>{appointmentData.officerName}</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Approving Officer अनुमोदन अधिकारी</Text>
                    <Text style={styles.fieldValue} numberOfLines={2}>
                      {appointmentData.officerName}( {appointmentData.designation} )
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Address पता</Text>
                    <Text style={styles.fieldValue} numberOfLines={2}>
                      {appointmentData.department}, {appointmentData.agency}
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Gadgets / गैजेट</Text>
                    <Text style={styles.fieldValue}>-</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Purpose / उद्देश्य</Text>
                    <Text style={styles.fieldValue}>{appointmentData.purpose.toUpperCase()}</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Remark / टिप्पणी</Text>
                    <Text style={styles.fieldValue}>ONLINE PASS</Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.fieldLabel}>Signature, Officer Visited: अधिकारी के हस्ताक्षर:</Text>
                    <View style={styles.signLine} />
                  </View>
                </View>
              </View>

              {/* Right Column - Valid Duration, Address, Contact & QR */}
              <View style={styles.rightColumn}>
                {/* Valid Duration Box */}
                <View style={styles.validBox}>
                  <View style={styles.emblemCircle}>
                    <Icon name="seal" size={32} color="#0A2463" />
                  </View>
                  <Text style={styles.validLabel}>Valid Duration वैध अवधि :{appointmentData.time}</Text>
                  <Text style={styles.regDateLabel}>Reg Date पंजीकरण तिथि {appointmentData.date}</Text>
                  <Text style={styles.printedOn}>Printed On: {appointmentData.date} 15:23</Text>
                </View>

                {/* Address & Contact */}
                <View style={styles.contactSection}>
                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Address पता</Text>
                    <Text style={styles.contactValue} numberOfLines={3}>
                      {personalDetails?.presentAddress || "**26 'BHAY 'HAND **I, *******'RAM *****'ABAD"}
                    </Text>
                  </View>

                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Mobile No. मोबाइल नंबर</Text>
                    <Text style={styles.contactValue}>******0723</Text>
                  </View>

                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>ID Details पहचान विवरण</Text>
                    <Text style={styles.contactValue}>
                      {personalDetails?.identityProof || 'PASSPORT'}{'\n'}
                      {personalDetails?.identityProofNumber ? `****${personalDetails.identityProofNumber.slice(-4)}` : '****2620'}
                    </Text>
                  </View>
                </View>

                {/* QR Code in bottom corner */}
                <View style={styles.qrCorner}>
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={appointmentData.passNo}
                      size={85}
                      color="#0A2463"
                      backgroundColor="white"
                    />
                  </View>
                  <Text style={styles.validDateText}>Valid Date वैध तिथि :</Text>
                  <Text style={styles.validDateValue}>{appointmentData.date}</Text>
                </View>

                {/* Reception Info */}
                <View style={styles.receptionInfo}>
                  <Text style={styles.receptionTitle}>Sr. Reception/Reception Officer</Text>
                  <Text style={styles.receptionHindi}>वरिष्ठ स्वागत स्वागत अधिकारी</Text>
                  <Text style={styles.receptionName}>(Kishan Raj Singh Hada)</Text>
                  <Text style={styles.gateText}>Gate No.1, Kartavya Bhawan 3</Text>
                  <Text style={styles.codeText}>EJA6SWAP-SWA110.19.11.187</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <LinearGradient
              colors={['#00BCD4', '#0097A7']}
              style={styles.instructionHeader}
            >
              <Text style={styles.instructionTitle}>INSTRUCTIONS/दिशा निर्देश</Text>
            </LinearGradient>
            
            <View style={styles.instructionContent}>
              <Text style={styles.hindiText}>
                जिस कार्यालय के लिए पास आवंटित है उसके अलावा आगंतुक सरकारी भवन के अन्य कार्यालयों में ना घूमें और मुलाकात के पश्चात पास को सुरक्षाकर्मी के पास अवश्य जमा करायें।
              </Text>
              <Text style={styles.englishText}>
                VISITOR SHOULD NOT ROAM AROUND THE OFFICES IN THE GOVERNMENT BUILDING EXCEPT THE OFFICE TO BE VISITED AND HE/SHE MUST RETURN THE PASS TO SECURITY PERSONNEL AFTER THE VISIT
              </Text>
            </View>
          </View>

          {/* Footer */}
          <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.footer}>
            <Text style={styles.footerText}>MINISTRY OF HOME AFFAIRS • RECEPTION ORGANISATION</Text>
          </LinearGradient>
        </View>

        {/* Bottom NIC Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoRow}>
            <Icon name="flag" size={16} color="#FF9933" />
            <Text style={styles.infoText}>A Digital India Initiative by Government of India</Text>
          </View>
          
          <Text style={styles.copyright}>Copyright © 2019 by NIC. All rights reserved.</Text>
          
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  topBanner: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  logoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A2463',
  },
  logoSubtitle: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '500',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  buildingText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  passTypeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A2463',
  },
  mainBody: {
    padding: 12,
  },
  regNoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  regNoLeft: {
    flex: 1,
  },
  regLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  regNumber: {
    fontSize: 8,
    color: '#0A2463',
    fontWeight: '700',
  },
  photoCorner: {
    marginLeft: 10,
  },
  photo: {
    width: 85,
    height: 100,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  photoPlaceholder: {
    width: 85,
    height: 100,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    flex: 1.5,
  },
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A2463',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 6,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '600',
    width: 90,
    lineHeight: 9,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 9.5,
  },
  signLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CBD5E1',
    marginTop: 4,
  },
  validBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emblemCircle: {
    marginBottom: 6,
  },
  validLabel: {
    fontSize: 7.5,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 3,
  },
  regDateLabel: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  printedOn: {
    fontSize: 6,
    color: '#64748B',
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 5,
    alignItems: 'flex-start',
  },
  contactLabel: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    width: 38,
    lineHeight: 8,
    flexShrink: 0,
  },
  contactValue: {
    fontSize: 6.5,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 8.5,
  },
  qrCorner: {
    alignItems: 'center',
    marginBottom: 10,
  },
  qrWrapper: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  validDateText: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  validDateValue: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0A2463',
  },
  receptionInfo: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  receptionTitle: {
    fontSize: 6,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 8,
  },
  receptionHindi: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 8,
    marginBottom: 3,
  },
  receptionName: {
    fontSize: 6.5,
    color: '#0A2463',
    fontWeight: '700',
    marginBottom: 2,
  },
  gateText: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 1,
    textAlign: 'center',
  },
  codeText: {
    fontSize: 5.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  instructions: {
    marginTop: 6,
  },
  instructionHeader: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  instructionContent: {
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  hindiText: {
    fontSize: 6.5,
    color: '#0A2463',
    textAlign: 'center',
    lineHeight: 9,
    marginBottom: 6,
    fontWeight: '600',
  },
  englishText: {
    fontSize: 6,
    color: '#0EA5D1',
    textAlign: 'center',
    lineHeight: 8.5,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomInfo: {
    backgroundColor: '#3477eb',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 7.5,
    color: '#E2E8F0',
    marginVertical: 10,
  },
  nicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 6,
  },
  nicBadge: {
    backgroundColor: '#3477eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  nicText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nicName: {
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default TodayAppointmentDetailScreen;