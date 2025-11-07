import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../App.js'; // Assumed path to App.js

// Reusing the color scheme for consistency
const COLORS = {
    primary: '#311B92',   // Dark Indigo (Main accents)
    secondary: '#880E4F', // Dark Maroon 
    darkBlue: '#0047AB',  // Secondary accents/prominent details
    white: '#FFFFFF',
    black: '#000000',
    gray: '#E5E7EB',
    lightGray: '#F5F5F5',
};

// 🎯 Safety Defaults (used while loading or if data is missing)
const DEFAULT_FALLBACK = {
    name: 'User Profile',
    email: 'N/A',
    number: 'N/A',
    role: 'N/A',
    avatarUri: 'https://placehold.co/100x100/311B92/FFFFFF/png?text=?',
};


const Profile = () => {
    const { theme } = useTheme();
    
    // 🟢 CRITICAL FIX: Destructure the user object as 'user' 
    // to match the property name set in the AuthContext in App.js.
    const { user, userToken } = useContext(AuthContext); 
    
    // We will use 'user' instead of 'userData' for consistency.
    const profileData = {
        name: user?.name || DEFAULT_FALLBACK.name,
        email: user?.email || DEFAULT_FALLBACK.email,
        number: user?.number || DEFAULT_FALLBACK.number,
        role: user?.role || DEFAULT_FALLBACK.role,
        avatarUri: user?.avatarUri || DEFAULT_FALLBACK.avatarUri,
    };

    const handleEditPress = () => {
        Alert.alert('Navigate', 'Navigating to Edit Profile Settings...');
    };

    // --- Safety Check for User Data ---
    if (!userToken) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text, fontSize: 18, textAlign: 'center', fontWeight: 'bold' }}>
                    🛑 Not Signed In
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                    Please sign in to view your profile details.
                </Text>
            </View>
        );
    }
    
    // Check if the essential data required for display has arrived (i.e., 'user' is populated and has an ID)
    if (!user || !user.id) {
         return (
             <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                 <Text style={{ color: theme.primary, fontSize: 18, textAlign: 'center', fontWeight: 'bold' }}>
                     ⏳ Loading Profile Data...
                 </Text>
                 <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                     Waiting for authenticated user data from context.
                 </Text>
             </View>
         );
    }
    // ---------------------------------


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
                        <Text style={[styles.nameText, { color: theme.primary }]} numberOfLines={1}>{profileData.name}</Text>
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
                </View>

                {/* Edit Button */}
                <TouchableOpacity style={{ backgroundColor: theme.primary, alignSelf: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 }} onPress={handleEditPress}>
                    <Text style={{ color: theme.buttonText || COLORS.white, fontWeight: 'bold' }}>Edit Profile</Text>
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
    // Adjusted fullWidthDetailItem to match new detail structure (Email is full-width)
    fullWidthDetailItem: { width: '100%', marginBottom: 15, marginTop: 5, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.gray }, 
    detailLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkBlue, textTransform: 'uppercase', marginBottom: 3 },
    detailValue: { fontSize: 16, color: COLORS.black, fontWeight: '500' },
    // --- Edit Button ---
    editButton: { backgroundColor: COLORS.primary, alignSelf: 'center', marginTop: 10, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
    editButtonText: { color: COLORS.white, fontWeight: 'bold' },
});