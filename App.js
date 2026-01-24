import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import VisitorLoginScreen from './src/screens/VisitorLoginScreen';
import VisitorRegisterScreen from './src/screens/VisitorRegisterScreen';

// Add this import
import { enableScreens } from 'react-native-screens';
import PersonalDetailsScreen from './src/screens/PersonalDetailsScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateAppointmentScreen from './src/screens/CreateAppointmentScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TemporaryPassScreen from './src/screens/TemporaryPassScreen';
import TemporaryPassInstructionsScreen from './src/screens/TemporaryPassInstructionsScreen';
import ActiveTempPassScreen from './src/screens/ActiveTempPassScreen';
import AboutSwagatamScreen from './src/screens/AboutSwagatamScreen';
import TodaysPassScreen from './src/screens/TodaysPassScreen';
import MyActivePassScreen from './src/screens/MyActivePassScreen';
import TodayAppointmentDetailScreen from './src/screens/TodayAppointmentDetailScreen';
enableScreens();

const Stack = createNativeStackNavigator();

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="VisitorLogin"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="VisitorLogin" 
            component={VisitorLoginScreen} 
          />
          <Stack.Screen 
            name="VisitorRegister" 
            component={VisitorRegisterScreen} 
          />
          <Stack.Screen 
  name="PersonalDetails" 
  component={PersonalDetailsScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="CreateAppointment" 
  component={CreateAppointmentScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen name="Home" component={HomeScreen} />
<Stack.Screen 
  name="Dashboard" 
  component={DashboardScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="TemporaryPass" 
  component={TemporaryPassScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="TemporaryPassInstructions" 
  component={TemporaryPassInstructionsScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ActiveTempPass" 
  component={ActiveTempPassScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="AboutSwagatam" 
  component={AboutSwagatamScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="TodaysPass" 
  component={TodaysPassScreen}
  options={{ headerShown: false }}
/>
 <Stack.Screen name="MyActivePasses" component={MyActivePassScreen} />
 <Stack.Screen 
          name="TodayAppointmentDetail" 
          component={TodayAppointmentDetailScreen}
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;