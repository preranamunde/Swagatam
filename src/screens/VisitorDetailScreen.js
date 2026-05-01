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
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VisitorDetailScreen = ({ navigation, route }) => {
  const { passData } = route.params;
  const [visitorDetails, setVisitorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    loadVisitorDetails();
  }, []);

  const loadVisitorDetails = async () => {
    try {
      const storedData = await AsyncStorage.getItem('personalDetails');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setVisitorDetails(parsedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading visitor details:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load visitor details');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleApprove = () => {
    setActionType('approved');
    setShowSuccessDialog(true);
    
    setTimeout(() => {
      setShowSuccessDialog(false);
      navigation.goBack();
    }, 2000);
  };

  const handleReject = () => {
    setActionType('rejected');
    setShowRejectDialog(true);
    
    setTimeout(() => {
      setShowRejectDialog(false);
      navigation.goBack();
    }, 2000);
  };

  const SuccessDialog = () => (
    <Modal
      visible={showSuccessDialog}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSuccessDialog(false)}
    >
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.dialogTitle}>Approved Successfully!</Text>
          <Text style={styles.dialogMessage}>
            {passData.purpose ? 'Appointment' : 'Appointment'} for {passData.visitorName} has been approved.
          </Text>
          <TouchableOpacity
            style={styles.dialogButton}
            onPress={() => {
              setShowSuccessDialog(false);
              navigation.goBack();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dialogButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const RejectDialog = () => (
    <Modal
      visible={showRejectDialog}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRejectDialog(false)}
    >
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.rejectIconContainer}>
            <Icon name="close-circle" size={60} color="#F44336" />
          </View>
          <Text style={styles.dialogTitle}>Rejected</Text>
          <Text style={styles.dialogMessage}>
            {passData.purpose ? 'Temporary pass' : 'Appointment'} for {passData.visitorName} has been rejected.
          </Text>
          <TouchableOpacity
            style={[styles.dialogButton, { backgroundColor: '#F44336' }]}
            onPress={() => {
              setShowRejectDialog(false);
              navigation.goBack();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dialogButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Icon name={icon} size={22} color="#1E293B" />
      <Text style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}: </Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </Text>
    </View>
  );

  const DocumentCard = ({ title, uri, icon }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIconContainer}>
          <Icon name={icon} size={24} color="#3477eb" />
        </View>
        <Text style={styles.documentTitle}>{title}</Text>
      </View>
      {uri ? (
        <View style={styles.documentImageContainer}>
          <Image source={{ uri }} style={styles.documentImage} resizeMode="contain" />
          <View style={styles.documentBadge}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.documentBadgeText}>Uploaded</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDocumentContainer}>
          <Icon name="file-upload-outline" size={40} color="#CBD5E1" />
          <Text style={styles.noDocumentText}>No document uploaded</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <LinearGradient colors={['#3477eb', '#3477eb']} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visitor Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#3477eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitor Details</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appointment/Pass Summary Card */}
        <View style={styles.appointmentCard}>
          <View style={styles.dateSection}>
            <Text style={styles.dayText}>{passData.day}</Text>
            <Text style={styles.dateText}>{passData.dateNum || passData.date}</Text>
            <Text style={styles.monthText}>{passData.month}</Text>
          </View>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentRow}>
              <Icon name="clock-outline" size={18} color="#64748B" />
              <Text style={styles.appointmentText}>{passData.time}</Text>
            </View>
            {passData.location && (
              <View style={styles.appointmentRow}>
                <Icon name="map-marker" size={18} color="#64748B" />
                <Text style={styles.appointmentText}>{passData.location}</Text>
              </View>
            )}
            {passData.additionalParticipants > 0 && (
              <View style={styles.appointmentRow}>
                <Icon name="account-multiple" size={18} color="#64748B" />
                <Text style={styles.appointmentText}>
                  {passData.additionalParticipants} additional participant{passData.additionalParticipants > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {passData.department && (
              <View style={styles.appointmentRow}>
                <Icon name="office-building" size={18} color="#64748B" />
                <Text style={styles.appointmentText}>{passData.department}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="account" size={24} color="#1E293B" />
            <Text style={styles.cardHeaderText}>Personal Information</Text>
          </View>

          <InfoRow icon="account" label="Full Name" value={visitorDetails?.name || passData.visitorName} />
          <InfoRow icon="account-supervisor" label="Father/Husband Name" value={visitorDetails?.fatherHusbandName} />
          <InfoRow icon="gender-male-female" label="Gender/Age" value={visitorDetails?.gender} />
          <InfoRow icon="calendar" label="Date of Birth" value={formatDate(visitorDetails?.dateOfBirth)} />
          <InfoRow icon="email" label="Email" value={visitorDetails?.email} />
          <InfoRow icon="briefcase" label="Occupation" value={visitorDetails?.occupation} />
        </View>

        {/* Identity Proof Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="card-account-details" size={24} color="#1E293B" />
            <Text style={styles.cardHeaderText}>Identity Proof</Text>
          </View>

          <InfoRow icon="card-account-details-outline" label="ID Type" value={visitorDetails?.identityProof} />
          <InfoRow icon="numeric" label="ID Number" value={visitorDetails?.identityProofNumber} />
        </View>

        {/* Present Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="map-marker" size={24} color="#1E293B" />
            <Text style={styles.cardHeaderText}>Present Address</Text>
          </View>

          <InfoRow icon="home" label="Address" value={visitorDetails?.presentAddress} />
          <InfoRow icon="map-marker-radius" label="Landmarks" value={visitorDetails?.presentLandmarks} />
          <InfoRow icon="map" label="State" value={visitorDetails?.presentState} />
          <InfoRow icon="mailbox" label="Pincode" value={visitorDetails?.presentPincode} />
        </View>

        {/* Permanent Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="home-account" size={24} color="#1E293B" />
            <Text style={styles.cardHeaderText}>Permanent Address</Text>
          </View>

          <InfoRow icon="home-account" label="Address" value={visitorDetails?.permanentAddress} />
          <InfoRow icon="map-marker-radius" label="Landmarks" value={visitorDetails?.permanentLandmarks} />
          <InfoRow icon="map" label="State" value={visitorDetails?.permanentState} />
          <InfoRow icon="mailbox" label="Pincode" value={visitorDetails?.permanentPincode} />
        </View>

        {/* Documents Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="file-document-multiple" size={24} color="#1E293B" />
            <Text style={styles.cardHeaderText}>Uploaded Documents</Text>
          </View>

          <DocumentCard 
            title="Photograph" 
            uri={visitorDetails?.photoUri} 
            icon="camera"
          />
          
          <DocumentCard 
            title="Signature" 
            uri={visitorDetails?.signatureUri} 
            icon="draw"
          />
          
          <DocumentCard 
            title="Identity Document" 
            uri={visitorDetails?.documentUri} 
            icon="file-document"
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons - Fixed at Bottom - Order changed: Reject, Approve */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Icon name="close-circle" size={24} color="#FFFFFF" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.approveButton}
          onPress={handleApprove}
          activeOpacity={0.8}
        >
          <Icon name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>

      {/* Dialogs */}
      <SuccessDialog />
      <RejectDialog />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateSection: {
    backgroundColor: '#3477eb',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  appointmentContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    paddingVertical: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
  infoValue: {
    fontWeight: '500',
    color: '#64748B',
  },
  documentItem: {
    marginTop: 8,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  documentImageContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  documentImage: {
    width: '100%',
    height: 200,
  },
  documentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
  },
  documentBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  noDocumentContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noDocumentText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 8,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  rejectIconContainer: {
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default VisitorDetailScreen;