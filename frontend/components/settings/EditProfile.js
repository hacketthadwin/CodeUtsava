import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing a consistent color scheme
const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  tertiary: '#1B5E20', 
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
};

// --- DUMMY DATA ---
const initialProfileData = {
  name: 'Adarsh',
  email: 'adarsh.s@example.com',
  number: '+91 9876543210',
  role: 'Patient',
  dob: '01/01/1995',
  aadhar: '1234 5678 9012',
};

const EditProfile = () => {
  const [formData, setFormData] = useState(initialProfileData);
  const insets = useSafeAreaInsets();

  const handleInputChange = (key, value) => {
    setFormData(prevData => ({ ...prevData, [key]: value }));
  };

  const handleSave = () => {
    // In a real app, this is where you would send data to your server
    Alert.alert(
      "Profile Updated", 
      `Your changes have been saved!\nName: ${formData.name}\nEmail: ${formData.email}\nNumber: ${formData.number}`
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Edit Profile</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={formData.number}
            onChangeText={(text) => handleInputChange('number', text)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Date of Birth"
            placeholderTextColor="#888"
            value={formData.dob}
            onChangeText={(text) => handleInputChange('dob', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Aadhar Number"
            placeholderTextColor="#888"
            value={formData.aadhar}
            onChangeText={(text) => handleInputChange('aadhar', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Role"
            placeholderTextColor="#888"
            value={formData.role}
            onChangeText={(text) => handleInputChange('role', text)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});