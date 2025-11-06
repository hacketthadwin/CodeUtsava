import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#311B92',    // Dark Indigo (Main accents/icons)
  secondary: '#880E4F',  // Dark Maroon (Action/Danger text)
  darkBlue: '#0047AB',   // Status text
  white: '#FFFFFF',      // Used for primary text on dark accents
  black: '#000000',      // Used for primary text on light backgrounds
  gray: '#F0F0F0',       // Light gray background for groups
  lightGray: '#FFFFFF',  // White background for option rows
};

const LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Gujarati' },
  { code: 'fr', name: 'Marathi' },
  { code: 'pt', name: 'Tamil' },
];

const LanguageSettings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const insets = useSafeAreaInsets();

  const handleSelect = (code, name) => {
    setSelectedLanguage(code);
    Alert.alert("Language Changed", `The application language has been set to ${name}.`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Language Settings</Text>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>

        <View style={styles.sectionGroup}>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === selectedLanguage;
            return (
              <TouchableOpacity 
                key={lang.code}
                style={[styles.row, isSelected && styles.selectedRow]}
                onPress={() => handleSelect(lang.code, lang.name)}
              >
                <Text style={styles.optionText}>{lang.name}</Text>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
};

export default LanguageSettings;

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    justifyContent: 'space-between',
  },
  selectedRow: {
    backgroundColor: '#F0F8FF', // Very light blue tint when selected
  },
  optionText: {
    color: COLORS.black, 
    fontSize: 16,
  },
  checkIcon: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  }
});
