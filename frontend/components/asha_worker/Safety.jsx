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

const Safety = () => {
  
  const handleSOSPress = () => {
    // In a real-world app, this would dispatch general emergency services.
    
    Alert.alert(
      "General Emergency SOS",
      "We are locating your position and dispatching the nearest Ambulance/Emergency Service (108). Stay calm and stay on the line.",
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
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>
          Press and hold the button below to instantly alert **Emergency Services** with your live location.
        </Text>
        
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOSPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>HELP</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Use only in urgent, life-threatening situations.
        </Text>
      </View>
      
      {/* --- Additional Helplines Section --- */}
      <Text style={styles.sectionTitle}>Essential Helplines & Services</Text>
      <HelplineCard 
        title="Ambulance / Fire / Police"
        number="108 / 100 / 101"
        onPress={() => handleHelplinePress("Emergency Services", "108")}
      />
      <HelplineCard 
        title="Women & Child Helpline"
        number="181"
        onPress={() => handleHelplinePress("Women & Child Helpline", "181")}
      />
      <HelplineCard 
        title="Disaster Management"
        number="1070"
        onPress={() => handleHelplinePress("Disaster Management", "1070")}
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

export default Safety;
