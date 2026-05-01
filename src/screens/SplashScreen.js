import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Text,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to login screen after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          

          <Image
            source={require('../assets/images/swagatam.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          
          <View style={styles.textContainer}>
            <Text style={styles.tagline}>No Waiting, No Queues, No Delays...</Text>
            <Text style={styles.mainText}>Make An Appointment With</Text>
            <Text style={styles.mainText}>Government</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.tricolorBar}>
            <View style={styles.saffron} />
            <View style={styles.white} />
            <View style={styles.green} />
          </View>
          <Text style={styles.footerText}>Government of India Initiative</Text>
          <Text style={styles.footerTextSmall}>
            Developed by National Informatics Centre
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3477eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emblemImage: {
    width: 85,
    height: 85,
  },
  logoImage: {
    width: width * 0.65,
    height: height * 0.2,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 15,
    color: '#CBD5E1',
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  tricolorBar: {
    flexDirection: 'row',
    width: width * 0.5,
    height: 5,
    marginBottom: 20,
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  footerTextSmall: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '400',
  },
});

export default SplashScreen;