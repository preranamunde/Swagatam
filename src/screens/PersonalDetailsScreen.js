import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Platform, Alert, Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeProfile } from '../constants/services/visitorRegisterService';
import { getStateCode, getIdTypeCode } from '../constants/stateCodes';

// ─── Constants ─────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ['SELECT', 'MALE', 'FEMALE', 'OTHER'];

const IDENTITY_PROOF_OPTIONS = [
  'SELECT', 'VOTER ID', 'PASSPORT', 'DRIVING LICENSE', 'GOV.ID CARD', 'OTHER',
];

const OCCUPATION_OPTIONS = [
  'SELECT', 'BUSINESS', 'CHARTERED ACCOUNTANT', 'DOCTOR', 'ENGINEER', 'FARMER',
  'GOVT. SERVICE', 'HOME MAKER', 'HOUSE WIFE', 'JOURNALIST (ACCREDITED)',
  'JOURNALIST (NON-ACCREDITED)', 'LAWYER', 'MISC-ANY-OTHER', 'PARAMEDICAL',
  'POLICE', 'PRIVATE SERVICE', 'RETIRED', 'STUDENT', 'TEACHER',
];

const STATE_OPTIONS = [
  'SELECT', 'ANDAMAN AND NICOBAR', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM',
  'BIHAR', 'CHANDIGARH', 'CHHATTISGARH', 'DADRA AND NAGAR HAVELI', 'DAMAN AND DIU',
  'DELHI', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU AND KASHMIR',
  'JHARKHAND', 'KARNATAKA', 'KERALA', 'LADAKH', 'LAKSHADWEEP', 'MADHYA PRADESH',
  'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ORISSA',
  'PUDUCHERRY', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA',
  'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

// base64 is captured directly from image picker (includeBase64: true) — no fetch needed

/** Format a JS Date as DD/MM/YYYY for display */
const formatDate = (date) => {
  if (!date) return '';
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
  ].join('/');
};

