import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendLoginOtp, verifyLoginOtp } from '../constants/services/visitorloginservice';

// ─── Validation ────────────────────────────────────────────────────────────────
const isValidMobile = (n) => /^[6-9]\d{9}$/.test(n);
const isValidOtp    = (o) => /^\d{4,6}$/.test(o);

const RESEND_COOLDOWN_SECONDS = 180; // server enforces a 3 minute gap between requests

// Pulls a "165 seconds" style number out of a server message, if present,
// so the local countdown can stay in sync with the backend cooldown.
const extractSecondsFromMessage = (msg) => {
  if (!msg) return null;
  const match = msg.match(/(\d+)\s*second/i);
  return match ? parseInt(match[1], 10) : null;
};

// ─── Captcha (frontend-only, strengthened) ─────────────────────────────────────
// Same scheme as VisitorLoginScreen: purely a client-side gate before calling
// sendLoginOtp(). The generated text, the user's captcha input, and the
// verified/unverified state never leave the device — sendLoginOtp() is still
// called with only (mobileNo), exactly as before. The Send/Resend OTP button
// stays disabled until the captcha is verified locally, so it can never even
// trigger the API call with an unverified captcha.
const CAPTCHA_LENGTH = 6;
// Deliberately excludes visually-ambiguous characters (0/O, 1/I/L).
const CAPTCHA_CHARS  = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CAPTCHA_COLORS = ['#1E3A8A', '#3477eb', '#0F172A', '#0E7490', '#7C3AED', '#B91C1C', '#C2410C'];

const generateCaptcha = () => {
  let text = '';
  const styledChars = [];
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    const ch = CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    text += ch;
    styledChars.push({
      char:      ch,
      rotate:    Math.floor(Math.random() * 36) - 18,  // -18°..17° (stronger tilt)
      translateY: Math.floor(Math.random() * 12) - 6,  // -6..5 px vertical jitter
      fontSize:  20 + Math.floor(Math.random() * 8),   // 20..27 (variable size)
      color:     CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)],
    });
  }
  return { text, styledChars };
};

// Random decorative noise lines behind the captcha text — regenerated with
// every captcha so overlapping clutter changes each time, making automated
// character segmentation/OCR harder.
const generateNoiseLines = (count = 4) =>
  Array.from({ length: count }, () => ({
    top:    `${Math.floor(Math.random() * 70) + 10}%`,
    left:   `${Math.floor(Math.random() * 15) - 10}%`,
    width:  `${Math.floor(Math.random() * 40) + 90}%`,
    transform: [{ rotate: `${Math.floor(Math.random() * 40) - 20}deg` }],
    backgroundColor: CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)],
  }));

