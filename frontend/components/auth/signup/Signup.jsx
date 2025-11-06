import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Alert,
    Modal,
    Platform, // <-- Imported Platform for safe area checks
} from 'react-native';

const darkCardColors = {
    // --- Dark Theme Palette (Matching SignIn.jsx) ---
    darkBackground: '#1E1E1E',
    darkCard: '#2C2C2C',
    primaryHighlight: '#4A90E2',
    mainText: '#F0F0F0',
    subText: '#888888',
    white: '#ffffff',
    redDanger: '#B71C1C',
};

// Define the available roles
const ROLES = ['Asha Worker', 'PHC Doctor', 'Patient'];

const SignUp = ({ navigation }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState(ROLES[0]); // Default role
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State for confirm password
    const [confirmPassword, setConfirmPassword] = useState('');

    // State to control the visibility of the role selection modal
    const [showRolePicker, setShowRolePicker] = useState(false);

    // Function to handle role selection from the modal
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setShowRolePicker(false);
    };

    const handleSignUp = () => {
        // 1. Basic validation for required fields
        if (!name || !mobile || !password || !confirmPassword) {
            Alert.alert('Registration Error', 'Please fill in all required fields (Name, Mobile, Password, and Confirm Password).');
            return;
        }

        // 2. Password Match Validation
        if (password !== confirmPassword) {
            Alert.alert('Password Error', 'Password and Confirm Password must match.');
            return;
        }

        // 3. Simulate signup logic
        Alert.alert('Registration Complete', `Account request submitted for ${name} as a ${role}. You will be notified once approved.`);
        navigation.navigate('SignIn');
    };

    return (
        <View style={styles.container}>
            {/* Status bar uses the dark card color for seamless look */}
            <StatusBar
                backgroundColor={darkCardColors.darkCard}
                barStyle="light-content"
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header/Title */}
                <Text style={styles.appTitle}>ArogyaLink</Text>
                <Text style={styles.pageTitle}>Create Account</Text>
                <Text style={styles.subtitle}>Welcome! Fill in your details to get started with field support.</Text>

                <View style={styles.card}>

                    {/* Full Name Input */}
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Pooja Sharma"
                        placeholderTextColor={darkCardColors.subText}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        color={darkCardColors.mainText}
                    />

                    {/* Role Selector (Dropdown implemented via Modal) */}
                    <Text style={styles.inputLabel}>Role</Text>
                    <TouchableOpacity
                        style={[styles.textInput, styles.roleDisplay]}
                        onPress={() => setShowRolePicker(true)}
                    >
                        <Text style={{ color: darkCardColors.mainText, fontSize: 16 }}>
                            {role}
                        </Text>
                        <Text style={{ color: darkCardColors.subText, fontSize: 16 }}>▼</Text>
                    </TouchableOpacity>

                    {/* Mobile Number Input */}
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="0000 000 000"
                        placeholderTextColor={darkCardColors.subText}
                        value={mobile}
                        onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                        keyboardType="phone-pad"
                        maxLength={10}
                        color={darkCardColors.mainText}
                    />

                    {/* Email Input (Optional) */}
                    <Text style={styles.inputLabel}>Email (Optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., user@example.com"
                        placeholderTextColor={darkCardColors.subText}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        color={darkCardColors.mainText}
                    />

                    {/* Password Input */}
                    <Text style={styles.inputLabel}>Set Password</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="•••••••• (Min 6 characters)"
                        placeholderTextColor={darkCardColors.subText}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        color={darkCardColors.mainText}
                    />

                    {/* Confirm Password Input */}
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="•••••••• (Enter again)"
                        placeholderTextColor={darkCardColors.subText}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        color={darkCardColors.mainText}
                    />

                    {/* Sign Up Button */}
                    <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                        <Text style={styles.buttonText}>REGISTER ACCOUNT</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Sign In Link */}
                    <View style={styles.signInLinkContainer}>
                        <Text style={styles.linkText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                            <Text style={styles.linkButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Role Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showRolePicker}
                onRequestClose={() => setShowRolePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setShowRolePicker(false)} // Close modal when tapping outside
                >
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Your Role</Text>
                        {ROLES.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.pickerItem,
                                    role === item && styles.pickerItemSelected
                                ]}
                                onPress={() => handleRoleSelect(item)}
                            >
                                <Text style={styles.pickerItemText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowRolePicker(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkCardColors.darkBackground,
    },
    scrollContent: {
        flexGrow: 1,
        // Added dynamic top padding to respect the notch/status bar area
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
        // Added generous bottom padding to respect the navigation bar area
        paddingBottom: 50,
        paddingHorizontal: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: darkCardColors.primaryHighlight,
        marginBottom: 5,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: darkCardColors.mainText,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: darkCardColors.subText,
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: darkCardColors.darkCard,
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: darkCardColors.mainText,
        marginBottom: 5,
        marginTop: 10,
    },
    textInput: {
        height: 50,
        borderColor: darkCardColors.subText,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: darkCardColors.darkBackground,
    },
    roleDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 15,
    },
    signUpButton: {
        backgroundColor: darkCardColors.primaryHighlight,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 25,
    },
    buttonText: {
        color: darkCardColors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: darkCardColors.subText,
        marginVertical: 20,
    },
    signInLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    linkText: {
        fontSize: 14,
        color: darkCardColors.mainText,
    },
    linkButtonText: {
        color: darkCardColors.primaryHighlight,
        fontSize: 14,
        fontWeight: 'bold',
    },

    // --- Modal/Picker Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    pickerContainer: {
        width: '80%',
        backgroundColor: darkCardColors.darkCard,
        borderRadius: 10,
        padding: 15,
        elevation: 20,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: darkCardColors.mainText,
        marginBottom: 10,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: darkCardColors.subText,
        paddingBottom: 8,
    },
    pickerItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: darkCardColors.darkBackground,
        alignItems: 'center',
    },
    pickerItemSelected: {
        backgroundColor: darkCardColors.primaryHighlight,
        borderRadius: 5,
    },
    pickerItemText: {
        fontSize: 16,
        color: darkCardColors.mainText,
    },
    modalCloseButton: {
        backgroundColor: darkCardColors.primaryHighlight,
        borderRadius: 8,
        padding: 12,
        marginTop: 15,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: darkCardColors.white,
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default SignUp;
