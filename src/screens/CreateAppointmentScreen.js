import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import {
  fetchGovTypes,
  fetchStateOrMinistry,
  fetchBhawanByMinistry,
  fetchOfficersByBhawan,
  insertAppVisitor,
} from '../constants/services/appointmentservice';

// ─── State → numeric code mapping ─────────────────────────────────────────────
const STATE_CODE_MAP = {
  'ANDAMAN AND NICOBAR':    '35',
  'ANDHRA PRADESH':         '28',
  'ARUNACHAL PRADESH':      '12',
  'ASSAM':                  '18',
  'BIHAR':                  '10',
  'CHANDIGARH':             '04',
  'CHHATTISGARH':           '22',
  'DADRA AND NAGAR HAVELI': '26',
  'DAMAN AND DIU':          '25',
  'DELHI':                  '07',
  'GOA':                    '30',
  'GUJARAT':                '24',
  'HARYANA':                '06',
  'HIMACHAL PRADESH':       '02',
  'JAMMU AND KASHMIR':      '01',
  'JHARKHAND':              '20',
  'KARNATAKA':              '29',
  'KERALA':                 '32',
  'LADAKH':                 '38',
  'LAKSHADWEEP':            '31',
  'MADHYA PRADESH':         '23',
  'MAHARASHTRA':            '27',
  'MANIPUR':                '14',
  'MEGHALAYA':              '17',
  'MIZORAM':                '15',
  'NAGALAND':               '13',
  'ORISSA':                 '21',
  'PUDUCHERRY':             '34',
  'PUNJAB':                 '03',
  'RAJASTHAN':              '08',
  'SIKKIM':                 '11',
  'TAMIL NADU':             '33',
  'TELANGANA':              '36',
  'TRIPURA':                '16',
  'UTTAR PRADESH':          '09',
  'UTTARAKHAND':            '05',
  'WEST BENGAL':            '19',
};

// ─── Static option lists (defined outside component to avoid re-creation) ─────
const STATE_OPTIONS = [
  { label: 'SELECT',                    value: 'SELECT' },
  { label: 'ANDAMAN AND NICOBAR',       value: 'ANDAMAN AND NICOBAR' },
  { label: 'ANDHRA PRADESH',            value: 'ANDHRA PRADESH' },
  { label: 'ARUNACHAL PRADESH',         value: 'ARUNACHAL PRADESH' },
  { label: 'ASSAM',                     value: 'ASSAM' },
  { label: 'BIHAR',                     value: 'BIHAR' },
  { label: 'CHANDIGARH',                value: 'CHANDIGARH' },
  { label: 'CHHATTISGARH',              value: 'CHHATTISGARH' },
  { label: 'DADRA AND NAGAR HAVELI',    value: 'DADRA AND NAGAR HAVELI' },
  { label: 'DAMAN AND DIU',             value: 'DAMAN AND DIU' },
  { label: 'DELHI',                     value: 'DELHI' },
  { label: 'GOA',                       value: 'GOA' },
  { label: 'GUJARAT',                   value: 'GUJARAT' },
  { label: 'HARYANA',                   value: 'HARYANA' },
  { label: 'HIMACHAL PRADESH',          value: 'HIMACHAL PRADESH' },
  { label: 'JAMMU AND KASHMIR',         value: 'JAMMU AND KASHWAR' },
  { label: 'JHARKHAND',                 value: 'JHARKHAND' },
  { label: 'KARNATAKA',                 value: 'KARNATAKA' },
  { label: 'KERALA',                    value: 'KERALA' },
  { label: 'LADAKH',                    value: 'LADAKH' },
  { label: 'LAKSHADWEEP',               value: 'LAKSHADWEEP' },
  { label: 'MADHYA PRADESH',            value: 'MADHYA PRADESH' },
  { label: 'MAHARASHTRA',               value: 'MAHARASHTRA' },
  { label: 'MANIPUR',                   value: 'MANIPUR' },
  { label: 'MEGHALAYA',                 value: 'MEGHALAYA' },
  { label: 'MIZORAM',                   value: 'MIZORAM' },
  { label: 'NAGALAND',                  value: 'NAGALAND' },
  { label: 'ORISSA',                    value: 'ORISSA' },
  { label: 'PUDUCHERRY',                value: 'PUDUCHERRY' },
  { label: 'PUNJAB',                    value: 'PUNJAB' },
  { label: 'RAJASTHAN',                 value: 'RAJASTHAN' },
  { label: 'SIKKIM',                    value: 'SIKKIM' },
  { label: 'TAMIL NADU',                value: 'TAMIL NADU' },
  { label: 'TELANGANA',                 value: 'TELANGANA' },
  { label: 'TRIPURA',                   value: 'TRIPURA' },
  { label: 'UTTAR PRADESH',             value: 'UTTAR PRADESH' },
  { label: 'UTTARAKHAND',               value: 'UTTARAKHAND' },
  { label: 'WEST BENGAL',               value: 'WEST BENGAL' },
];

