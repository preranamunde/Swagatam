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
} from 'react-native';

const VisitorRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  const handleSendOTP = () => {
    if (!name || !gender || !mobileNo) {
      alert('Please fill all required fields');
      return;
    }
    console.log('Send OTP:', { name, gender, mobileNo });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const selectGender = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderDropdown(false);
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
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
          <Text style={styles.subtitle}>Digital Governance Portal</Text>
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
            <Text style={styles.mainTitle}>Visitor Registration</Text>
            <Text style={styles.welcomeText}>Create your account to get started</Text>
          </View>

          {/* Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>👤</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Gender Selection with Dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Gender <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity 
                style={styles.inputWrapper}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                activeOpacity={0.7}
              >
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>⚧</Text>
                </View>
                <View style={styles.selectInput}>
                  <Text style={gender ? styles.selectedText : styles.placeholderText}>
                    {gender || 'Select your gender'}
                  </Text>
                </View>
                <View style={styles.dropdownIconContainer}>
                  <Text style={styles.dropdownIcon}>{showGenderDropdown ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {/* Dropdown Options */}
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        index === genderOptions.length - 1 && styles.dropdownItemLast,
                        gender === option && styles.dropdownItemSelected
                      ]}
                      onPress={() => selectGender(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        gender === option && styles.dropdownItemTextSelected
                      ]}>
                        {option}
                      </Text>
                      {gender === option && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Mobile Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>📱</Text>
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

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              An OTP will be sent to your mobile number for verification
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleSendOTP}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.loginLink}>Login Here</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>About Swagatam</Text>
            <Text style={styles.footerText}>
              Swagatam is an initiative by the Government of India to facilitate 
              citizens. This platform enables a smooth and simple appointment process, 
              bridging the gap between the Government and citizens.
            </Text>
          </View>
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
    backgroundColor: '#0A2463',
    paddingTop: 50,
    paddingBottom: 40,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
  marginTop:-20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
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
    width: 110,
    height: 100,
    marginLeft:5,
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
  required: {
    color: '#EF4444',
    fontSize: 16,
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
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  selectInput: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  selectedText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownIconContainer: {
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#64748B',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#0A2463',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: '#0A2463',
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 14,
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
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 17,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  loginText: {
    fontSize: 15,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  footerCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
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
    alignSelf: 'center',
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

export default VisitorRegisterScreen;