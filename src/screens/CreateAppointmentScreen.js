import React, { useState } from 'react';
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
import DatePicker from 'react-native-date-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';

const CreateAppointmentScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    organizationType: '',
    state: '',
    department: '',
    building: '',
    authority: '',
    visitingOfficerName: '',
    visitDate: null,
    visitTime: null,
    visitType: '',
    visitPurpose: '',
    electronicGadgets: {
      mobile: false,
      remoteKey: false,
      storageDevice: false,
      laptop: false,
      camera: false,
      other: false,
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentUri, setDocumentUri] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const organizationTypeOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'Central Government', value: 'Central Government' },
    { label: 'State Government', value: 'State Government' },
    { label: 'Public Sector', value: 'Public Sector' },
    { label: 'Autonomous Body', value: 'Autonomous Body' },
    { label: 'Other', value: 'Other' },
  ];

  const buildingOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'NIC Headquarter', value: 'NIC Headquarter' },
    { label: 'NDC Shastri Park', value: 'NDC Shastri Park' },
    { label: 'Laxmi Nagar Data Centre', value: 'Laxmi Nagar Data Centre' },
  ];

  const authorityOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'ANJU SAGAR', value: 'ANJU SAGAR' },
    { label: 'YATRINDRTA SAXENA', value: 'YATRINDRTA SAXENA' },
  ];

  const stateOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'ANDAMAN AND NICOBAR', value: 'ANDAMAN AND NICOBAR' },
    { label: 'ANDHRA PRADESH', value: 'ANDHRA PRADESH' },
    { label: 'ARUNACHAL PRADESH', value: 'ARUNACHAL PRADESH' },
    { label: 'ASSAM', value: 'ASSAM' },
    { label: 'BIHAR', value: 'BIHAR' },
    { label: 'CHANDIGARH', value: 'CHANDIGARH' },
    { label: 'CHHATTISGARH', value: 'CHHATTISGARH' },
    { label: 'DADRA AND NAGAR HAVELI', value: 'DADRA AND NAGAR HAVELI' },
    { label: 'DAMAN AND DIU', value: 'DAMAN AND DIU' },
    { label: 'DELHI', value: 'DELHI' },
    { label: 'GOA', value: 'GOA' },
    { label: 'GUJARAT', value: 'GUJARAT' },
    { label: 'HARYANA', value: 'HARYANA' },
    { label: 'HIMACHAL PRADESH', value: 'HIMACHAL PRADESH' },
    { label: 'JAMMU AND KASHMIR', value: 'JAMMU AND KASHMIR' },
    { label: 'JHARKHAND', value: 'JHARKHAND' },
    { label: 'KARNATAKA', value: 'KARNATAKA' },
    { label: 'KERALA', value: 'KERALA' },
    { label: 'LADAKH', value: 'LADAKH' },
    { label: 'LAKSHADWEEP', value: 'LAKSHADWEEP' },
    { label: 'MADHYA PRADESH', value: 'MADHYA PRADESH' },
    { label: 'MAHARASHTRA', value: 'MAHARASHTRA' },
    { label: 'MANIPUR', value: 'MANIPUR' },
    { label: 'MEGHALAYA', value: 'MEGHALAYA' },
    { label: 'MIZORAM', value: 'MIZORAM' },
    { label: 'NAGALAND', value: 'NAGALAND' },
    { label: 'ORISSA', value: 'ORISSA' },
    { label: 'PUDUCHERRY', value: 'PUDUCHERRY' },
    { label: 'PUNJAB', value: 'PUNJAB' },
    { label: 'RAJASTHAN', value: 'RAJASTHAN' },
    { label: 'SIKKIM', value: 'SIKKIM' },
    { label: 'TAMIL NADU', value: 'TAMIL NADU' },
    { label: 'TELANGANA', value: 'TELANGANA' },
    { label: 'TRIPURA', value: 'TRIPURA' },
    { label: 'UTTAR PRADESH', value: 'UTTAR PRADESH' },
    { label: 'UTTARAKHAND', value: 'UTTARAKHAND' },
    { label: 'WEST BENGAL', value: 'WEST BENGAL' },
  ];

  const departmentOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'National Informatic Centre', value: 'National Informatic Centre' },
    { label: 'CENTRAL POWER RESEARCH INSTITUTE', value: 'CENTRAL POWER RESEARCH INSTITUTE' },
    { label: 'Ministry Of Electronics and Information Technology', value: 'Ministry Of Electronics and Information Technology' },
    { label: 'UAT(Testing)', value: 'UAT(Testing)' },
    { label: 'Unique Identification Authority Of India MeitY', value: 'Unique Identification Authority Of India MeitY' },
    { label: 'Enforcement Directorate', value: 'Enforcement Directorate' },
  ];

  const visitTypeOptions = [
    { label: 'SELECT', value: 'SELECT' },
    { label: 'Official', value: 'Official' },
    { label: 'Personal', value: 'Personal' },
    { label: 'Meeting', value: 'Meeting' },
    { label: 'Other', value: 'Other' },
    { label: 'On Duty', value: 'On Duty' },
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGadgetToggle = (gadget) => {
    setFormData({
      ...formData,
      electronicGadgets: {
        ...formData.electronicGadgets,
        [gadget]: !formData.electronicGadgets[gadget],
      },
    });
  };

  const handleDateConfirm = () => {
    handleInputChange('visitDate', tempDate);
    setShowDatePicker(false);
    // Automatically show time picker after date is selected
    setTimeout(() => setShowTimePicker(true), 300);
  };

  const handleTimeConfirm = () => {
    handleInputChange('visitTime', tempTime);
    setShowTimePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(formData.visitDate || new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setTempTime(formData.visitTime || new Date());
    setShowTimePicker(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDateTimeDisplay = () => {
    if (!formData.visitDate) return 'Select date and time';
    const dateStr = formatDate(formData.visitDate);
    if (!formData.visitTime) return dateStr;
    const timeStr = formatTime(formData.visitTime);
    return `${dateStr} at ${timeStr}`;
  };

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

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.organizationType || formData.organizationType === 'SELECT') {
      Alert.alert('Error', 'Please select Organization Type');
      return;
    }
    if (!formData.state || formData.state === 'SELECT') {
      Alert.alert('Error', 'Please select State');
      return;
    }
    if (!formData.department || formData.department === 'SELECT') {
      Alert.alert('Error', 'Please select Department/Organization');
      return;
    }
    if (!formData.building || formData.building === 'SELECT') {
      Alert.alert('Error', 'Please select Building');
      return;
    }
    if (!formData.authority || formData.authority === 'SELECT') {
      Alert.alert('Error', 'Please select Authority/Officer');
      return;
    }
    if (!formData.visitingOfficerName) {
      Alert.alert('Error', 'Please enter Visiting Officer Name');
      return;
    }
    if (!formData.visitDate) {
      Alert.alert('Error', 'Please select Visit Date');
      return;
    }
    if (!formData.visitTime) {
      Alert.alert('Error', 'Please select Visit Time');
      return;
    }
    if (!formData.visitType || formData.visitType === 'SELECT') {
      Alert.alert('Error', 'Please select Visit Type');
      return;
    }
    if (!formData.visitPurpose) {
      Alert.alert('Error', 'Please enter Visit Purpose');
      return;
    }

    Alert.alert(
      'Success',
      'Appointment created successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() },
      ]
    );
  };

  const renderRedStar = () => <Text style={styles.redStar}>*</Text>;

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

              <TouchableOpacity style={styles.modalOption} onPress={onCamera}>
                <Icon name="camera" size={24} color="#3477eb" />
                <Text style={styles.modalOptionText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={onGallery}>
                <Icon name="image" size={24} color="#3477eb" />
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
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Main Form Section */}
        <View style={styles.section}>
          {/* Organization Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Organization Type {renderRedStar()}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={organizationTypeOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Organization Type"
              value={formData.organizationType}
              onChange={(item) => {
                handleInputChange('organizationType', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="domain"
                  size={20}
                />
              )}
            />
          </View>

          {/* State */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={stateOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select State"
              searchPlaceholder="Search..."
              value={formData.state}
              onChange={(item) => {
                handleInputChange('state', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="map-marker"
                  size={20}
                />
              )}
            />
          </View>

          {/* Department/Organization */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Department/Organization {renderRedStar()}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={departmentOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Department"
              searchPlaceholder="Search..."
              value={formData.department}
              onChange={(item) => {
                handleInputChange('department', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="office-building"
                  size={20}
                />
              )}
            />
          </View>

          {/* Building */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Building {renderRedStar()}</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={buildingOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Building"
              value={formData.building}
              onChange={(item) => {
                handleInputChange('building', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="office-building-outline"
                  size={20}
                />
              )}
            />
          </View>

          {/* Authority/Officer */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Authority/Officer {renderRedStar()}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={authorityOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Authority/Officer"
              value={formData.authority}
              onChange={(item) => {
                handleInputChange('authority', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="account-tie"
                  size={20}
                />
              )}
            />
          </View>

          {/* Visiting Officer Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Visiting Officer Name {renderRedStar()}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter visiting officer name"
              placeholderTextColor="#94A3B8"
              value={formData.visitingOfficerName}
              onChangeText={(value) =>
                handleInputChange('visitingOfficerName', value)
              }
            />
          </View>

          {/* Visit Date and Time Combined */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Date & Time {renderRedStar()}</Text>
            <TouchableOpacity
              style={styles.dateTimeInput}
              onPress={openDatePicker}
            >
              <Icon name="calendar-clock" size={20} color="#64748B" style={styles.inputIcon} />
              <Text
                style={
                  formData.visitDate ? styles.dateTimeText : styles.dateTimePlaceholder
                }
              >
                {getDateTimeDisplay()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal - Custom with white background */}
          <Modal
            transparent={true}
            visible={showDatePicker}
            animationType="fade"
            onRequestClose={handleDateCancel}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContainer}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={handleDateCancel}>
                      <Icon name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  
                  <DatePicker
                    date={tempDate}
                    onDateChange={setTempDate}
                    mode="date"
                    minimumDate={new Date()}
                    theme="light"
                    textColor="#0F172A"
                    fadeToColor="#FFFFFF"
                  />
                  
                  <View style={styles.datePickerButtonContainer}>
                    <TouchableOpacity
                      style={styles.datePickerCancelButton}
                      onPress={handleDateCancel}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.datePickerConfirmButton}
                      onPress={handleDateConfirm}
                    >
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* Time Picker Modal - Custom with white background */}
          <Modal
            transparent={true}
            visible={showTimePicker}
            animationType="fade"
            onRequestClose={handleTimeCancel}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContainer}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Time</Text>
                    <TouchableOpacity onPress={handleTimeCancel}>
                      <Icon name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  
                  <DatePicker
                    date={tempTime}
                    onDateChange={setTempTime}
                    mode="time"
                    theme="light"
                    textColor="#0F172A"
                    fadeToColor="#FFFFFF"
                  />
                  
                  <View style={styles.datePickerButtonContainer}>
                    <TouchableOpacity
                      style={styles.datePickerCancelButton}
                      onPress={handleTimeCancel}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.datePickerConfirmButton}
                      onPress={handleTimeConfirm}
                    >
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* Visit Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Type {renderRedStar()}</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={visitTypeOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Visit Type"
              value={formData.visitType}
              onChange={(item) => {
                handleInputChange('visitType', item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.dropdownLeftIcon}
                  color="#64748B"
                  name="briefcase"
                  size={20}
                />
              )}
            />
          </View>

          {/* Visit Purpose */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Visit Purpose (Max 150 char) {renderRedStar()}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter visit purpose"
              placeholderTextColor="#94A3B8"
              value={formData.visitPurpose}
              onChangeText={(value) => {
                if (value.length <= 150) {
                  handleInputChange('visitPurpose', value);
                }
              }}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.charCount}>
              {formData.visitPurpose.length}/150
            </Text>
          </View>

          {/* Electronic Gadgets - Horizontal Layout */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Electronic Gadgets</Text>
            <View style={styles.gadgetsContainer}>
              {/* Row 1: Mobile & Remote Key */}
              <View style={styles.gadgetRow}>
                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('mobile')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.mobile && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.mobile && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Mobile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('remoteKey')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.remoteKey && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.remoteKey && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Remote Key</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Storage Device & Laptop */}
              <View style={styles.gadgetRow}>
                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('storageDevice')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.storageDevice && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.storageDevice && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Storage Device</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('laptop')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.laptop && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.laptop && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Laptop</Text>
                </TouchableOpacity>
              </View>

              {/* Row 3: Camera & Other */}
              <View style={styles.gadgetRow}>
                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('camera')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.camera && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.camera && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gadgetCheckbox}
                  onPress={() => handleGadgetToggle('other')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.electronicGadgets.other && styles.checkboxChecked,
                    ]}
                  >
                    {formData.electronicGadgets.other && (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.gadgetLabel}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Upload Document - Compact Version */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Document (if any)</Text>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                documentUploaded && styles.uploadButtonSuccess,
              ]}
              onPress={() => setShowDocumentModal(true)}
            >
              <Icon 
                name={documentUploaded ? "check-circle" : "file-upload-outline"} 
                size={18} 
                color={documentUploaded ? "#10B981" : "#64748B"} 
              />
              <Text style={[
                styles.uploadButtonText,
                documentUploaded && styles.uploadButtonTextSuccess
              ]}>
                {documentUploaded ? 'Document Uploaded' : 'Choose File'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.uploadInstruction}>
              1. Please attach only pdf file that is less than 400 KB.
            </Text>
          </View>
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

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Upload Modal */}
      <UploadModal
        visible={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onCamera={() => handleDocumentOption('camera')}
        onGallery={() => handleDocumentOption('gallery')}
        title="Upload Document"
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
    backgroundColor: '#3477eb',
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
  formGroup: {
    marginBottom: 24,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  dateTimeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 10,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
  },
  dateTimePlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  gadgetsContainer: {
    gap: 10,
  },
  gadgetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gadgetCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gadgetLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  uploadButtonTextSuccess: {
    color: '#10B981',
  },
  uploadInstruction: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#3477eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3477eb',
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
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 17,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
  // Dropdown Styles
  dropdown: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
  },
  dropdownLeftIcon: {
    marginRight: 10,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownSearchInput: {
    height: 40,
    fontSize: 15,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#0F172A',
  },
  // Modal Styles
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
    color: '#3477eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  modalCancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  // Date/Time Picker Modal Styles
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3477eb',
  },
  datePickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  datePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#3477eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CreateAppointmentScreen;