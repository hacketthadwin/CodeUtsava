import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../App';
import AvatarMenu from '../patient/othercomps/AvatarMenu';

// Import doctor screen contents
import DashboardContent from './screens/DashboardScreen';
import PatientsContent from './screens/PatientsScreen';
import ChatContent from './screens/ChatScreen';
import RequestContent from './screens/RequestScreen';
import NotificationsScreen from './screens/NotificationsScreen';

const COLORS = {
  primary: '#311B92',
  secondary: '#880E4F',
  tertiary: '#1B5E20',
  danger: '#B71C1C',
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
  darkyellow: '#b88600',
};

const DoctorMainDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { signOut } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showSchedule] = useState(true);

  const samplePatients = [
    { id: 1, name: 'Rohit Sharma', age: 34, lastVisit: '2025-11-18' },
    { id: 2, name: 'Priya Singh', age: 28, lastVisit: '2025-11-19' },
  ];

  const StatCard = ({ title, value }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card || COLORS.white }]}>
      <Text style={[styles.statTitle, { color: theme.textSecondary || COLORS.black }]}>{title}</Text>
      <Text style={[styles.statValue, { color: theme.text || COLORS.primary }]}>{value}</Text>
    </View>
  );

  const PatientListItem = ({ p }) => (
    <View style={[styles.patientCard, { backgroundColor: theme.card || COLORS.white, borderLeftColor: COLORS.primary }]}>
      <Text style={[styles.patientName, { color: theme.text }]}>{p.name}</Text>
      <Text style={[styles.patientMeta, { color: theme.textSecondary }]}>{p.age} yrs • Last: {p.lastVisit}</Text>
    </View>
  );

  const renderContent = () => {
    const tabHeight = 50;
    const totalBottomPadding = tabHeight + insets.bottom + 20;

    switch (activeTab) {
      case 'Requests':
        return <RequestContent navigation={navigation} />;
      case 'Patients':
        return <PatientsContent navigation={navigation} />;
      case 'Chat':
        return <ChatContent navigation={navigation} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} />;
      case 'Dashboard':
      default:
        return (
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: totalBottomPadding }]}>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Welcome back, <Text style={{ fontWeight: 'bold' }}>Doctor</Text>
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>

            {showSchedule && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: COLORS.primary, marginBottom: 12 }]}
                onPress={() =>
                  Alert.alert(
                    "Today's Schedule",
                    '09:00 AM - Patient: Rohit Sharma\n10:30 AM - Patient: Priya Singh'
                  )
                }
              >
                <Text style={styles.primaryButtonText}>Today's Schedule</Text>
              </TouchableOpacity>
            )}

            <View style={styles.statsRow}>
              <StatCard title="Patients Today" value="12" />
              <StatCard title="New Messages" value="3" />
              <StatCard title="Pending Reports" value="5" />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Patients</Text>
            {samplePatients.map((p) => (
              <PatientListItem key={p.id} p={p} />
            ))}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: COLORS.darkBlue }]}
              onPress={() => setActiveTab('Requests')}
            >
              <Text style={styles.primaryButtonText}>New Requests</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  const TabBar = () => {
    const tabs = [
      { name: 'Dashboard', label: 'Home', icon: '🏠' },
      { name: 'Patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
      { name: 'Chat', label: 'Chat', icon: '💬' },
      { name: 'Notifications', label: 'Alerts', icon: '🔔' },
    ];

    return (
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: insets.bottom,
            backgroundColor: theme.tabBarBackground || COLORS.white,
            borderTopColor: theme.tabBarBorder || COLORS.gray,
          },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButtonNav}
            onPress={() => setActiveTab(tab.name)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab.name === activeTab ? COLORS.primary : theme.textSecondary || '#888' },
              ]}
            >
              {tab.icon} {'\n'}
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={styles.headerContainer}>
          <AvatarMenu
            avatarUri={null}
            onProfile={() => navigation.navigate('Profile')}
            onSettings={() => navigation.navigate('Settings')}
            onLogout={() => signOut()}
          />
        </View>

        <View style={styles.contentArea}>{renderContent()}</View>

        <TabBar />
      </View>
    </GestureHandlerRootView>
  );
};

export default DoctorMainDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 8 },
  contentArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  greeting: { fontSize: 26, fontWeight: 'bold', marginTop: 6, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 18, marginBottom: 10 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statTitle: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },

  patientCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  patientName: { fontSize: 16, fontWeight: '700' },
  patientMeta: { fontSize: 13, marginTop: 6 },

  primaryButton: { marginTop: 18, padding: 14, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 5,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  tabButtonNav: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { textAlign: 'center', fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
