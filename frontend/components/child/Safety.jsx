import { Alert, Text, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import React from 'react';

// Reusing the color scheme for a consistent look and feel
const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  tertiary: '#1B5E20', 
  danger: '#B71C1C',   // Main color for the SOS button
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
};

// Component for non-emergency contact cards
const HelplineCard = ({ title, number, onPress }) => (
  <TouchableOpacity style={styles.helplineCard} onPress={onPress}>
    <View style={styles.helplineContent}>
      <Text style={styles.helplineTitle}>{title}</Text>
      <Text style={styles.helplineNumber}>{number}</Text>
    </View>
  </TouchableOpacity>
);

const SafetyChild = () => {
  
  const handleSOSPress = () => {
    // In a real-world app, this would dispatch pediatric emergency services.
    
    Alert.alert(
      "Pediatric Emergency SOS",
      "We are locating your position and dispatching the nearest Pediatric Ambulance/Emergency Service. Stay calm and stay on the line.",
      [
        {
          text: "OK",
          onPress: () => console.log("User acknowledged SOS message"),
        },
      ]
    );
  };
  
  const handleHelplinePress = (title, number) => {
    // Simulated action for calling a helpline
    Alert.alert(
      `Call ${title}`,
      `Dialing ${number}. This function would connect you directly to the helpline in a real app.`
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      
      {/* --- SOS Section --- */}
      <View style={styles.sosSection}>
        <Text style={styles.headerTitle}>Child Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>
          Press and hold the button below to instantly alert **Pediatric Emergency Services** with your live location.
        </Text>
        
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOSPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>HELP</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Use only in urgent, life-threatening situations involving a child.
        </Text>
      </View>
      
      {/* --- Additional Helplines Section --- */}
      <Text style={styles.sectionTitle}>Quick Helplines (Non-Emergency)</Text>
      <HelplineCard 
        title="Poison Control Center"
        number="1800-XXX-XXXX"
        onPress={() => handleHelplinePress("Poison Control", "1800-XXX-XXXX")}
      />
      <HelplineCard 
        title="Child Protection Services"
        number="1098"
        onPress={() => handleHelplinePress("Child Protection Services", "1098")}
      />
      <HelplineCard 
        title="Local Health Advice Line"
        number="555-CHILD-DOC"
        onPress={() => handleHelplinePress("Health Advice Line", "555-CHILD-DOC")}
      />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    color: COLORS.danger,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    color: COLORS.black,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  sosButton: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.danger,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  disclaimerText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  
  // --- Helpline Card Styles ---
  sectionTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    alignSelf: 'flex-start',
    width: '100%',
  },
  helplineCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  helplineContent: {
    flex: 1,
  },
  helplineTitle: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  helplineNumber: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default SafetyChild;
