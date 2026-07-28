import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Platform, Alert, Modal, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import {
  fetchGovTypes, fetchStateOrMinistry, fetchBhawanByMinistry,
  fetchOfficersByBhawan, insertAppVisitor,
} from '../constants/services/appointmentservice';

// ─── Static lists ──────────────────────────────────────────────────────────────

/**
 * STATE_OPTIONS mirrors the exact Id values returned by GetStateOrMinistry
 * so that STATE_ID_MAP[selectedState] gives the correct numeric code for StateCode.
 *
 * IMPORTANT: For InsertAppVisitor the API expects the raw numeric Id from
 * GetStateOrMinistry (e.g. "27" for Maharashtra, "7" for Delhi) — NOT a
 * zero-padded two-digit code.  Only send StateCode when GovCode = "2".
 */
const STATE_OPTIONS = [
  { label: 'SELECT',                    value: 'SELECT',                    stateId: '' },
  { label: 'ANDAMAN AND NICOBAR',       value: 'ANDAMAN AND NICOBAR',       stateId: '35' },
  { label: 'ANDHRA PRADESH',            value: 'ANDHRA PRADESH',            stateId: '28' },
  { label: 'ARUNACHAL PRADESH',         value: 'ARUNACHAL PRADESH',         stateId: '12' },
  { label: 'ASSAM',                     value: 'ASSAM',                     stateId: '18' },
  { label: 'BIHAR',                     value: 'BIHAR',                     stateId: '10' },
  { label: 'CHANDIGARH',                value: 'CHANDIGARH',                stateId: '4'  },
  { label: 'CHHATTISGARH',              value: 'CHHATTISGARH',              stateId: '22' },
  { label: 'DADRA AND NAGAR HAVELI',    value: 'DADRA AND NAGAR HAVELI',    stateId: '26' },
  { label: 'DAMAN AND DIU',             value: 'DAMAN AND DIU',             stateId: '25' },
  { label: 'DELHI',                     value: 'DELHI',                     stateId: '7'  },
  { label: 'GOA',                       value: 'GOA',                       stateId: '30' },
  { label: 'GUJARAT',                   value: 'GUJARAT',                   stateId: '24' },
  { label: 'HARYANA',                   value: 'HARYANA',                   stateId: '6'  },
  { label: 'HIMACHAL PRADESH',          value: 'HIMACHAL PRADESH',          stateId: '2'  },
  { label: 'JAMMU AND KASHMIR',         value: 'JAMMU AND KASHMIR',         stateId: '1'  },
  { label: 'JHARKHAND',                 value: 'JHARKHAND',                 stateId: '20' },
  { label: 'KARNATAKA',                 value: 'KARNATAKA',                 stateId: '29' },
  { label: 'KERALA',                    value: 'KERALA',                    stateId: '32' },
  { label: 'LADAKH',                    value: 'LADAKH',                    stateId: '37' },
  { label: 'LAKSHADWEEP',               value: 'LAKSHADWEEP',               stateId: '31' },
  { label: 'MADHYA PRADESH',            value: 'MADHYA PRADESH',            stateId: '23' },
  { label: 'MAHARASHTRA',               value: 'MAHARASHTRA',               stateId: '27' },
  { label: 'MANIPUR',                   value: 'MANIPUR',                   stateId: '14' },
  { label: 'MEGHALAYA',                 value: 'MEGHALAYA',                 stateId: '17' },
  { label: 'MIZORAM',                   value: 'MIZORAM',                   stateId: '15' },
  { label: 'NAGALAND',                  value: 'NAGALAND',                  stateId: '13' },
  { label: 'ORISSA',                    value: 'ORISSA',                    stateId: '21' },
  { label: 'PUDUCHERRY',                value: 'PUDUCHERRY',                stateId: '34' },
  { label: 'PUNJAB',                    value: 'PUNJAB',                    stateId: '3'  },
  { label: 'RAJASTHAN',                 value: 'RAJASTHAN',                 stateId: '8'  },
  { label: 'SIKKIM',                    value: 'SIKKIM',                    stateId: '11' },
  { label: 'TAMIL NADU',                value: 'TAMIL NADU',                stateId: '33' },
  { label: 'TELANGANA',                 value: 'TELANGANA',                stateId: '36' },
  { label: 'TRIPURA',                   value: 'TRIPURA',                   stateId: '16' },
  { label: 'UTTAR PRADESH',             value: 'UTTAR PRADESH',             stateId: '9'  },
  { label: 'UTTARAKHAND',               value: 'UTTARAKHAND',               stateId: '5'  },
  { label: 'WEST BENGAL',               value: 'WEST BENGAL',               stateId: '19' },
];

const VISIT_TYPE_OPTIONS = [
  { label: 'SELECT',   value: 'SELECT'   },
  { label: 'Official', value: 'Official' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Meeting',  value: 'Meeting'  },
  { label: 'Other',    value: 'Other'    },
  { label: 'On Duty',  value: 'On Duty'  },
];

const GADGET_LABELS = {
  mobile: 'Mobile', remoteKey: 'Remote Key', storageDevice: 'Storage Device',
  laptop: 'Laptop', camera: 'Camera', other: 'Other',
};
const GADGET_ROWS = [['mobile', 'remoteKey'], ['storageDevice', 'laptop'], ['camera', 'other']];
const EMPTY_SELECT = [{ label: 'SELECT', value: 'SELECT', id: 'SELECT' }];

const HOUR_OPTIONS   = Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2,'0'), value: String(i).padStart(2,'0') }));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: String(i*5).padStart(2,'0'), value: String(i*5).padStart(2,'0') }));

// GovType Id that means "State Government" — must match API response
const STATE_GOVT_GOV_CODE = '2';

// Per API docs: DocumentBase64 must be a PDF under 400 KB
const MAX_DOC_SIZE_BYTES = 400 * 1024;

