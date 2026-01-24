import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

const TemporaryPassInstructionsScreen = ({ navigation }) => {
  const handleProceed = () => {
    navigation.navigate('TemporaryPass');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const instructions = [
    "Applicant profile must be completed before applying for Temporary pass.",
    "There could be certain guidelines/procedure or requirement of specific documents eg. police verification, ID proof document etc. of your concerned ministry/department for issuing Temporary passes. Applicant should confirm all the aspects of Temporary pass from the nodal officer/reporting officer of the concerned department.",
    "Applicants have to provide all the requested details correctly.",
    "Scanned copy of Work order/Appointment document in PDF format (Size less than 400 KB) should be kept handy before applying.",
    "After successful submission of Temporary pass request, Request will be verified & forwarded by the concerned reporting officer/reporting office.",
    "After successful verification, Request will again be verified by the security supervisor/security section/pass issuing authority of the concerned department.",
    "Once pass request is approved by security supervisor/security section/pass issuing authority, Temporary pass will be issued and applicant will be intimated via email only.",
    "Applicant can view & download the application details by view application option.",
    "In Case of Reject/Detail Sought, Applicant have to provide required information.",
    "In Case of Lost or Mutation of Temporary pass, Applicant can apply again only after lodging FIR and paying challan. Applicant have to upload the copy of challan and FIR in single pdf file (size max 400 KB).",
    "Applicant can apply for Renewal of his/her Pass (In case of same work order/Appointment letter applicant applied before).",
    "Individual can request for Cancelation of his/her pass.",
    "Applicant can apply again after 5 days of current issued pass and 15 days before expiry of current pass.",
    "For any query kindly contact to concerned nodal officer. Nodal officer details can be found from swagatam portal.",
    "PCC (Police clearance certificate) is mandatory for all bhawans/buildings where security is managed by MHA SSO.",
    "A copy of the recommendation of JS (Admin.) of the concerned Ministry/Department with proper justification in case of an OPEN temporary pass to non-officials is required to be uploaded.",
    "Applicant can have only one Temporary pass in his/her possession at a time. (Undertaking for the same is to be uploaded)",
    "For temporary pass, applicants with an extended contract/employment without any break, the previous PCC will remain valid. In case of fresh appointment/break in employment, a new/valid PCC will be required."
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Temporary Pass Instructions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeIcon}>⚠️</Text>
            <Text style={styles.noticeTitle}>Important Information</Text>
          </View>
          <Text style={styles.noticeText}>
            Please read all instructions carefully before proceeding with your Temporary Pass application.
          </Text>
        </View>

        {/* Instructions List */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Guidelines & Requirements</Text>
          
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Required Documents */}
        <View style={styles.documentsCard}>
          <Text style={styles.documentsTitle}>📄 Required Documents</Text>
          <View style={styles.documentsList}>
            <View style={styles.documentItem}>
              <Text style={styles.documentBullet}>•</Text>
              <Text style={styles.documentText}>Work order/Appointment document (PDF, max 400 KB)</Text>
            </View>
            <View style={styles.documentItem}>
              <Text style={styles.documentBullet}>•</Text>
              <Text style={styles.documentText}>Police Clearance Certificate (PCC) - if applicable</Text>
            </View>
            <View style={styles.documentItem}>
              <Text style={styles.documentBullet}>•</Text>
              <Text style={styles.documentText}>ID Proof documents</Text>
            </View>
            <View style={styles.documentItem}>
              <Text style={styles.documentBullet}>•</Text>
              <Text style={styles.documentText}>JS (Admin.) recommendation - for OPEN pass to non-officials</Text>
            </View>
            <View style={styles.documentItem}>
              <Text style={styles.documentBullet}>•</Text>
              <Text style={styles.documentText}>Undertaking for single pass possession</Text>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>I Understand - Proceed to Apply</Text>
          <Text style={styles.proceedButtonIcon}>→</Text>
        </TouchableOpacity>

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
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
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
  noticeCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  noticeText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  instructionsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  instructionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A2463',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  documentsCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  documentsList: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentBullet: {
    fontSize: 16,
    color: '#3B82F6',
    marginRight: 8,
    marginTop: 2,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: '#0A2463',
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  proceedButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});

export default TemporaryPassInstructionsScreen;