import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import doctor screens
import DashboardScreen from './screens/DashboardScreen';
import PatientsScreen from './screens/PatientsScreen';
import ChatScreen from './screens/ChatScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ReportsScreen from './screens/ReportsScreen';

const Tab = createMaterialTopTabNavigator();

export default function DoctorMainDashboard() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: theme.primary,
            elevation: 4,
            shadowOpacity: 0.3,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#e0e0e0',
          tabBarIndicatorStyle: {
            backgroundColor: '#ffffff',
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 8,
            fontWeight: '900',
            textTransform: 'none',
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            let size = 20;

            if (route.name === 'Dashboard') {
              iconName = 'home';
            } else if (route.name === 'Patients') {
              iconName = 'people';
            } else if (route.name === 'Chat') {
              iconName = 'chatbubbles';
            } else if (route.name === 'Notifications') {
              iconName = 'notifications';
            } else if (route.name === 'Reports') {
              iconName = 'document-text';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarShowIcon: true,
        })}
        initialRouteName="Dashboard"
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen 
          name="Patients" 
          component={PatientsScreen}
          options={{
            tabBarLabel: 'Patients',
          }}
        />
        <Tab.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{
            tabBarLabel: 'Chat',
          }}
        />
        <Tab.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{
            tabBarLabel: 'Alerts',
          }}
        />
        <Tab.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{
            tabBarLabel: 'Reports',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
  },
});
