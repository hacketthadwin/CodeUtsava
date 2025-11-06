import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing a consistent color scheme
const COLORS = {
  primary: '#311B92',    // Dark Indigo (Main accents/Active switch)
  secondary: '#880E4F',  // Dark Maroon (Used for key info)
  darkBlue: '#0047AB',   // Secondary accents
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F0F0F0',       // Light gray background for groups
  lightGray: '#FFFFFF',  // White background for option rows
};

// Component for a single notification toggle row
const NotificationToggle = ({ title, subtitle, isEnabled, onToggle }) => (
  <View style={styles.row}>
    <View style={styles.textContainer}>
      <Text style={styles.optionText}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
    </View>
    <Switch
      trackColor={{ false: COLORS.gray, true: COLORS.primary }}
      thumbColor={COLORS.white}
      onValueChange={onToggle}
      value={isEnabled}
    />
  </View>
);

const ManageNotifications = () => {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    generalAlerts: true,
    cyclePredictions: true,
    appointmentReminders: true,
    chatUpdates: true,
    emergencyTips: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Manage Notifications</Text>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>

        {/* --- 1. Health & Cycle Alerts --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Health & Cycle Alerts</Text>
          <NotificationToggle 
            title="Cycle Predictions" 
            subtitle="Get alerts 3 days before your estimated period start date."
            isEnabled={settings.cyclePredictions}
            onToggle={() => handleToggle('cyclePredictions')}
          />
          <NotificationToggle 
            title="Symptom Log Reminders" 
            subtitle="Receive reminders to log daily symptoms or basal temperature."
            isEnabled={settings.generalAlerts}
            onToggle={() => handleToggle('generalAlerts')}
          />
        </View>

        {/* --- 2. Consultation & Communication --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Consultation & Communication</Text>
          <NotificationToggle 
            title="Appointment Reminders" 
            subtitle="Alerts for scheduled consultations with doctors."
            isEnabled={settings.appointmentReminders}
            onToggle={() => handleToggle('appointmentReminders')}
          />
          <NotificationToggle 
            title="Chat/Message Updates" 
            subtitle="Notify me when a doctor replies to a message."
            isEnabled={settings.chatUpdates}
            onToggle={() => handleToggle('chatUpdates')}
          />
        </View>

        {/* --- 3. Safety & Maintenance --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Safety & Maintenance</Text>
          <NotificationToggle 
            title="Emergency Alert Broadcasts" 
            subtitle="Safety tips and public health announcements."
            isEnabled={settings.emergencyTips}
            onToggle={() => handleToggle('emergencyTips')}
          />
        </View>

      </ScrollView>
    </View>
  );
};

export default ManageNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, 
  },
  headerTitle: {
    color: COLORS.black, 
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'left',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionGroup: {
    marginBottom: 20,
    backgroundColor: COLORS.gray, 
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
  },
  optionText: {
    color: COLORS.black, 
    fontSize: 16,
    fontWeight: '500',
  },
  subtitleText: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});