const VISIT_TYPE_OPTIONS = [
  { label: 'SELECT',   value: 'SELECT' },
  { label: 'Official', value: 'Official' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Meeting',  value: 'Meeting' },
  { label: 'Other',    value: 'Other' },
  { label: 'On Duty',  value: 'On Duty' },
];

const GADGET_LABELS = {
  mobile:        'Mobile',
  remoteKey:     'Remote Key',
  storageDevice: 'Storage Device',
  laptop:        'Laptop',
  camera:        'Camera',
  other:         'Other',
};

const GADGET_ROWS = [
  ['mobile', 'remoteKey'],
  ['storageDevice', 'laptop'],
  ['camera', 'other'],
];

const EMPTY_SELECT = [{ label: 'SELECT', value: 'SELECT', id: 'SELECT' }];

// ─── Generate Hr options 00-23 ─────────────────────────────────────────────
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}));

// ─── Generate Min options 00-55 (step 5) ──────────────────────────────────
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: String(i * 5).padStart(2, '0'),
  value: String(i * 5).padStart(2, '0'),
}));

// ─── GovCode value for State Government — adjust if your API returns a different Id ──
const STATE_GOVT_GOV_CODE = '2';

// ─── Component ────────────────────────────────────────────────────────────────

const CreateAppointmentScreen = ({ navigation, route }) => {

  // ── visRegNo resolution (3-tier fallback) ────────────────────────────────
  const [visRegNo,       setVisRegNo]       = useState(String(route?.params?.visRegNo ?? ''));
  const [sessionLoading, setSessionLoading] = useState(!route?.params?.visRegNo);

  useEffect(() => {
    if (route?.params?.visRegNo) {
      console.log('[CreateAppointmentScreen] visRegNo from route params:', route.params.visRegNo);
      return;
    }

    const loadVisRegNo = async () => {
      try {
        const sessionRaw = await AsyncStorage.getItem('loginSession');
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          const id = session?.Vis_Reg_No ?? session?.visRegNo ?? '';
          if (id) {
            console.log('[CreateAppointmentScreen] visRegNo from loginSession:', id);
            setVisRegNo(String(id));
            setSessionLoading(false);
            return;
          }
        }

        const userRaw = await AsyncStorage.getItem('userData');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          const id = user?.visRegNo ?? user?.Vis_Reg_No ?? '';
          if (id) {
            console.log('[CreateAppointmentScreen] visRegNo from userData:', id);
            setVisRegNo(String(id));
            setSessionLoading(false);
            return;
          }
        }

        console.warn('[CreateAppointmentScreen] visRegNo not found in any storage key');
        setSessionLoading(false);
      } catch (err) {
        console.error('[CreateAppointmentScreen] AsyncStorage read error:', err.message);
        setSessionLoading(false);
      }
    };

    loadVisRegNo();
  }, []);

  // ── Form State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    organizationType:     '',
    state:                '',
    department:           '',
    building:             '',
    authority:            '',
    visitingOfficerName:  '',
    approvingOfficerName: '',
    visitDate:            null,
    visitTime:            null,
    visitType:            '',
    visitPurpose:         '',
    electronicGadgets: {
      mobile:        false,
      remoteKey:     false,
      storageDevice: false,
      laptop:        false,
      camera:        false,
      other:         false,
    },
  });

  // ── Date Picker State ───────────────────────────────────────────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate,       setTempDate]       = useState(new Date());

  // ── Time State (Hr/Min dropdowns + Any Time checkbox) ───────────────────────
  const [selectedHour,   setSelectedHour]   = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [isAnyTime,      setIsAnyTime]      = useState(false);

  // ── Document Upload State ───────────────────────────────────────────────────
  const [documentUploaded,  setDocumentUploaded]  = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // ── Submit State ────────────────────────────────────────────────────────────
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Organization Type ───────────────────────────────────────────────────────
  const [orgTypeOptions, setOrgTypeOptions] = useState(EMPTY_SELECT);
  const [orgTypeLoading, setOrgTypeLoading] = useState(false);
  const [orgTypeError,   setOrgTypeError]   = useState(null);

  // ── Department ──────────────────────────────────────────────────────────────
  const [departmentOptions, setDepartmentOptions] = useState(EMPTY_SELECT);
  const [deptLoading,       setDeptLoading]       = useState(false);
  const [deptError,         setDeptError]         = useState(null);

  // ── Building ────────────────────────────────────────────────────────────────
  const [buildingOptions, setBuildingOptions] = useState(EMPTY_SELECT);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [buildingError,   setBuildingError]   = useState(null);

  // ── Authority / Officer ─────────────────────────────────────────────────────
  const [authorityOptions, setAuthorityOptions] = useState(EMPTY_SELECT);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authorityError,   setAuthorityError]   = useState(null);

  useEffect(() => {
    loadGovTypes();
  }, []);

  // ── API Loaders ─────────────────────────────────────────────────────────────

  const loadGovTypes = async () => {
    setOrgTypeLoading(true);
    setOrgTypeError(null);
    try {
      const data   = await fetchGovTypes();
      const mapped = data.map((item) => ({ label: item.Name, value: item.Id, id: item.Id }));
      setOrgTypeOptions([...EMPTY_SELECT, ...mapped]);
    } catch (error) {
      console.error('loadGovTypes error:', error.message);
      setOrgTypeError('Failed to load. Tap to retry.');
    } finally {
      setOrgTypeLoading(false);
    }
  };

  const loadDepartments = async (govType) => {
    setDeptLoading(true);
    setDeptError(null);
    setFormData((prev) => ({
      ...prev,
      department: '', building: '', authority: '',
      visitingOfficerName: '', approvingOfficerName: '',
    }));
    setDepartmentOptions(EMPTY_SELECT);
    setBuildingOptions(EMPTY_SELECT);
    setBuildingError(null);
    setAuthorityOptions(EMPTY_SELECT);
    setAuthorityError(null);
    try {
      const data   = await fetchStateOrMinistry(govType);
      const mapped = data.map((item) => ({ label: item.Name, value: item.Id, id: item.Id }));
      setDepartmentOptions([...EMPTY_SELECT, ...mapped]);
    } catch (error) {
      console.error('loadDepartments error:', error.message);
      setDeptError('Failed to load. Tap to retry.');
    } finally {
      setDeptLoading(false);
    }
  };

  const loadBuildings = async (ministryCode) => {
    setBuildingLoading(true);
    setBuildingError(null);
    setFormData((prev) => ({
      ...prev,
      building: '', authority: '',
      visitingOfficerName: '', approvingOfficerName: '',
    }));
    setBuildingOptions(EMPTY_SELECT);
    setAuthorityOptions(EMPTY_SELECT);
    setAuthorityError(null);
    try {
      const data   = await fetchBhawanByMinistry(ministryCode);
      const mapped = data.map((item) => ({ label: item.Name, value: item.Id, id: item.Id }));
      setBuildingOptions([...EMPTY_SELECT, ...mapped]);
    } catch (error) {
      console.error('loadBuildings error:', error.message);
      setBuildingError('Failed to load. Tap to retry.');
    } finally {
      setBuildingLoading(false);
    }
  };

  const loadOfficers = async (ministryCode, bhawanCode) => {
    setAuthorityLoading(true);
    setAuthorityError(null);
    setFormData((prev) => ({
      ...prev,
      authority: '', visitingOfficerName: '', approvingOfficerName: '',
    }));
    setAuthorityOptions(EMPTY_SELECT);
    try {
      const { officers } = await fetchOfficersByBhawan(ministryCode, bhawanCode);
      const mapped = officers.map((item) => {
        const justName = item.Name.includes('(')
          ? item.Name.split('(')[0].trim()
          : item.Name.trim();
        return {
          label: item.Name,
          value: item.Id,
          id:    item.Id,
          name:  justName,
        };
      });
      setAuthorityOptions([...EMPTY_SELECT, ...mapped]);
    } catch (error) {
      console.error('loadOfficers error:', error.message);
      setAuthorityError('Failed to load. Tap to retry.');
    } finally {
      setAuthorityLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleGadgetToggle = (gadget) =>
    setFormData((prev) => ({
      ...prev,
      electronicGadgets: {
        ...prev.electronicGadgets,
        [gadget]: !prev.electronicGadgets[gadget],
      },
    }));

  const handleDateConfirm = () => {
    handleInputChange('visitDate', tempDate);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(formData.visitDate || new Date());
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const formatTime = (hour, minute) => `${hour}:${minute}`;

  const handleDocumentOption = (option) => {
    setShowDocumentModal(false);
    const pickerOpts = { mediaType: 'photo', quality: 1, saveToPhotos: false };
    const cb = (response) => {
      if (response.didCancel) return;
      if (response.errorCode) { Alert.alert('Error', response.errorMessage); return; }
      if (response.assets?.[0]) { setDocumentUploaded(true); }
    };
    if (option === 'camera')  launchCamera(pickerOpts, cb);
    if (option === 'gallery') launchImageLibrary(pickerOpts, cb);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (sessionLoading) {
      Alert.alert('Please wait', 'Loading session data…');
      return;
    }

    if (!visRegNo || visRegNo.trim() === '' || visRegNo === 'undefined') {
      Alert.alert(
        'Session Error',
        'Visitor registration number not found.\n\nPlease log out and log in again.',
        [
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.multiRemove(['loginSession', 'userData', 'userRole']);
              navigation.reset({ index: 0, routes: [{ name: 'VisitorLogin' }] });
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    if (!formData.organizationType || formData.organizationType === 'SELECT') {
      Alert.alert('Error', 'Please select Organization Type'); return;
    }
    if (!formData.state || formData.state === 'SELECT') {
      Alert.alert('Error', 'Please select State'); return;
    }
    if (!formData.department || formData.department === 'SELECT') {
      Alert.alert('Error', 'Please select Department/Organization'); return;
    }
    if (!formData.building || formData.building === 'SELECT') {
      Alert.alert('Error', 'Please select Building'); return;
    }
    if (!formData.authority || formData.authority === 'SELECT') {
      Alert.alert('Error', 'Please select Authority/Officer'); return;
    }
    if (!formData.visitingOfficerName.trim()) {
      Alert.alert('Error', 'Please enter Visiting Officer Name'); return;
    }
    if (!formData.visitDate) {
      Alert.alert('Error', 'Please select Visit Date'); return;
    }
    if (!isAnyTime && (!selectedHour || !selectedMinute)) {
      Alert.alert('Error', 'Please select Visit Time'); return;
    }
    if (!formData.visitType || formData.visitType === 'SELECT') {
      Alert.alert('Error', 'Please select Visit Type'); return;
    }
    if (!formData.visitPurpose.trim()) {
      Alert.alert('Error', 'Please enter Visit Purpose'); return;
    }

    const isStateGovt = String(formData.organizationType) === STATE_GOVT_GOV_CODE;
    const stateCode   = isStateGovt
      ? (STATE_CODE_MAP[formData.state] || formData.state)
      : '0';

    // ── Visit_Time: omit or send empty string when Any Time is checked ──
    const visitTimeValue = isAnyTime ? '' : formatTime(selectedHour, selectedMinute);

    const payload = {
      Vis_Reg_No:             visRegNo,
      MCode:                  String(formData.department),
      BCode:                  String(formData.building),
      Loc_Id:                 String(formData.authority),
      Officer_Name:           formData.visitingOfficerName.trim(),
      Approving_Officer_Name: (formData.approvingOfficerName || formData.visitingOfficerName).trim(),
      Vis_Date:               formatDate(formData.visitDate),
      Visit_Time:             visitTimeValue,
      Visit_Purpose:          formData.visitPurpose.trim(),
      AdditionalVisitors:     '0',
      GovCode:                String(formData.organizationType),
      StateCode:              stateCode,
    };

    console.log('📋 Submit payload:', JSON.stringify(payload));

    setSubmitLoading(true);
    try {
      const response = await insertAppVisitor(payload);
      if (response?.Success) {
        Alert.alert(
          'Success',
          response.Message || 'Appointment created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert('Error', response?.Message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('handleSubmit error:', error.message);
      Alert.alert('Error', error.message || 'Failed to submit appointment. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Are you sure you want to cancel? All data will be lost.', [
      { text: 'No',  style: 'cancel' },
      { text: 'Yes', onPress: () => navigation.goBack() },
    ]);
  };

  // ── Derived disable flags ─────────────────────────────────────────────────
  const deptDisabled      = deptLoading      || !formData.organizationType || formData.organizationType === 'SELECT';
  const buildingDisabled  = buildingLoading  || !formData.department        || formData.department        === 'SELECT';
  const authorityDisabled = authorityLoading || !formData.building          || formData.building          === 'SELECT';

  // ── Sub-components ────────────────────────────────────────────────────────

  const RedStar = () => <Text style={styles.redStar}>*</Text>;

  const ErrorBanner = ({ message, onRetry }) => (
    <View style={styles.errorBanner}>
      <Icon name="alert-circle-outline" size={14} color="#EF4444" />
      <Text style={styles.errorBannerText}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const UploadModal = ({ visible, onClose, onCamera, onGallery, title }) => (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
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
              <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ── Loading overlay while session resolves ────────────────────────────────
  if (sessionLoading) {
    return (
      <View style={styles.sessionLoadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Appointment</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.sessionLoadingBody}>
          <ActivityIndicator size="large" color="#3477eb" />
          <Text style={styles.sessionLoadingText}>Loading session…</Text>
        </View>
      </View>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.section}>

          {/* ── Organization Type ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Type <RedStar /></Text>
            {orgTypeError && <ErrorBanner message={orgTypeError} onRetry={loadGovTypes} />}
            <Dropdown
              style={[styles.dropdown, orgTypeLoading && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={orgTypeOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={orgTypeLoading ? 'Loading…' : 'Select Organization Type'}
              value={formData.organizationType}
              disable={orgTypeLoading}
              onChange={(item) => {
                handleInputChange('organizationType', item.value);
                if (item.value && item.value !== 'SELECT') {
                  loadDepartments(item.value);
                } else {
                  setDepartmentOptions(EMPTY_SELECT);
                  setBuildingOptions(EMPTY_SELECT);
                  setAuthorityOptions(EMPTY_SELECT);
                  setFormData((prev) => ({
                    ...prev,
                    department: '', building: '', authority: '',
                    visitingOfficerName: '', approvingOfficerName: '',
                  }));
                }
              }}
              renderLeftIcon={() =>
                orgTypeLoading
                  ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                  : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="domain" size={20} />
              }
            />
          </View>

          {/* ── State ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>State <RedStar /></Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={STATE_OPTIONS}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select State"
              searchPlaceholder="Search…"
              value={formData.state}
              onChange={(item) => handleInputChange('state', item.value)}
              renderLeftIcon={() => (
                <Icon style={styles.dropdownLeftIcon} color="#64748B" name="map-marker" size={20} />
              )}
            />
          </View>

          {/* ── Department / Organization ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Department/Organization <RedStar /></Text>
            {deptError && (
              <ErrorBanner
                message={deptError}
                onRetry={() => loadDepartments(formData.organizationType)}
              />
            )}
            <Dropdown
              style={[styles.dropdown, deptDisabled && styles.dropdownDisabled]}
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
              placeholder={deptLoading ? 'Loading…' : deptDisabled ? 'Select Organization Type first' : 'Select Department'}
              searchPlaceholder="Search…"
              value={formData.department}
              disable={deptDisabled}
              onChange={(item) => {
                handleInputChange('department', item.value);
                if (item.value && item.value !== 'SELECT') {
                  loadBuildings(item.value);
                } else {
                  setBuildingOptions(EMPTY_SELECT);
                  setAuthorityOptions(EMPTY_SELECT);
                  setBuildingError(null);
                  setAuthorityError(null);
                  setFormData((prev) => ({
                    ...prev,
                    building: '', authority: '',
                    visitingOfficerName: '', approvingOfficerName: '',
                  }));
                }
              }}
              renderLeftIcon={() =>
                deptLoading
                  ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                  : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="office-building" size={20} />
              }
            />
          </View>

          {/* ── Building ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Building <RedStar /></Text>
            {buildingError && (
              <ErrorBanner message={buildingError} onRetry={() => loadBuildings(formData.department)} />
            )}
            <Dropdown
              style={[styles.dropdown, buildingDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={buildingOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={buildingLoading ? 'Loading…' : buildingDisabled ? 'Select Department first' : 'Select Building'}
              searchPlaceholder="Search…"
              value={formData.building}
              disable={buildingDisabled}
              onChange={(item) => {
                handleInputChange('building', item.value);
                if (item.value && item.value !== 'SELECT') {
                  loadOfficers(formData.department, item.value);
                } else {
                  setAuthorityOptions(EMPTY_SELECT);
                  setAuthorityError(null);
                  setFormData((prev) => ({
                    ...prev,
                    authority: '', visitingOfficerName: '', approvingOfficerName: '',
                  }));
                }
              }}
              renderLeftIcon={() =>
                buildingLoading
                  ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                  : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="office-building-outline" size={20} />
              }
            />
          </View>

          {/* ── Authority / Officer ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Authority/Officer <RedStar /></Text>
            {authorityError && (
              <ErrorBanner
                message={authorityError}
                onRetry={() => loadOfficers(formData.department, formData.building)}
              />
            )}
            <Dropdown
              style={[styles.dropdown, authorityDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={authorityOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={authorityLoading ? 'Loading…' : authorityDisabled ? 'Select Building first' : 'Select Authority/Officer'}
              searchPlaceholder="Search…"
              value={formData.authority}
              disable={authorityDisabled}
              onChange={(item) => {
                handleInputChange('authority', item.value);
                if (item.value && item.value !== 'SELECT' && item.name) {
                  handleInputChange('visitingOfficerName',  item.name);
                  handleInputChange('approvingOfficerName', item.label || item.name);
                } else {
                  handleInputChange('visitingOfficerName',  '');
                  handleInputChange('approvingOfficerName', '');
                }
              }}
              renderLeftIcon={() =>
                authorityLoading
                  ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                  : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="account-tie" size={20} />
              }
            />
          </View>

          {/* ── Visiting Officer Name ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visiting Officer Name <RedStar /></Text>
            <TextInput
              style={styles.textInput}
              placeholder="Auto-filled on officer selection"
              placeholderTextColor="#94A3B8"
              value={formData.visitingOfficerName}
              onChangeText={(v) => handleInputChange('visitingOfficerName', v)}
            />
          </View>

          {/* ── Visit Date ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Date <RedStar /></Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={openDatePicker}>
              <Icon name="calendar" size={20} color="#64748B" style={styles.inputIcon} />
              <Text style={formData.visitDate ? styles.dateTimeText : styles.dateTimePlaceholder}>
                {formData.visitDate ? formatDate(formData.visitDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <Modal
            transparent
            visible={showDatePicker}
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContainer}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
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
                    <TouchableOpacity style={styles.datePickerCancelButton} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.datePickerConfirmButton} onPress={handleDateConfirm}>
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* ── Preferred Time ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Time <RedStar /></Text>

            {/* Any Time checkbox row */}
            <TouchableOpacity
              style={styles.anyTimeRow}
              onPress={() => setIsAnyTime((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isAnyTime && styles.checkboxChecked]}>
                {isAnyTime && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.anyTimeLabel}>Any Time</Text>
            </TouchableOpacity>

            {/* Hr / Min dropdowns — hidden when Any Time is checked */}
            {!isAnyTime && (
              <View style={styles.timeRow}>
                <View style={styles.timeFieldWrapper}>
                  <Text style={styles.timeSubLabel}>Hr</Text>
                  <Dropdown
                    style={styles.timeDropdown}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    containerStyle={styles.dropdownContainer}
                    data={HOUR_OPTIONS}
                    maxHeight={220}
                    labelField="label"
                    valueField="value"
                    placeholder="00"
                    value={selectedHour}
                    onChange={(item) => setSelectedHour(item.value)}
                  />
                </View>
                <Text style={styles.timeColon}>:</Text>
                <View style={styles.timeFieldWrapper}>
                  <Text style={styles.timeSubLabel}>Min</Text>
                  <Dropdown
                    style={styles.timeDropdown}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    containerStyle={styles.dropdownContainer}
                    data={MINUTE_OPTIONS}
                    maxHeight={220}
                    labelField="label"
                    valueField="value"
                    placeholder="00"
                    value={selectedMinute}
                    onChange={(item) => setSelectedMinute(item.value)}
                  />
                </View>
              </View>
            )}
          </View>

          {/* ── Visit Type ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Type <RedStar /></Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer}
              data={VISIT_TYPE_OPTIONS}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Visit Type"
              value={formData.visitType}
              onChange={(item) => handleInputChange('visitType', item.value)}
              renderLeftIcon={() => (
                <Icon style={styles.dropdownLeftIcon} color="#64748B" name="briefcase" size={20} />
              )}
            />
          </View>

          {/* ── Visit Purpose ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Purpose (Max 150 char) <RedStar /></Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter visit purpose"
              placeholderTextColor="#94A3B8"
              value={formData.visitPurpose}
              onChangeText={(v) => { if (v.length <= 150) handleInputChange('visitPurpose', v); }}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.charCount}>{formData.visitPurpose.length}/150</Text>
          </View>

          {/* ── Electronic Gadgets ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Electronic Gadgets</Text>
            <View style={styles.gadgetsContainer}>
              {GADGET_ROWS.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.gadgetRow}>
                  {row.map((gadget) => (
                    <TouchableOpacity
                      key={gadget}
                      style={styles.gadgetCheckbox}
                      onPress={() => handleGadgetToggle(gadget)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, formData.electronicGadgets[gadget] && styles.checkboxChecked]}>
                        {formData.electronicGadgets[gadget] && <Icon name="check" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.gadgetLabel}>{GADGET_LABELS[gadget]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* ── Upload Document ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Document (if any)</Text>
            <TouchableOpacity
              style={[styles.uploadButton, documentUploaded && styles.uploadButtonSuccess]}
              onPress={() => setShowDocumentModal(true)}
            >
              <Icon
                name={documentUploaded ? 'check-circle' : 'file-upload-outline'}
                size={18}
                color={documentUploaded ? '#10B981' : '#64748B'}
              />
              <Text style={[styles.uploadButtonText, documentUploaded && styles.uploadButtonTextSuccess]}>
                {documentUploaded ? 'Document Uploaded' : 'Choose File'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.uploadInstruction}>
              1. Please attach only pdf file that is less than 400 KB.
            </Text>
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={submitLoading}
          >
            {submitLoading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.submitButtonText}>Submit</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={submitLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:                 { flex: 1, backgroundColor: '#F8FAFC' },
  sessionLoadingContainer:   { flex: 1, backgroundColor: '#F8FAFC' },
  sessionLoadingBody:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  sessionLoadingText:        { fontSize: 15, color: '#64748B', fontWeight: '500' },
  header:                    { backgroundColor: '#3477eb', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  backButton:                { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:               { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  headerRight:               { width: 40 },
  scrollView:                { flex: 1 },
  scrollContent:             { paddingBottom: 20 },
  section:                   { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  formGroup:                 { marginBottom: 24 },
  label:                     { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
  redStar:                   { color: '#EF4444', fontSize: 14 },
  textInput:                 { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#0F172A' },
  textArea:                  { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  charCount:                 { fontSize: 12, color: '#64748B', textAlign: 'right', marginTop: 4 },
  dateTimeInput:             { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  inputIcon:                 { marginRight: 10 },
  dateTimeText:              { fontSize: 15, color: '#0F172A', flex: 1 },
  dateTimePlaceholder:       { fontSize: 15, color: '#94A3B8', flex: 1 },
  // ── Any Time checkbox row ──
  anyTimeRow:                { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  anyTimeLabel:              { fontSize: 14, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
  // ── Hr / Min time row ──
  timeRow:                   { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timeFieldWrapper:          { flex: 1 },
  timeSubLabel:              { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  timeDropdown:              { height: 50, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 12 },
  timeColon:                 { fontSize: 22, fontWeight: '700', color: '#334155', paddingBottom: 12 },
  // ─────────────────────────
  errorBanner:               { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8, borderWidth: 1, borderColor: '#FECACA', gap: 6 },
  errorBannerText:           { fontSize: 12, color: '#EF4444', flex: 1 },
  retryButton:               { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#EF4444', borderRadius: 6 },
  retryButtonText:           { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  dropdown:                  { height: 50, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16 },
  dropdownDisabled:          { opacity: 0.6, backgroundColor: '#F8FAFC' },
  dropdownPlaceholder:       { fontSize: 15, color: '#94A3B8' },
  dropdownSelectedText:      { fontSize: 15, color: '#0F172A' },
  dropdownIcon:              { width: 20, height: 20, tintColor: '#64748B' },
  dropdownLeftIcon:          { marginRight: 10 },
  dropdownContainer:         { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  dropdownSearchInput:       { height: 40, fontSize: 15, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, color: '#0F172A' },
  checkbox:                  { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked:           { backgroundColor: '#10B981', borderColor: '#10B981' },
  gadgetsContainer:          { gap: 10 },
  gadgetRow:                 { flexDirection: 'row', gap: 10 },
  gadgetCheckbox:            { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  gadgetLabel:               { fontSize: 13, color: '#334155', fontWeight: '500', flex: 1 },
  uploadButton:              { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadButtonSuccess:       { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  uploadButtonText:          { fontSize: 14, color: '#64748B', fontWeight: '600' },
  uploadButtonTextSuccess:   { color: '#10B981' },
  uploadInstruction:         { fontSize: 12, color: '#10B981', marginTop: 8, lineHeight: 18 },
  buttonContainer:           { marginHorizontal: 16, marginTop: 24, gap: 12 },
  submitButton:              { backgroundColor: '#3477eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#3477eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonDisabled:      { opacity: 0.6 },
  submitButtonText:          { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  cancelButton:              { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  cancelButtonText:          { color: '#64748B', fontSize: 17, fontWeight: '700' },
  bottomPadding:             { height: 20 },
  modalOverlay:              { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer:            { width: '85%', maxWidth: 400 },
  modalContent:              { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalTitle:                { fontSize: 20, fontWeight: '700', color: '#3477eb', marginBottom: 8, textAlign: 'center' },
  modalSubtitle:             { fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  modalOption:               { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  modalOptionText:           { fontSize: 15, fontWeight: '600', color: '#334155', flex: 1 },
  modalCancelButton:         { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center' },
  modalCancelText:           { fontSize: 15, fontWeight: '600', color: '#64748B' },
  datePickerModalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  datePickerModalContainer:  { width: '90%', maxWidth: 400 },
  datePickerModalContent:    { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  datePickerHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  datePickerTitle:           { fontSize: 18, fontWeight: '700', color: '#3477eb' },
  datePickerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  datePickerCancelButton:    { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  datePickerCancelText:      { fontSize: 16, fontWeight: '600', color: '#64748B' },
  datePickerConfirmButton:   { flex: 1, backgroundColor: '#3477eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  datePickerConfirmText:     { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default CreateAppointmentScreen;