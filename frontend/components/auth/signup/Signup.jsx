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
    Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';

// --- Lottie Assets & Paths (Assuming components/auth/signup/ is the location) ---
const ROOT_PATH = '../../../';
const SUCCESS_TRANSITION_ANIMATION = require(`${ROOT_PATH}assets/animations/acc_created.json`);
const BUTTON_LOADING_ANIMATION = require(`${ROOT_PATH}assets/animations/loader.json`);
const AUTH_ERROR_ANIMATION = require(`${ROOT_PATH}assets/animations/error_anim.json`); // Reusing error anim for OTP failure

const darkCardColors = {
    // --- Dark Theme Palette ---
    darkBackground: '#1E1E1E',
    darkCard: '#2C2C2C',
    primaryHighlight: '#4A90E2',
    mainText: '#F0F0F0',
    subText: '#888888',
    white: '#ffffff',
    redDanger: '#B71C1C',
    greenSuccess: '#4CAF50',
};

// Define constants
const ROLES = ['Doctor', 'Patient'];
const LANGUAGES = ['English', 'Hindi'];
const GENDERS = ['Male', 'Female', 'Other'];
const DEGREES = ['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'Ayurveda (BAMS/MD)', 'Homeopathy (BHMS/MD)', 'Other'];

// --- API ENDPOINT ROOT ---
const API_BASE_URL = `http://192.168.137.1:5000/api/v1`;
// ---------------------------------------------

// --- Screen States for managing Lottie transitions ---
const SCREEN_STATE = {
    FORM: 'form',
    LOADING: 'loading_button', 
    SUCCESS: 'success_transition',
    ERROR: 'error_transition',
};

// --- OTP Authentication Steps ---
const SIGNUP_STEP = {
    FORM_INPUT: 1,     // Step 1: User enters all registration details
    OTP_VERIFY: 2,     // Step 2: User enters OTP
};


const SignUpScreen = ({ navigation }) => {
    // Required fields from Mongoose Schema
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(ROLES[0]);
    const [mobile, setMobile] = useState(''); 
    const [address, setAddress] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState(GENDERS[0]);
    const [language, setLanguage] = useState(LANGUAGES[0]);

    // Doctor-Specific Fields
    const [degree, setDegree] = useState(DEGREES[0]);
    const [registrationNumber, setRegistrationNumber] = useState('');
    
    // OTP Field
    const [otp, setOtp] = useState(''); 

    // Form/Screen State Management
    const [currentStep, setCurrentStep] = useState(SIGNUP_STEP.FORM_INPUT);
    const [screenState, setScreenState] = useState(SCREEN_STATE.FORM); 
    const isInteracting = screenState !== SCREEN_STATE.FORM;

    // Modal Visibility States
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showDegreePicker, setShowDegreePicker] = useState(false); 
    

    // --- Modal/Picker Handlers (Kept as is) ---
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        if (selectedRole === 'Patient') {
            setDegree(DEGREES[0]);
            setRegistrationNumber('');
        }
        setShowRolePicker(false);
    };

    const handleDegreeSelect = (selectedDegree) => {
        setDegree(selectedDegree);
        setShowDegreePicker(false);
    };

    const handleLanguageSelect = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        setShowLanguagePicker(false);
    };
    
    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
        setShowGenderPicker(false);
    };

    // --- Validation Helper ---
    const validateForm = () => {
        // Comprehensive Input Validation based on schema requirements
        if (!name || !email || !mobile || !address || !age || !gender || !language || !password || !confirmPassword) {
            Alert.alert('Registration Error', 'Please fill in all required fields.');
            return false;
        }

        // Conditional Doctor Validation
        if (role === 'Doctor') {
            if (degree.trim() === '' || degree === DEGREES[0] || !registrationNumber || registrationNumber.trim() === '') {
                Alert.alert('Registration Error', 'As a Doctor, you must select a Degree and provide a Registration Number.');
                return false;
            }
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Error', 'Password and Confirm Password must match.');
            return false;
        }
        
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
            Alert.alert('Validation Error', 'Please enter a valid age (1-120).');
            return false;
        }
        if (mobile.length !== 10 || isNaN(parseInt(mobile, 10))) {
            Alert.alert('Validation Error', 'Mobile number must be a valid 10-digit number.');
            return false;
        }
        
        return true;
    };


    // --- API Helper ---
    const makeApiCall = async (endpoint, payload) => {
        const url = `${API_BASE_URL}/${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = { 
                    success: false, 
                    message: `Server error: HTTP ${response.status} returned non-JSON data.` 
                };
            }

            if (!response.ok || !responseData.success) {
                const errorMessage = responseData.message || `API call failed with status ${response.status}`;
                
                setScreenState(SCREEN_STATE.ERROR); 
                setTimeout(() => {
                    setScreenState(SCREEN_STATE.FORM); 
                    Alert.alert('Request Failed', errorMessage);
                }, 2000); 

                throw new Error(errorMessage);
            }

            return responseData;

        } catch (error) {
            if (error.message.includes('Network request failed')) {
                 Alert.alert(
                    'Network Error', 
                    `Could not reach the server at ${API_BASE_URL}. Please ensure your backend is running.`,
                );
            }
            throw error; 
        }
    };


    // --- STEP 1: Main Handler (Validates & Sends OTP) ---
    const handleInitialSubmission = async () => {
        if (!validateForm()) return;

        setScreenState(SCREEN_STATE.LOADING);
        
        try {
            // 1. Call the /send-otp endpoint with email
            const payload = { email };
            const responseData = await makeApiCall('send-otp', payload);

            // 2. Success: Move to OTP verification step
            setCurrentStep(SIGNUP_STEP.OTP_VERIFY);
            Alert.alert('OTP Sent!', responseData.message);
            setScreenState(SCREEN_STATE.FORM);

        } catch (error) {
            // Error handling is inside makeApiCall
            setScreenState(SCREEN_STATE.FORM);
        }
    };

    // --- STEP 2: Verify OTP and Final Registration ---
    const handleFinalRegistration = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('OTP Required', 'Please enter the 6-digit OTP.');
            return;
        }

        setScreenState(SCREEN_STATE.LOADING);

        try {
            // 1. Build the full payload including all user data + OTP
            const payload = {
                name,
                email,
                address,
                phone: mobile, 
                age: parseInt(age, 10), 
                gender,
                language,
                password,
                role,
                degree: role === 'Doctor' ? degree : undefined, 
                registrationNumber: role === 'Doctor' ? registrationNumber : undefined,
                otp: otp, // CRITICAL: Include OTP for backend verification
            };

            // 2. Call the /signup endpoint
            const successData = await makeApiCall('signup', payload); 

            // 3. Success flow
            console.log('Registration Success:', successData);
            setScreenState(SCREEN_STATE.SUCCESS);

            const transitionTime = 2500;
            setTimeout(() => {
                Alert.alert('Success', `Account created. Welcome, ${name}! You can now sign in.`);
                navigation.navigate('SignIn');
                setScreenState(SCREEN_STATE.FORM); 
            }, transitionTime);

        } catch (error) {
            // Error handling is inside makeApiCall
            // If OTP is invalid, screenState will be set to ERROR and reset to FORM
            setScreenState(SCREEN_STATE.FORM);
        }
    };

    // Determine the main button action
    const mainAction = currentStep === SIGNUP_STEP.FORM_INPUT 
                       ? handleInitialSubmission 
                       : handleFinalRegistration;
    
    // Determine the main button text
    const buttonText = currentStep === SIGNUP_STEP.FORM_INPUT 
                       ? 'SEND OTP & CONTINUE' 
                       : 'VERIFY & REGISTER';


    // --- Conditional Full-Screen RENDER (Success/Error Transitions) ---

    if (screenState === SCREEN_STATE.SUCCESS || screenState === SCREEN_STATE.ERROR) {
        const transitionSource = screenState === SCREEN_STATE.SUCCESS 
          ? SUCCESS_TRANSITION_ANIMATION 
          : AUTH_ERROR_ANIMATION; 

        return (
            <View style={styles.fullScreenContainer}>
                <StatusBar backgroundColor={darkCardColors.darkBackground} barStyle="light-content" />
                <LottieView
                    source={transitionSource}
                    autoPlay
                    loop={false}
                    style={styles.fullScreenLottie}
                />
                <Text style={styles.transitionText}>
                    {screenState === SCREEN_STATE.SUCCESS ? 'Account Created' : 'Verification Failed'}
                </Text>
            </View>
        );
    }

    // --- FORM RENDER (Default State) ---

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor={darkCardColors.darkCard}
                barStyle="light-content"
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled" 
            >
                
                <Text style={styles.appTitle}>CardiaMind</Text>
                <Text style={styles.pageTitle}>
                    {currentStep === SIGNUP_STEP.FORM_INPUT ? 'Create Account' : 'Verify OTP'}
                </Text>
                <Text style={styles.subtitle}>
                    {currentStep === SIGNUP_STEP.FORM_INPUT 
                        ? 'Fill in your details to get started.'
                        : `OTP sent to ${email}. Please enter it below to complete registration.`}
                </Text>

                <View style={styles.card}>
                    
                    {/* --- STEP 1: ALL REGISTRATION FIELDS --- */}
                    {currentStep === SIGNUP_STEP.FORM_INPUT && (
                        <>
                            {/* Full Name Input */}
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput style={styles.textInput} placeholder="Pooja Sharma" placeholderTextColor={darkCardColors.subText} value={name} onChangeText={setName} autoCapitalize="words" color={darkCardColors.mainText} editable={!isInteracting} />

                            {/* Role Selector */}
                            <Text style={styles.inputLabel}>Role</Text>
                            <TouchableOpacity style={[styles.textInput, styles.roleDisplay]} onPress={() => setShowRolePicker(true)} disabled={isInteracting} >
                                <Text style={{ color: darkCardColors.mainText, fontSize: 16 }}>{role}</Text>
                                <Text style={{ color: darkCardColors.subText, fontSize: 16 }}>▼</Text>
                            </TouchableOpacity>

                            {/* CONDITIONAL DOCTOR FIELDS */}
                            {role === 'Doctor' && (
                                <>
                                    <Text style={styles.inputLabel}>Degree</Text>
                                    <TouchableOpacity style={[styles.textInput, styles.roleDisplay]} onPress={() => setShowDegreePicker(true)} disabled={isInteracting} >
                                        <Text style={{ color: darkCardColors.mainText, fontSize: 16 }}>{degree}</Text>
                                        <Text style={{ color: darkCardColors.subText, fontSize: 16 }}>▼</Text>
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.inputLabel}>Registration Number</Text>
                                    <TextInput style={styles.textInput} placeholder="Official Registration No." placeholderTextColor={darkCardColors.subText} value={registrationNumber} onChangeText={setRegistrationNumber} autoCapitalize="characters" color={darkCardColors.mainText} editable={!isInteracting} />
                                </>
                            )}
                            {/* Mobile Number Input */}
                            <Text style={styles.inputLabel}>Mobile Number (10 Digits)</Text>
                            <TextInput style={styles.textInput} placeholder="0000 000 000" placeholderTextColor={darkCardColors.subText} value={mobile} onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))} keyboardType="phone-pad" maxLength={10} color={darkCardColors.mainText} editable={!isInteracting} />

                            {/* Email Input */}
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput style={styles.textInput} placeholder="e.g., user@example.com" placeholderTextColor={darkCardColors.subText} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" color={darkCardColors.mainText} editable={!isInteracting} />
                            
                            {/* Address Input */}
                            <Text style={styles.inputLabel}>Address</Text>
                            <TextInput style={[styles.textInput, { height: 80, paddingVertical: 15 }]} placeholder="Full Mailing Address" placeholderTextColor={darkCardColors.subText} value={address} onChangeText={setAddress} autoCapitalize="words" multiline={true} color={darkCardColors.mainText} editable={!isInteracting} />
                            
                            {/* Age Input */}
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput style={styles.textInput} placeholder="Age (e.g., 30)" placeholderTextColor={darkCardColors.subText} value={age} onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" maxLength={3} color={darkCardColors.mainText} editable={!isInteracting} />

                            {/* Gender Selector */}
                            <Text style={styles.inputLabel}>Gender</Text>
                            <TouchableOpacity style={[styles.textInput, styles.roleDisplay]} onPress={() => setShowGenderPicker(true)} disabled={isInteracting} >
                                <Text style={{ color: darkCardColors.mainText, fontSize: 16 }}>{gender}</Text>
                                <Text style={{ color: darkCardColors.subText, fontSize: 16 }}>▼</Text>
                            </TouchableOpacity>

                            {/* Language Selector */}
                            <Text style={styles.inputLabel}>Preferred Language</Text>
                            <TouchableOpacity style={[styles.textInput, styles.roleDisplay]} onPress={() => setShowLanguagePicker(true)} disabled={isInteracting} >
                                <Text style={{ color: darkCardColors.mainText, fontSize: 16 }}>{language}</Text>
                                <Text style={{ color: darkCardColors.subText, fontSize: 16 }}>▼</Text>
                            </TouchableOpacity>

                            {/* Password Input */}
                            <Text style={styles.inputLabel}>Set Password</Text>
                            <TextInput style={styles.textInput} placeholder="•••••••• (Min 6 characters)" placeholderTextColor={darkCardColors.subText} value={password} onChangeText={setPassword} secureTextEntry color={darkCardColors.mainText} editable={!isInteracting} />

                            {/* Confirm Password Input */}
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <TextInput style={styles.textInput} placeholder="•••••••• (Enter again)" placeholderTextColor={darkCardColors.subText} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry color={darkCardColors.mainText} editable={!isInteracting} />
                        </>
                    )}

                    {/* --- STEP 2: OTP INPUT FIELD --- */}
                    {currentStep === SIGNUP_STEP.OTP_VERIFY && (
                        <>
                            <Text style={styles.inputLabel}>6-Digit OTP</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter the code from your email"
                                placeholderTextColor={darkCardColors.subText}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                autoCapitalize="none"
                                color={darkCardColors.mainText}
                                editable={!isInteracting}
                            />
                            
                            {/* Resend OTP button */}
                            <TouchableOpacity 
                                style={styles.resendOtpButton} 
                                onPress={() => {
                                    Alert.alert('Resend OTP', 'The system will resend a new OTP to your email. Proceed?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Resend', onPress: handleInitialSubmission },
                                    ]);
                                }} 
                                disabled={isInteracting}
                            >
                                <Text style={styles.resendOtpText}>Resend OTP</Text>
                            </TouchableOpacity>

                            {/* Go Back to Edit Form */}
                            <TouchableOpacity 
                                style={styles.editFormButton} 
                                onPress={() => {
                                    setCurrentStep(SIGNUP_STEP.FORM_INPUT);
                                    setOtp('');
                                }} 
                                disabled={isInteracting}
                            >
                                <Text style={styles.editFormText}>← Edit Registration Details</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {/* --- MAIN ACTION BUTTON --- */}
                    <TouchableOpacity 
                        onPress={mainAction} 
                        style={[styles.signUpButton, screenState === 'loading' && styles.signUpButtonLoading]}
                        disabled={isInteracting}
                    >
                        {screenState === 'loading' ? (
                            <LottieView
                                source={BUTTON_LOADING_ANIMATION}
                                autoPlay
                                loop
                                style={styles.buttonLottie}
                            />
                        ) : (
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider and Sign In Link */}
                    <View style={styles.divider} />
                    <View style={styles.signInLinkContainer}>
                        <Text style={styles.linkText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} disabled={isInteracting}>
                            <Text style={styles.linkButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* --- Modals (Keep these outside ScrollView) --- */}

            {/* Role Selection Modal */}
            <Modal animationType="fade" transparent={true} visible={showRolePicker} onRequestClose={() => setShowRolePicker(false)} >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowRolePicker(false)} >
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Your Role</Text>
                        {ROLES.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.pickerItem, role === item && styles.pickerItemSelected]} onPress={() => handleRoleSelect(item)} >
                                <Text style={[styles.pickerItemText, role === item && {color: darkCardColors.darkCard}]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRolePicker(false)} >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Degree Selection Modal --- */}
            <Modal animationType="fade" transparent={true} visible={showDegreePicker} onRequestClose={() => setShowDegreePicker(false)} >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowDegreePicker(false)} >
                    <View style={[styles.pickerContainer, { maxHeight: '80%' }]}>
                        <Text style={styles.pickerTitle}>Select Your Degree</Text>
                        <ScrollView style={{ flexGrow: 0 }}>
                            {DEGREES.map((item, index) => (
                                <TouchableOpacity key={index} style={[styles.pickerItem, degree === item && styles.pickerItemSelected]} onPress={() => handleDegreeSelect(item)} >
                                    <Text style={[styles.pickerItemText, degree === item && {color: darkCardColors.darkCard}]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowDegreePicker(false)} >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {/* Language Selection Modal */}
            <Modal animationType="fade" transparent={true} visible={showLanguagePicker} onRequestClose={() => setShowLanguagePicker(false)} >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowLanguagePicker(false)} >
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Preferred Language</Text>
                        {LANGUAGES.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.pickerItem, language === item && styles.pickerItemSelected]} onPress={() => handleLanguageSelect(item)} >
                                <Text style={[styles.pickerItemText, language === item && {color: darkCardColors.darkCard}]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowLanguagePicker(false)} >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {/* Gender Selection Modal */}
            <Modal animationType="fade" transparent={true} visible={showGenderPicker} onRequestClose={() => setShowGenderPicker(false)} >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowGenderPicker(false)} >
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Gender</Text>
                        {GENDERS.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.pickerItem, gender === item && styles.pickerItemSelected]} onPress={() => handleGenderSelect(item)} >
                                <Text style={[styles.pickerItemText, gender === item && {color: darkCardColors.darkCard}]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowGenderPicker(false)} >
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
    // --- Full Screen Transition Styles ---
    fullScreenContainer: {
        flex: 1,
        backgroundColor: darkCardColors.darkBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenLottie: {
        width: '100%',
        height: 300,
    },
    transitionText: {
        color: darkCardColors.white,
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    // --- Scroll & Keyboard Optimization ---
    scrollContent: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
        paddingBottom: 50, 
        paddingHorizontal: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- Lottie Styles (Button only) ---
    buttonLottie: {
        width: 50,
        height: 50,
    },
    // --- Header Styles ---
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
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: darkCardColors.subText,
        marginBottom: 20,
        textAlign: 'center',
    },
    // --- Card & Form Styles ---
    card: {
        backgroundColor: darkCardColors.darkCard,
        borderRadius: 15,
        padding: 25,
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
        color: darkCardColors.mainText,
    },
    roleDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 15,
    },
    // --- Button Styles ---
    signUpButton: {
        backgroundColor: darkCardColors.primaryHighlight,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 25,
    },
    signUpButtonLoading: {
        padding: 5,
        height: 50,
    },
    buttonText: {
        color: darkCardColors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendOtpButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    resendOtpText: {
        color: darkCardColors.greenSuccess,
        fontSize: 14,
        fontWeight: '600',
    },
    editFormButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    editFormText: {
        color: darkCardColors.subText,
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: darkCardColors.subText,
        marginVertical: 20,
    },
    // --- Link Styles ---
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

export default SignUpScreen;