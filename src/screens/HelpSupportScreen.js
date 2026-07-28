import React, { useState } from 'react';
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

// NOTE: Placeholder FAQ content — update the questions/answers below to match
// the app's actual help content whenever it's finalized.
const FAQS = [
  {
    id: '1',
    question: 'How do I create an appointment?',
    answer:
      'Go to Home and tap "Make An Appointment". Fill in the organization, department, building, officer and visit details, then submit.',
  },
  {
    id: '2',
    question: 'How do I check my appointment status?',
    answer:
      'Open the drawer menu and go to Dashboard, or tap "My Active Passes" from the Home screen to view all your active and approved passes.',
  },
  {
    id: '3',
    question: 'I am facing a technical issue in the app. Who do I contact?',
    answer:
      'Please reach out to our technical support team using the email listed below, and we will get back to you as soon as possible.',
  },
  {
    id: '4',
    question: 'Who do I contact for appointment or pass related queries?',
    answer:
      'For Administrative issues, Appointment queries, Temporary Pass queries, or Data availability, please contact the concerned nodal officer or the PRO/reception officer of the department. See the Contact Us screen for details.',
  },
];

const HelpSupportScreen = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleFaq = (id) => setExpandedId((prev) => (prev === id ? null : id));

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help &amp; Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>

        <View style={styles.faqCard}>
          {FAQS.map((faq, index) => {
            const isOpen = expandedId === faq.id;
            return (
              <View key={faq.id} style={[styles.faqItem, index === FAQS.length - 1 && styles.faqItemLast]}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Icon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>STILL NEED HELP?</Text>

        <View style={styles.contactCard}>
          <View style={styles.cardIconWrap}>
            <Icon name="lifebuoy" size={26} color="#3477eb" />
          </View>
          <Text style={styles.cardTitle}>Reach Our Support Team</Text>
          <Text style={styles.cardBody}>
            For any technical issues with the app, write to us and we'll help you out.
          </Text>
          <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7} style={styles.emailRow}>
            <Icon name="email-outline" size={18} color="#3477eb" style={styles.emailIcon} />
            <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <Icon name="card-account-phone-outline" size={18} color="#FFFFFF" style={styles.linkButtonIcon} />
            <Text style={styles.linkButtonText}>Go to Contact Us</Text>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
    marginLeft: 4,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  faqItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  faqItemLast: { borderBottomWidth: 0 },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A', marginRight: 10 },
  faqAnswer: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 10 },
  contactCard: {
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  cardBody: { fontSize: 14, color: '#475569', lineHeight: 21, marginBottom: 16 },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
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

export default HelpSupportScreen;