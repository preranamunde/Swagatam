import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ✅ Updated: added resendOTP
import { sendOTP, verifyOTPAndRegister, resendOTP } from '../constants/services/visitorRegisterService';

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const isValidMobile   = (n) => /^[6-9]\d{9}$/.test(n);
const isValidPassword = (p) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,15}$/.test(p);

// ─────────────────────────────────────────────
// CAPTCHA — 100% client-side. Generated, rendered
// with per-character distortion, and verified
// entirely on-device. NEVER sent to any API.
// ─────────────────────────────────────────────
const CAPTCHA_LENGTH = 6;
// Excludes visually-confusing characters (0/O, 1/I/l)
const CAPTCHA_CHARS  = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const CAPTCHA_COLORS = ['#0A2463', '#3477eb', '#059669', '#B91C1C', '#7C3AED', '#C2410C'];

const generateCaptchaText = () => {
  let out = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return out;
};

// Per-character random distortion style, regenerated with the text so it
// changes visually every time (rotation, color, size, vertical offset).
const generateCaptchaCharStyles = (length) =>
  Array.from({ length }, () => ({
    transform: [
      { rotate: `${Math.floor(Math.random() * 34) - 17}deg` },
      { translateY: Math.floor(Math.random() * 10) - 5 },
    ],
    color: CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)],
    fontSize: 20 + Math.floor(Math.random() * 8),
  }));

