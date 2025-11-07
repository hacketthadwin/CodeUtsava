import React, { useState, useMemo, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
    Provider as PaperProvider,
    MD3LightTheme,
    MD3DarkTheme,
} from "react-native-paper";
import { verifyInstallation } from "nativewind";
import { Text } from "react-native";
import "./global.css";

// === CONTEXTS ===
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// --- Auth Context for Role Management ---
// CRITICAL: Export AuthContext so other files (like Profile.js and chat screens) can import it!
export const AuthContext = React.createContext(); 

// === AUTH COMPONENTS ===
import SignIn from "./components/auth/signin/SignIn";
import SignUp from "./components/auth/signup/Signup";

// === DOCTOR COMPONENTS ===
import DashboardScreen from "./components/doctor/screens/DashboardScreen";
import PatientsScreen from "./components/doctor/screens/PatientsScreen";

// Doctor Chat List and Doctor-side Patient Chat Room (PatientChatRoom)
import DoctorChatListScreen, { PatientChatRoom } from "./components/doctor/screens/ChatScreen"; 

import NotificationsScreen from "./components/doctor/screens/NotificationsScreen";
import ReportsScreen from "./components/doctor/screens/ReportsScreen";
import DoctorMainDashboard from "./components/doctor/DoctorMainDashboard";

// === PATIENT COMPONENTS ===
import Patient from "./components/patient/Patient";
// Patient Accepted Doctor List (Where chat navigation originates)
import ChatWithDoctor from "./components/patient/ChatWithDoctor";
// Patient Chat Room (The component where the patient chats with a doctor)
import DoctorChat from "./components/patient/DoctorChat"; 
import PastReports from "./components/patient/PastReports";
import RequestConsult from "./components/patient/RequestConsult";
import ContactSOS from "./components/patient/ContactSOS";

// === SETTINGS COMPONENTS ===
import Settings from "./components/settings/Settings";
import EditProfile from "./components/settings/EditProfile";
import ManageNotification from "./components/settings/ManageNotification";
import Theme from "./components/settings/Themes";
import Language from "./components/settings/Language";
import PrivacyPolicy from "./components/settings/PrivacyPolicy";
import Terms from "./components/settings/Terms";
import FAQ from "./components/settings/FAQ";

// === PROFILE COMPONENT ===
import Profile from "./components/profile/Profile";

import AdminPanel from "./components/admin/AdminPanel";
import AdminGate from './components/admin/AdminGate';

const Stack = createStackNavigator();

// ===============================================================
// 1. NEW: Simple Admin Panel Navigator
// This defines the specific navigation flow for the Admin role.
// ===============================================================
function AdminMainNavigator() {
    return (
        <Stack.Navigator 
            initialRouteName="AdminDashboard"
            // You can choose to hide or show the header here. 
            // Setting it to 'false' often works better for main dashboard views.
            screenOptions={{ headerShown: false }} 
        >
            <Stack.Screen 
                name="AdminDashboard" 
                component={AdminPanel} 
            />
            {/* Add any sub-screens specific to the Admin flow here, if needed later */}
            {/* <Stack.Screen name="AdminSettings" component={AdminSettings} /> */}
        </Stack.Navigator>
    );
}

// ===============================================================
// 2. UPDATED: Role-based navigation: adds the Admin check
// ===============================================================
function RoleSwitchNavigator() {
    const { role } = useContext(AuthContext);

    if (role === "Doctor") {
        return <DoctorMainDashboard />;
    } else if (role === "Patient") {
        return <Patient />;
    } else if (role === "Admin") { // <-- NEW ADMIN CHECK
        return <AdminMainNavigator />; // <-- Returns the Admin navigator
    }

    return (
        <Text
            style={{
                flex: 1,
                backgroundColor: "black",
                color: "white",
                textAlign: "center",
                paddingTop: 100,
            }}
        >
            Error: Invalid or Missing User Role. Please try signing in again.
        </Text>
    );
}

