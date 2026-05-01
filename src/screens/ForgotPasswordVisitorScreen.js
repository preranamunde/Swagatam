import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Hardcoded OTP for testing
const HARDCODED_OTP = '123456';
const HARDCODED_MOBILE = '9999999999';

const ForgotPasswordVisitorScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  // Step 1: Mobile number
  const [mobileNo, setMobileNo] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step labels
  const steps = ['Mobile', 'Verify OTP', 'Reset Password'];

  const handleSendOtp = () => {
    if (!mobileNo || mobileNo.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    // Simulate OTP sent
    setOtpSent(true);
    Alert.alert('OTP Sent', `OTP has been sent to +91 ${mobileNo}.\n(Hardcoded OTP for testing: ${HARDCODED_OTP})`);
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }
    if (otp !== HARDCODED_OTP) {
      Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
      return;
    }
    setOtpVerified(true);
    setStep(3);
  };

  const handleProceedToOtp = () => {
    if (!otpSent) {
      Alert.alert('Error', 'Please send OTP first.');
      return;
    }
    setStep(2);
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please try again.');
      return;
    }
    Alert.alert(
      'Success',
      'Your password has been reset successfully!',
      [{ text: 'Login Now', onPress: () => navigation.navigate('VisitorLogin') }]
    );
  };

  const handleResendOtp = () => {
    setOtp('');
    Alert.alert('OTP Resent', `A new OTP has been sent to +91 ${mobileNo}.\n(Hardcoded OTP: ${HARDCODED_OTP})`);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = step > stepNum;
        const isActive = step === stepNum;
        return (
          <React.Fragment key={stepNum}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isCompleted && styles.stepCircleCompleted,
                isActive && styles.stepCircleActive,
              ]}>
                {isCompleted
                  ? <Ionicons name="checkmark" size={16} color="#fff" />
                  : <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>{stepNum}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.stepConnector, isCompleted && styles.stepConnectorCompleted]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStep1 = () => (
    <View>
      
      

      <View style={styles.formGroup}>
        <Text style={styles.label}>Registered Mobile Number</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Icon name="cellphone" size={24} color="#3477eb" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#94A3B8"
            value={mobileNo}
            onChangeText={setMobileNo}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!otpSent}
          />
          {otpSent && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#059669" />
            </View>
          )}
        </View>
      </View>

      {!otpSent ? (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp} activeOpacity={0.8}>
          <Icon name="message-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.otpSentBanner}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
            <Text style={styles.otpSentText}>OTP sent to +91 {mobileNo}</Text>
            <TouchableOpacity onPress={() => { setOtpSent(false); setMobileNo(''); }}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleProceedToOtp} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Proceed to Verify OTP</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Verify OTP</Text>
      <Text style={styles.stepSubtitle}>OTP sent to +91 {mobileNo}</Text>

      <View style={styles.formGroup}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Icon name="shield-key-outline" size={24} color="#3477eb" />
          </View>
          <TextInput
            style={[styles.textInput, styles.otpInput]}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#94A3B8"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the OTP? </Text>
        <TouchableOpacity onPress={handleResendOtp}>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp} activeOpacity={0.8}>
        <Icon name="shield-check-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Verify OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(1)}>
        <Ionicons name="arrow-back" size={18} color="#3477eb" />
        <Text style={styles.backStepText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Icon name="lock-outline" size={24} color="#3477eb" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new password"
            placeholderTextColor="#94A3B8"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>Minimum 6 characters</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[
          styles.inputWrapper,
          confirmPassword.length > 0 && newPassword !== confirmPassword && styles.inputWrapperError,
          confirmPassword.length > 0 && newPassword === confirmPassword && styles.inputWrapperSuccess,
        ]}>
          <View style={styles.inputIconContainer}>
            <Icon name="lock-check-outline" size={24} color="#3477eb" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Re-enter new password"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
        {confirmPassword.length > 0 && newPassword === confirmPassword && (
          <Text style={styles.successText}>Passwords match ✓</Text>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} activeOpacity={0.8}>
        <Icon name="lock-reset" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/image.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.govTitle}>Forgot Password</Text>
          <Text style={styles.subtitle}>Recover your Swagatam account</Text>
        </View>
        <View style={styles.headerWave} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content Card */}
          <View style={styles.card}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>

          {/* Back to Login */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('VisitorLogin')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secured by Government Authentication</Text>
          <View style={styles.securityBadge}>
            <Icon name="shield-check" size={16} color="#059669" />
            <Text style={styles.securityText}>SSL Encrypted</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection: {
    backgroundColor: '#3477eb',
    paddingTop: 50,
    paddingBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: { alignItems: 'center', zIndex: 2, paddingTop: 20 },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: { width: 140, height: 50 },
  govTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4, letterSpacing: 0.5 },
  subtitle: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 },
  headerWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  formContainer: { paddingHorizontal: 20, paddingTop: 28 },

  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  stepItem: { alignItems: 'center', width: 72 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: { backgroundColor: '#3477eb' },
  stepCircleCompleted: { backgroundColor: '#059669' },
  stepNumber: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  stepNumberActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },
  stepLabelActive: { color: '#3477eb', fontWeight: '700' },
  stepConnector: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginBottom: 20 },
  stepConnectorCompleted: { backgroundColor: '#059669' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  stepSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 28, lineHeight: 20 },

  // Form
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: { borderColor: '#EF4444' },
  inputWrapperSuccess: { borderColor: '#059669' },
  inputIconContainer: {
    width: 50,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  textInput: { flex: 1, height: 54, paddingHorizontal: 16, fontSize: 15, color: '#0F172A' },
  otpInput: { letterSpacing: 4, fontSize: 20, fontWeight: '700' },
  eyeIcon: { paddingHorizontal: 16, height: 54, justifyContent: 'center' },
  verifiedBadge: { paddingHorizontal: 14 },
  hintText: { fontSize: 12, color: '#94A3B8', marginTop: 6, marginLeft: 4 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6, marginLeft: 4 },
  successText: { fontSize: 12, color: '#059669', marginTop: 6, marginLeft: 4 },

  // OTP Sent Banner
  otpSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 8,
  },
  otpSentText: { flex: 1, fontSize: 13, color: '#059669', fontWeight: '500' },
  changeLink: { fontSize: 13, color: '#3477eb', fontWeight: '700' },

  // Resend
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  resendText: { fontSize: 14, color: '#64748B' },
  resendLink: { fontSize: 14, color: '#3477eb', fontWeight: '700' },

  // Buttons
  primaryButton: {
    backgroundColor: '#3477eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  backStepText: { fontSize: 15, color: '#3477eb', fontWeight: '600' },

  // Login Link
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginLinkText: { fontSize: 15, color: '#64748B' },
  loginLink: { fontSize: 15, color: '#3477eb', fontWeight: '700' },

  // Footer
  footer: { marginTop: 32, alignItems: 'center', paddingHorizontal: 24 },
  footerText: { fontSize: 13, color: '#94A3B8', marginBottom: 12, fontWeight: '500' },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityText: { fontSize: 12, color: '#059669', fontWeight: '600', marginLeft: 6 },
});

export default ForgotPasswordVisitorScreen;