// ─── Component ─────────────────────────────────────────────────────────────────
const VisitorLoginOtpScreen = ({ navigation }) => {
  const [step,          setStep]          = useState('mobile'); // 'mobile' | 'otp'
  const [mobileNo,      setMobileNo]      = useState('');
  const [otp,           setOtp]           = useState('');
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [verifyingOtp,  setVerifyingOtp]  = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Captcha state — generated once on mount, regenerated on refresh or after
  // every send/resend attempt. `captcha.text` is the correct answer;
  // `captchaInput` is what the user typed. Neither is ever included in the
  // API payload — sendLoginOtp() only ever receives the mobile number.
  const [captcha,         setCaptcha]         = useState(() => generateCaptcha());
  const [noiseLines,      setNoiseLines]      = useState(() => generateNoiseLines());
  const [captchaInput,    setCaptchaInput]    = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError,    setCaptchaError]    = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCooldown(seconds);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setNoiseLines(generateNoiseLines());
    setCaptchaInput('');
    setCaptchaVerified(false);
    setCaptchaError('');
  };

  // Live, on-device verification as the user types — nothing is transmitted.
  const handleCaptchaInputChange = (val) => {
    setCaptchaInput(val);
    setCaptchaError('');
    if (val.length === CAPTCHA_LENGTH) {
      const match = val.toUpperCase() === captcha.text.toUpperCase();
      setCaptchaVerified(match);
      if (!match) setCaptchaError('Captcha does not match.');
    } else {
      setCaptchaVerified(false);
    }
  };

  // ── Send / Resend OTP Handler ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!mobileNo.trim())
      return Alert.alert('Validation', 'Please enter your mobile number.');
    if (!isValidMobile(mobileNo))
      return Alert.alert('Validation', 'Mobile number must be 10 digits and start with 6–9.');

    // ── Captcha check — frontend-only gate. Nothing captcha-related is ever
    // sent to sendLoginOtp(); it only guards whether we're allowed to call it.
    if (!captchaInput.trim()) {
      setCaptchaError('Please enter the captcha shown above.');
      return Alert.alert('Validation', 'Please enter the captcha shown above.');
    }
    if (captchaInput.trim().toUpperCase() !== captcha.text.toUpperCase()) {
      setCaptchaError('Captcha does not match.');
      Alert.alert('Validation', 'Captcha does not match. Please try again.');
      handleRefreshCaptcha();
      return;
    }

    setSendingOtp(true);
    try {
      const response = await sendLoginOtp(mobileNo.trim()); // 👈 captcha never sent
      console.log('Send OTP response:', JSON.stringify(response));

      const resultText = response?.Result ?? '';
      const lower = resultText.toLowerCase();

      if (lower.includes('successfully sent')) {
        setStep('otp');
        setOtp('');
        startCooldown(RESEND_COOLDOWN_SECONDS);
        handleRefreshCaptcha(); // fresh captcha required for the next resend
        Alert.alert('OTP Sent', resultText);
      } else if (lower.includes('wait')) {
        // Server enforced its own cooldown — sync the local timer to it.
        const secs = extractSecondsFromMessage(resultText);
        if (secs) startCooldown(secs);
        handleRefreshCaptcha();
        Alert.alert('Please Wait', resultText);
      } else {
        // Not registered, daily limit reached, invalid number, etc.
        handleRefreshCaptcha();
        Alert.alert('Unable to Send OTP', resultText || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      console.error('Send OTP Error:', e.message);
      handleRefreshCaptcha();
      Alert.alert('Error', `Failed to send OTP:\n${e.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP Handler ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp.trim())
      return Alert.alert('Validation', 'Please enter the OTP sent to your mobile.');
    if (!isValidOtp(otp))
      return Alert.alert('Validation', 'Please enter a valid OTP.');

    setVerifyingOtp(true);
    try {
      const response = await verifyLoginOtp(mobileNo.trim(), otp.trim());
      console.log('Verify OTP response:', JSON.stringify(response));

      if (response?.Success === true) {
        const userData = response?.Data?.[0] ?? {};

        await AsyncStorage.setItem('loginSession', JSON.stringify({
          Vis_Reg_No: userData.Vis_Reg_No ?? '',
          Name:       userData.Name       ?? '',
          Mobile:     userData.Mobile     ?? mobileNo,
          Email:      userData.Email      ?? '',
        }));

        await AsyncStorage.setItem('userData', JSON.stringify({
          mobile:   userData.Mobile     ?? mobileNo,
          name:     userData.Name       ?? 'Visitor User',
          email:    userData.Email      ?? '',
          visRegNo: userData.Vis_Reg_No ?? '',
        }));

        await AsyncStorage.setItem('userRole', 'visitor');

        console.log(
          'loginSession saved (OTP login) — Vis_Reg_No:',
          userData.Vis_Reg_No,
          '| Mobile:',
          userData.Mobile,
        );

        navigation.reset({
          index:  0,
          routes: [{ name: 'Home' }],
        });
      } else {
        const msg = response?.Message ?? 'Invalid OTP. Please try again.';
        Alert.alert('Verification Failed', msg);
      }
    } catch (e) {
      console.error('Verify OTP Error:', e.message);
      Alert.alert('Error', `OTP verification failed:\n${e.message}`);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangeNumber = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCooldown(0);
    setOtp('');
    setStep('mobile');
    handleRefreshCaptcha();
  };

  const handleBack = () => navigation.goBack();

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* ── Header ── */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
      >
        <View style={styles.formContainer}>

          {/* ── Title ── */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Login with OTP</Text>
            <Text style={styles.welcomeText}>
              {step === 'mobile'
                ? 'Enter your registered mobile number to receive an OTP'
                : `Enter the OTP sent to +91 ${mobileNo}`}
            </Text>
          </View>

          {/* ── Mobile Number ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Number</Text>
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
                editable={step === 'mobile'}
              />
              {step === 'otp' && (
                <TouchableOpacity style={styles.changeNumberBtn} onPress={handleChangeNumber}>
                  <Text style={styles.changeNumberText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Captcha — frontend-only check, never sent to the API. OTP is
              only sent/resent once this is verified locally. Shown in both
              steps: it gates the initial send, and is re-verified (with a
              fresh code) before every resend. ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Captcha <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.captchaRow}>
              <View style={styles.captchaBox}>
                {noiseLines.map((lineStyle, i) => (
                  <View key={`noise-${i}`} style={[styles.captchaNoiseLine, lineStyle]} />
                ))}
                <View style={styles.captchaTextRow}>
                  {captcha.styledChars.map((c, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.captchaChar,
                        {
                          color: c.color,
                          fontSize: c.fontSize,
                          transform: [
                            { rotate: `${c.rotate}deg` },
                            { translateY: c.translateY },
                          ],
                        },
                      ]}
                    >
                      {c.char}
                    </Text>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.captchaRefreshButton}
                onPress={handleRefreshCaptcha}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={22} color="#3477eb" />
              </TouchableOpacity>
            </View>
            <View style={[
              styles.inputWrapper,
              captchaVerified && styles.captchaInputVerified,
              !!captchaError && styles.captchaInputError,
            ]}>
              <View style={styles.inputIconContainer}>
                <Icon name="shield-check-outline" size={24} color="#3477eb" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter captcha shown above"
                placeholderTextColor="#94A3B8"
                value={captchaInput}
                onChangeText={handleCaptchaInputChange}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={CAPTCHA_LENGTH}
              />
              {captchaVerified && (
                <View style={styles.eyeIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#059669" />
                </View>
              )}
            </View>
            {!!captchaError && (
              <Text style={styles.captchaErrorText}>{captchaError}</Text>
            )}
            <Text style={styles.captchaHelperText}>
              This check happens on your device only and is never sent to the server.
            </Text>
          </View>

          {/* ── OTP Field (step 2) ── */}
          {step === 'otp' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Icon name="shield-key-outline" size={24} color="#3477eb" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter OTP"
                  placeholderTextColor="#94A3B8"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              {/* ── Resend ── */}
              <View style={styles.resendRow}>
                {resendCooldown > 0 ? (
                  <Text style={styles.resendMutedText}>
                    Resend OTP in {resendCooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={sendingOtp || !captchaVerified}
                  >
                    <Text
                      style={[
                        styles.resendLinkText,
                        (sendingOtp || !captchaVerified) && styles.resendLinkTextDisabled,
                      ]}
                    >
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ── Primary Action Button ── */}
          {step === 'mobile' ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (sendingOtp || !captchaVerified) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={sendingOtp || !captchaVerified}
              activeOpacity={0.8}
            >
              {sendingOtp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, verifyingOtp && styles.primaryButtonDisabled]}
              onPress={handleVerifyOtp}
              disabled={verifyingOtp}
              activeOpacity={0.8}
            >
              {verifyingOtp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Verify &amp; Login</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* ── Back to Password Login ── */}
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationText}>Prefer a password? </Text>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.registrationLink}>Login with Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
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

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:               { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection:           { backgroundColor: '#3477eb', paddingTop: 50, paddingBottom: 40, position: 'relative' },
  backButton:              { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  headerContent:           { alignItems: 'center', zIndex: 2, paddingTop: 20 },
  logoContainer:           { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 5, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  logoImage:               { width: 140, height: 50 },
  govTitle:                { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4, letterSpacing: 0.5 },
  subtitle:                { color: '#FFFFFF' },
  headerWave:              { position: 'absolute', bottom: -1, left: 0, right: 0, height: 30, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollView:              { flex: 1 },
  scrollContent:           { paddingBottom: 40 },
  formContainer:           { paddingHorizontal: 24, paddingTop: 30 },
  titleSection:            { marginBottom: 32 },
  mainTitle:               { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  welcomeText:             { fontSize: 15, color: '#64748B', fontWeight: '400' },
  formGroup:               { marginBottom: 24 },
  label:                   { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
  required:                { color: '#EF4444', fontSize: 16 },
  inputWrapper:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  inputIconContainer:      { width: 50, height: 54, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  textInput:               { flex: 1, height: 54, paddingHorizontal: 16, fontSize: 15, color: '#0F172A', fontWeight: '400' },
  eyeIcon:                 { paddingHorizontal: 16, height: 54, justifyContent: 'center' },
  changeNumberBtn:          { paddingHorizontal: 16, height: 54, justifyContent: 'center' },
  changeNumberText:         { color: '#3477eb', fontSize: 13, fontWeight: '700' },
  // ── Captcha ──
  captchaRow:              { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  captchaBox:              { flex: 1, height: 64, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', position: 'relative' },
  captchaNoiseLine:        { position: 'absolute', height: 2, opacity: 0.4 },
  captchaTextRow:          { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  captchaChar:             { fontWeight: '800', marginHorizontal: 2 },
  captchaRefreshButton:    { width: 64, height: 64, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#3477eb', justifyContent: 'center', alignItems: 'center' },
  captchaInputVerified:    { borderColor: '#059669', borderWidth: 2 },
  captchaInputError:       { borderColor: '#EF4444', borderWidth: 2 },
  captchaErrorText:        { fontSize: 12, color: '#EF4444', marginTop: 6 },
  captchaHelperText:       { fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 16 },
  resendRow:                { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  resendMutedText:          { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  resendLinkText:           { fontSize: 13, color: '#3477eb', fontWeight: '700' },
  resendLinkTextDisabled:   { color: '#94A3B8' },
  primaryButton:           { backgroundColor: '#3477eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#3477eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonDisabled:   { opacity: 0.6 },
  primaryButtonText:       { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  buttonIcon:              { marginLeft: 8 },
  registrationContainer:   { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registrationText:        { fontSize: 15, color: '#64748B' },
  registrationLink:        { fontSize: 15, color: '#3477eb', fontWeight: '700' },
  footer:                  { marginTop: 40, alignItems: 'center', paddingHorizontal: 24 },
  footerText:              { fontSize: 13, color: '#94A3B8', marginBottom: 12, fontWeight: '500' },
  securityBadge:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  securityText:            { fontSize: 12, color: '#059669', fontWeight: '600', marginLeft: 6 },
});

export default VisitorLoginOtpScreen;