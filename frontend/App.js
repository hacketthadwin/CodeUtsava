import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { verifyInstallation } from 'nativewind';
import "./global.css";

// Auth Components
import SignIn from './components/auth/signin/SignIn';
import SignUp from './components/auth/signup/Signup';

// Main Dashboard Components
import Patient from './components/patient/Patient';
import Worker from './components/asha_worker/Worker';
import Child from './components/child/Child';
import Women from './components/women/Women';

// Doctor Components
import DoctorMainDashboard from './components/doctor/DoctorMainDashboard';
import DashboardScreen from './components/doctor/screens/DashboardScreen';
import PatientsScreen from './components/doctor/screens/PatientsScreen';
import ChatScreen from './components/doctor/screens/ChatScreen';
import NotificationsScreen from './components/doctor/screens/NotificationsScreen';
import ReportsScreen from './components/doctor/screens/ReportsScreen';

// Patient Components
import ChatWithDoctor from './components/patient/ChatWithDoctor';
import DoctorChat from './components/patient/DoctorChat';
import PastReports from './components/patient/PastReports';
import RequestConsult from './components/patient/RequestConsult';
import ContactSOS from './components/patient/ContactSOS';

// ASHA Worker Components
import ChatWithPatient from './components/asha_worker/ChatWithPatient';
import PatientChat from './components/asha_worker/PatientChat';
import UploadPatientRecord from './components/asha_worker/UploadPatientRecord';
import WorkerSchedule from './components/asha_worker/WorkerSchedule';
import PrivateConsults from './components/asha_worker/PrivateConsults';
import Safety from './components/asha_worker/Safety';

// Child Components
import VaccinationTracker from './components/child/Vaccination';
import GrowthAndMilestones from './components/child/GrowthMilestones';
import SymptomIllnessLog from './components/child/SymptomIllnessLog';
import WellnessLibrary from './components/child/Wellness';
import SafetyChild from './components/child/Safety';

// Women Components
import PeriodTracker from './components/women/PeriodTracker';
import PrivateConsultWomen from './components/women/PrivateConsults';
import SafetyWomen from './components/women/Safety';
import WellnessPage from './components/women/Wellness';

// Settings Components
import Settings from './components/settings/Settings';
import EditProfile from './components/settings/EditProfile';
import ManageNotification from './components/settings/ManageNotification';
import Theme from './components/settings/Themes';
import Language from './components/settings/Language';
import PrivacyPolicy from './components/settings/PrivacyPolicy';
import Terms from './components/settings/Terms';
import FAQ from './components/settings/FAQ';

