import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/image.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Added Title Section */}
        <Text style={styles.welcomeText}>Select Your Role</Text>
        <Text style={styles.subtitleText}>Choose how you want to proceed</Text>
      </View>

      {/* Role Links Section */}
      <View style={styles.linksSection}>
        {/* Visitor Link */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('VisitorLogin')}
          activeOpacity={0.7}
        >
          <Icon name="account-outline" size={24} color="#FFFFFF" />
          <Text style={styles.linkText}>Login as Visitor</Text>
          <Icon name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Officer Link */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('OfficerLogin')}
          activeOpacity={0.7}
        >
          <Icon name="shield-account-outline" size={24} color="#FFFFFF" />
          <Text style={styles.linkText}>Login as Officer</Text>
          <Icon name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Footer Logo */}
        <View style={styles.footerLogoContainer}>
          <Image
            source={require('../assets/images/nic1.png')}
            style={styles.footerLogoImage}
            resizeMode="contain"
          />
        </View>

        {/* Tricolor Bar */}
        <View style={styles.tricolorBar}>
          <View style={styles.saffron} />
          <View style={styles.white} />
          <View style={styles.green} />
        </View>
        
        <Text style={styles.footerText}>Government of India</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3477eb',
  },
  logoSection: {
    paddingTop: 80,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: width * 0.4,
    height: height * 0.06,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
    marginTop: 3,
  },
  subtitleText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  linksSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  linkText: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 16,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255, 255, 255, 0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerLogoContainer: {
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerLogoImage: {
    width: width * 0.9,
    height: height * 0.08,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: width * 0.4,
    height: 5,
    marginBottom: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  saffron: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  white: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  green: {
    flex: 1,
    backgroundColor: '#138808',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default RoleSelectionScreen;