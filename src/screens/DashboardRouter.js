import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './DashboardScreen';
import OfficerDashboard from './OfficerDashboard';

const DashboardRouter = ({ navigation }) => {
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

  // Show different dashboard based on role
  if (userRole === 'officer') {
    return <OfficerDashboard navigation={navigation} />;
  } else {
    return <DashboardScreen navigation={navigation} />;
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

export default DashboardRouter;