// Random decorative noise lines rendered behind the captcha text to make
// automated OCR/scraping harder.
const generateCaptchaNoiseLines = (count = 5) =>
  Array.from({ length: count }, () => ({
    top: `${Math.floor(Math.random() * 80) + 5}%`,
    left: `${Math.floor(Math.random() * 20)}%`,
    width: `${Math.floor(Math.random() * 40) + 60}%`,
    transform: [{ rotate: `${Math.floor(Math.random() * 40) - 20}deg` }],
    backgroundColor: CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)],
  }));

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const VisitorRegisterScreen = ({ navigation }) => {
  const [step,         setStep]         = useState(1);
  const [mobileNo,     setMobileNo]     = useState('');
  const [name,         setName]         = useState('');
  const [gender,       setGender]       = useState('');
  const [otp,          setOtp]          = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGenderDD, setShowGenderDD] = useState(false);
  const [loading,      setLoading]      = useState(false);

  // ── CAPTCHA state (client-only, never transmitted) ──
  const [captchaText,    setCaptchaText]    = useState('');
  const [captchaInput,   setCaptchaInput]   = useState('');
  const [captchaCharSty, setCaptchaCharSty] = useState([]);
  const [captchaNoise,   setCaptchaNoise]   = useState([]);
  const [captchaError,   setCaptchaError]   = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const refreshCaptcha = () => {
    const text = generateCaptchaText();
    setCaptchaText(text);
    setCaptchaCharSty(generateCaptchaCharStyles(text.length));
    setCaptchaNoise(generateCaptchaNoiseLines());
    setCaptchaInput('');
    setCaptchaVerified(false);
    setCaptchaError('');
  };

  // Generate the first captcha on mount
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleCaptchaInputChange = (val) => {
    setCaptchaInput(val);
    setCaptchaError('');
    // Live-verify locally as the user types — nothing is ever sent anywhere
    if (val.length === captchaText.length) {
      setCaptchaVerified(val === captchaText);
      if (val !== captchaText) setCaptchaError('Captcha does not match. Try again.');
    } else {
      setCaptchaVerified(false);
    }
  };

  const genderOptions = [
    { label: 'Male',   value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other',  value: 'O' },
  ];

  // ── STEP 1 — Send OTP ──────────────────────
  const handleSendOTP = async () => {
    if (!mobileNo)
      return Alert.alert('Validation', 'Please enter mobile number.');
    if (!isValidMobile(mobileNo))
      return Alert.alert('Validation', 'Must be 10 digits and start with 6–9.');

    // ── Captcha gate (frontend-only, not sent to API) ──
    if (!captchaInput.trim()) {
      setCaptchaError('Please enter the captcha shown below.');
      return Alert.alert('Captcha Required', 'Please enter the captcha text shown below.');
    }
    if (captchaInput !== captchaText) {
      setCaptchaError('Captcha does not match. Try again.');
      Alert.alert('Incorrect Captcha', 'The captcha you entered does not match. A new one has been generated.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result  = await sendOTP(mobileNo); // 👈 captcha is NOT included in this call
      const message = result?.[0]?.Result ?? '';
      console.log('ACTUAL API MESSAGE:', message);
      console.log('FULL RESULT:', JSON.stringify(result));

      if (message.toLowerCase().includes('already registered')) {
        Alert.alert(
          'Already Registered',
          message,
          [
            { text: 'Go to Login', onPress: () => navigation.goBack() },
            { text: 'OK' },
          ]
        );
      } else if (
        message.toLowerCase().includes('otp') ||
        message.toLowerCase().includes('success') ||
        message.toLowerCase().includes('sent') ||
        message === ''
      ) {
        setStep(2);
        Alert.alert(
          'OTP Sent ✅',
          `An OTP has been sent to +91-${mobileNo}.\n\n📱 Check your SMS inbox and enter it below.`
        );
      } else {
        Alert.alert('Failed', message || 'Unknown response from server. Check console logs.');
      }
    } catch (e) {
      console.error('❌ Send OTP Error:', e.message);
      Alert.alert('Error', `Failed to send OTP:\n${e.message}`);
    } finally {
      setLoading(false);
      refreshCaptcha(); // rotate captcha after every attempt (success or fail)
    }
  };

  // ── STEP 1b — Resend OTP ───────────────────
  // Uses the dedicated ReSendOTPForVisitor endpoint (not InsertAppvisitors)
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const result  = await resendOTP(mobileNo);
      const message = result?.[0]?.Result ?? '';
      console.log('Resend OTP result:', message);

      if (
        message.toLowerCase().includes('otp') ||
        message.toLowerCase().includes('success') ||
        message.toLowerCase().includes('sent') ||
        message === ''
      ) {
        Alert.alert(
          'OTP Resent',
          `A new OTP has been sent to +91-${mobileNo}.\n\n📱 Check your SMS inbox and enter it below.`
        );
      } else {
        Alert.alert('Resend Failed', message || 'Could not resend OTP. Please try again.');
      }
    } catch (e) {
      console.error('❌ Resend OTP Error:', e.message);
      Alert.alert('Error', `Failed to resend OTP:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 — Verify OTP & Register ─────────
  const handleRegister = async () => {
    if (!name.trim())
      return Alert.alert('Validation', 'Please enter your full name.');
    if (!gender)
      return Alert.alert('Validation', 'Please select your gender.');
    if (!otp.trim())
      return Alert.alert('Validation', 'Please enter the OTP received on your mobile.');
    if (!password)
      return Alert.alert('Validation', 'Please create a password.');
    if (!isValidPassword(password))
      return Alert.alert(
        'Weak Password',
        '8–15 characters with:\n• At least one uppercase letter\n• At least one lowercase letter\n• At least one number\n• At least one special character'
      );

    setLoading(true);
    try {
      const result  = await verifyOTPAndRegister({ mobileNo, name, gender, otp, password });
      const message = result?.[0]?.Result ?? '';
      const visNo   = result?.[0]?.VisNo  ?? '';
      console.log('🔍 Register result:', message, '| VisNo:', visNo);

      if (message.toLowerCase().includes('successfully')) {
        Alert.alert(
          '🎉 Registered Successfully!',
          `${message}\n\nYour Visitor No: ${visNo}`,
          [{ text: 'Go to Login', onPress: () => navigation.goBack() }]
        );
      } else if (
        message.toLowerCase().includes('invalid otp') ||
        message.toLowerCase().includes('wrong otp')
      ) {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect or has expired. Please check your SMS and try again, or tap Resend OTP.');
      } else {
        Alert.alert('Registration Failed', message || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      console.error('❌ Register Error:', e.message);
      Alert.alert('Error', `Registration failed:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* ── Header ── */}
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
          <Text style={styles.govTitle}>Government of India</Text>
          <Text style={styles.subtitle}>Gateway to Government Appointments</Text>
        </View>
        <View style={styles.headerWave} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>

          {/* ── Step Indicator ── */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]}>
              <Text style={[styles.stepDotText, styles.stepDotTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step === 2 && styles.stepDotTextActive]}>2</Text>
            </View>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              {step === 1 ? 'Verify Mobile' : 'Complete Registration'}
            </Text>
            <Text style={styles.welcomeText}>
              {step === 1
                ? 'Enter your mobile number to receive an OTP'
                : `OTP sent to +91-${mobileNo}. Fill in your details below.`}
            </Text>
          </View>

          {/* ══════════ STEP 1 ══════════ */}
          {step === 1 && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Mobile Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Icon name="cellphone" size={24} color="#0A2463" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#94A3B8"
                    value={mobileNo}
                    onChangeText={setMobileNo}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Icon name="information-outline" size={20} color="#3B82F6" />
                <Text style={styles.infoText}>
                  An OTP will be sent via SMS to this number for verification
                </Text>
              </View>

              {/* ══════════ CAPTCHA (frontend-only) ══════════ */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Security Check <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.captchaBox}>
                  <View style={styles.captchaDisplay}>
                    {captchaNoise.map((lineStyle, i) => (
                      <View key={`noise-${i}`} style={[styles.captchaNoiseLine, lineStyle]} />
                    ))}
                    <View style={styles.captchaTextRow}>
                      {captchaText.split('').map((ch, i) => (
                        <Text
                          key={`ch-${i}-${ch}`}
                          style={[styles.captchaChar, captchaCharSty[i]]}
                        >
                          {ch}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.captchaRefreshButton}
                    onPress={refreshCaptcha}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={22} color="#3477eb" />
                  </TouchableOpacity>
                </View>

                <View style={[
                  styles.inputWrapper,
                  captchaVerified && styles.captchaInputVerified,
                  !!captchaError && styles.captchaInputError,
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Icon name="shield-check-outline" size={24} color="#0A2463" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type the characters shown above"
                    placeholderTextColor="#94A3B8"
                    value={captchaInput}
                    onChangeText={handleCaptchaInputChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={CAPTCHA_LENGTH}
                  />
                  {captchaVerified && (
                    <View style={styles.dropdownIconContainer}>
                      <Ionicons name="checkmark-circle" size={22} color="#059669" />
                    </View>
                  )}
                </View>
                {!!captchaError && (
                  <Text style={styles.captchaErrorText}>{captchaError}</Text>
                )}
                <Text style={styles.captchaHelperText}>
                  Case-sensitive. This check happens on your device only and is never sent to the server.
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, !captchaVerified && styles.primaryButtonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading || !captchaVerified}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : (
                      <>
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.buttonIcon} />
                      </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ══════════ STEP 2 ══════════ */}
          {step === 2 && (
            <>
              {/* ── OTP Info Banner ── */}
              <View style={styles.otpInfoBanner}>
                <Icon name="message-text-outline" size={22} color="#059669" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.otpInfoTitle}>OTP Sent to Your Mobile</Text>
                  <Text style={styles.otpInfoText}>
                    Check your SMS inbox for the OTP sent to{' '}
                    <Text style={styles.otpMobileHighlight}>+91-{mobileNo}</Text>.
                    Enter it in the OTP field below.
                  </Text>
                </View>
              </View>

              {/* ── Full Name ── */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Icon name="account-outline" size={24} color="#0A2463" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* ── Gender ── */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowGenderDD(!showGenderDD)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.inputIconContainer}>
                      <Icon name="gender-male-female" size={24} color="#0A2463" />
                    </View>
                    <View style={styles.selectInput}>
                      <Text style={gender ? styles.selectedText : styles.placeholderText}>
                        {genderOptions.find(g => g.value === gender)?.label || 'Select your gender'}
                      </Text>
                    </View>
                    <View style={styles.dropdownIconContainer}>
                      <Ionicons
                        name={showGenderDD ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#64748B"
                      />
                    </View>
                  </TouchableOpacity>
                  {showGenderDD && (
                    <View style={styles.dropdownList}>
                      {genderOptions.map((opt, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.dropdownItem,
                            i === genderOptions.length - 1 && styles.dropdownItemLast,
                            gender === opt.value && styles.dropdownItemSelected,
                          ]}
                          onPress={() => { setGender(opt.value); setShowGenderDD(false); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            gender === opt.value && styles.dropdownItemTextSelected,
                          ]}>
                            {opt.label}
                          </Text>
                          {gender === opt.value && (
                            <Ionicons name="checkmark" size={20} color="#3477eb" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* ── OTP Field ── */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  OTP <Text style={styles.required}>*</Text>
                  <Text style={styles.otpLabelHint}> (received on your mobile via SMS)</Text>
                </Text>
                <View style={[styles.inputWrapper, styles.otpInputWrapper]}>
                  <View style={[styles.inputIconContainer, styles.otpIconContainer]}>
                    <Icon name="shield-key-outline" size={24} color="#059669" />
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.otpTextInput]}
                    placeholder="Enter OTP from SMS"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus={true}
                  />
                  {otp.length > 0 && (
                    <View style={styles.otpLengthBadge}>
                      <Text style={styles.otpLengthText}>{otp.length}/6</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.otpHelperText}>
                  📱 Open your SMS app → look for a message from Swagatam/NIC
                </Text>
              </View>

              {/* ── Password ── */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Icon name="lock-outline" size={24} color="#0A2463" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Create a strong password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.dropdownIconContainer}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordHint}>
                  8–15 chars · uppercase · lowercase · number · special character
                </Text>
              </View>

              {/* ── Resend OTP ── */}
              {/* ✅ Updated: now calls handleResendOTP → ReSendOTPForVisitor API */}
              <TouchableOpacity
                onPress={handleResendOTP}
                style={styles.resendRow}
                disabled={loading}
              >
                <Icon name="refresh" size={16} color="#3477eb" />
                <Text style={styles.resendText}>  Resend OTP</Text>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : (
                      <>
                        <Text style={styles.primaryButtonText}>Register</Text>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#FFF"
                          style={styles.buttonIcon}
                        />
                      </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setStep(1); refreshCaptcha(); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>← Change Mobile</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Login link ── */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Login Here</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── About Swagatam ── */}
        <View style={styles.swagatamContainer}>
          <View style={styles.swagatamHeader}>
            <Icon name="information-outline" size={20} color="#1E3A8A" />
            <Text style={styles.swagatamTitle}>About Swagatam</Text>
          </View>
          <Text style={styles.swagatamText}>
            Swagatam is an initiative by the Government of India to facilitate the common man.
            It enables citizens to have a smooth process of making an appointment — hassle free.
          </Text>
        </View>

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

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container:                  { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection:              { backgroundColor: '#3477eb', paddingTop: 50, paddingBottom: 40, position: 'relative' },
  backButton:                 { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  headerContent:              { alignItems: 'center', zIndex: 2, paddingTop: 30 },
  logoContainer:              { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 5, marginBottom: 15, elevation: 8 },
  logoImage:                  { width: 140, height: 40 },
  govTitle:                   { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle:                   { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerWave:                 { position: 'absolute', bottom: -1, left: 0, right: 0, height: 30, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollView:                 { flex: 1 },
  scrollContent:              { paddingBottom: 40 },
  formContainer:              { paddingHorizontal: 24, paddingTop: 30 },
  stepIndicator:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepDot:                    { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  stepDotActive:              { borderColor: '#3477eb', backgroundColor: '#3477eb' },
  stepDotText:                { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  stepDotTextActive:          { color: '#FFFFFF' },
  stepLine:                   { flex: 1, height: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  stepLineActive:             { backgroundColor: '#3477eb' },
  titleSection:               { marginBottom: 28 },
  mainTitle:                  { fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  welcomeText:                { fontSize: 14, color: '#64748B', lineHeight: 20 },
  formGroup:                  { marginBottom: 20 },
  label:                      { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  required:                   { color: '#EF4444', fontSize: 16 },
  inputWrapper:               { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', elevation: 2 },
  inputIconContainer:         { width: 50, height: 54, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  textInput:                  { flex: 1, height: 54, paddingHorizontal: 16, fontSize: 15, color: '#0F172A' },
  dropdownContainer:          { position: 'relative', zIndex: 1000 },
  selectInput:                { flex: 1, height: 54, paddingHorizontal: 16, justifyContent: 'center' },
  placeholderText:            { fontSize: 15, color: '#94A3B8' },
  selectedText:               { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  dropdownIconContainer:      { paddingHorizontal: 16, height: 54, justifyContent: 'center' },
  dropdownList:               { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginTop: 4, elevation: 5, overflow: 'hidden' },
  dropdownItem:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemLast:           { borderBottomWidth: 0 },
  dropdownItemSelected:       { backgroundColor: '#EFF6FF' },
  dropdownItemText:           { fontSize: 15, color: '#334155', fontWeight: '500' },
  dropdownItemTextSelected:   { color: '#3477eb', fontWeight: '700' },
  otpInfoBanner:              { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1.5, borderColor: '#6EE7B7', alignItems: 'flex-start' },
  otpInfoTitle:               { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  otpInfoText:                { fontSize: 13, color: '#047857', lineHeight: 20 },
  otpMobileHighlight:         { fontWeight: '700', color: '#065F46' },
  otpLabelHint:               { fontSize: 12, color: '#059669', fontWeight: '400' },
  otpInputWrapper:            { borderColor: '#6EE7B7', borderWidth: 2, backgroundColor: '#F0FDF4' },
  otpIconContainer:           { backgroundColor: '#DCFCE7' },
  otpTextInput:               { fontSize: 20, fontWeight: '700', letterSpacing: 4, color: '#065F46' },
  otpLengthBadge:             { paddingHorizontal: 12, height: 54, justifyContent: 'center' },
  otpLengthText:              { fontSize: 12, color: '#059669', fontWeight: '600' },
  otpHelperText:              { fontSize: 12, color: '#059669', marginTop: 6, lineHeight: 18 },
  passwordHint:               { fontSize: 12, color: '#94A3B8', marginTop: 6 },
  resendRow:                  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  resendText:                 { fontSize: 14, color: '#3477eb', fontWeight: '600' },
  infoBox:                    { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 16, borderRadius: 12, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#3B82F6', alignItems: 'flex-start' },
  infoText:                   { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 20, marginLeft: 10 },

  // ── Captcha styles ──
  captchaBox:                 { flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, gap: 10 },
  captchaDisplay:              {
    flex: 1,
    height: 64,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaNoiseLine:            { position: 'absolute', height: 2, opacity: 0.35 },
  captchaTextRow:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  captchaChar:                  { fontWeight: '800', marginHorizontal: 3 },
  captchaRefreshButton:          {
    width: 54,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaInputVerified:         { borderColor: '#059669', borderWidth: 2 },
  captchaInputError:            { borderColor: '#EF4444', borderWidth: 2 },
  captchaErrorText:             { fontSize: 12, color: '#EF4444', marginTop: 6 },
  captchaHelperText:            { fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 16 },

  buttonContainer:            { gap: 14 },
  primaryButton:              { backgroundColor: '#3477eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4 },
  primaryButtonDisabled:      { backgroundColor: '#94A3B8', elevation: 0 },
  primaryButtonText:          { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  buttonIcon:                 { marginLeft: 8 },
  cancelButton:               { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  cancelButtonText:           { color: '#64748B', fontSize: 17, fontWeight: '700' },
  loginContainer:             { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  loginText:                  { fontSize: 15, color: '#64748B' },
  loginLink:                  { fontSize: 15, color: '#3B82F6', fontWeight: '700' },
  swagatamContainer:          { marginTop: 40, marginHorizontal: 24, marginBottom: 24, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#0A2463' },
  swagatamHeader:             { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  swagatamTitle:              { fontSize: 15, fontWeight: '700', color: '#1E3A8A', marginLeft: 8 },
  swagatamText:               { fontSize: 13, color: '#1E3A8A', textAlign: 'justify', lineHeight: 20 },
  footer:                     { marginTop: 16, alignItems: 'center', paddingHorizontal: 24 },
  footerText:                 { fontSize: 13, color: '#94A3B8', marginBottom: 12 },
  securityBadge:              { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  securityText:               { fontSize: 12, color: '#059669', fontWeight: '600', marginLeft: 6 },
});

export default VisitorRegisterScreen;