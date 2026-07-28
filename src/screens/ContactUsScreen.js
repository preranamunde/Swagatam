import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SUPPORT_EMAIL = 'support-swagatam@gov.in';
const NODAL_OFFICERS_URL = 'https://www.swagatam.gov.in/public/NodalOfficers.aspx';

const ContactUsScreen = ({ navigation }) => {
  const handleEmailPress = async () => {
    const mailUrl = `mailto:${SUPPORT_EMAIL}`;
    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
      } else {
        Alert.alert('Email', SUPPORT_EMAIL);
      }
    } catch (e) {
      Alert.alert('Email', SUPPORT_EMAIL);
    }
  };

  const handleNodalOfficersPress = async () => {
    try {
      const supported = await Linking.canOpenURL(NODAL_OFFICERS_URL);
      if (supported) {
        await Linking.openURL(NODAL_OFFICERS_URL);
      } else {
        Alert.alert('Error', 'Unable to open the link. Please try again later.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to open the link. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Technical Support */}
        <View style={styles.card}>
          <View style={styles.cardIconWrap}>
            <Icon name="headset" size={26} color="#3477eb" />
          </View>
          <Text style={styles.cardTitle}>For Any Technical Support</Text>
          <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7} style={styles.emailRow}>
            <Icon name="email-outline" size={18} color="#3477eb" style={styles.emailIcon} />
            <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* Administrative / Appointment / Temp Pass / Data queries */}
        <View style={styles.card}>
          <View style={styles.cardIconWrap}>
            <Icon name="office-building-outline" size={26} color="#3477eb" />
          </View>
          <Text style={styles.cardTitle}>Administrative &amp; Appointment Queries</Text>
          <Text style={styles.cardBody}>
            For any Administrative issues, Appointment queries, Temporary Pass queries, or Data
            availability, kindly contact the concerned nodal officer of the department, or contact
            the PRO/reception officer of the concerned department.
          </Text>

          <TouchableOpacity onPress={handleNodalOfficersPress} activeOpacity={0.8} style={styles.linkButton}>
            <Icon name="link-variant" size={18} color="#FFFFFF" style={styles.linkButtonIcon} />
            <Text style={styles.linkButtonText}>View Nodal Officers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#3477eb',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  headerRight: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#475569', lineHeight: 21, marginBottom: 16 },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  emailIcon: { marginRight: 8 },
  emailText: { fontSize: 15, color: '#3477eb', fontWeight: '600' },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3477eb',
    borderRadius: 10,
    paddingVertical: 13,
    gap: 8,
  },
  linkButtonIcon: { marginRight: 4 },
  linkButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  bottomPadding: { height: 20 },
});

export default ContactUsScreen;