// ===============================================================
// Main App content (handles theme + auth navigation)
// ===============================================================
function AppContent() {
    const { theme, isDarkMode } = useTheme();

    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    
    // State holding the full user object
    const [userData, setCurrentUserData] = useState(null); 

    const authContext = useMemo(
        () => ({
            // The signIn function now accepts full user data (newUserData)
            signIn: async (token, role, newUserData = null) => {
                setUserToken(token);
                // CRITICAL: Ensure you pass 'Admin' for an admin user here.
                setUserRole(role); 
                // CRITICAL: Set the full user object
                setCurrentUserData(newUserData); 
            },
            signOut: () => {
                setUserToken(null);
                setUserRole(null);
                setCurrentUserData(null); // Clear user data on sign out
            },
            userToken,
            role: userRole,
            // CRITICAL: Expose the full user object as 'user' for consistent access
            user: userData, 
        }),
        [userToken, userRole, userData]
    );

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
        <AuthContext.Provider value={authContext}>
            <PaperProvider theme={paperTheme}>
                <StatusBar
                    style={theme.statusBarStyle}
                    backgroundColor={theme.statusBarBackground}
                />
                <NavigationContainer>
                    {/* The AdminPanel component was standalone. Removed it to use in RoleSwitchNavigator. */}
                    {/* <AdminPanel /> */} 
                    <Stack.Navigator
                        initialRouteName={userToken ? "RoleSwitch" : "SignIn"}
                        screenOptions={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: theme.headerBackground,
                            },
                            headerTintColor: theme.primary,
                            headerTitleStyle: {
                                fontWeight: "bold",
                                color: theme.headerText,
                            },
                            cardStyle: { backgroundColor: theme.background },
                        }}
                    >
                        {userToken ? (
                            <>
                                {/* Entry point after login */}
                                <Stack.Screen
                                    name="RoleSwitch"
                                    component={RoleSwitchNavigator}
                                    options={{ headerShown: false }}
                                />

                                {/* 3. NEW: Admin Screen Register (For deep linking or navigation from shared screens) */}
                                {userRole === "Admin" && (
                                    <Stack.Group>
                                        <Stack.Screen 
                                            name="AdminPanelDetail" // Use a different name to avoid conflict with AdminMainNavigator
                                            component={AdminPanel} 
                                            options={{ title: "Admin Panel Detail" }} 
                                        />
                                    </Stack.Group>
                                )}

                                {/* Doctor-specific screens (kept for context) */}
                                {userRole === "Doctor" && (
                                    <Stack.Group>
                                        {/* ... Doctor Screens ... */}
                                        <Stack.Screen name="DoctorDashboard" component={DashboardScreen} options={{ title: "Doctor Dashboard" }}/>
                                        <Stack.Screen name="PatientsScreen" component={PatientsScreen} options={{ title: "Manage Patients" }}/>
                                        <Stack.Screen name="ChatScreen" component={DoctorChatListScreen} options={{ title: "Patient Consults" }}/>
                                        <Stack.Screen name="PatientChatRoom" component={PatientChatRoom} options={{ title: "Chat" }}/>
                                        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} options={{ title: "Notifications" }}/>
                                        <Stack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: "Reports" }}/>
                                    </Stack.Group>
                                )}

                                {/* Patient-specific screens (kept for context) */}
                                {userRole === "Patient" && (
                                    <Stack.Group>
                                        {/* ... Patient Screens ... */}
                                        <Stack.Screen name="Patient" component={Patient} options={{ title: "Patient Dashboard" }}/>
                                        <Stack.Screen name="ChatWithDoctor" component={ChatWithDoctor} options={{ title: "Your Doctors" }}/>
                                        <Stack.Screen name="DoctorChat" component={DoctorChat} options={{ title: "Doctor Chat" }}/>
                                        <Stack.Screen name="PastReports" component={PastReports} options={{ title: "Past Reports" }}/>
                                        <Stack.Screen name="RequestConsult" component={RequestConsult} options={{ title: "Request Consultation" }}/>
                                        <Stack.Screen name="ContactSOS" component={ContactSOS} options={{ title: "Emergency SOS" }}/>
                                    </Stack.Group>
                                )}

                                {/* Shared screens */}
                                <Stack.Screen name="Settings" component={Settings} options={{ title: "Settings" }}/>
                                <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: "Edit Profile" }}/>
                                <Stack.Screen name="ManageNotification" component={ManageNotification} options={{ title: "Manage Notifications" }}/>
                                <Stack.Screen name="Theme" component={Theme} options={{ title: "Theme Settings" }}/>
                                <Stack.Screen name="Language" component={Language} options={{ title: "Language Settings" }}/>
                                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ title: "Privacy Policy" }}/>
                                <Stack.Screen name="Terms" component={Terms} options={{ title: "Terms & Conditions" }}/>
                                <Stack.Screen name="FAQ" component={FAQ} options={{ title: "FAQ" }}/>
                                <Stack.Screen name="Profile" component={Profile} options={{ title: "My Profile" }}/>
                                <Stack.Screen name="AdminGate" component={AdminGate} options={{ title: "Admin Login" }}/> 

                            </>
                        ) : (
                            <>
                                {/* Unauthenticated flow */}
                                <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }}/>
                                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </AuthContext.Provider>
    );
}

// ===============================================================
// App Root Wrapper
// ===============================================================
export default function App() {
    verifyInstallation();

    return (
        <ThemeProvider>
            {/* The main content that uses context hooks */}
            <AppContent /> 
        </ThemeProvider>
    );
}