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
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfficerLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (email && password) {
      console.log('Officer Login:', { email, password });
      
      // Store role as 'officer'
      try {
        await AsyncStorage.setItem('userRole', 'officer');
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          email: email, 
          name: 'Officer Suresh' 
        }));
        
        // Navigate to Home screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        
      } catch (error) {
        console.error('Error saving officer data:', error);
        Alert.alert('Error', 'Failed to login. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  const handleForgotPassword = () => {
  navigation.navigate('ForgotPasswordOfficer');
};

  const handleBackToRoleSelection = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToRoleSelection}
        >
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
            <Text style={styles.mainTitle}>Officer Login</Text>
            <Text style={styles.welcomeText}>Access your officer dashboard</Text>
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email ID</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Icon name="email-outline" size={24} color="#3477eb" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your official email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
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
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={22} 
                  color="#64748B" 
                />
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
            <Text style={styles.primaryButtonText}>Login as Officer</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon name="information-outline" size={24} color="#F59E0B" />
            <Text style={styles.infoText}>
              This portal is exclusively for government officers. 
              Please use your official credentials to login.
            </Text>
          </View>
        </View>

        {/* Footer with NIC Logo */}
        <View style={styles.footer}>
          <Image 
            source={require('../assets/images/niclogo.jpeg')} 
            style={styles.nicLogo}
            resizeMode="contain"
          />
          
          {/* Tagline */}
          <Text style={styles.tagline}>Secured by Government Authentication</Text>
          
          {/* Indian Flag Color Line */}
          <View style={styles.flagLineContainer}>
            <View style={[styles.flagLine, styles.saffron]} />
            <View style={[styles.flagLine, styles.white]} />
            <View style={[styles.flagLine, styles.green]} />
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
    paddingTop: 30,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 140,
    height: 40,
  },
  govTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3477eb',
    fontWeight: '600',
  },
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  nicLogo: {
    width: '200%',
    height: 120,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  flagLineContainer: {
    flexDirection: 'row',
    marginTop: 12,
    width: 120,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  flagLine: {
    flex: 1,
    height: '100%',
  },
  saffron: {
    backgroundColor: '#FF9933',
  },
  white: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  green: {
    backgroundColor: '#138808',
  },
});

export default OfficerLoginScreen;