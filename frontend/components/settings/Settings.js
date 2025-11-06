import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

// Reusing a consistent color scheme
const COLORS = {
  primary: '#311B92',    // Dark Indigo (Main accents/icons)
  secondary: '#880E4F',  // Dark Maroon (Action/Danger text)
  darkBlue: '#0047AB',   // Status text
  white: '#FFFFFF',      // Used for primary text on dark accents
  black: '#000000',      // Used for primary text on light backgrounds
  gray: '#F0F0F0',       // Light gray background for groups
  lightGray: '#FFFFFF',  // White background for option rows
};

// Component for a single settings item row (theme-aware)
const SettingsRow = ({ title, value, onPress, isDanger, icon }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={[styles.row, { backgroundColor: theme.card, borderBottomColor: theme.tabBarBorder }]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, {color: icon.color || theme.primary}]}>{icon.symbol}</Text>
      </View>
      <Text style={[styles.optionText, { color: theme.text }, isDanger && styles.dangerText]}>{title}</Text>
      <View style={styles.valueContainer}>
        {value && <Text style={[styles.valueText, { color: theme.textSecondary }, isDanger && styles.dangerText]}>{value}</Text>}
        <Text style={[styles.arrow, { color: theme.textSecondary }, isDanger && styles.dangerText]}> > </Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Settings component
const Settings = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();

  const handleAlert = (title, message) => {
    Alert.alert(title, message);
  };
  
  // Custom alert handler for non-navigable pages
  const handleNonNavigableAlert = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 20 }
        ]}
      >

        {/* --- 1. User & Account Section --- */}
        <View style={[styles.sectionGroup, { backgroundColor: theme.surface }]}>
          <SettingsRow 
            title="Edit Profile Information" 
            icon={{symbol: '👤', color: COLORS.darkBlue}}
            onPress={() => navigation.navigate('EditProfile')} // Navigates to EditProfile.js
          />
          
          <SettingsRow 
            title="Manage Notifications" 
            value="Custom"
            icon={{symbol: '🔔', color: COLORS.secondary}}
            onPress={() => navigation.navigate('ManageNotification')} // Navigates to ManageNotification.js
          />
        </View>
        
        {/* --- 2. Preferences & Appearance Section --- */}
        <View style={[styles.sectionGroup, { backgroundColor: theme.surface }]}>
          <SettingsRow 
            title="Theme/Appearance" 
            value="Light"
            icon={{symbol: '🎨', color: COLORS.secondary}}
            onPress={() => navigation.navigate('Theme')} // Navigates to Theme.js
          />
          <SettingsRow 
            title="Language" 
            value="English (US)"
            icon={{symbol: '🌐', color: COLORS.primary}}
            onPress={() => navigation.navigate('Language')} // Navigates to Language.js
          />
        </View>

        {/* --- 3. Data, Privacy, and Support Section --- */}
        <View style={[styles.sectionGroup, { backgroundColor: theme.surface }]}>
          <SettingsRow 
            title="Privacy Policy" 
            icon={{symbol: '📜', color: COLORS.darkBlue}}
            onPress={() => navigation.navigate('PrivacyPolicy')} // Navigates to PrivacyPolicy.js
          />
          
          <SettingsRow 
            title="Terms of Service" 
            icon={{symbol: '⚖️', color: COLORS.darkBlue}}
            onPress={() => navigation.navigate('Terms')} // Navigates to Terms.js
          />
          
          <SettingsRow 
            title="Clear Cache" 
            icon={{symbol: '🧹', color: COLORS.tertiary}}
            onPress={() => handleNonNavigableAlert('Maintenance', 'Clearing local cache...')}/>
          
          <SettingsRow 
            title="Help Center / FAQ" 
            icon={{symbol: '❓', color: COLORS.primary}}
            onPress={() => navigation.navigate('FAQ')} // Navigates to FAQ.js
          />

          <SettingsRow 
            title="Version" 
            value="1.1.0"
            icon={{symbol: '📱', color: '#666'}}
            onPress={() => handleNonNavigableAlert('Version', 'Displaying app version number.')}/>

          <SettingsRow 
            title="Sign Out" 
            isDanger={true}
            icon={{symbol: '➡️', color: COLORS.secondary}}
            onPress={() => handleNonNavigableAlert('Logout', 'Logging out of the application...')}/>
        </View>

      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.black, 
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  sectionGroup: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 30,
    marginRight: 15,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    marginRight: 5,
  },
  arrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dangerText: {
    color: COLORS.secondary,
  },
});
