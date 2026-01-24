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

const VisitorLoginScreen = ({ navigation }) => {
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = () => {
  if (mobileNo && password) {
    console.log('Login:', { mobileNo, password });
    // Navigate to Home screen
    navigation.navigate('Home');
  } else {
    Alert.alert('Error', 'Please enter mobile number and password');
  }
};

  const handleLoginWithOtp = () => {
    console.log('Login with OTP');
  };

  const handleRegistration = () => {
    navigation.navigate('VisitorRegister');
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.emblemContainer}>
            <View style={styles.emblemPlaceholder}>
              <Image
                source={require('../assets/images/satyamev.png')}
                style={styles.emblemImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.govTitle}>Government of India</Text>
        </View>
        <View style={styles.headerWave} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Visitor Login</Text>
            <Text style={styles.welcomeText}>Welcome back! Please login to continue</Text>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>📞</Text>
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

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>🔑</Text>
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
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* OTP Button */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleLoginWithOtp}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonIcon}>📲</Text>
            <Text style={styles.secondaryButtonText}>Login with OTP</Text>
          </TouchableOpacity>

          {/* Registration Link */}
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegistration}>
              <Text style={styles.registrationLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Swagatam Information */}
        <View style={styles.swagatamContainer}>
          <Text style={styles.swagatamText}>
            Swagatam is an initiative by the Government of India to facilitate the common man. 
            Swagatam facility enables the citizens to have a smooth and simple process of making 
            an appointment. It will bridge the gap between the Government and the common man and 
            will enhance the opportunity of a common man to meet a government officer, hassle free.
          </Text>
        </View>

        {/* Footer Menu */}
        <View style={styles.footerMenu}>
          <TouchableOpacity style={styles.footerMenuItem}>
            <Text style={styles.footerMenuDot}>•</Text>
            <Text style={styles.footerMenuText}>About Swagatam</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerMenuItem}>
            <Text style={styles.footerMenuDot}>•</Text>
            <Text style={styles.footerMenuText}>Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerMenuItem}>
            <Text style={styles.footerMenuDot}>•</Text>
            <Text style={styles.footerMenuText}>Video Tutorial</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secured by Government Authentication</Text>
          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>SSL Encrypted</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    backgroundColor: '#3477eb',
    paddingTop: 50,
    paddingBottom: 40,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  emblemContainer: {
    marginBottom: 15,
  },
  emblemPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#0A2463',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  emblemImage: {
    width: 120,
    height: 100,
    marginLeft:7,
  },
  govTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '400',
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  titleSection: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
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
  inputIconContainer: {
    width: 50,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  inputIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '400',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  eyeIconText: {
    fontSize: 20,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A2463',
  },
  secondaryButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#0A2463',
    fontSize: 17,
    fontWeight: '700',
  },
  registrationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registrationText: {
    fontSize: 15,
    color: '#64748B',
  },
  registrationLink: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  swagatamContainer: {
    marginTop: 40,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0A2463',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  swagatamText: {
    fontSize: 13,
    color: '#1E3A8A',
    textAlign: 'justify',
    lineHeight: 20,
    fontWeight: '400',
  },
  footerMenu: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  footerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerMenuDot: {
    fontSize: 18,
    color: '#0A2463',
    marginRight: 8,
    fontWeight: '700',
  },
  footerMenuText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
    fontWeight: '500',
  },
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
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});

export default VisitorLoginScreen;