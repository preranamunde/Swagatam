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
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginVisitor } from '../constants/services/visitorloginservice';

// ─── Validation ────────────────────────────────────────────────────────────────
const isValidMobile = (n) => /^[6-9]\d{9}$/.test(n);

// ─── Component ─────────────────────────────────────────────────────────────────
const VisitorLoginScreen = ({ navigation }) => {
  const [mobileNo,     setMobileNo]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  // ── Login Handler ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!mobileNo.trim())
      return Alert.alert('Validation', 'Please enter your mobile number.');
    if (!isValidMobile(mobileNo))
      return Alert.alert('Validation', 'Mobile number must be 10 digits and start with 6–9.');
    if (!password.trim())
      return Alert.alert('Validation', 'Please enter your password.');

    setLoading(true);
    try {
      const response = await loginVisitor(mobileNo.trim(), password);
      console.log('Login response:', JSON.stringify(response));

      if (response?.Success === true) {
        const userData = response?.Data?.[0] ?? {};

        // loginSession — raw API fields used by screens that call APIs
        //   e.g. PersonalDetailsScreen reads Vis_Reg_No as VisNo, Mobile as VisMob
        await AsyncStorage.setItem('loginSession', JSON.stringify({
          Vis_Reg_No: userData.Vis_Reg_No ?? '',
          Name:       userData.Name       ?? '',
          Mobile:     userData.Mobile     ?? mobileNo,
          Email:      userData.Email      ?? '',
        }));

        // userData — human-readable fields for display screens
        await AsyncStorage.setItem('userData', JSON.stringify({
          mobile:   userData.Mobile     ?? mobileNo,
          name:     userData.Name       ?? 'Visitor User',
          email:    userData.Email      ?? '',
          visRegNo: userData.Vis_Reg_No ?? '',
        }));

        await AsyncStorage.setItem('userRole', 'visitor');

        console.log(
          'loginSession saved — Vis_Reg_No:',
          userData.Vis_Reg_No,
          '| Mobile:',
          userData.Mobile,
        );

        navigation.reset({
          index:  0,
          routes: [{ name: 'Home' }],
        });

      } else {
        const msg = response?.Message ?? 'Login failed. Please check your credentials.';
        Alert.alert('Login Failed', msg);
      }
    } catch (e) {
      console.error('Login Error:', e.message);
      Alert.alert('Error', `Login failed:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOtp        = () => console.log('Login with OTP — not yet implemented');
  const handleRegistration        = () => navigation.navigate('VisitorRegister');
  const handleForgotPassword      = () => navigation.navigate('ForgotPasswordVisitor');
  const handleBackToRoleSelection = () => navigation.goBack();

  const openExternalLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Failed to open link. Please check your internet connection.');
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* ── Header ── */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToRoleSelection}>
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
            <Text style={styles.mainTitle}>Visitor Login</Text>
            <Text style={styles.welcomeText}>Welcome back! Please login to continue</Text>
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
              />
            </View>
          </View>

          {/* ── Password ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Icon name="lock-outline" size={24} color="#3477eb" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Forgot Password ── */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* ── Login Button ── */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* ── Login with OTP ── */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLoginWithOtp}
            activeOpacity={0.8}
          >
            <Icon name="message-text-outline" size={22} color="#3477eb" style={styles.secondaryButtonIcon} />
            <Text style={styles.secondaryButtonText}>Login with OTP</Text>
          </TouchableOpacity>

          {/* ── Register Link ── */}
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegistration}>
              <Text style={styles.registrationLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── About Swagatam ── */}
        <TouchableOpacity
          style={styles.swagatamContainer}
          onPress={() => openExternalLink('https://swagatam.gov.in/public/About.aspx')}
          activeOpacity={0.7}
        >
          <View style={styles.swagatamHeader}>
            <Icon name="information-outline" size={20} color="#1E3A8A" />
            <Text style={styles.swagatamTitle}>About Swagatam</Text>
            <Icon name="open-in-new" size={16} color="#1E3A8A" style={styles.externalLinkIcon} />
          </View>
          <Text style={styles.swagatamText}>
            Swagatam is an initiative by the Government of India to facilitate the common man.
            Swagatam facility enables the citizens to have a smooth and simple process of making
            an appointment. It will bridge the gap between the Government and the common man and
            will enhance the opportunity of a common man to meet a government officer, hassle free.
          </Text>
        </TouchableOpacity>

        {/* ── Footer Menu Cards ── */}
        <View style={styles.footerMenuContainer}>
          {[
            { label: 'About Swagatam',   icon: 'information-outline',   url: 'https://swagatam.gov.in/public/About.aspx' },
            { label: 'Terms & Conditions', icon: 'file-document-outline', url: 'https://swagatam.gov.in/public/TermsofUse.aspx' },
            { label: 'Video Tutorial',   icon: 'play-circle-outline',   url: 'https://swagatam.gov.in/public/Videos.aspx' },
          ].map(({ label, icon, url }) => (
            <TouchableOpacity
              key={label}
              style={styles.footerMenuCard}
              activeOpacity={0.7}
              onPress={() => openExternalLink(url)}
            >
              <View style={styles.footerCardIconCircle}>
                <Icon name={icon} size={24} color="#3477eb" />
              </View>
              <Text style={styles.footerMenuText}>{label}</Text>
              <Icon name="open-in-new" size={18} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── NIC Logo ── */}
        <View style={styles.nicLogoContainer}>
          <Image
            source={require('../assets/images/niclogo.jpeg')}
            style={styles.nicLogo}
            resizeMode="contain"
          />
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
  inputWrapper:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  inputIconContainer:      { width: 50, height: 54, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  textInput:               { flex: 1, height: 54, paddingHorizontal: 16, fontSize: 15, color: '#0F172A', fontWeight: '400' },
  eyeIcon:                 { paddingHorizontal: 16, height: 54, justifyContent: 'center' },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText:      { fontSize: 14, color: '#3477eb', fontWeight: '600' },
  primaryButton:           { backgroundColor: '#3477eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#3477eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonDisabled:   { opacity: 0.6 },
  primaryButtonText:       { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  buttonIcon:              { marginLeft: 8 },
  dividerContainer:        { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  divider:                 { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText:             { marginHorizontal: 16, fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  secondaryButton:         { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 2, borderColor: '#3477eb' },
  secondaryButtonIcon:     { marginRight: 8 },
  secondaryButtonText:     { color: '#3477eb', fontSize: 17, fontWeight: '700' },
  registrationContainer:   { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registrationText:        { fontSize: 15, color: '#64748B' },
  registrationLink:        { fontSize: 15, color: '#3477eb', fontWeight: '700' },
  swagatamContainer:       { marginTop: 40, marginHorizontal: 24, marginBottom: 24, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#3477eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  swagatamHeader:          { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  swagatamTitle:           { fontSize: 15, fontWeight: '700', color: '#1E3A8A', marginLeft: 8, flex: 1 },
  externalLinkIcon:        { marginLeft: 4 },
  swagatamText:            { fontSize: 13, color: '#1E3A8A', textAlign: 'justify', lineHeight: 20, fontWeight: '400' },
  footerMenuContainer:     { paddingHorizontal: 24, marginBottom: 24, gap: 12 },
  footerMenuCard:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 2, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#3477eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  footerCardIconCircle:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  footerMenuText:          { fontSize: 15, color: '#334155', fontWeight: '600', flex: 1 },
  nicLogoContainer:        { alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  nicLogo:                 { width: '100%', height: 120 },
  footer:                  { marginTop: 16, alignItems: 'center', paddingHorizontal: 24 },
  footerText:              { fontSize: 13, color: '#94A3B8', marginBottom: 12, fontWeight: '500' },
  securityBadge:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  securityText:            { fontSize: 12, color: '#059669', fontWeight: '600', marginLeft: 6 },
});

export default VisitorLoginScreen;