import { Alert, Text, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  tertiary: '#1B5E20', 
  danger: '#B71C1C', 
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
};

// Component for a doctor's card
const DoctorCard = ({ name, specialty, onPress }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.doctorName}>Dr. {name}</Text>
      <Text style={styles.doctorSpecialty}>{specialty}</Text>
    </View>
    <TouchableOpacity 
      style={styles.requestButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>Request Schedule</Text>
    </TouchableOpacity>
  </View>
);

const RequestConsult = () => {
  const { theme } = useTheme();
  // Mixed doctors list (male + female, shuffled, general names)
  const doctors = [
    { id: '1', name: 'Arun Mehta', specialty: 'General Physician' },
    { id: '2', name: 'Neha Kapoor', specialty: 'Gynecologist' },
    { id: '3', name: 'Rahul Sharma', specialty: 'Pediatrician' },
    { id: '4', name: 'Anita Desai', specialty: 'Family Medicine' },
    { id: '5', name: 'Suresh Reddy', specialty: 'Orthopedic Specialist' },
    { id: '6', name: 'Kavita Joshi', specialty: 'Dermatologist' },
    { id: '7', name: 'Vikram Singh', specialty: 'ENT Specialist' },
    { id: '8', name: 'Pooja Verma', specialty: 'Public Health' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Connect with Doctors</Text>
      <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
        Request a consultation with a trusted specialist.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {doctors.map(doctor => (
          <View key={doctor.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder, borderWidth: 1 }]}> 
            <View style={styles.cardContent}>
              <Text style={[styles.doctorName, { color: theme.primary }]}>Dr. {doctor.name}</Text>
              <Text style={[styles.doctorSpecialty, { color: theme.textSecondary }]}>{doctor.specialty}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.requestButton, { backgroundColor: theme.primary }]}
              onPress={() => Alert.alert(
                'Request Sent!',
                `Your request to schedule a consultation with Dr. ${doctor.name} has been sent. The doctor will contact you shortly.`
              )}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Request Schedule</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  doctorName: {
    color: COLORS.darkBlue,
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorSpecialty: {
    color: '#666666',
    fontSize: 14,
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default RequestConsult;
