import React, { useState, useRef, useEffect } from 'react';
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
const MAX_ATTEMPTS = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Shown on every app launch AFTER the first one, as long as a loginSession
// and a saved userMpin already exist in AsyncStorage (checked in App.js).
// User enters the PIN -> compared against AsyncStorage 'userMpin'.
// Match -> Home. No match -> stays here (with attempt counter).
// 'Forgot MPIN' clears the saved session/pin and drops back to normal login.
// ─────────────────────────────────────────────────────────────────────────────
const MpinLoginScreen = ({ navigation }) => {
  const [pin, setPin] = useState(new Array(PIN_LENGTH).fill(''));
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const pinRefs = useRef([]);

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserName(parsed?.name ?? '');
      }
    } catch (e) {
      console.log('Could not load user name:', e.message);
    }
  };

  const handlePinChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const arr = [...pin];
    arr[index] = digit;
    setPin(arr);
    setError('');

    if (digit && index < PIN_LENGTH - 1) {
      pinRefs.current[index + 1]?.focus();
    }

    // Auto-verify once all 4 digits are filled
    if (digit && index === PIN_LENGTH - 1) {
      const fullPin = arr.join('');
      if (fullPin.length === PIN_LENGTH) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (enteredPin) => {
    setLoading(true);
    try {
      const storedPin = await AsyncStorage.getItem('userMpin');

      if (storedPin && enteredPin === storedPin) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin(new Array(PIN_LENGTH).fill(''));
      setTimeout(() => pinRefs.current[0]?.focus(), 100);

      if (nextAttempts >= MAX_ATTEMPTS) {
        Alert.alert(
          'Too Many Attempts',
          'You have exceeded the maximum number of attempts. Please login with your password.',
          [{ text: 'OK', onPress: handleUseLoginInstead }],
        );
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - nextAttempts} attempt(s) remaining.`);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseLoginInstead = async () => {
    try {
      // Clear the saved session so App.js falls back to the normal login flow
      await AsyncStorage.multiRemove(['loginSession', 'userData', 'userRole', 'userMpin']);
    } catch (e) {
      console.log('Error clearing session:', e.message);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Icon name="lock-check-outline" size={40} color="#3477eb" />
        </View>
        <Text style={styles.headerTitle}>
          {userName ? `Welcome back, ${userName}` : 'Welcome back'}
        </Text>
        <Text style={styles.headerSubtitle}>Enter your 4-digit MPIN to continue</Text>
      </View>

      <View style={styles.pinSection}>
        <View style={styles.pinRow}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (pinRefs.current[index] = ref)}
              style={[
                styles.pinBox,
                digit ? styles.pinBoxFilled : null,
                error ? styles.pinBoxError : null,
              ]}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              textAlign="center"
              editable={!loading}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.forgotLink} onPress={handleUseLoginInstead}>
          <Text style={styles.forgotLinkText}>Forgot MPIN? Login with password</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  pinSection: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  pinRow: { flexDirection: 'row', marginBottom: 20 },
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
  pinBoxError: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  forgotLink: { marginTop: 20 },
  forgotLinkText: { color: '#3477eb', fontSize: 14, fontWeight: '600' },
});

export default MpinLoginScreen;