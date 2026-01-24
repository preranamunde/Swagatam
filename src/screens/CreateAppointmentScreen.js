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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentUri, setDocumentUri] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

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
    'WEST BENGAL',
  ];

  const departmentOptions = [
    'SELECT',
    'National Informatic Centre',
    'CENTRAL POWER RESEARCH INSTITUTE',
    'Ministry Of Electronics and Information Technology',
    'UAT(Testing)',
    'Unique Identification Authority Of India MeitY',
    'Enforcement Directorate',
  ];

  const visitTypeOptions = [
    'SELECT',
    'Official',
    'Personal',
    'Meeting',
    'Other',
    'On Duty',
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

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('visitDate', selectedDate);
      // Automatically show time picker after date is selected
      setTimeout(() => setShowTimePicker(true), 300);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      handleInputChange('visitTime', selectedTime);
    }
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
    if (!formData.building) {
      Alert.alert('Error', 'Please enter Building');
      return;
    }
    if (!formData.authority) {
      Alert.alert('Error', 'Please enter Authority/Officer');
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
                <Icon name="camera" size={24} color="#0A2463" />
                <Text style={styles.modalOptionText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={onGallery}>
                <Icon name="image" size={24} color="#0A2463" />
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
      >
        {/* Main Form Section */}
        <View style={styles.section}>
          {/* Organization Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Organization Type {renderRedStar()}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter organization type"
              placeholderTextColor="#94A3B8"
              value={formData.organizationType}
              onChangeText={(value) =>
                handleInputChange('organizationType', value)
              }
            />
          </View>

          {/* State */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>State {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.state}
                onValueChange={(value) => handleInputChange('state', value)}
                style={styles.picker}
                dropdownIconColor="#64748B"
                itemStyle={styles.pickerItem}
                mode="dropdown"
                prompt="Select State"
              >
                {stateOptions.map((option, index) => (
                  <Picker.Item 
                    key={index} 
                    label={option} 
                    value={option}
                    style={styles.pickerItem}
                    color="#0F172A"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Department/Organization */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Department/Organization {renderRedStar()}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
                style={styles.picker}
                dropdownIconColor="#64748B"
                itemStyle={styles.pickerItem}
                mode="dropdown"
                prompt="Select Department/Organization"
              >
                {departmentOptions.map((option, index) => (
                  <Picker.Item 
                    key={index} 
                    label={option} 
                    value={option}
                    style={styles.pickerItem}
                    color="#0F172A"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Building */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Building {renderRedStar()}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter building name"
              placeholderTextColor="#94A3B8"
              value={formData.building}
              onChangeText={(value) => handleInputChange('building', value)}
            />
          </View>

          {/* Authority/Officer */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Authority/Officer {renderRedStar()}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter authority/officer name"
              placeholderTextColor="#94A3B8"
              value={formData.authority}
              onChangeText={(value) => handleInputChange('authority', value)}
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
              onPress={() => setShowDatePicker(true)}
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

          {showDatePicker && (
            <DateTimePicker
              value={formData.visitDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              themeVariant="light"
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={formData.visitTime || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              themeVariant="light"
            />
          )}

          {/* Visit Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Type {renderRedStar()}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.visitType}
                onValueChange={(value) => handleInputChange('visitType', value)}
                style={styles.picker}
                dropdownIconColor="#64748B"
                itemStyle={styles.pickerItem}
                mode="dropdown"
                prompt="Select Visit Type"
              >
                {visitTypeOptions.map((option, index) => (
                  <Picker.Item 
                    key={index} 
                    label={option} 
                    value={option}
                    style={styles.pickerItem}
                    color="#0F172A"
                  />
                ))}
              </Picker>
            </View>
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
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 1,
    zIndex: 1,
  },
  picker: {
    height: 48,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  pickerItem: {
    fontSize: 14,
    height: 35,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
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
});

export default CreateAppointmentScreen;