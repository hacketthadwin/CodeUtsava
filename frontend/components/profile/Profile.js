import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Reusing the color scheme for consistency
const COLORS = {
  primary: '#311B92',   // Dark Indigo (Main accents)
  secondary: '#880E4F', // Dark Maroon 
  darkBlue: '#0047AB',  // Secondary accents/prominent details
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
};

// --- DUMMY DATA ---
const profileData = {
  name: 'Adarsh',
  email: 'adarsh12345678jha@gmail.com',
  number: '+91 9876543210',
  role: 'Patient',
  dob: '05/03/2004',
  aadhar: '1234 5678 9012',
  avatarUri: 'https://placehold.co/100x100/311B92/FFFFFF/png?text=A', 
};

const Profile = () => {
  const { theme } = useTheme();
  
  const handleEditPress = () => {
    Alert.alert('Navigate', 'Navigating to Edit Profile Settings...');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Page Title */}
      <Text style={[styles.pageTitle, { color: theme.text }]}>My Profile</Text>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: theme.card }] }>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileData.avatarUri }} style={[styles.profileImage, { borderColor: theme.primary }]} />
          </View>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.nameText, { color: theme.primary }]}>{profileData.name}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.tabBarBorder }]} />

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.fullWidthDetailItem}>
            <Text style={[styles.detailLabel, { color: theme.primary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.email}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.primary }]}>Phone</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.number}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.primary }]}>Role</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.role}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.primary }]}>DOB</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.dob}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.primary }]}>Aadhar</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.aadhar}</Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={{ backgroundColor: theme.primary, alignSelf: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 }} onPress={handleEditPress}>
          <Text style={{ color: theme.buttonText, fontWeight: 'bold' }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray, // Overall light background
    padding: 20,
    paddingTop: 50,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    shadowColor: COLORS.primary, // Primary color shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  // --- Header/Avatar Styles ---
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: { marginRight: 15 },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: COLORS.primary },
  greetingContainer: { flex: 1 },
  greetingText: { fontSize: 18, color: '#666' },
  nameText: { fontSize: 28, fontWeight: 'bold', color: COLORS.darkBlue },
  divider: { height: 1, backgroundColor: COLORS.gray, marginBottom: 20 },
  // --- Details Grid Styles ---
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '48%', marginBottom: 15 },
  fullWidthDetailItem: { width: '100%', marginBottom: 15, marginTop: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.gray },
  detailLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkBlue, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontSize: 16, color: COLORS.black, fontWeight: '500' },
  // --- Edit Button ---
  editButton: { backgroundColor: COLORS.primary, alignSelf: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  editButtonText: { color: COLORS.white, fontWeight: 'bold' },
});
