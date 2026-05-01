import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import OfficerHomeScreen from './OfficerHomeScreen';

const HomeRouter = ({ navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      setLoading(false);
    } catch (error) {
      console.error('Error loading role:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0A2463" />
      </View>
    );
  }

  // Show different screen based on role
  if (userRole === 'officer') {
    return <OfficerHomeScreen navigation={navigation} />;
  } else {
    return <HomeScreen navigation={navigation} />;
  }
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default HomeRouter;