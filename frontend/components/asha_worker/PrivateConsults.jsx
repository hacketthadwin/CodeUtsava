import { Alert, Text, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import React from 'react';

// Reusing the same color scheme for consistency
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

// Component to represent a single doctor's card
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
      <Text style={styles.buttonText}>Request Consult</Text>
    </TouchableOpacity>
  </View>
);

const PrivateConsults = () => {
  // Updated dummy data focusing on Pediatricians and Child Health Specialists
  const doctors = [
    { id: '1', name: 'Ananya Jha', specialty: 'PHC Pediatrician, Child Immunization' },
    { id: '2', name: 'Kavita Verma', specialty: 'Child Development Specialist, Nutrition' },
    { id: '3', name: 'Madhuri Singh', specialty: 'PHC Doctor, Family & Child Health' },
    { id: '4', name: 'Deepika Patel', specialty: 'Pediatric Health Counselor' },
    { id: '5', name: 'Rupali Reddy', specialty: 'Newborn Care Specialist' },
    { id: '6', name: 'Ria Gupta', specialty: 'PHC Doctor, Child Behavioral Health' },
  ];

  const handleRequest = (doctorName) => {
    Alert.alert(
      'Consultation Request Sent',
      `Your request for Dr. ${doctorName} has been submitted. The doctor or their assistant will reach out shortly to coordinate a private appointment regarding your child's health.`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Child Health Consults</Text>
      <Text style={styles.headerSubtitle}>Connect securely with verified Pediatric and PHC Specialists.</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {doctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            name={doctor.name}
            specialty={doctor.specialty}
            onPress={() => handleRequest(doctor.name)}
          />
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

export default PrivateConsults;
