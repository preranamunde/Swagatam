import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import VisitorLoginScreen from './src/screens/VisitorLoginScreen';
import VisitorLoginOtpScreen from './src/screens/VisitorLoginOtpScreen';
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
import ContactUsScreen from './src/screens/ContactUsScreen';
// ── NEW: MPIN screens ──────────────────────────────────────────────────────
import MpinSetupScreen from './src/screens/MpinSetupScreen';
import MpinLoginScreen from './src/screens/MpinLoginScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';

enableScreens();

const Stack = createNativeStackNavigator();

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialRoute, setInitialRoute] = useState('RoleSelection');

  // Runs once, in parallel with the splash timer, to decide where to land.
  useEffect(() => {
    checkLaunchState();
  }, []);

  const checkLaunchState = async () => {
    try {
      const loginSession = await AsyncStorage.getItem('loginSession');
      const storedMpin = await AsyncStorage.getItem('userMpin');

      if (loginSession) {
        const session = JSON.parse(loginSession);

        if (session?.Vis_Reg_No) {
          // Already logged in before (Vis_Reg_No present).
          if (storedMpin) {
            // MPIN already created -> ask for it instead of full login.
            setInitialRoute('MpinLogin');
          } else {
            // Edge case: session exists but no PIN was ever saved -> set one up.
            setInitialRoute('MpinSetup');
          }
        } else {
          setInitialRoute('RoleSelection');
        }
      } else {
        // First time launch / no saved session -> normal login flow.
        setInitialRoute('RoleSelection');
      }
    } catch (e) {
      console.log('Error checking launch state:', e.message);
      setInitialRoute('RoleSelection');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Keep showing splash until BOTH the splash timer finishes AND the
  // AsyncStorage check completes, so we never flash the wrong screen.
  if (showSplash || isCheckingAuth) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
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
            name="VisitorLoginOtp"
            component={VisitorLoginOtpScreen}
          />
          <Stack.Screen
            name="OfficerLogin"
            component={OfficerLoginScreen}
          />
          <Stack.Screen
            name="VisitorRegister"
            component={VisitorRegisterScreen}
          />
          {/* ── NEW: MPIN screens ── */}
          <Stack.Screen
            name="MpinSetup"
            component={MpinSetupScreen}
          />
          <Stack.Screen
            name="MpinLogin"
            component={MpinLoginScreen}
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
          <Stack.Screen name="ContactUs" component={ContactUsScreen}/>
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen}/>
          <Stack.Screen name="ForgotPasswordVisitor" component={ForgotPasswordVisitorScreen} />
          <Stack.Screen name="ForgotPasswordOfficer" component={ForgotPasswordOfficerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;