/** Format a JS Date as YYYY-MM-DD for the API */
const formatDateForAPI = (date) => {
  if (!date) return '';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

/** Map gender label → API single character */
const mapGender = (g) => ({ MALE: 'M', FEMALE: 'F', OTHER: 'O' }[g] ?? '');

// ─── Component ─────────────────────────────────────────────────────────────────

const PersonalDetailsScreen = ({ navigation, route }) => {
  // ── Form state ──
  const [formData, setFormData] = useState({
    name:                '',
    fatherHusbandName:   '',
    gender:              'SELECT',
    dateOfBirth:         null,
    identityProof:       'SELECT',
    identityProofNumber: '',
    email:               '',
    occupation:          'SELECT',
    presentAddress:      '',
    presentLandmarks:    '',
    presentState:        'SELECT',
    presentPincode:      '',
    permanentAddress:    '',
    permanentLandmarks:  '',
    permanentState:      'SELECT',
    permanentPincode:    '',
  });

  const [showIdProofNumber,   setShowIdProofNumber]   = useState(false);
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [showDatePicker,      setShowDatePicker]      = useState(false);
  const [isSubmitting,        setIsSubmitting]        = useState(false);

  // Upload state — uri for display, base64 for API
  const [photoUploaded,     setPhotoUploaded]     = useState(false);
  const [photoUri,          setPhotoUri]          = useState(null);
  const [photoBase64,       setPhotoBase64]       = useState('');
  const [signatureUploaded, setSignatureUploaded] = useState(false);
  const [signatureUri,      setSignatureUri]      = useState(null);
  const [documentUploaded,  setDocumentUploaded]  = useState(false);
  const [documentUri,       setDocumentUri]       = useState(null);
  const [documentBase64,    setDocumentBase64]    = useState('');

  // Modal state
  const [showPhotoModal,     setShowPhotoModal]     = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showDocumentModal,  setShowDocumentModal]  = useState(false);

  // ── Edit mode pre-fill ──
  useEffect(() => {
    if (route.params?.editMode && route.params?.userData) {
      const d = route.params.userData;
      setFormData({
        name:                d.name                || '',
        fatherHusbandName:   d.fatherHusbandName   || '',
        gender:              d.gender              || 'SELECT',
        dateOfBirth:         d.dateOfBirth ? new Date(d.dateOfBirth) : null,
        identityProof:       d.identityProof       || 'SELECT',
        identityProofNumber: d.identityProofNumber || '',
        email:               d.email               || '',
        occupation:          d.occupation          || 'SELECT',
        presentAddress:      d.presentAddress      || '',
        presentLandmarks:    d.presentLandmarks    || '',
        presentState:        d.presentState        || 'SELECT',
        presentPincode:      d.presentPincode      || '',
        permanentAddress:    d.permanentAddress    || '',
        permanentLandmarks:  d.permanentLandmarks  || '',
        permanentState:      d.permanentState      || 'SELECT',
        permanentPincode:    d.permanentPincode    || '',
      });
      if (d.photoUri)     { setPhotoUri(d.photoUri);         setPhotoUploaded(true); }
      if (d.signatureUri) { setSignatureUri(d.signatureUri); setSignatureUploaded(true); }
      if (d.documentUri)  { setDocumentUri(d.documentUri);   setDocumentUploaded(true); }
    }
  }, [route.params]);

  // ── Handlers ──
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleInputChange('dateOfBirth', selectedDate);
  };

  // includeBase64:true → picker returns base64 directly, no fetch() on file:// URI needed
  const handleMediaOption = (option, onSuccess) => {
    const opts = { mediaType: 'photo', quality: 0.5, saveToPhotos: false, includeBase64: true };
    const cb   = (response) => {
      if (response.assets?.[0]) {
        const asset = response.assets[0];
        onSuccess(asset.uri, asset.base64 ?? '');
      }
    };
    option === 'camera' ? launchCamera(opts, cb) : launchImageLibrary(opts, cb);
  };

  const handlePhotoOption    = (opt) => { setShowPhotoModal(false);     handleMediaOption(opt, (uri, b64) => { setPhotoUri(uri);     setPhotoBase64(b64);    setPhotoUploaded(true);     }); };
  const handleSignatureOption = (opt) => { setShowSignatureModal(false); handleMediaOption(opt, (uri)       => { setSignatureUri(uri);                          setSignatureUploaded(true); }); };
  const handleDocumentOption  = (opt) => { setShowDocumentModal(false);  handleMediaOption(opt, (uri, b64) => { setDocumentUri(uri);  setDocumentBase64(b64); setDocumentUploaded(true);  }); };

  // ── Validation ──
  const validate = () => {
    const f = formData;
    if (!f.name.trim())                         return 'Name is required';
    if (!f.fatherHusbandName.trim())            return "Father/Husband name is required";
    if (!f.gender || f.gender === 'SELECT')     return 'Please select a gender';
    if (!f.dateOfBirth)                         return 'Date of birth is required';
    if (!f.identityProof || f.identityProof === 'SELECT') return 'Please select an identity proof type';
    if (!f.identityProofNumber.trim())          return 'Identity proof number is required';
    if (!f.email.trim())                        return 'Email is required';
    if (!f.occupation || f.occupation === 'SELECT') return 'Please select an occupation';
    if (!f.presentAddress.trim())               return 'Present address is required';
    if (!f.presentLandmarks.trim())             return 'Present landmark is required';
    if (!f.presentState || f.presentState === 'SELECT') return 'Please select present state';
    if (!f.presentPincode || f.presentPincode.length !== 6) return 'Present pincode must be 6 digits';
    if (!f.permanentAddress.trim())             return 'Permanent address is required';
    if (!f.permanentLandmarks.trim())           return 'Permanent landmark is required';
    if (!f.permanentState || f.permanentState === 'SELECT') return 'Please select permanent state';
    if (!f.permanentPincode || f.permanentPincode.length !== 6) return 'Permanent pincode must be 6 digits';
    if (!photoUploaded)                         return 'Please upload your photo';
    if (!documentUploaded)                      return 'Please upload your ID document';
    if (!isDeclarationChecked)                  return 'Please accept the declaration';
    return null;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const error = validate();
    if (error) { Alert.alert('Validation Error', error); return; }

    // TODO: replace with session values when backend is ready
    const visNo  = 1192563;
    const visMob = '9146158801';

    setIsSubmitting(true);
    try {
      // Persist locally
      const dataToSave = { ...formData, photoUri, signatureUri, documentUri };
      await AsyncStorage.setItem('personalDetails', JSON.stringify(dataToSave));
      console.log('📋 Saved to AsyncStorage');

      // base64 already captured by image picker (includeBase64: true) — no conversion needed
      console.log('🖼️ Photo base64 length:', photoBase64.length);
      console.log('📄 Document base64 length:', documentBase64.length);
      if (!photoBase64)    { Alert.alert('Error', 'Photo data missing. Please re-upload your photo.');         setIsSubmitting(false); return; }
      if (!documentBase64) { Alert.alert('Error', 'Document data missing. Please re-upload your ID document.'); setIsSubmitting(false); return; }


      // Map display values → API codes
      const presentStateCode   = getStateCode(formData.presentState);
      const permanentStateCode  = getStateCode(formData.permanentState);
      const idTypeCode          = getIdTypeCode(formData.identityProof);

      if (!presentStateCode)  { Alert.alert('Error', 'Invalid present state selected');   setIsSubmitting(false); return; }
      if (!permanentStateCode){ Alert.alert('Error', 'Invalid permanent state selected'); setIsSubmitting(false); return; }
      if (!idTypeCode)        { Alert.alert('Error', 'Invalid identity proof type');      setIsSubmitting(false); return; }

      console.log('📤 State codes:', { presentStateCode, permanentStateCode, idTypeCode });

      const result  = await completeProfile({
        visNo,
        visMob,
        visName:              formData.name.trim(),
        visFName:             formData.fatherHusbandName.trim(),
        visdob:               formatDateForAPI(formData.dateOfBirth),
        visGender:            mapGender(formData.gender),
        visemail:             formData.email.trim(),
        visIdType:            idTypeCode,           // e.g. '1', '2' … '5'
        visIddetails:         formData.identityProofNumber.trim(),
        occupation:           formData.occupation,
        visPresentAddress:    formData.presentAddress.trim(),
        presentLandmark:      formData.presentLandmarks.trim(),
        visPresentState:      presentStateCode,     // e.g. '27' for MAHARASHTRA
        visPinCode:           formData.presentPincode,
        visPermanentAddress:  formData.permanentAddress.trim(),
        visPermanentLandmark: formData.permanentLandmarks.trim(),
        visPermanentState:    permanentStateCode,
        visPermanentPincode:  formData.permanentPincode,
        photoBase64,
        documentBase64,
      });

      console.log('✅ API Response:', JSON.stringify(result, null, 2));
      const message = result?.[0]?.Result ?? 'No response from server';

      if (message.toLowerCase().includes('success')) {
        Alert.alert('Success ✅', message, [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      } else {
        // Server responded but with a non-success message
        Alert.alert('Submission Failed', message);
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      // Show the actual server error message clearly
      Alert.alert('Error ❌', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Are you sure? All data will be lost.', [
      { text: 'No',  style: 'cancel' },
      { text: 'Yes', onPress: () => navigation.goBack() },
    ]);
  };

  const renderRedStar = () => <Text style={styles.redStar}>*</Text>;

  // ── Upload Modal ──
  const UploadModal = ({ visible, onClose, onCamera, onGallery, title }) => (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Choose an option</Text>
              <TouchableOpacity style={styles.modalOption} onPress={onCamera}>
                <Text style={styles.modalOptionIcon}>📷</Text>
                <Text style={styles.modalOptionText}>Open Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={onGallery}>
                <Text style={styles.modalOptionIcon}>🖼️</Text>
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ── Render ──
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
        {/* ── Personal Information ── */}
        <View style={styles.section}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={formData.name}
              onChangeText={(v) => handleInputChange('name', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Father/Husband Name {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter father/husband name"
              placeholderTextColor="#94A3B8"
              value={formData.fatherHusbandName}
              onChangeText={(v) => handleInputChange('fatherHusbandName', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(v) => handleInputChange('gender', v)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {GENDER_OPTIONS.map((opt, i) => (
                  <Picker.Item key={i} label={opt} value={opt} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth {renderRedStar()}</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Identity Proof {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.identityProof}
                onValueChange={(v) => handleInputChange('identityProof', v)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {IDENTITY_PROOF_OPTIONS.map((opt, i) => (
                  <Picker.Item key={i} label={opt} value={opt} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Identity Proof Card Number {renderRedStar()}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="Enter ID card number"
                placeholderTextColor="#94A3B8"
                value={formData.identityProofNumber}
                onChangeText={(v) => handleInputChange('identityProofNumber', v)}
                secureTextEntry={!showIdProofNumber}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowIdProofNumber(!showIdProofNumber)}
              >
                <Text style={styles.eyeIconText}>{showIdProofNumber ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email ID {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={formData.email}
              onChangeText={(v) => handleInputChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Occupation {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.occupation}
                onValueChange={(v) => handleInputChange('occupation', v)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {OCCUPATION_OPTIONS.map((opt, i) => (
                  <Picker.Item key={i} label={opt} value={opt} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* ── Present Address ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Present Address</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address {renderRedStar()}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter your present address"
              placeholderTextColor="#94A3B8"
              value={formData.presentAddress}
              onChangeText={(v) => handleInputChange('presentAddress', v)}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmarks {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter nearby landmarks (alphabets only)"
              placeholderTextColor="#94A3B8"
              value={formData.presentLandmarks}
              onChangeText={(v) => handleInputChange('presentLandmarks', v)}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.presentState}
                onValueChange={(v) => handleInputChange('presentState', v)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {STATE_OPTIONS.map((opt, i) => (
                  <Picker.Item key={i} label={opt} value={opt} />
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
              onChangeText={(v) => handleInputChange('presentPincode', v)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* ── Permanent Address ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Permanent Address</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address {renderRedStar()}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter your permanent address"
              placeholderTextColor="#94A3B8"
              value={formData.permanentAddress}
              onChangeText={(v) => handleInputChange('permanentAddress', v)}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmarks {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter nearby landmarks (alphabets only)"
              placeholderTextColor="#94A3B8"
              value={formData.permanentLandmarks}
              onChangeText={(v) => handleInputChange('permanentLandmarks', v)}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.permanentState}
                onValueChange={(v) => handleInputChange('permanentState', v)}
                style={styles.picker}
                dropdownIconColor="#000000"
              >
                {STATE_OPTIONS.map((opt, i) => (
                  <Picker.Item key={i} label={opt} value={opt} />
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
              onChangeText={(v) => handleInputChange('permanentPincode', v)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* ── Upload Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Photo & ID Document Upload</Text>
          <Text style={styles.uploadHint}>
            ⚠️ Photo: JPG/PNG/BMP under 20 KB • ID Document: PDF under 400 KB
          </Text>

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Scanned Signature</Text>
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

        {/* ── Declaration ── */}
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
              I hereby declare that all the information provided above is true and correct
              to the best of my knowledge.
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Buttons ── */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
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

      {/* ── Upload Modals ── */}
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

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:             { flex: 1, backgroundColor: '#F8FAFC' },
  header:                { backgroundColor: '#0A2463', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 },
  backButton:            { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText:        { color: '#FFFFFF', fontSize: 28, fontWeight: '400' },
  headerTitle:           { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  headerRight:           { width: 40 },
  scrollView:            { flex: 1 },
  scrollContent:         { paddingBottom: 20 },
  section:               { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, elevation: 2 },
  sectionHeader:         { fontSize: 18, fontWeight: '700', color: '#0A2463', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#E2E8F0', paddingBottom: 10 },
  formGroup:             { marginBottom: 20 },
  label:                 { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
  redStar:               { color: '#EF4444', fontSize: 14 },
  uploadHint:            { fontSize: 12, color: '#EF4444', marginBottom: 16, lineHeight: 18 },
  textInput:             { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  textArea:              { height: 80, textAlignVertical: 'top', paddingTop: 14 },
  pickerWrapper:         { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden' },
  picker:                { height: 50, color: '#0F172A' },
  dateInput:             { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:              { fontSize: 15, color: '#0F172A' },
  datePlaceholder:       { fontSize: 15, color: '#94A3B8' },
  calendarIcon:          { fontSize: 20 },
  inputWrapper:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden' },
  textInputWithIcon:     { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  eyeIcon:               { paddingHorizontal: 16, paddingVertical: 14 },
  eyeIconText:           { fontSize: 18 },
  uploadButtonFull:      { backgroundColor: '#F1F5F9', borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', paddingVertical: 16, alignItems: 'center', flexDirection: 'column' },
  uploadButtonSuccess:   { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  uploadIcon:            { fontSize: 32, marginBottom: 8 },
  uploadButtonText:      { fontSize: 15, color: '#334155', fontWeight: '600', textAlign: 'center' },
  declarationContainer:  { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox:              { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked:       { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark:             { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  declarationText:       { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },
  buttonContainer:       { marginHorizontal: 16, marginTop: 24, gap: 12 },
  submitButton:          { backgroundColor: '#0A2463', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  submitButtonDisabled:  { backgroundColor: '#64748B' },
  submitButtonText:      { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  cancelButton:          { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#EF4444' },
  cancelButtonText:      { color: '#EF4444', fontSize: 17, fontWeight: '700' },
  bottomPadding:         { height: 20 },
  modalOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer:        { width: '85%', maxWidth: 400 },
  modalContent:          { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, elevation: 8 },
  modalTitle:            { fontSize: 20, fontWeight: '700', color: '#0A2463', marginBottom: 8, textAlign: 'center' },
  modalSubtitle:         { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center' },
  modalOption:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  modalOptionIcon:       { fontSize: 24, marginRight: 16 },
  modalOptionText:       { fontSize: 16, fontWeight: '600', color: '#334155', flex: 1 },
  modalCancelButton:     { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center' },
  modalCancelText:       { fontSize: 16, fontWeight: '600', color: '#64748B' },
  footerSection:         { backgroundColor: '#0A2463', marginHorizontal: 10, marginTop: 30, paddingVertical: 30, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  digitalIndiaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  digitalIndiaLogo:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: '#FFFFFF', borderRadius: 20 },
  logoPlaceholder:       { fontSize: 24 },
  digitalIndiaText:      { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  copyrightContainer:    { marginVertical: 10, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%', alignItems: 'center' },
  copyrightText:         { color: '#E2E8F0', fontSize: 11, textAlign: 'center' },
  nicLogoContainer:      { marginTop: 10, alignItems: 'center' },
  nicLogo:               { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  nicLogoText:           { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginRight: 10, backgroundColor: '#1E40AF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  nicFullText:           { color: '#FFFFFF', fontSize: 8, fontWeight: '700', lineHeight: 12, letterSpacing: 1 },
});

export default PersonalDetailsScreen;