// "Any Additional Visitor?" section — options + cap.
// NOTE: This data is captured locally for the officer/visitor's own reference
// only. It is intentionally NOT sent to InsertAppVisitor — the payload keeps
// sending the existing static AdditionalVisitors: '0' field, exactly as
// before. See handleSubmit — nothing from additionalVisitors state is read
// there.
const GENDER_OPTIONS = [
  { label: 'SELECT', value: 'SELECT' },
  { label: 'Male',   value: 'Male'   },
  { label: 'Female', value: 'Female' },
  { label: 'Other',  value: 'Other'  },
];
const MAX_ADDITIONAL_VISITORS = 5;

// Per updated requirement: Visit Date must stay within the CURRENT month and
// year, and — on top of that — no more than MAX_VISIT_DATE_DAYS days ahead of
// today. So the upper bound is whichever comes first: the end of the current
// month, or today + MAX_VISIT_DATE_DAYS.
const MAX_VISIT_DATE_DAYS = 10;

const getVisitDateRange = () => {
  const min = new Date();
  min.setHours(0, 0, 0, 0);

  const tenDaysOut = new Date();
  tenDaysOut.setDate(tenDaysOut.getDate() + MAX_VISIT_DATE_DAYS);
  tenDaysOut.setHours(23, 59, 59, 999);

  const endOfMonth = new Date(min.getFullYear(), min.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const max = tenDaysOut < endOfMonth ? tenDaysOut : endOfMonth;
  return { min, max };
};

/**
 * Sanitize free-text / dropdown-derived fields before they go into the
 * InsertAppVisitor payload.
 *
 * Why this exists:
 *  - Dropdown labels coming back from GetOfficerByBhawan look like
 *    "Officer InchargeUAT( Hon’ble  Minister - psara new division )" —
 *    note the curly right-single-quote (U+2019), the parenthetical
 *    designation, and the double space.
 *  - JSON.stringify() already escapes these characters correctly before
 *    AES encryption, so they are NOT corrupted in transit — but the
 *    backend's own insert/stored-procedure layer can still choke on
 *    typographic quote characters or on unexpectedly long bracketed text
 *    inside a name field, which is the most likely cause of the
 *    "Internal server error" seen only on the write (Insert) call and
 *    never on the read-only lookup calls.
 *  - This strips the parenthetical title, normalises curly quotes to
 *    straight ones, and collapses repeated whitespace — without changing
 *    JSON.stringify's escaping behaviour at all.
 */
const sanitizeText = (str) =>
  String(str || '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // curly single quotes -> straight
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')  // curly double quotes -> straight
    .replace(/\(.*?\)/g, '')                      // drop any parenthetical title
    .replace(/\s+/g, ' ')                         // collapse multiple spaces
    .trim();

/**
 * Build the comma-separated Gadgets string expected by InsertAppVisitor,
 * e.g. "Camera,Laptop". Returns '' if nothing is checked, in which case
 * the field is omitted from the payload entirely (Gadgets is optional).
 */
const buildGadgetsString = (gadgets) =>
  Object.entries(gadgets)
    .filter(([, checked]) => checked)
    .map(([key]) => GADGET_LABELS[key])
    .join(',');

// ─── Component ────────────────────────────────────────────────────────────────
const CreateAppointmentScreen = ({ navigation, route }) => {

  const [visRegNo,       setVisRegNo]       = useState(String(route?.params?.visRegNo ?? ''));
  const [sessionLoading, setSessionLoading] = useState(!route?.params?.visRegNo);

  useEffect(() => {
    if (route?.params?.visRegNo) return;
    const load = async () => {
      try {
        const s = await AsyncStorage.getItem('loginSession');
        if (s) {
          const obj = JSON.parse(s);
          const id  = obj?.Vis_Reg_No ?? obj?.visRegNo ?? '';
          if (id) { setVisRegNo(String(id)); setSessionLoading(false); return; }
        }
        const u = await AsyncStorage.getItem('userData');
        if (u) {
          const obj = JSON.parse(u);
          const id  = obj?.visRegNo ?? obj?.Vis_Reg_No ?? '';
          if (id) { setVisRegNo(String(id)); setSessionLoading(false); return; }
        }
      } catch (e) { console.error('AsyncStorage error:', e.message); }
      setSessionLoading(false);
    };
    load();
  }, []);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    organizationType: '', state: '', stateId: '',
    department: '', building: '', authority: '',
    visitingOfficerName: '', approvingOfficerName: '',
    visitDate: null, visitType: '', visitPurpose: '',
    electronicGadgets: { mobile:false, remoteKey:false, storageDevice:false, laptop:false, camera:false, other:false },
  });

  const [showDatePicker,    setShowDatePicker]    = useState(false);
  const [tempDate,          setTempDate]          = useState(new Date());
  // Today through the next MAX_VISIT_DATE_DAYS days — bounds for the Visit
  // Date picker. Computed once per screen mount.
  const visitDateRange = useMemo(() => getVisitDateRange(), []);
  const [selectedHour,      setSelectedHour]      = useState('00');
  const [selectedMinute,    setSelectedMinute]    = useState('00');
  const [isAnyTime,         setIsAnyTime]         = useState(false);

  // Document upload state — holds the actual base64 payload for DocumentBase64
  const [documentUploaded,  setDocumentUploaded]  = useState(false);
  const [documentBase64,    setDocumentBase64]    = useState(null);
  const [documentName,      setDocumentName]      = useState('');
  const [documentPicking,   setDocumentPicking]   = useState(false);

  // "Any Additional Visitor?" — Yes/No + up to MAX_ADDITIONAL_VISITORS rows.
  // Purely local/UI state — never merged into the InsertAppVisitor payload.
  const [hasAdditionalVisitors, setHasAdditionalVisitors] = useState(false);
  const [additionalVisitors,    setAdditionalVisitors]    = useState([]);

  const [submitLoading,     setSubmitLoading]     = useState(false);

  const [orgTypeOptions,  setOrgTypeOptions]  = useState(EMPTY_SELECT);
  const [orgTypeLoading,  setOrgTypeLoading]  = useState(false);
  const [orgTypeError,    setOrgTypeError]    = useState(null);

  const [departmentOptions, setDepartmentOptions] = useState(EMPTY_SELECT);
  const [deptLoading,       setDeptLoading]       = useState(false);
  const [deptError,         setDeptError]         = useState(null);

  const [buildingOptions, setBuildingOptions] = useState(EMPTY_SELECT);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [buildingError,   setBuildingError]   = useState(null);

  const [authorityOptions, setAuthorityOptions] = useState(EMPTY_SELECT);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authorityError,   setAuthorityError]   = useState(null);

  useEffect(() => { loadGovTypes(); }, []);

  // ── Loaders ─────────────────────────────────────────────────────────────────
  const loadGovTypes = async () => {
    setOrgTypeLoading(true); setOrgTypeError(null);
    try {
      const data = await fetchGovTypes();
      setOrgTypeOptions([...EMPTY_SELECT, ...data.map(d => ({ label: d.Name, value: d.Id, id: d.Id }))]);
    } catch (e) { setOrgTypeError('Failed to load. Tap to retry.'); }
    finally { setOrgTypeLoading(false); }
  };

  const loadDepartments = async (govType) => {
    setDeptLoading(true); setDeptError(null);
    setDepartmentOptions(EMPTY_SELECT); setBuildingOptions(EMPTY_SELECT);
    setAuthorityOptions(EMPTY_SELECT); setBuildingError(null); setAuthorityError(null);
    setFormData(p => ({ ...p, department:'', building:'', authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
    setHasAdditionalVisitors(false); setAdditionalVisitors([]);
    try {
      const data = await fetchStateOrMinistry(govType);
      setDepartmentOptions([...EMPTY_SELECT, ...data.map(d => ({ label: d.Name, value: d.Id, id: d.Id }))]);
    } catch (e) { setDeptError('Failed to load. Tap to retry.'); }
    finally { setDeptLoading(false); }
  };

  const loadBuildings = async (ministryCode) => {
    setBuildingLoading(true); setBuildingError(null);
    setBuildingOptions(EMPTY_SELECT); setAuthorityOptions(EMPTY_SELECT); setAuthorityError(null);
    setFormData(p => ({ ...p, building:'', authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
    setHasAdditionalVisitors(false); setAdditionalVisitors([]);
    try {
      const data = await fetchBhawanByMinistry(ministryCode);
      setBuildingOptions([...EMPTY_SELECT, ...data.map(d => ({ label: d.Name, value: d.Id, id: d.Id }))]);
    } catch (e) { setBuildingError('Failed to load. Tap to retry.'); }
    finally { setBuildingLoading(false); }
  };

  const loadOfficers = async (ministryCode, bhawanCode) => {
    setAuthorityLoading(true); setAuthorityError(null);
    setAuthorityOptions(EMPTY_SELECT);
    setFormData(p => ({ ...p, authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
    setHasAdditionalVisitors(false); setAdditionalVisitors([]);
    try {
      const { officers } = await fetchOfficersByBhawan(ministryCode, bhawanCode);
      setAuthorityOptions([...EMPTY_SELECT, ...officers.map(o => ({
        label: o.Name,
        value: o.Id,
        id:    o.Id,
        name:  o.Name.includes('(') ? o.Name.split('(')[0].trim() : o.Name.trim(),
      }))]);
    } catch (e) { setAuthorityError('Failed to load. Tap to retry.'); }
    finally { setAuthorityLoading(false); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const setField = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const formatDate = (date) => {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  /**
   * Opens the native document picker restricted to PDF, validates size
   * client-side against the 400 KB limit the API enforces, then reads
   * the file as base64 and stores it for submission as DocumentBase64.
   *
   * Note: the server still re-validates size/type/base64 integrity
   * (see the "Document must be less than 400 KB", "Only PDF documents
   * allowed.", and "Invalid Base64 string for document." error
   * responses) so this client-side check is a UX nicety, not a
   * guarantee — the existing catch block in handleSubmit already
   * surfaces any server-side rejection via Alert.
   */
  const handlePickDocument = async () => {
    setDocumentPicking(true);
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      const fileUri = result.fileCopyUri || result.uri;
      const stat = await RNFS.stat(fileUri);

      if (stat.size > MAX_DOC_SIZE_BYTES) {
        Alert.alert(
          'File too large',
          `Document must be less than 400 KB. Current size: ${Math.round(stat.size / 1024)} KB`
        );
        return;
      }

      const base64 = await RNFS.readFile(fileUri, 'base64');
      setDocumentBase64(base64);
      setDocumentName(result.name || 'document.pdf');
      setDocumentUploaded(true);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.error('Document pick error:', err.message);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    } finally {
      setDocumentPicking(false);
    }
  };

  const handleRemoveDocument = () => {
    setDocumentBase64(null);
    setDocumentName('');
    setDocumentUploaded(false);
  };

  // ── Additional Visitor helpers ───────────────────────────────────────────────
  // Local-only rows (name/age/gender/address). Capped at MAX_ADDITIONAL_VISITORS
  // and deliberately never read inside handleSubmit / the payload builder below.
  const handleToggleAdditionalVisitors = (value) => {
    setHasAdditionalVisitors(value);
    if (!value) setAdditionalVisitors([]);
    else if (value && additionalVisitors.length === 0) {
      setAdditionalVisitors([{ id: `${Date.now()}`, name: '', age: '', gender: '', address: '' }]);
    }
  };

  const addVisitorRow = () => {
    if (additionalVisitors.length >= MAX_ADDITIONAL_VISITORS) return;
    setAdditionalVisitors(prev => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, name: '', age: '', gender: '', address: '' },
    ]);
  };

  const removeVisitorRow = (id) => {
    setAdditionalVisitors(prev => prev.filter(v => v.id !== id));
  };

  const updateVisitorField = (id, field, value) => {
    setAdditionalVisitors(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (sessionLoading) { Alert.alert('Please wait', 'Loading session…'); return; }
    if (!visRegNo || visRegNo.trim() === '' || visRegNo === 'undefined') {
      Alert.alert('Session Error', 'Visitor registration number not found. Please log out and log in again.',
        [{ text:'Log Out', style:'destructive', onPress: async () => {
            await AsyncStorage.multiRemove(['loginSession','userData','userRole']);
            navigation.reset({ index:0, routes:[{ name:'VisitorLogin' }] });
          }},
          { text:'Cancel', style:'cancel' }]);
      return;
    }

    if (!formData.organizationType || formData.organizationType === 'SELECT') { Alert.alert('Error','Please select Organization Type'); return; }
    if (isStateGovtSelected && (!formData.state || formData.state === 'SELECT')) { Alert.alert('Error','Please select State'); return; }
    if (!formData.department        || formData.department        === 'SELECT') { Alert.alert('Error','Please select Department');        return; }
    if (!formData.building          || formData.building          === 'SELECT') { Alert.alert('Error','Please select Building');          return; }
    if (!formData.authority         || formData.authority         === 'SELECT') { Alert.alert('Error','Please select Authority/Officer'); return; }
    if (!formData.visitingOfficerName.trim())                                   { Alert.alert('Error','Please enter Visiting Officer Name'); return; }
    if (!formData.visitDate)                                                    { Alert.alert('Error','Please select Visit Date');        return; }
    if (formData.visitDate < visitDateRange.min || formData.visitDate > visitDateRange.max) {
      Alert.alert('Error', `Visit Date must be between ${formatDate(visitDateRange.min)} and ${formatDate(visitDateRange.max)}.`);
      return;
    }
    if (!formData.visitType         || formData.visitType         === 'SELECT') { Alert.alert('Error','Please select Visit Type');        return; }
    if (!formData.visitPurpose.trim())                                          { Alert.alert('Error','Please enter Visit Purpose');      return; }

    const isStateGovt = String(formData.organizationType) === STATE_GOVT_GOV_CODE;

    // StateCode: send the numeric Id from STATE_OPTIONS when State Govt, else "0"
    const stateCode = isStateGovt ? (formData.stateId || '0') : '0';

    // Visit_Time: "00:00" when Any Time per API docs
    const visitTime = isAnyTime ? '00:00' : `${selectedHour}:${selectedMinute}`;

    // Gadgets: comma-separated list of checked items, e.g. "Camera,Laptop".
    // Optional — omitted entirely from the payload if nothing is checked.
    const gadgetsStr = buildGadgetsString(formData.electronicGadgets);

    /**
     * Build payload as a plain JS object.
     * appointmentservice → buildFinalInput calls JSON.stringify on this object,
     * which safely escapes ALL special characters including apostrophes in
     * officer names like "Hon'ble Minister" → "Hon\'ble Minister" in the JSON
     * string that gets AES-encrypted and sent to the server.
     *
     * Never template-literal or manually concatenate this into a JSON string.
     *
     * NOTE: Officer_Name / Approving_Officer_Name / Visit_Purpose are run
     * through sanitizeText() to strip parenthetical designations, normalise
     * curly quotes, and collapse whitespace — this is what was causing the
     * "Internal server error" on InsertAppVisitor (see sanitizeText comment
     * above for the full explanation).
     *
     * Gadgets and DocumentBase64 are new, optional fields per the updated
     * InsertAppVisitor docs — only included when there's actually data to
     * send, since the API treats both as optional.
     *
     * AdditionalVisitors stays a static '0' on purpose — the "Any Additional
     * Visitor?" name/age/gender/address rows captured above are dummy/local
     * UI-only fields and are intentionally NOT read here or sent to the API.
     */
    const payload = {
      Vis_Reg_No:             String(visRegNo),
      MCode:                  String(formData.department),
      BCode:                  String(formData.building),
      Loc_Id:                 String(formData.authority),
      Officer_Name:           sanitizeText(formData.visitingOfficerName),
      Approving_Officer_Name: sanitizeText(formData.approvingOfficerName || formData.visitingOfficerName),
      Vis_Date:               formatDate(formData.visitDate),
      Visit_Time:             visitTime,
      Visit_Purpose:          sanitizeText(formData.visitPurpose),
      AdditionalVisitors:     '0',
      GovCode:                String(formData.organizationType),
      StateCode:              stateCode,
      ...(gadgetsStr ? { Gadgets: gadgetsStr } : {}),
      ...(documentBase64 ? { DocumentBase64: documentBase64 } : {}),
    };

    setSubmitLoading(true);
    try {
      const response = await insertAppVisitor(payload);
      if (response?.Success) {
        Alert.alert('Success', response.Message || 'Appointment created successfully!',
          [{ text:'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', response?.Message || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () =>
    Alert.alert('Cancel','Are you sure? All data will be lost.',[
      { text:'No', style:'cancel' },
      { text:'Yes', onPress: () => navigation.goBack() },
    ]);

  // ── Derived flags ─────────────────────────────────────────────────────────
  // State field is only meaningful — and only enabled — when the selected
  // Organization Type is "State Government" (GovCode === STATE_GOVT_GOV_CODE).
  // For every other organization type it's locked and cleared.
  const isStateGovtSelected = String(formData.organizationType) === STATE_GOVT_GOV_CODE;
  const stateDisabled     = !isStateGovtSelected;
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.section}>

          {/* Organization Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Type <RedStar /></Text>
            {orgTypeError && <ErrorBanner message={orgTypeError} onRetry={loadGovTypes} />}
            <Dropdown
              style={[styles.dropdown, orgTypeLoading && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder} selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon} containerStyle={styles.dropdownContainer}
              data={orgTypeOptions} maxHeight={300} labelField="label" valueField="value"
              placeholder={orgTypeLoading ? 'Loading…' : 'Select Organization Type'}
              value={formData.organizationType} disable={orgTypeLoading}
              onChange={(item) => {
                setField('organizationType', item.value);
                // Reset State whenever Organization Type changes — it will only
                // be re-enabled below if the newly selected type is State Govt.
                setField('state', ''); setField('stateId', '');
                if (item.value && item.value !== 'SELECT') loadDepartments(item.value);
                else {
                  setDepartmentOptions(EMPTY_SELECT); setBuildingOptions(EMPTY_SELECT); setAuthorityOptions(EMPTY_SELECT);
                  setFormData(p => ({ ...p, department:'', building:'', authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
                }
              }}
              renderLeftIcon={() => orgTypeLoading
                ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="domain" size={20} />}
            />
          </View>

          {/* State — only enabled for Organization Type = State Government */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              State {isStateGovtSelected && <RedStar />}
            </Text>
            <Dropdown
              style={[styles.dropdown, stateDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText} inputSearchStyle={styles.dropdownSearchInput}
              iconStyle={styles.dropdownIcon} containerStyle={styles.dropdownContainer}
              data={STATE_OPTIONS} search maxHeight={300} labelField="label" valueField="value"
              placeholder={stateDisabled ? 'Applicable only for State Government' : 'Select State'}
              searchPlaceholder="Search…" value={formData.state} disable={stateDisabled}
              onChange={(item) => {
                // Store both the display name and the numeric stateId
                setFormData(p => ({ ...p, state: item.value, stateId: item.stateId || '' }));
              }}
              renderLeftIcon={() => <Icon style={styles.dropdownLeftIcon} color="#64748B" name="map-marker" size={20} />}
            />
          </View>

          {/* Department */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Department/Organization <RedStar /></Text>
            {deptError && <ErrorBanner message={deptError} onRetry={() => loadDepartments(formData.organizationType)} />}
            <Dropdown
              style={[styles.dropdown, deptDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder} selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput} iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer} data={departmentOptions} search maxHeight={300}
              labelField="label" valueField="value"
              placeholder={deptLoading ? 'Loading…' : deptDisabled ? 'Select Organization Type first' : 'Select Department'}
              searchPlaceholder="Search…" value={formData.department} disable={deptDisabled}
              onChange={(item) => {
                setField('department', item.value);
                if (item.value && item.value !== 'SELECT') loadBuildings(item.value);
                else {
                  setBuildingOptions(EMPTY_SELECT); setAuthorityOptions(EMPTY_SELECT);
                  setBuildingError(null); setAuthorityError(null);
                  setFormData(p => ({ ...p, building:'', authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
                }
              }}
              renderLeftIcon={() => deptLoading
                ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="office-building" size={20} />}
            />
          </View>

          {/* Building */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Building <RedStar /></Text>
            {buildingError && <ErrorBanner message={buildingError} onRetry={() => loadBuildings(formData.department)} />}
            <Dropdown
              style={[styles.dropdown, buildingDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder} selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput} iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer} data={buildingOptions} search maxHeight={300}
              labelField="label" valueField="value"
              placeholder={buildingLoading ? 'Loading…' : buildingDisabled ? 'Select Department first' : 'Select Building'}
              searchPlaceholder="Search…" value={formData.building} disable={buildingDisabled}
              onChange={(item) => {
                setField('building', item.value);
                if (item.value && item.value !== 'SELECT') loadOfficers(formData.department, item.value);
                else {
                  setAuthorityOptions(EMPTY_SELECT); setAuthorityError(null);
                  setFormData(p => ({ ...p, authority:'', visitingOfficerName:'', approvingOfficerName:'' }));
                }
              }}
              renderLeftIcon={() => buildingLoading
                ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="office-building-outline" size={20} />}
            />
          </View>

          {/* Authority / Officer */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Authority/Officer <RedStar /></Text>
            {authorityError && <ErrorBanner message={authorityError} onRetry={() => loadOfficers(formData.department, formData.building)} />}
            <Dropdown
              style={[styles.dropdown, authorityDisabled && styles.dropdownDisabled]}
              placeholderStyle={styles.dropdownPlaceholder} selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearchInput} iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer} data={authorityOptions} search maxHeight={300}
              labelField="label" valueField="value"
              placeholder={authorityLoading ? 'Loading…' : authorityDisabled ? 'Select Building first' : 'Select Authority/Officer'}
              searchPlaceholder="Search…" value={formData.authority} disable={authorityDisabled}
              onChange={(item) => {
                setField('authority', item.value);
                if (item.value && item.value !== 'SELECT' && item.name) {
                  // FIX: previously this used item.label here, which is the
                  // raw "Name( Designation )" string straight from the API —
                  // including the curly apostrophe and double spaces that
                  // were breaking InsertAppVisitor. Use the already-cleaned
                  // item.name for both fields instead.
                  setField('visitingOfficerName',  item.name);
                  setField('approvingOfficerName', item.name);
                } else {
                  setField('visitingOfficerName', ''); setField('approvingOfficerName', '');
                }
              }}
              renderLeftIcon={() => authorityLoading
                ? <ActivityIndicator size="small" color="#3477eb" style={styles.dropdownLeftIcon} />
                : <Icon style={styles.dropdownLeftIcon} color="#64748B" name="account-tie" size={20} />}
            />
          </View>

          {/* Visiting Officer Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visiting Officer Name <RedStar /></Text>
            <TextInput
              style={styles.textInput} placeholder="Auto-filled on officer selection"
              placeholderTextColor="#94A3B8" value={formData.visitingOfficerName}
              onChangeText={(v) => setField('visitingOfficerName', v)}
            />
          </View>

          {/* Visit Date — restricted to today through the next 10 days */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Date <RedStar /></Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={() => { setTempDate(formData.visitDate || visitDateRange.min); setShowDatePicker(true); }}>
              <Icon name="calendar" size={20} color="#64748B" style={styles.inputIcon} />
              <Text style={formData.visitDate ? styles.dateTimeText : styles.dateTimePlaceholder}>
                {formData.visitDate ? formatDate(formData.visitDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateHintText}>
              Selectable from {formatDate(visitDateRange.min)} to {formatDate(visitDateRange.max)} (current month, max {MAX_VISIT_DATE_DAYS} days ahead)
            </Text>
          </View>

          <Modal transparent visible={showDatePicker} animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContainer}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}><Icon name="close" size={24} color="#64748B" /></TouchableOpacity>
                  </View>
                  <DatePicker
                    date={tempDate}
                    onDateChange={setTempDate}
                    mode="date"
                    minimumDate={visitDateRange.min}
                    maximumDate={visitDateRange.max}
                    theme="light"
                    textColor="#0F172A"
                    fadeToColor="#FFFFFF"
                  />
                  <View style={styles.datePickerButtonContainer}>
                    <TouchableOpacity style={styles.datePickerCancelButton} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.datePickerConfirmButton}
                      onPress={() => {
                        // Defensive clamp in case the native picker ever
                        // allows a value outside the window.
                        const clamped = tempDate < visitDateRange.min
                          ? visitDateRange.min
                          : tempDate > visitDateRange.max
                            ? visitDateRange.max
                            : tempDate;
                        setField('visitDate', clamped);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* Preferred Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Time <RedStar /></Text>
            <TouchableOpacity style={styles.anyTimeRow} onPress={() => setIsAnyTime(p => !p)} activeOpacity={0.7}>
              <View style={[styles.checkbox, isAnyTime && styles.checkboxChecked]}>
                {isAnyTime && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.anyTimeLabel}>Any Time</Text>
            </TouchableOpacity>
            {!isAnyTime && (
              <View style={styles.timeRow}>
                <View style={styles.timeFieldWrapper}>
                  <Text style={styles.timeSubLabel}>Hr</Text>
                  <Dropdown style={styles.timeDropdown} placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText} iconStyle={styles.dropdownIcon}
                    containerStyle={styles.dropdownContainer} data={HOUR_OPTIONS} maxHeight={220}
                    labelField="label" valueField="value" placeholder="00" value={selectedHour}
                    onChange={(item) => setSelectedHour(item.value)} />
                </View>
                <Text style={styles.timeColon}>:</Text>
                <View style={styles.timeFieldWrapper}>
                  <Text style={styles.timeSubLabel}>Min</Text>
                  <Dropdown style={styles.timeDropdown} placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText} iconStyle={styles.dropdownIcon}
                    containerStyle={styles.dropdownContainer} data={MINUTE_OPTIONS} maxHeight={220}
                    labelField="label" valueField="value" placeholder="00" value={selectedMinute}
                    onChange={(item) => setSelectedMinute(item.value)} />
                </View>
              </View>
            )}
          </View>

          {/* Visit Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visit Type <RedStar /></Text>
            <Dropdown style={styles.dropdown} placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText} iconStyle={styles.dropdownIcon}
              containerStyle={styles.dropdownContainer} data={VISIT_TYPE_OPTIONS} maxHeight={300}
              labelField="label" valueField="value" placeholder="Select Visit Type"
              value={formData.visitType} onChange={(item) => setField('visitType', item.value)}
              renderLeftIcon={() => <Icon style={styles.dropdownLeftIcon} color="#64748B" name="briefcase" size={20} />}
            />
          </View>

          {/* Visit Purpose — height reduced and bottom margin tightened so
              Electronic Gadgets isn't pushed down by a big empty gap. */}
          <View style={[styles.formGroup, styles.visitPurposeGroup]}>
            <Text style={styles.label}>Visit Purpose (Max 150 char) <RedStar /></Text>
            <TextInput style={[styles.textInput, styles.textArea]} placeholder="Enter visit purpose"
              placeholderTextColor="#94A3B8" value={formData.visitPurpose}
              onChangeText={(v) => { if (v.length <= 150) setField('visitPurpose', v); }}
              multiline numberOfLines={3} maxLength={150} />
            <Text style={styles.charCount}>{formData.visitPurpose.length}/150</Text>
          </View>

          {/* Electronic Gadgets — checked items get combined into the
              comma-separated Gadgets string sent to InsertAppVisitor */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Electronic Gadgets</Text>
            <View style={styles.gadgetsContainer}>
              {GADGET_ROWS.map((row, ri) => (
                <View key={ri} style={styles.gadgetRow}>
                  {row.map((gadget) => (
                    <TouchableOpacity key={gadget} style={styles.gadgetCheckbox}
                      onPress={() => setFormData(p => ({ ...p, electronicGadgets: { ...p.electronicGadgets, [gadget]: !p.electronicGadgets[gadget] } }))}
                      activeOpacity={0.7}>
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

          {/* Upload Document — PDF only, < 400 KB, base64-encoded into
              DocumentBase64 for InsertAppVisitor */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Document (if any)</Text>
            <TouchableOpacity
              style={[styles.uploadButton, documentUploaded && styles.uploadButtonSuccess]}
              onPress={documentUploaded ? handleRemoveDocument : handlePickDocument}
              disabled={documentPicking}
            >
              {documentPicking ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <Icon
                  name={documentUploaded ? 'check-circle' : 'file-upload-outline'}
                  size={18}
                  color={documentUploaded ? '#10B981' : '#64748B'}
                />
              )}
              <Text style={[styles.uploadButtonText, documentUploaded && styles.uploadButtonTextSuccess]} numberOfLines={1}>
                {documentUploaded ? `${documentName} (tap to remove)` : 'Choose PDF File'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.uploadInstruction}>1. Please attach only pdf file that is less than 400 KB.</Text>
          </View>

          {/* Any Additional Visitor? — last field before Submit/Cancel.
              Only appears once an Authority/Officer has been selected.
              Local-only: name/age/gender/address rows are dummy placeholders
              for the officer's reference and are never sent to the API (the
              payload always sends the existing static AdditionalVisitors:'0'). */}
          {formData.authority && formData.authority !== 'SELECT' && (
            <View style={[styles.formGroup, styles.lastFormGroup]}>
              <Text style={styles.label}>Any Additional Visitor?</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity style={styles.radioOption} onPress={() => handleToggleAdditionalVisitors(true)} activeOpacity={0.7}>
                  <View style={[styles.radioCircle, hasAdditionalVisitors && styles.radioCircleSelected]}>
                    {hasAdditionalVisitors && <View style={styles.radioCircleDot} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioOption} onPress={() => handleToggleAdditionalVisitors(false)} activeOpacity={0.7}>
                  <View style={[styles.radioCircle, !hasAdditionalVisitors && styles.radioCircleSelected]}>
                    {!hasAdditionalVisitors && <View style={styles.radioCircleDot} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>

              {hasAdditionalVisitors && (
                <View style={styles.visitorsContainer}>
                  {additionalVisitors.map((visitor, index) => (
                    <View key={visitor.id} style={styles.visitorCard}>
                      <View style={styles.visitorCardHeader}>
                        <Text style={styles.visitorCardTitle}>Visitor {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeVisitorRow(visitor.id)} style={styles.visitorRemoveButton}>
                          <Icon name="close-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.visitorFieldRow}>
                        <View style={[styles.visitorFieldWrapper, { flex: 1.4 }]}>
                          <Text style={styles.visitorFieldLabel}>Name</Text>
                          <TextInput
                            style={styles.visitorTextInput}
                            placeholder="Full name"
                            placeholderTextColor="#94A3B8"
                            value={visitor.name}
                            onChangeText={(v) => updateVisitorField(visitor.id, 'name', v)}
                          />
                        </View>
                        <View style={styles.visitorFieldWrapper}>
                          <Text style={styles.visitorFieldLabel}>Age</Text>
                          <TextInput
                            style={styles.visitorTextInput}
                            placeholder="Age"
                            placeholderTextColor="#94A3B8"
                            value={visitor.age}
                            onChangeText={(v) => updateVisitorField(visitor.id, 'age', v.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            maxLength={3}
                          />
                        </View>
                      </View>

                      <View style={styles.visitorFieldRow}>
                        <View style={styles.visitorFieldWrapper}>
                          <Text style={styles.visitorFieldLabel}>Gender</Text>
                          <Dropdown
                            style={styles.visitorDropdown}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            containerStyle={styles.dropdownContainer}
                            data={GENDER_OPTIONS}
                            maxHeight={180}
                            labelField="label"
                            valueField="value"
                            placeholder="Select"
                            value={visitor.gender}
                            onChange={(item) => updateVisitorField(visitor.id, 'gender', item.value)}
                          />
                        </View>
                        <View style={[styles.visitorFieldWrapper, { flex: 1.4 }]}>
                          <Text style={styles.visitorFieldLabel}>Address</Text>
                          <TextInput
                            style={styles.visitorTextInput}
                            placeholder="Address"
                            placeholderTextColor="#94A3B8"
                            value={visitor.address}
                            onChangeText={(v) => updateVisitorField(visitor.id, 'address', v)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.addVisitorButton, additionalVisitors.length >= MAX_ADDITIONAL_VISITORS && styles.addVisitorButtonDisabled]}
                    onPress={addVisitorRow}
                    disabled={additionalVisitors.length >= MAX_ADDITIONAL_VISITORS}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="plus-circle-outline"
                      size={18}
                      color={additionalVisitors.length >= MAX_ADDITIONAL_VISITORS ? '#94A3B8' : '#3477eb'}
                    />
                    <Text style={[styles.addVisitorButtonText, additionalVisitors.length >= MAX_ADDITIONAL_VISITORS && styles.addVisitorButtonTextDisabled]}>
                      {additionalVisitors.length >= MAX_ADDITIONAL_VISITORS ? 'Maximum 5 visitors added' : 'Add Visitor'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.visitorCountText}>{additionalVisitors.length}/{MAX_ADDITIONAL_VISITORS} additional visitors added</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.submitButton, submitLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit} activeOpacity={0.8} disabled={submitLoading}>
            {submitLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Submit</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8} disabled={submitLoading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:                 { flex:1, backgroundColor:'#F8FAFC' },
  sessionLoadingContainer:   { flex:1, backgroundColor:'#F8FAFC' },
  sessionLoadingBody:        { flex:1, justifyContent:'center', alignItems:'center', gap:16 },
  sessionLoadingText:        { fontSize:15, color:'#64748B', fontWeight:'500' },
  header:                    { backgroundColor:'#3477eb', paddingTop:Platform.OS==='ios'?50:40, paddingBottom:16, paddingHorizontal:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between', elevation:4 },
  backButton:                { width:40, height:40, justifyContent:'center', alignItems:'center' },
  headerTitle:               { fontSize:20, fontWeight:'700', color:'#FFFFFF', letterSpacing:0.5 },
  headerRight:               { width:40 },
  scrollView:                { flex:1 },
  scrollContent:             { paddingBottom:20 },
  section:                   { backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:16, padding:20, borderRadius:12, elevation:2 },
  formGroup:                 { marginBottom:24 },
  visitPurposeGroup:          { marginBottom:8 },
  lastFormGroup:              { marginBottom:0 },
  label:                     { fontSize:14, fontWeight:'600', color:'#334155', marginBottom:8 },
  redStar:                   { color:'#EF4444', fontSize:14 },
  textInput:                 { backgroundColor:'#FFFFFF', borderRadius:10, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:16, paddingVertical:12, fontSize:15, color:'#0F172A' },
  textArea:                  { height:70, textAlignVertical:'top', paddingTop:10, paddingBottom:10 },
  charCount:                 { fontSize:12, color:'#64748B', textAlign:'right', marginTop:2 },
  dateTimeInput:             { backgroundColor:'#FFFFFF', borderRadius:10, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:16, paddingVertical:12, flexDirection:'row', alignItems:'center' },
  inputIcon:                 { marginRight:10 },
  dateTimeText:              { fontSize:15, color:'#0F172A', flex:1 },
  dateTimePlaceholder:       { fontSize:15, color:'#94A3B8', flex:1 },
  dateHintText:               { fontSize:12, color:'#64748B', marginTop:6 },
  anyTimeRow:                { flexDirection:'row', alignItems:'center', marginBottom:12 },
  anyTimeLabel:              { fontSize:14, fontWeight:'600', color:'#EF4444', marginLeft:8 },
  timeRow:                   { flexDirection:'row', alignItems:'flex-end', gap:8 },
  timeFieldWrapper:          { flex:1 },
  timeSubLabel:              { fontSize:13, fontWeight:'600', color:'#64748B', marginBottom:6 },
  timeDropdown:              { height:50, backgroundColor:'#FFFFFF', borderRadius:10, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:12 },
  timeColon:                 { fontSize:22, fontWeight:'700', color:'#334155', paddingBottom:12 },
  errorBanner:               { flexDirection:'row', alignItems:'center', backgroundColor:'#FEF2F2', borderRadius:8, paddingHorizontal:10, paddingVertical:6, marginBottom:8, borderWidth:1, borderColor:'#FECACA', gap:6 },
  errorBannerText:           { fontSize:12, color:'#EF4444', flex:1 },
  retryButton:               { paddingHorizontal:8, paddingVertical:3, backgroundColor:'#EF4444', borderRadius:6 },
  retryButtonText:           { fontSize:11, color:'#FFFFFF', fontWeight:'600' },
  dropdown:                  { height:50, backgroundColor:'#FFFFFF', borderRadius:10, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:16 },
  dropdownDisabled:          { opacity:0.6, backgroundColor:'#F8FAFC' },
  dropdownPlaceholder:       { fontSize:15, color:'#94A3B8' },
  dropdownSelectedText:      { fontSize:15, color:'#0F172A' },
  dropdownIcon:              { width:20, height:20, tintColor:'#64748B' },
  dropdownLeftIcon:          { marginRight:10 },
  dropdownContainer:         { backgroundColor:'#FFFFFF', borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', elevation:8 },
  dropdownSearchInput:       { height:40, fontSize:15, borderColor:'#E2E8F0', borderRadius:8, paddingHorizontal:12, color:'#0F172A' },
  checkbox:                  { width:20, height:20, borderRadius:5, borderWidth:2, borderColor:'#CBD5E1', marginRight:10, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFFFF' },
  checkboxChecked:           { backgroundColor:'#10B981', borderColor:'#10B981' },
  gadgetsContainer:          { gap:10 },
  gadgetRow:                 { flexDirection:'row', gap:10 },
  gadgetCheckbox:            { flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#F8FAFC', paddingHorizontal:12, paddingVertical:10, borderRadius:8, borderWidth:1, borderColor:'#E2E8F0' },
  gadgetLabel:               { fontSize:13, color:'#334155', fontWeight:'500', flex:1 },
  uploadButton:              { backgroundColor:'#F8FAFC', borderRadius:10, borderWidth:1.5, borderColor:'#CBD5E1', paddingVertical:12, paddingHorizontal:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  uploadButtonSuccess:       { backgroundColor:'#ECFDF5', borderColor:'#10B981' },
  uploadButtonText:          { fontSize:14, color:'#64748B', fontWeight:'600', flexShrink:1 },
  uploadButtonTextSuccess:   { color:'#10B981' },
  uploadInstruction:         { fontSize:12, color:'#10B981', marginTop:8, lineHeight:18 },
  // "Any Additional Visitor?" — Yes/No radio + dynamic visitor cards
  radioRow:                   { flexDirection:'row', gap:24 },
  radioOption:                { flexDirection:'row', alignItems:'center' },
  radioCircle:                { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:'#CBD5E1', marginRight:8, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFFFF' },
  radioCircleSelected:        { borderColor:'#3477eb' },
  radioCircleDot:             { width:10, height:10, borderRadius:5, backgroundColor:'#3477eb' },
  radioLabel:                 { fontSize:14, fontWeight:'600', color:'#334155' },
  visitorsContainer:          { marginTop:16, gap:12 },
  visitorCard:                { backgroundColor:'#F8FAFC', borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', padding:12, gap:10 },
  visitorCardHeader:          { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  visitorCardTitle:           { fontSize:13, fontWeight:'700', color:'#3477eb' },
  visitorRemoveButton:        { padding:2 },
  visitorFieldRow:            { flexDirection:'row', gap:10 },
  visitorFieldWrapper:        { flex:1 },
  visitorFieldLabel:          { fontSize:11, fontWeight:'600', color:'#64748B', marginBottom:4 },
  visitorTextInput:           { backgroundColor:'#FFFFFF', borderRadius:8, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:10, paddingVertical:8, fontSize:13, color:'#0F172A' },
  visitorDropdown:            { height:38, backgroundColor:'#FFFFFF', borderRadius:8, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:10 },
  addVisitorButton:           { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, borderWidth:1.5, borderColor:'#3477eb', borderStyle:'dashed', borderRadius:10, paddingVertical:10 },
  addVisitorButtonDisabled:   { borderColor:'#CBD5E1' },
  addVisitorButtonText:       { fontSize:13, fontWeight:'600', color:'#3477eb' },
  addVisitorButtonTextDisabled: { color:'#94A3B8' },
  visitorCountText:            { fontSize:11, color:'#64748B', textAlign:'right', marginTop:6 },
  buttonContainer:           { marginHorizontal:16, marginTop:24, gap:12 },
  submitButton:              { backgroundColor:'#3477eb', paddingVertical:16, borderRadius:12, alignItems:'center', elevation:4 },
  submitButtonDisabled:      { opacity:0.6 },
  submitButtonText:          { color:'#FFFFFF', fontSize:17, fontWeight:'700', letterSpacing:0.5 },
  cancelButton:              { backgroundColor:'#FFFFFF', paddingVertical:16, borderRadius:12, alignItems:'center', borderWidth:2, borderColor:'#E2E8F0' },
  cancelButtonText:          { color:'#64748B', fontSize:17, fontWeight:'700' },
  bottomPadding:             { height:20 },
  datePickerModalOverlay:    { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  datePickerModalContainer:  { width:'90%', maxWidth:400 },
  datePickerModalContent:    { backgroundColor:'#FFFFFF', borderRadius:16, padding:20, elevation:8 },
  datePickerHeader:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingBottom:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  datePickerTitle:           { fontSize:18, fontWeight:'700', color:'#3477eb' },
  datePickerButtonContainer: { flexDirection:'row', justifyContent:'space-between', marginTop:20, gap:12 },
  datePickerCancelButton:    { flex:1, backgroundColor:'#F1F5F9', borderRadius:10, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'#E2E8F0' },
  datePickerCancelText:      { fontSize:16, fontWeight:'600', color:'#64748B' },
  datePickerConfirmButton:   { flex:1, backgroundColor:'#3477eb', borderRadius:10, paddingVertical:14, alignItems:'center' },
  datePickerConfirmText:     { fontSize:16, fontWeight:'700', color:'#FFFFFF' },
});

export default CreateAppointmentScreen;