// Profile Component
import Profile from './components/profile/Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'PatientDashboard') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'WorkerDashboard') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'DoctorDashboard') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="PatientDashboard" 
        component={Patient}
        options={{ 
          tabBarLabel: 'Patient',
          title: 'Patient Dashboard'
        }}
      />
      <Tab.Screen 
        name="WorkerDashboard" 
        component={Worker}
        options={{ 
          tabBarLabel: 'ASHA Worker',
          title: 'ASHA Worker'
        }}
      />
      <Tab.Screen 
        name="DoctorDashboard" 
        component={DoctorMainDashboard}
        options={{ 
          tabBarLabel: 'Doctor',
          title: 'Doctor Dashboard'
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Component with Theme
function AppContent() {
  const { theme, isDarkMode } = useTheme();
  
  // Create Paper theme based on our theme
  const paperTheme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: theme.primary,
      background: theme.paperBackground,
      surface: theme.paperSurface,
      onBackground: theme.paperText,
      onSurface: theme.paperText,
    },
  };
  
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={theme.statusBarStyle} backgroundColor={theme.statusBarBackground} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SignIn"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.headerBackground,
            },
            headerTintColor: theme.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: theme.headerText,
            },
            cardStyle: { backgroundColor: theme.background },
          }}
        >
        {/* Auth Screens */}
        <Stack.Screen 
          name="SignIn" 
          component={SignIn} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{ headerShown: false }}
        />
        
        {/* Main Dashboard */}
        <Stack.Screen 
          name="MainDashboard" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        
        {/* Patient Screens */}
        <Stack.Screen 
          name="Patient" 
          component={Patient} 
          options={{ title: 'Patient Dashboard' }}
        />
        <Stack.Screen 
          name="ChatWithDoctor" 
          component={ChatWithDoctor} 
          options={{ title: 'Chat with Doctor' }}
        />
        <Stack.Screen 
          name="DoctorChat" 
          component={DoctorChat} 
          options={{ title: 'Doctor Chat' }}
        />
        <Stack.Screen 
          name="PastReports" 
          component={PastReports} 
          options={{ title: 'Past Reports' }}
        />
        <Stack.Screen 
          name="RequestConsults" 
          component={RequestConsult} 
          options={{ title: 'Request Consultation' }}
        />
        <Stack.Screen 
          name="ContactSOS" 
          component={ContactSOS} 
          options={{ title: 'Emergency SOS' }}
        />
        
        {/* ASHA Worker Screens */}
        <Stack.Screen 
          name="Worker" 
          component={Worker} 
          options={{ title: 'ASHA Worker Dashboard' }}
        />
        <Stack.Screen 
          name="ChatWithPatient" 
          component={ChatWithPatient} 
          options={{ title: 'Chat with Patient' }}
        />
        <Stack.Screen 
          name="PatientChat" 
          component={PatientChat} 
          options={{ title: 'Patient Chat' }}
        />
        <Stack.Screen 
          name="UploadPatientRecord" 
          component={UploadPatientRecord} 
          options={{ title: 'Upload Patient Record' }}
        />
        <Stack.Screen 
          name="WorkerSchedule" 
          component={WorkerSchedule} 
          options={{ title: 'My Schedule' }}
        />
        <Stack.Screen 
          name="PrivateConsults" 
          component={PrivateConsults} 
          options={{ title: 'Private Consultations' }}
        />
        <Stack.Screen 
          name="Safety" 
          component={Safety} 
          options={{ title: 'Safety & SOS' }}
        />
        
        {/* Child Screens */}
        <Stack.Screen 
          name="Child" 
          component={Child} 
          options={{ title: 'Child Health Dashboard' }}
        />
        <Stack.Screen 
          name="VaccinationTracker" 
          component={VaccinationTracker} 
          options={{ title: 'Vaccination Tracker' }}
        />
        <Stack.Screen 
          name="GrowthAndMilestones" 
          component={GrowthAndMilestones} 
          options={{ title: 'Growth & Milestones' }}
        />
        <Stack.Screen 
          name="SymptomIllnessLog" 
          component={SymptomIllnessLog} 
          options={{ title: 'Symptom & Illness Log' }}
        />
        <Stack.Screen 
          name="WellnessLibrary" 
          component={WellnessLibrary} 
          options={{ title: 'Wellness Library' }}
        />
        <Stack.Screen 
          name="SafetyChild" 
          component={SafetyChild} 
          options={{ title: 'Safety & SOS' }}
        />
        
        {/* Women Screens */}
        <Stack.Screen 
          name="Women" 
          component={Women} 
          options={{ title: 'Women\'s Health Dashboard' }}
        />
        <Stack.Screen 
          name="PeriodTracker" 
          component={PeriodTracker} 
          options={{ title: 'Period Tracker' }}
        />
        <Stack.Screen 
          name="WomenPrivateConsults" 
          component={PrivateConsultWomen} 
          options={{ title: 'Private Consultations' }}
        />
        <Stack.Screen 
          name="WomenSafety" 
          component={SafetyWomen} 
          options={{ title: 'Safety & SOS' }}
        />
        <Stack.Screen 
          name="WomenWellness" 
          component={WellnessPage} 
          options={{ title: 'Wellness Library' }}
        />
        
        {/* Doctor Screens */}
        <Stack.Screen name="DoctorDashboard" component={DashboardScreen} />
        <Stack.Screen name="PatientsScreen" component={PatientsScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        
        {/* Settings Screens */}
        <Stack.Screen 
          name="Settings" 
          component={Settings} 
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfile} 
          options={{ title: 'Edit Profile' }}
        />
        <Stack.Screen 
          name="ManageNotification" 
          component={ManageNotification} 
          options={{ title: 'Manage Notifications' }}
        />
        <Stack.Screen 
          name="Theme" 
          component={Theme} 
          options={{ title: 'Theme Settings' }}
        />
        <Stack.Screen 
          name="Language" 
          component={Language} 
          options={{ title: 'Language Settings' }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicy} 
          options={{ title: 'Privacy Policy' }}
        />
        <Stack.Screen 
          name="Terms" 
          component={Terms} 
          options={{ title: 'Terms & Conditions' }}
        />
        <Stack.Screen 
          name="FAQ" 
          component={FAQ} 
          options={{ title: 'FAQ' }}
        />
        
        {/* Profile Screen */}
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{ title: 'My Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  verifyInstallation();

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
