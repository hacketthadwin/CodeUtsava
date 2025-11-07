import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme
import { AuthContext } from '../../App.js'; // Import AuthContext

// Reusing a consistent color scheme (used for default/fallback styles)
const COLORS = {
  primary: '#311B92', 
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
};

// --- API CONFIG ---
const API_HOST = '192.168.137.1';
const API_PORT = '5000';
const PROFILE_UPDATE_ENDPOINT = `http://${API_HOST}:${API_PORT}/api/v1/user/profile`; 
// --------------------

const EditProfile = ({ navigation }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    
    // 1. Get user data, token, and the signIn update function from context
    const { userData, userToken, signIn } = useContext(AuthContext);

    // Initial state setup (will be overwritten by useEffect if userData is available)
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        number: userData?.number || '',
        role: userData?.role || '',
    });
    
    const [isSaving, setIsSaving] = useState(false);

    // 2. Initialize form data once the userData is reliably loaded from context
    useEffect(() => {
        if (userData && userData.id) {
             setFormData({
                name: userData.name || '',
                email: userData.email || '',
                number: userData.number || '',
                role: userData.role || '',
            });
        }
    }, [userData]);
    
    // Safety check for not signed in or still loading
    if (!userData || !userData.id) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.text, marginTop: 10 }}>Loading profile details...</Text>
            </View>
        );
    }
    
    // --- Handlers ---

    const handleInputChange = (key, value) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    const handleSave = async () => {
        if (isSaving) return;

        // Simple validation
        if (!formData.name || !formData.email) {
            Alert.alert("Validation Error", "Name and Email are required fields.");
            return;
        }

        setIsSaving(true);

        try {
            // Data payload: Only send fields that are intended to be updated.
            const dataToUpdate = {
                name: formData.name,
                email: formData.email,
                number: formData.number,
                // Role, Aadhar, DOB are omitted as they are typically not user-editable or were removed
            };

            const response = await fetch(PROFILE_UPDATE_ENDPOINT, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Authenticate the request
                },
                body: JSON.stringify(dataToUpdate),
            });
            
            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                const errorMsg = responseData.message || `Failed to update profile. Status: ${response.status}`;
                Alert.alert("Update Failed", errorMsg);
                console.error("Profile Update Error:", responseData);
                return;
            }

            // 3. Update the local AuthContext state with the new data
            // We assume the backend returns the *fully updated* user object in responseData.user
            const newUserData = responseData.user ? { 
                ...userData, // Start with existing data (like id, token, role)
                ...responseData.user, // Overwrite with new fields from the server
            } : formData; // Fallback to local form data if server doesn't return the full user object
            
            // Call signIn to update the global context state
            signIn(userToken, userData.role, newUserData); 

            Alert.alert("Success", "Your profile has been updated successfully!");
            
            // Navigate back to the Profile view after a successful update
            if (navigation && navigation.goBack) {
                navigation.goBack();
            }

        } catch (error) {
            console.error("Network Error during profile update:", error);
            Alert.alert("Network Error", `Could not connect to the server at ${API_HOST}.`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- JSX Render ---
    
    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={[styles.formSection, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Personal Details</Text>
                    
                    {/* Name */}
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder="Name"
                        placeholderTextColor={theme.textSecondary}
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        editable={!isSaving}
                    />
                    
                    {/* Email */}
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder="Email Address"
                        placeholderTextColor={theme.textSecondary}
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isSaving}
                    />
                    
                    {/* Phone Number */}
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder="Phone Number"
                        placeholderTextColor={theme.textSecondary}
                        value={formData.number}
                        onChangeText={(text) => handleInputChange('number', text)}
                        keyboardType="phone-pad"
                        editable={!isSaving}
                    />

                    {/* Role (Read-only) */}
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Role (Read Only)</Text>
                    <TextInput
                        style={[styles.input, styles.readOnlyInput, { backgroundColor: theme.surface, color: theme.textSecondary, borderColor: theme.border }]}
                        value={formData.role}
                        editable={false}
                    />
                    
                    {/* DOB and AADHAR removed for consistency with Profile.js */}
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: theme.primary }]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                         <ActivityIndicator color={theme.buttonText || COLORS.white} />
                    ) : (
                        <Text style={[styles.saveButtonText, { color: theme.buttonText || COLORS.white }]}>Save Changes</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

export default EditProfile;

// --- Stylesheet using dynamic theme colors ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
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
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
    },
    readOnlyInput: {
        opacity: 0.7,
    },
    saveButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minHeight: 50,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});