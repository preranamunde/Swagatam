import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonalDetailsScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: '',
    fatherHusbandName: '',
    gender: '',
    dateOfBirth: null,
    identityProof: '',
    identityProofNumber: '',
    email: '',
    occupation: '',
    presentAddress: '',
    presentLandmarks: '',
    presentState: '',
    presentPincode: '',
    permanentAddress: '',
    permanentLandmarks: '',
    permanentState: '',
    permanentPincode: '',
  });

  const [showIdProofNumber, setShowIdProofNumber] = useState(false);
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Upload states
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [signatureUploaded, setSignatureUploaded] = useState(false);
  const [signatureUri, setSignatureUri] = useState(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentUri, setDocumentUri] = useState(null);
  
  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const genderOptions = ['SELECT', 'MALE', 'FEMALE', 'OTHER'];
  
  const identityProofOptions = [
    'SELECT',
    'VOTER ID',
    'PASSPORT',
    'DRIVING LICENSE',
    'GOV.ID CARD',
    'OTHER'
  ];

  const occupationOptions = [
    'SELECT',
    'BUSINESS',
    'CHARTERED ACCOUNTANT',
    'DOCTOR',
    'ENGINEER',
    'FARMER',
    'GOVT. SERVICE',
    'HOME MAKER',
    'HOUSE WIFE',
    'JOURNALIST (ACCREDITED)',
    'JOURNALIST (NON-ACCREDITED)',
    'LAWYER',
    'MISC-ANY-OTHER',
    'PARAMEDICAL',
    'POLICE',
    'PRIVATE SERVICE',
    'RETIRED',
    'STUDENT',
    'TEACHER'
  ];

  const stateOptions = [
    'SELECT',
    'ANDAMAN AND NICOBAR',
    'ANDHRA PRADESH',
    'ARUNACHAL PRADESH',
    'ASSAM',
    'BIHAR',
    'CHANDIGARH',
    'CHHATTISGARH',
    'DADRA AND NAGAR HAVELI',
    'DAMAN AND DIU',
    'DELHI',
    'GOA',
    'GUJARAT',
    'HARYANA',
    'HIMACHAL PRADESH',
    'JAMMU AND KASHMIR',
    'JHARKHAND',
    'KARNATAKA',
    'KERALA',
    'LADAKH',
    'LAKSHADWEEP',
    'MADHYA PRADESH',
    'MAHARASHTRA',
    'MANIPUR',
    'MEGHALAYA',
    'MIZORAM',
    'NAGALAND',
    'ORISSA',
    'PUDUCHERRY',
    'PUNJAB',
    'RAJASTHAN',
    'SIKKIM',
    'TAMIL NADU',
    'TELANGANA',
    'TRIPURA',
    'UTTAR PRADESH',
    'UTTARAKHAND',
    'WEST BENGAL'
  ];
