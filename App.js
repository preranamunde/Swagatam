import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import VisitorLoginScreen from './src/screens/VisitorLoginScreen';
import OfficerLoginScreen from './src/screens/OfficerLoginScreen';
import VisitorRegisterScreen from './src/screens/VisitorRegisterScreen';
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
import OfficerHomeScreen from './src/screens/OfficerHomeScreen';
import HomeRouter from './src/screens/HomeRouter';
import DashboardRouter from './src/screens/DashboardRouter';
import CreateVisitorVisitScreen from './src/screens/CreateVisitorVisitScreen';
import MyProfileScreen from './src/screens/MyProfileScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import ApproveAppointmentsScreen from './src/screens/ApproveAppointmentsScreen';
import VisitorTemporaryPassScreen from './src/screens/VisitorTemporaryPassScreen';
import ApprovedTempPassScreen from './src/screens/ApprovedTempPassScreen';
import TemporaryPassDetailScreen from './src/screens/TemporaryPassDetailScreen';
import VisitorDetailScreen from './src/screens/VisitorDetailScreen';
import VisitorDetailsDailyPass from './src/screens/VisitorDetailsDailyPass';
import ForgotPasswordVisitorScreen from './src/screens/ForgotPasswordVisitorScreen';
import ForgotPasswordOfficerScreen from './src/screens/ForgotPasswordOfficerScreen';


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
          initialRouteName="RoleSelection"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="RoleSelection" 
            component={RoleSelectionScreen} 
          />
          <Stack.Screen 
            name="VisitorLogin" 
            component={VisitorLoginScreen} 
          />
          <Stack.Screen 
            name="OfficerLogin" 
            component={OfficerLoginScreen} 
          />
          <Stack.Screen 
            name="VisitorRegister" 
            component={VisitorRegisterScreen} 
          />
          <Stack.Screen 
            name="PersonalDetails" 
            component={PersonalDetailsScreen}
          />
          <Stack.Screen 
            name="CreateAppointment" 
            component={CreateAppointmentScreen}
          />
          <Stack.Screen name="Homes" component={HomeScreen} />
          <Stack.Screen 
            name="Dashboards" 
            component={DashboardScreen}
          />
          <Stack.Screen 
            name="TemporaryPass" 
            component={TemporaryPassScreen}
          />
          <Stack.Screen 
            name="TemporaryPassInstructions" 
            component={TemporaryPassInstructionsScreen}
          />
          <Stack.Screen 
            name="ActiveTempPass" 
            component={ActiveTempPassScreen}
          />
          <Stack.Screen 
            name="AboutSwagatam" 
            component={AboutSwagatamScreen}
          />
          <Stack.Screen 
            name="TodaysPass" 
            component={TodaysPassScreen}
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
          <Stack.Screen 
  name="OfficerHome" 
  component={OfficerHomeScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen name="Home" component={HomeRouter} />
        <Stack.Screen name="Dashboard" component={DashboardRouter} />
        <Stack.Screen 
  name="CreateVisitorVisit" 
  component={CreateVisitorVisitScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="MyProfile" 
  component={MyProfileScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen name="AppointmentsScreen" component={AppointmentsScreen} options={{ headerShown: false }} />
<Stack.Screen name="ApproveAppointments" component={ApproveAppointmentsScreen} />
<Stack.Screen 
  name="VisitorTemporaryPassScreen" 
  component={VisitorTemporaryPassScreen} 
  options={{ headerShown: false }} 
/>
<Stack.Screen 
  name="ApprovedTempPassScreen" 
  component={ApprovedTempPassScreen} 
  options={{ headerShown: false }} 
/>
<Stack.Screen 
  name="TemporaryPassDetail" 
  component={TemporaryPassDetailScreen}
/>
<Stack.Screen 
  name="VisitorDetailScreen" 
  component={VisitorDetailScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="VisitorDailyPassDetail" 
  component={VisitorDetailsDailyPass} 
  options={{ headerShown: false }}
/>
<Stack.Screen name="ForgotPasswordVisitor" component={ForgotPasswordVisitorScreen} />
<Stack.Screen name="ForgotPasswordOfficer" component={ForgotPasswordOfficerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;