import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Platform, Alert, Image, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MyProfileScreen = ({ navigation }) => {
  const [userData, setUserData]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadUserData(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { loadUserData(); });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('personalDetails');
      if (storedData) setUserData(JSON.parse(storedData));
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('PersonalDetails', { editMode: true, userData });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('personalDetails');
              setUserData(null);
              Alert.alert('Deleted', 'Your profile has been deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
  };

  const InfoItem = ({ icon, iconLib = 'MaterialCommunityIcons', label, value }) => {
    const IconComponent = iconLib === 'Ionicons' ? Ionicons : iconLib === 'MaterialIcons' ? MaterialIcons : Icon;
    return (
      <View style={styles.infoItem}>
        <View style={styles.iconBox}>
          <IconComponent name={icon} size={24} color="#3477eb" />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
      </View>
    );
  };

  const GridInfoItem = ({ icon, iconLib = 'MaterialCommunityIcons', label, value }) => {
    const IconComponent = iconLib === 'Ionicons' ? Ionicons : iconLib === 'MaterialIcons' ? MaterialIcons : Icon;
    return (
      <View style={styles.gridItem}>
        <View style={styles.gridIconBox}>
          <IconComponent name={icon} size={20} color="#3477eb" />
        </View>
        <Text style={styles.gridLabel}>{label}</Text>
        <Text style={styles.gridValue}>{value || 'N/A'}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <ActivityIndicator size="large" color="#3477eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="account-alert" size={60} color="#3477eb" />
          </View>
          <Text style={styles.emptyTitle}>No Profile Data</Text>
          <Text style={styles.emptyDesc}>Please complete your profile first</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('PersonalDetails')}>
            <Text style={styles.emptyButtonText}>Create Profile</Text>
            <Icon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>

          {/* Edit & Delete buttons in corner */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleEdit} style={styles.editIconCorner}>
              <Icon name="pencil" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteIconCorner}>
              <Icon name="delete-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileTop}>
            <View style={styles.avatarSection}>
              {userData.photoUri ? (
                <Image source={{ uri: userData.photoUri }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Icon name="account" size={45} color="#3477eb" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData.name || 'User Name'}</Text>
              <View style={styles.profileEmailRow}>
                <Icon name="email-outline" size={14} color="#64748B" />
                <Text style={styles.profileEmail}>{userData.email || 'email@example.com'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickGrid}>
            <GridInfoItem icon="gender-male-female" label="Gender" value={userData.gender} />
            <GridInfoItem icon="cake-variant" label="Age" value={userData.dateOfBirth ? new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear() + ' yrs' : 'N/A'} />
            <GridInfoItem icon="briefcase-outline" label="Occupation" value={userData.occupation?.substring(0, 10)} />
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}><Icon name="account-details" size={18} color="#3477eb" /></View>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <View style={styles.sectionContent}>
            <InfoItem icon="account-circle"     label="Full Name"            value={userData.name} />
            <InfoItem icon="account-supervisor" label="Father/Husband Name"  value={userData.fatherHusbandName} />
            <InfoItem icon="calendar-range"     label="Date of Birth"        value={formatDate(userData.dateOfBirth)} />
          </View>
        </View>

        {/* Identity & Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}><Icon name="card-account-details" size={18} color="#3477eb" /></View>
            <Text style={styles.sectionTitle}>Identity & Contact</Text>
          </View>
          <View style={styles.sectionContent}>
            <InfoItem icon="card-account-details-outline" label="Identity Proof" value={userData.identityProof} />
            <InfoItem icon="shield-lock"                  label="ID Number"      value={userData.identityProofNumber ? '••••' + userData.identityProofNumber.slice(-4) : 'Not provided'} />
            <InfoItem icon="email"         iconLib="MaterialIcons" label="Email Address" value={userData.email} />
            <InfoItem icon="briefcase"     iconLib="MaterialIcons" label="Occupation"    value={userData.occupation} />
          </View>
        </View>

        {/* Present Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}><Icon name="home-map-marker" size={18} color="#3477eb" /></View>
            <Text style={styles.sectionTitle}>Present Address</Text>
          </View>
          <View style={styles.sectionContent}>
            <InfoItem icon="home"               iconLib="MaterialIcons" label="Address"   value={userData.presentAddress} />
            <InfoItem icon="location-on"        iconLib="MaterialIcons" label="Landmarks" value={userData.presentLandmarks} />
            <InfoItem icon="map"                iconLib="MaterialIcons" label="State"     value={userData.presentState} />
            <InfoItem icon="local-post-office"  iconLib="MaterialIcons" label="Pincode"   value={userData.presentPincode} />
          </View>
        </View>

        {/* Permanent Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}><Icon name="home-account" size={18} color="#3477eb" /></View>
            <Text style={styles.sectionTitle}>Permanent Address</Text>
          </View>
          <View style={styles.sectionContent}>
            <InfoItem icon="home-variant"       iconLib="MaterialIcons" label="Address"   value={userData.permanentAddress} />
            <InfoItem icon="location-on"        iconLib="MaterialIcons" label="Landmarks" value={userData.permanentLandmarks} />
            <InfoItem icon="map"                iconLib="MaterialIcons" label="State"     value={userData.permanentState} />
            <InfoItem icon="local-post-office"  iconLib="MaterialIcons" label="Pincode"   value={userData.permanentPincode} />
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}><Icon name="file-document-multiple" size={18} color="#3477eb" /></View>
            <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          </View>
          <View style={styles.documentsGrid}>
            {[
              { key: 'photoUri',     icon: 'camera',        title: 'Photo' },
              { key: 'signatureUri', icon: 'draw',          title: 'Signature' },
              { key: 'documentUri',  icon: 'file-document', title: 'ID Document' },
            ].map((doc) => (
              <View key={doc.key} style={[styles.docCard, userData[doc.key] && styles.docCardActive]}>
                <View style={[styles.docIconCircle, userData[doc.key] && styles.docIconActive]}>
                  <Icon name={doc.icon} size={28} color={userData[doc.key] ? '#3477eb' : '#94A3B8'} />
                </View>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <View style={styles.docStatusBadge}>
                  <View style={[styles.docDot, userData[doc.key] && styles.docDotActive]} />
                  <Text style={[styles.docStatusText, userData[doc.key] && styles.docStatusActive]}>
                    {userData[doc.key] ? 'Uploaded' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delete Button at Bottom */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Icon name="delete-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:                  { flex: 1, backgroundColor: '#F1F5F9' },
  loadingContainer:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  loadingText:                { marginTop: 12, fontSize: 15, color: '#64748B', fontWeight: '500' },
  header:                     { backgroundColor: '#3477eb', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 },
  backButton:                 { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:                { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  headerRight:                { width: 40 },
  scrollView:                 { flex: 1 },
  profileCard:                { backgroundColor: '#FFFFFF', margin: 16, marginTop: 20, borderRadius: 16, padding: 20, elevation: 3, position: 'relative' },
  actionButtons:              { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8, zIndex: 10 },
  editIconCorner:             { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3477eb', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  deleteIconCorner:           { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  profileTop:                 { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatarSection:              { marginRight: 16 },
  profileAvatar:              { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#3477eb' },
  profileAvatarPlaceholder:   { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#3477eb' },
  profileInfo:                { flex: 1 },
  profileName:                { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  profileEmailRow:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileEmail:               { fontSize: 13, color: '#64748B' },
  quickGrid:                  { flexDirection: 'row', gap: 12 },
  gridItem:                   { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, alignItems: 'center' },
  gridIconBox:                { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridLabel:                  { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  gridValue:                  { fontSize: 13, color: '#0F172A', fontWeight: '700' },
  section:                    { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  sectionHeader:              { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#F1F5F9' },
  sectionIconCircle:          { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionTitle:               { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionContent:             { gap: 4 },
  infoItem:                   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#F8FAFC', borderRadius: 10, marginBottom: 8 },
  iconBox:                    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoText:                   { flex: 1 },
  infoLabel:                  { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  infoValue:                  { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  documentsGrid:              { flexDirection: 'row', gap: 10 },
  docCard:                    { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  docCardActive:              { backgroundColor: '#EFF6FF', borderColor: '#3477eb' },
  docIconCircle:              { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  docIconActive:              { backgroundColor: '#DBEAFE' },
  docTitle:                   { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  docStatusBadge:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docDot:                     { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94A3B8' },
  docDotActive:               { backgroundColor: '#3477eb' },
  docStatusText:              { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  docStatusActive:            { color: '#3477eb' },
  deleteButton:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EF4444', marginHorizontal: 16, marginTop: 8, marginBottom: 4, paddingVertical: 16, borderRadius: 12, elevation: 4 },
  deleteButtonText:           { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptyContainer:             { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconCircle:            { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle:                 { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyDesc:                  { fontSize: 14, color: '#64748B', marginBottom: 32 },
  emptyButton:                { backgroundColor: '#3477eb', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 4 },
  emptyButtonText:            { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bottomSpace:                { height: 20 },
});

export default MyProfileScreen;