useEffect(() => {
  if (route.params?.editMode && route.params?.userData) {
    const data = route.params.userData;
    setFormData({
      name: data.name || '',
      fatherHusbandName: data.fatherHusbandName || '',
      gender: data.gender || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      identityProof: data.identityProof || '',
      identityProofNumber: data.identityProofNumber || '',
      email: data.email || '',
      occupation: data.occupation || '',
      presentAddress: data.presentAddress || '',
      presentLandmarks: data.presentLandmarks || '',
      presentState: data.presentState || '',
      presentPincode: data.presentPincode || '',
      permanentAddress: data.permanentAddress || '',
      permanentLandmarks: data.permanentLandmarks || '',
      permanentState: data.permanentState || '',
      permanentPincode: data.permanentPincode || '',
    });
    
    if (data.photoUri) {
      setPhotoUri(data.photoUri);
      setPhotoUploaded(true);
    }
    if (data.signatureUri) {
      setSignatureUri(data.signatureUri);
      setSignatureUploaded(true);
    }
    if (data.documentUri) {
      setDocumentUri(data.documentUri);
      setDocumentUploaded(true);
    }
  }
}, [route.params]);
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Photo Upload Functions
  const handlePhotoOption = (option) => {
    setShowPhotoModal(false);
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
    };

    if (option === 'camera') {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setPhotoUri(response.assets[0].uri);
          setPhotoUploaded(true);
        }
      });
    } else if (option === 'gallery') {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setPhotoUri(response.assets[0].uri);
          setPhotoUploaded(true);
        }
      });
    }
  };

  // Signature Upload Functions
  const handleSignatureOption = (option) => {
    setShowSignatureModal(false);
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
    };

    if (option === 'camera') {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setSignatureUri(response.assets[0].uri);
          setSignatureUploaded(true);
        }
      });
    } else if (option === 'gallery') {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setSignatureUri(response.assets[0].uri);
          setSignatureUploaded(true);
        }
      });
    }
  };

  // Document Upload Functions
  const handleDocumentOption = (option) => {
    setShowDocumentModal(false);
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
    };

    if (option === 'camera') {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setDocumentUri(response.assets[0].uri);
          setDocumentUploaded(true);
        }
      });
    } else if (option === 'gallery') {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setDocumentUri(response.assets[0].uri);
          setDocumentUploaded(true);
        }
      });
    }
  };

  const handleSubmit = async () => {
  if (!isDeclarationChecked) {
    Alert.alert('Error', 'Please accept the declaration');
    return;
  }

  try {
    // Prepare data to save
    const dataToSave = {
      ...formData,
      photoUri: photoUri,
      signatureUri: signatureUri,
      documentUri: documentUri,
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem('personalDetails', JSON.stringify(dataToSave));

    Alert.alert(
      'Success',
      'Personal details submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to Home screen
            navigation.navigate('Home');
          },
        },
      ]
    );
  } catch (error) {
    console.error('Error saving data:', error);
    Alert.alert('Error', 'Failed to save personal details');
  }
};

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() }
      ]
    );
  };

  const renderRedStar = () => <Text style={styles.redStar}>*</Text>;

  // Upload Dialog Modal Component
  const UploadModal = ({ visible, onClose, onCamera, onGallery, title }) => (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Choose an option</Text>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={onCamera}
              >
                <Text style={styles.modalOptionIcon}>📷</Text>
                <Text style={styles.modalOptionText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalOption}
                onPress={onGallery}
              >
                <Text style={styles.modalOptionIcon}>🖼️</Text>
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={onClose}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        <View style={styles.section}>
         
          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Father/Husband Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Father/Husband Name {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter father/husband name"
              placeholderTextColor="#94A3B8"
              value={formData.fatherHusbandName}
              onChangeText={(value) => handleInputChange('fatherHusbandName', value)}
            />
          </View>

          {/* Gender */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {genderOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth {renderRedStar()}</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={formData.dateOfBirth ? styles.dateText : styles.datePlaceholder}>
                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date of birth'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Identity Proof */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Identity Proof {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.identityProof}
                onValueChange={(value) => handleInputChange('identityProof', value)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {identityProofOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Identity Proof Card Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Identity Proof Card Number {renderRedStar()}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="Enter ID card number"
                placeholderTextColor="#94A3B8"
                value={formData.identityProofNumber}
                onChangeText={(value) => handleInputChange('identityProofNumber', value)}
                secureTextEntry={!showIdProofNumber}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowIdProofNumber(!showIdProofNumber)}
              >
                <Text style={styles.eyeIconText}>
                  {showIdProofNumber ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email ID */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email ID {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Occupation */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Occupation {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.occupation}
                onValueChange={(value) => handleInputChange('occupation', value)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {occupationOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Present Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Present Address</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address {renderRedStar()}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter your present address"
              placeholderTextColor="#94A3B8"
              value={formData.presentAddress}
              onChangeText={(value) => handleInputChange('presentAddress', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmarks {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter nearby landmarks"
              placeholderTextColor="#94A3B8"
              value={formData.presentLandmarks}
              onChangeText={(value) => handleInputChange('presentLandmarks', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.presentState}
                onValueChange={(value) => handleInputChange('presentState', value)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {stateOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pincode {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor="#94A3B8"
              value={formData.presentPincode}
              onChangeText={(value) => handleInputChange('presentPincode', value)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Permanent Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Permanent Address</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address {renderRedStar()}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter your permanent address"
              placeholderTextColor="#94A3B8"
              value={formData.permanentAddress}
              onChangeText={(value) => handleInputChange('permanentAddress', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmarks {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter nearby landmarks"
              placeholderTextColor="#94A3B8"
              value={formData.permanentLandmarks}
              onChangeText={(value) => handleInputChange('permanentLandmarks', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.permanentState}
                onValueChange={(value) => handleInputChange('permanentState', value)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {stateOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pincode {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor="#94A3B8"
              value={formData.permanentPincode}
              onChangeText={(value) => handleInputChange('permanentPincode', value)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Photo & ID Document Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Photo & ID Document Upload</Text>

          {/* Photo Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Photo {renderRedStar()}</Text>
            <TouchableOpacity 
              style={[styles.uploadButtonFull, photoUploaded && styles.uploadButtonSuccess]}
              onPress={() => setShowPhotoModal(true)}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadButtonText}>
                {photoUploaded ? 'Photo Uploaded ✓' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signature Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Scanned Signature {renderRedStar()}</Text>
            <TouchableOpacity 
              style={[styles.uploadButtonFull, signatureUploaded && styles.uploadButtonSuccess]}
              onPress={() => setShowSignatureModal(true)}
            >
              <Text style={styles.uploadIcon}>✍️</Text>
              <Text style={styles.uploadButtonText}>
                {signatureUploaded ? 'Signature Uploaded ✓' : 'Upload Signature'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ID Document Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload ID Document {renderRedStar()}</Text>
            <TouchableOpacity 
              style={[styles.uploadButtonFull, documentUploaded && styles.uploadButtonSuccess]}
              onPress={() => setShowDocumentModal(true)}
            >
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadButtonText}>
                {documentUploaded ? 'Document Uploaded ✓' : 'Upload ID Document'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Declaration Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.declarationContainer}
            onPress={() => setIsDeclarationChecked(!isDeclarationChecked)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isDeclarationChecked && styles.checkboxChecked]}>
              {isDeclarationChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>
              I hereby declare that all the information provided above is true and correct to the best of my knowledge.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>


{/* ADD THIS FOOTER SECTION HERE */}
{/* UPDATED FOOTER SECTION */}
<View style={styles.footerSection}>
  <View style={styles.digitalIndiaContainer}>
    <View style={styles.digitalIndiaLogo}>
      <Text style={styles.logoPlaceholder}>🇮🇳</Text>
    </View>
    <Text style={styles.digitalIndiaText}>
      A Digital India Initiative by Government of India.
    </Text>
  </View>
  
  <View style={styles.copyrightContainer}>
    <Text style={styles.copyrightText}>
      Copyright © 2019 by NIC. All rights reserved.
    </Text>
  </View>
  
  <View style={styles.nicLogoContainer}>
    <View style={styles.nicLogo}>
      <Text style={styles.nicLogoText}>NIC</Text>
      <Text style={styles.nicFullText}>
        NATIONAL{'\n'}INFORMATICS{'\n'}CENTRE
      </Text>
    </View>
  </View>
</View>

<View style={styles.bottomPadding} />

<View style={styles.bottomPadding} />
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Upload Modals */}
      <UploadModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onCamera={() => handlePhotoOption('camera')}
        onGallery={() => handlePhotoOption('gallery')}
        title="Upload Photo"
      />

      <UploadModal
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onCamera={() => handleSignatureOption('camera')}
        onGallery={() => handleSignatureOption('gallery')}
        title="Upload Signature"
      />

      <UploadModal
        visible={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onCamera={() => handleDocumentOption('camera')}
        onGallery={() => handleDocumentOption('gallery')}
        title="Upload ID Document"
      />
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
    fontSize: 20,
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  redStar: {
    color: '#EF4444',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2463',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  modalCancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  pickerWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#0F172A',
  },
  dateInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#0F172A',
  },
  datePlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },
  calendarIcon: {
    fontSize: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  textInputWithIcon: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeIconText: {
    fontSize: 18,
  },
  uploadButtonFull: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'column',
  },
  uploadButtonSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  declarationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
  },
  declarationText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#0A2463',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 17,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
   footerSection: {
    backgroundColor: '#0A2463',
    marginHorizontal: 10,
    marginTop: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  digitalIndiaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  digitalIndiaLogo: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  logoPlaceholder: {
    fontSize: 24,
  },
  digitalIndiaText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  copyrightContainer: {
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    alignItems: 'center',
  },
  copyrightText: {
    color: '#E2E8F0',
    fontSize: 11,
    textAlign: 'center',
  },
  nicLogoContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  nicLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nicLogoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginRight: 10,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  nicFullText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 12,
    letterSpacing: 1,
  },
  
});

export default PersonalDetailsScreen;