import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const TemporaryPassScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Category Tab States - Moved to component level
  const [category, setCategory] = useState('regular');
  const [formData, setFormData] = useState({
    // Common fields
    requestedPeriodFrom: '',
    requestedPeriodTo: '',
    organizationType: '',
    organizationName: '',
    state: '',
    bhawanBuilding: '',
    reportingOfficer: '',
    divisionGroup: '',
    gadgetsLaptop: false,
    gadgetsDetails: '',
    noOtherPassAcknowledged: false,
    
    // Regular category fields
    designation: '',
    parentMinDept: '',
    reasonForPass: '',
    
    // Contractual fields
    vendorName: '',
    vendorAddress: '',
    phone: '',
    workOrderNo: '',
  });

  // Date Picker States
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Add focus listener to reload data when returning from edit
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('personalDetails');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      } else {
        Alert.alert(
          'No Profile Found',
          'Please complete your profile first to apply for a temporary pass.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('PersonalDetails', { 
      editMode: true, 
      userData,
      returnTo: 'TemporaryPass'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Date Picker Functions
  const showFromDatePicker = () => {
    setFromDatePickerVisibility(true);
  };

  const hideFromDatePicker = () => {
    setFromDatePickerVisibility(false);
  };

  const handleConfirmFromDate = (date) => {
    const formattedDate = formatDateForDisplay(date);
    updateFormData('requestedPeriodFrom', formattedDate);
    hideFromDatePicker();
  };

  const showToDatePicker = () => {
    setToDatePickerVisibility(true);
  };

  const hideToDatePicker = () => {
    setToDatePickerVisibility(false);
  };

  const handleConfirmToDate = (date) => {
    const formattedDate = formatDateForDisplay(date);
    updateFormData('requestedPeriodTo', formattedDate);
    hideToDatePicker();
  };

  const formatDateForDisplay = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const handleSaveAsDraft = async () => {
    try {
      await AsyncStorage.setItem('temporaryPassDraft', JSON.stringify({
        category,
        formData,
        savedAt: new Date().toISOString(),
      }));
      Alert.alert('Success', 'Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    }
  };

  const handleProceedToDocuments = () => {
    // Validate required fields
    const requiredFields = category === 'regular' 
      ? ['designation', 'parentMinDept', 'reasonForPass', 'organizationName', 'bhawanBuilding', 'reportingOfficer', 'divisionGroup']
      : ['designation', 'vendorName', 'vendorAddress', 'phone', 'workOrderNo', 'organizationName', 'bhawanBuilding', 'reportingOfficer', 'divisionGroup'];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0 || !formData.requestedPeriodFrom || !formData.requestedPeriodTo) {
      Alert.alert('Missing Information', 'Please fill all required fields marked with *');
      return;
    }

    if (!formData.noOtherPassAcknowledged) {
      Alert.alert('Acknowledgment Required', 'Please accept the acknowledgment to proceed.');
      return;
    }

    setActiveTab('document');
  };

  const renderDetailsTab = () => {
    if (!userData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No profile data found</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Applicant Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Applicant Details</Text>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            {/* Photo Section */}
            {userData.photoUri && (
              <View style={styles.photoSection}>
                <Image
                  source={{ uri: userData.photoUri }}
                  style={styles.applicantPhoto}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              {/* Name */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>
                  {userData.name || 'N/A'}
                </Text>
              </View>

              {/* Gender */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>
                  {userData.gender || 'N/A'}
                </Text>
              </View>

              {/* Date of Birth */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date of Birth</Text>
                <Text style={styles.detailValue}>
                  {formatDate(userData.dateOfBirth)}
                </Text>
              </View>

              {/* Identity Proof */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID Proof Type</Text>
                <Text style={styles.detailValue}>
                  {userData.identityProof || 'N/A'}
                </Text>
              </View>

              {/* ID Number */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID Number</Text>
                <Text style={styles.detailValue}>
                  {userData.identityProofNumber 
                    ? `****${userData.identityProofNumber.slice(-4)}` 
                    : 'N/A'}
                </Text>
              </View>

              {/* Email */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={[styles.detailValue, styles.emailText]}>
                  {userData.email || 'N/A'}
                </Text>
              </View>

              {/* Occupation */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Occupation</Text>
                <Text style={styles.detailValue}>
                  {userData.occupation || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  const renderCategoryTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryContainer}>
          {/* Category Selection Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Applicant Category*:</Text>
              
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setCategory('regular')}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {category === 'regular' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioText}>Regular</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setCategory('contractual')}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {category === 'contractual' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioText}>Contractual/Out Source</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Requested Pass Period */}
         
<View style={styles.periodRow}>
  <Text style={styles.periodLabel}>Requested Pass Period*:</Text>
  <View style={styles.dateInputs}>
    <TouchableOpacity 
      style={styles.dateInputWrapper}
      onPress={showFromDatePicker}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.dateInput,
        formData.requestedPeriodFrom && styles.dateInputFilled
      ]}>
        {formData.requestedPeriodFrom || 'From Date'}
      </Text>
      <Text style={styles.calendarIcon}>📅</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.dateInputWrapper}
      onPress={showToDatePicker}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.dateInput,
        formData.requestedPeriodTo && styles.dateInputFilled
      ]}>
        {formData.requestedPeriodTo || 'To Date'}
      </Text>
      <Text style={styles.calendarIcon}>📅</Text>
    </TouchableOpacity>
  </View>
</View>
          </View>

          {/* Form Fields Card */}
          <View style={styles.formCard}>
            {category === 'regular' ? (
              // Regular Category Fields
              <>
                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Designation*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.designation || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Parent Min/Dept/Organization*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Parent Ministry/Department"
                    value={formData.parentMinDept}
                    onChangeText={(text) => updateFormData('parentMinDept', text)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Reason for Temporary Pass*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.reasonForPass || '-- Select--'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Organization Type:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.organizationType || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>State:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter State"
                    value={formData.state}
                    onChangeText={(text) => updateFormData('state', text)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Organization Name*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.organizationName || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Bhawan / Building Name*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.bhawanBuilding || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Reporting Officer*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.reportingOfficer || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Division / Group Name*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Division / Group Name"
                    value={formData.divisionGroup}
                    onChangeText={(text) => updateFormData('divisionGroup', text)}
                  />
                </View>
              </>
            ) : (
              // Contractual Category Fields
              <>
                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Designation*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.designation || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Vendor Name*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Vendor Name"
                    value={formData.vendorName}
                    onChangeText={(text) => updateFormData('vendorName', text)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Vendor Address*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Vendor Address"
                    value={formData.vendorAddress}
                    onChangeText={(text) => updateFormData('vendorAddress', text)}
                    multiline
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Phone*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Vendor Phone No"
                    value={formData.phone}
                    onChangeText={(text) => updateFormData('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Work Order No.*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Work Order No"
                    value={formData.workOrderNo}
                    onChangeText={(text) => updateFormData('workOrderNo', text)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Organization Type:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.organizationType || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>State:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter State"
                    value={formData.state}
                    onChangeText={(text) => updateFormData('state', text)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Organization Name*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.organizationName || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Bhawan / Building Name*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.bhawanBuilding || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Reporting Officer*:</Text>
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectPlaceholder}>
                      {formData.reportingOfficer || 'SELECT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Division / Group Name*:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Division / Group Name"
                    value={formData.divisionGroup}
                    onChangeText={(text) => updateFormData('divisionGroup', text)}
                  />
                </View>
              </>
            )}

            {/* Gadgets/Items */}
            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>Gadgets/Items:</Text>
              <View style={styles.gadgetsRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => updateFormData('gadgetsLaptop', !formData.gadgetsLaptop)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkbox}>
                    {formData.gadgetsLaptop && <View style={styles.checkboxChecked} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Laptop</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.gadgetsInputField}
                  placeholder="Enter Make, Model, and Serial No."
                  value={formData.gadgetsDetails}
                  onChangeText={(text) => updateFormData('gadgetsDetails', text)}
                  editable={formData.gadgetsLaptop}
                />
              </View>
            </View>

            {/* Acknowledgment Checkbox */}
            <View style={styles.acknowledgmentRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => updateFormData('noOtherPassAcknowledged', !formData.noOtherPassAcknowledged)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, styles.checkboxLarge]}>
                  {formData.noOtherPassAcknowledged && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </View>
                <Text style={styles.acknowledgmentText}>
                  I accept that there is no other temporary pass is in my possession appart from being applied.*
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.saveButton} 
              activeOpacity={0.8}
              onPress={handleSaveAsDraft}
            >
              <Text style={styles.saveButtonText}>Save As Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.proceedButton} 
              activeOpacity={0.8}
              onPress={handleProceedToDocuments}
            >
              <Text style={styles.proceedButtonText}>Proceed to Upload Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButtonBottom} 
              activeOpacity={0.8}
              onPress={() => setActiveTab('details')}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomPadding} />
        </View>

        {/* Date Pickers */}
        <DateTimePickerModal
          isVisible={isFromDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmFromDate}
          onCancel={hideFromDatePicker}
          minimumDate={new Date()}
          date={formData.requestedPeriodFrom ? parseDate(formData.requestedPeriodFrom) : new Date()}
        />

        <DateTimePickerModal
          isVisible={isToDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmToDate}
          onCancel={hideToDatePicker}
          minimumDate={formData.requestedPeriodFrom ? parseDate(formData.requestedPeriodFrom) : new Date()}
          date={formData.requestedPeriodTo ? parseDate(formData.requestedPeriodTo) : (formData.requestedPeriodFrom ? parseDate(formData.requestedPeriodFrom) : new Date())}
        />
      </ScrollView>
    );
  };

  const renderDocumentTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.documentContainer}>
          {/* Application Summary Card */}
          <View style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <View>
                <Text style={styles.applicationLabel}>Application No.</Text>
              </View>
              <View>
                <Text style={styles.applicationLabel}>Application Date:</Text>
              </View>
            </View>

            <View style={styles.applicationBody}>
              <View style={styles.applicationLeft}>
                <View style={styles.applicationRow}>
                  <Text style={styles.applicationFieldLabel}>Applicant Name & Designation</Text>
                  <Text style={styles.applicationFieldValue}>
                    {userData?.name} - {formData.designation || 'N/A'}
                  </Text>
                </View>
                <View style={styles.applicationRow}>
                  <Text style={styles.applicationFieldLabel}>Temporary Pass Requested Period</Text>
                  <Text style={styles.applicationFieldValue}>
                    {formData.requestedPeriodFrom && formData.requestedPeriodTo 
                      ? `${formData.requestedPeriodFrom} to ${formData.requestedPeriodTo}`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.applicationRow}>
                  <Text style={styles.applicationFieldLabel}>Applicant Category</Text>
                  <Text style={styles.applicationFieldValue}>
                    {category === 'regular' ? 'Regular' : 'Contractual/Out Source'}
                  </Text>
                </View>
                <View style={styles.applicationRow}>
                  <Text style={styles.applicationFieldLabel}>Reporting Officer</Text>
                  <Text style={styles.applicationFieldValue}>
                    {formData.reportingOfficer || 'N/A'}
                  </Text>
                </View>
                <View style={styles.applicationRow}>
                  <Text style={styles.applicationFieldLabel}>Status :</Text>
                  <Text style={styles.applicationFieldValue}>Draft</Text>
                </View>
              </View>

              <View style={styles.applicationRight}>
                <View style={styles.photoContainer}>
                  {userData?.photoUri ? (
                    <Image
                      source={{ uri: userData.photoUri }}
                      style={styles.documentPhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.documentPhotoPlaceholder} />
                  )}
                </View>
                <View style={styles.signatureContainer}>
                  <View style={styles.signaturePlaceholder} />
                  <Text style={styles.signatureLabel}>Signature</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.documentActionButtons}>
            <TouchableOpacity 
              style={styles.editAppButton} 
              activeOpacity={0.8}
              onPress={() => setActiveTab('category')}
            >
              <Text style={styles.editAppButtonText}>Edit Application</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.uploadDocsButton} 
              activeOpacity={0.8}
              onPress={() => Alert.alert('Upload Documents', 'Document upload feature will be implemented')}
            >
              <Text style={styles.uploadDocsButtonText}>Upload Documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.previewButton} 
              activeOpacity={0.8}
              onPress={() => Alert.alert('Preview', 'Application preview will be shown')}
            >
              <Text style={styles.previewButtonText}>Preview Application</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  'Cancel Application',
                  'Are you sure you want to cancel this application?',
                  [
                    { text: 'No', style: 'cancel' },
                    { 
                      text: 'Yes', 
                      onPress: () => navigation.goBack(),
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Application</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'category':
        return renderCategoryTab();
      case 'document':
        return renderDocumentTab();
      default:
        return renderDetailsTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Temporary Pass</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Temporary Pass</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'details' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('details')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'details' && styles.activeTabText,
            ]}
          >
            Applicant Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'category' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('category')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'category' && styles.activeTabText,
            ]}
          >
            Applicant Category
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'document' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('document')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'document' && styles.activeTabText,
            ]}
          >
            Upload Document
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
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
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0A2463',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0A2463',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A2463',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  editIconButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 16,
  },
  cardContent: {
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  applicantPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#0A2463',
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1.5,
    textAlign: 'right',
  },
  emailText: {
    fontSize: 13,
  },
  bottomPadding: {
    height: 20,
  },
  // Category Tab Styles
  categoryContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  categoryHeader: {
    backgroundColor: '#B8D4E8',
    padding: 16,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E91E63',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E91E63',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  periodRow: {
    marginTop: 8,
  },
  periodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#CBD5E1',
  padding: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
dateInputFilled: {
  color: '#0F172A',
  fontWeight: '600',
},
calendarIcon: {
  fontSize: 16,
  marginLeft: 8,
},
  dateInput: {
    fontSize: 14,
    color: '#94A3B8',
  },
  dateInputFilled: {
    color: '#0F172A',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formRow: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  gadgetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#64748B',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLarge: {
    width: 20,
    height: 20,
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  checkboxCheck: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  gadgetsInputField: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  acknowledgmentRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  acknowledgmentText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexWrap: 'wrap',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonBottom: {
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 6,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Document Tab Styles
  documentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  applicationHeader: {
    backgroundColor: '#B8D4E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  applicationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  applicationBody: {
    flexDirection: 'row',
    padding: 16,
  },
  applicationLeft: {
    flex: 1,
    paddingRight: 12,
  },
  applicationRow: {
    marginBottom: 16,
  },
  applicationFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  applicationFieldValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    marginTop: 4,
  },
  applicationRight: {
    width: 140,
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 12,
  },
  documentPhoto: {
    width: 120,
    height: 140,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  documentPhotoPlaceholder: {
    width: 120,
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  signatureContainer: {
    width: 120,
  },
  signaturePlaceholder: {
    width: 120,
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  documentActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  editAppButton: {
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  editAppButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadDocsButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadDocsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TemporaryPassScreen;