import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const CreateVisitorVisitScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    purpose: '',
  });
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-advance steps
    if (field === 'name' && value.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    } else if (field === 'mobile' && value.length === 10 && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel? All entered information will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => navigation.goBack() 
        }
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile || !formData.purpose) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields to continue');
      return;
    }

    if (formData.mobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }

    Alert.alert(
      'Success!',
      'Visitor appointment has been created successfully. The visitor will receive a confirmation SMS.',
      [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]
    );
  };

  const isFormValid = formData.name && formData.mobile.length === 10 && formData.purpose;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
      
      {/* Gradient Header */}
      <LinearGradient colors={['#3477eb', '#5a94f5']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>New Visitor Appointment</Text>
            <Text style={styles.headerSubtitle}>Fill in visitor details</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            
            {/* Progress Steps */}
            <View style={styles.progressCard}>
              <View style={styles.stepsRow}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                    {currentStep > 1 ? (
                      <Icon name="check" size={18} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>Name</Text>
                </View>

                <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                    {currentStep > 2 ? (
                      <Icon name="check" size={18} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>Contact</Text>
                </View>

                <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
                  </View>
                  <Text style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}>Purpose</Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{Math.round((currentStep / 3) * 100)}%</Text>
              </View>
            </View>

            {/* Main Form Card */}
            <View style={styles.mainCard}>
              <View style={styles.cardHeader}>
                <Icon name="clipboard-text-outline" size={24} color="#3477eb" />
                <Text style={styles.cardHeaderTitle}>Visitor Information</Text>
              </View>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'name' && styles.inputContainerFocused,
                  formData.name && styles.inputContainerFilled
                ]}>
                  <View style={styles.inputIconBox}>
                    <Icon name="account" size={20} color={formData.name ? '#3477eb' : '#94A3B8'} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter visitor's full name"
                    placeholderTextColor="#94A3B8"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.name && (
                    <Icon name="check-circle" size={20} color="#10B981" />
                  )}
                </View>
              </View>

              {/* Mobile Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Mobile Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'mobile' && styles.inputContainerFocused,
                  formData.mobile && styles.inputContainerFilled
                ]}>
                  <View style={styles.inputIconBox}>
                    <Icon name="phone" size={20} color={formData.mobile ? '#3477eb' : '#94A3B8'} />
                  </View>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#94A3B8"
                    value={formData.mobile}
                    onChangeText={(text) => handleInputChange('mobile', text.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onFocus={() => setFocusedField('mobile')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.mobile.length === 10 && (
                    <Icon name="check-circle" size={20} color="#10B981" />
                  )}
                </View>
                {formData.mobile.length > 0 && formData.mobile.length < 10 && (
                  <View style={styles.helperRow}>
                    <Icon name="information" size={14} color="#F59E0B" />
                    <Text style={styles.helperText}>
                      Enter {10 - formData.mobile.length} more digit{10 - formData.mobile.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Purpose Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Purpose of Visit <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.textAreaContainer,
                  focusedField === 'purpose' && styles.inputContainerFocused,
                  formData.purpose && styles.inputContainerFilled
                ]}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe the purpose of visit (e.g., Meeting with officer, Document submission, etc.)"
                    placeholderTextColor="#94A3B8"
                    value={formData.purpose}
                    onChangeText={(text) => handleInputChange('purpose', text)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onFocus={() => setFocusedField('purpose')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View style={styles.characterCount}>
                  <Icon name="text" size={14} color="#94A3B8" />
                  <Text style={styles.characterCountText}>
                    {formData.purpose.length} characters
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Icon name="information-outline" size={20} color="#3477eb" />
                <Text style={styles.infoTitle}>Important Information</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="shield-check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Visitor will receive appointment confirmation via SMS</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="shield-check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Valid ID proof required during the visit</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="shield-check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Ensure mobile number is active and reachable</Text>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Buttons - Moves above keyboard when keyboard is open */}
      <View 
        style={[
          styles.bottomBar,
          keyboardHeight > 0 && { 
            marginBottom: Platform.OS === 'ios' ? keyboardHeight : keyboardHeight 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={handleCancel}
        >
          <Icon name="close-circle-outline" size={22} color="#EF4444" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Icon name="checkbox-marked-circle" size={22} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Create Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerRight: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3477eb',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepTextActive: {
    color: '#3477eb',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#3477eb',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3477eb',
    minWidth: 40,
    textAlign: 'right',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  inputContainerFocused: {
    borderColor: '#3477eb',
    backgroundColor: '#FFFFFF',
  },
  inputContainerFilled: {
    borderColor: '#10B981',
  },
  inputIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    padding: 0,
  },
  countryCode: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  textAreaContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3477eb',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CreateVisitorVisitScreen;