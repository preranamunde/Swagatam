import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PIN_LENGTH = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Shown ONCE, immediately after a successful mobile/password (or OTP) login.
// Step 1: user types a 4-digit PIN.
// Step 2: user re-types it to confirm (prevents accidental lock-out from a typo).
// On confirm -> PIN is saved to AsyncStorage under 'userMpin' -> navigate Home.
// ─────────────────────────────────────────────────────────────────────────────
const MpinSetupScreen = ({ navigation }) => {
  const [pin, setPin] = useState(new Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState(new Array(PIN_LENGTH).fill(''));
  const [step, setStep] = useState('create'); // 'create' | 'confirm'
  const [loading, setLoading] = useState(false);

  const pinRefs = useRef([]);
  const confirmRefs = useRef([]);

  const handlePinChange = (text, index, isConfirm) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const arr = isConfirm ? [...confirmPin] : [...pin];
    arr[index] = digit;
    isConfirm ? setConfirmPin(arr) : setPin(arr);

    const refs = isConfirm ? confirmRefs : pinRefs;
    if (digit && index < PIN_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index, isConfirm) => {
    const arr = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmRefs : pinRefs;
    if (e.nativeEvent.key === 'Backspace' && !arr[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== PIN_LENGTH) {
      return Alert.alert('Invalid PIN', `Please enter a ${PIN_LENGTH}-digit PIN.`);
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const enteredPin = pin.join('');
    const confirmedPin = confirmPin.join('');

    if (confirmedPin.length !== PIN_LENGTH) {
      return Alert.alert('Invalid PIN', `Please re-enter your ${PIN_LENGTH}-digit PIN.`);
    }

    if (enteredPin !== confirmedPin) {
      Alert.alert('PIN Mismatch', 'The PINs you entered do not match. Please try again.');
      setPin(new Array(PIN_LENGTH).fill(''));
      setConfirmPin(new Array(PIN_LENGTH).fill(''));
      setStep('create');
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('userMpin', enteredPin);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to save MPIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = () => {
    setConfirmPin(new Array(PIN_LENGTH).fill(''));
    setStep('create');
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const currentPinArray = step === 'create' ? pin : confirmPin;
  const currentRefs = step === 'create' ? pinRefs : confirmRefs;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Icon name="lock-outline" size={40} color="#3477eb" />
        </View>
        <Text style={styles.headerTitle}>
          {step === 'create' ? 'Set Your MPIN' : 'Confirm Your MPIN'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {step === 'create'
            ? 'Create a 4-digit PIN for quick and secure access next time'
            : 'Re-enter your PIN to confirm it'}
        </Text>
      </View>

      <View style={styles.pinSection}>
        <View style={styles.pinRow}>
          {currentPinArray.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (currentRefs.current[index] = ref)}
              style={[styles.pinBox, digit ? styles.pinBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index, step === 'confirm')}
              onKeyPress={(e) => handleKeyPress(e, index, step === 'confirm')}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              textAlign="center"
            />
          ))}
        </View>

        {step === 'create' ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Saving...' : 'Confirm & Continue'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backLink} onPress={handleChangePin}>
              <Text style={styles.backLinkText}>Change PIN</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection: {
    backgroundColor: '#3477eb',
    paddingTop: 70,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  pinSection: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  pinRow: { flexDirection: 'row', marginBottom: 40 },
  pinBox: {
    width: 55,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginHorizontal: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  pinBoxFilled: { borderColor: '#3477eb', backgroundColor: '#F0F7FF' },
  primaryButton: {
    backgroundColor: '#3477eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#3477eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  backLink: { marginTop: 16 },
  backLinkText: { color: '#3477eb', fontSize: 14, fontWeight: '600' },
});

export default MpinSetupScreen;