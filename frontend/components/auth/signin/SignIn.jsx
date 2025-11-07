import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import LottieView from 'lottie-react-native';
// NOTE: Make sure the path to App.js is correct based on your file structure
import { AuthContext } from '../../../App.js'; 

// --- Lottie Assets & Paths ---
const ROOT_PATH = '../../../'; 
const MAIN_LOCK_ANIMATION = require(`${ROOT_PATH}assets/animations/Lock.json`);
const AUTH_IDLE_ANIMATION = require(`${ROOT_PATH}assets/animations/password_auth.json`);
const AUTH_ERROR_ANIMATION = require(`${ROOT_PATH}assets/animations/error_anim.json`);
const LOADING_ANIMATION = require(`${ROOT_PATH}assets/animations/loader.json`); 

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
    yellowWarning: '#FFC107',
};

// --- FIXED API ENDPOINT ROOT ---
const API_BASE_URL = `http://192.168.137.1:5000/api/v1`; 

// --- Screen States for managing Lottie transitions ---
const SCREEN_STATE = {
    FORM: 'form',
    LOADING: 'loading_button', 
    SUCCESS: 'success_transition',
    ERROR: 'error_transition',
};

// --- OTP Authentication Steps ---
const AUTH_STEP = {
    EMAIL_INPUT: 1, 
    OTP_VERIFY: 2,  
};

// --- New: Authentication Method Selector ---
const AUTH_METHOD = {
    OTP: 'otp',
    PASSWORD: 'password',
};

// === CRITICAL: Mock Admin Credentials for Bypass ===
const MOCK_ADMIN_EMAIL = 'adarsh@gmail.com';
const MOCK_ADMIN_PASSWORD = 'adarsh';
// ===================================================

const SignInScreen = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState(''); 
    const [authStep, setAuthStep] = useState(AUTH_STEP.EMAIL_INPUT);
    const [screenState, setScreenState] = useState(SCREEN_STATE.FORM); 
    const [authMethod, setAuthMethod] = useState(AUTH_METHOD.PASSWORD); // Default to Password flow
    
    // Ensure that if it starts on the OTP flow, the password mock won't work 
    // without changing the method first. Setting default to PASSWORD is helpful for testing.

    const isButtonLoading = screenState === SCREEN_STATE.LOADING;
    const isOTPFlow = authMethod === AUTH_METHOD.OTP;

    // --- Utility function to switch authentication mode ---
    const switchAuthMethod = (method) => {
        setAuthMethod(method);
        // Reset specific states when switching method
        setAuthStep(AUTH_STEP.EMAIL_INPUT);
        setOtp('');
        setPassword('');
        setScreenState(SCREEN_STATE.FORM);
    };

    // Helper function to handle network calls and common error logic
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
                    Alert.alert('Authentication Failed', errorMessage);
                }, 2000); 

                throw new Error(errorMessage);
            }

            return responseData;

        } catch (error) {
            if (error.message.includes('Network request failed')) {
                Alert.alert(
                    'Network Error', 
                    `Could not reach the server at ${API_BASE_URL}. Please ensure your backend is running.`
                );
            }
            throw error;
        }
    };

    // --- HANDLER: Password Login (POST /login-password) ---
    const handlePasswordLogin = async () => {
        if (!email || !password) {
            Alert.alert('Input Required', 'Please enter both email and password.');
            return;
        }

        setScreenState(SCREEN_STATE.LOADING);
        
        // =======================================================
        // >>> START: MOCK ADMIN LOGIN IMPLEMENTATION <<<
        // =======================================================
        if (email.toLowerCase() === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
            // Bypass API call and simulate a successful admin login response
            const mockAdminResponse = {
                success: true,
                token: 'mock-admin-token-123',
                user: {
                    _id: 'mock-admin-id',
                    name: 'Adarsh Admin',
                    role: 'Admin', // <--- CRITICAL: Set the role to 'Admin'
                    email: MOCK_ADMIN_EMAIL,
                    phone: '9999999999',
                    age: 30,
                    gender: 'Male',
                    avatarUri: 'https://placehold.co/100x100/FF5722/FFFFFF/png?text=AA',
                },
            };
            
            // Simulate a short loading time
            setTimeout(() => {
                handleSuccessfulLogin(mockAdminResponse);
            }, 1000); 

            return; // Exit the function to prevent the actual API call
        }
        // =======================================================
        // >>> END: MOCK ADMIN LOGIN IMPLEMENTATION <<<
        // =======================================================


        try {
            const payload = { email, password };
            const responseData = await makeApiCall('login-password', payload); 
            
            handleSuccessfulLogin(responseData);

        } catch (error) {
            setScreenState(SCREEN_STATE.FORM);
        }
    };

    // --- HANDLER: OTP Send (POST /send-otp) ---
    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert('Input Required', 'Please enter your email address.');
            return;
        }

        setScreenState(SCREEN_STATE.LOADING);
        
        try {
            const payload = { email };
            const responseData = await makeApiCall('send-otp', payload);

            setAuthStep(AUTH_STEP.OTP_VERIFY);
            Alert.alert('OTP Sent!', responseData.message);
            setScreenState(SCREEN_STATE.FORM); 

        } catch (error) {
            setScreenState(SCREEN_STATE.FORM);
        }
    };
    
    // --- HANDLER: OTP Verify and Login (POST /login) ---
    const handleVerifyOtpAndLogin = async () => {
        if (!email || !otp) {
            Alert.alert('Input Required', 'Please enter both email and the OTP you received.');
            return;
        }

        setScreenState(SCREEN_STATE.LOADING);
        
        try {
            const payload = { email, otp };
            const responseData = await makeApiCall('login', payload);
            
            handleSuccessfulLogin(responseData);

        } catch (error) {
            // Error handling is inside makeApiCall
        }
    };
    
    // --- SHARED SUCCESS HANDLER ---
    const handleSuccessfulLogin = (responseData) => {
        const token = responseData.token;
        const user = responseData.user;
        const role = user.role || 'User'; 

        const userData = {
            id: user._id || user.id,
            name: user.name,
            role: role, 
            email: user.email || email, 
            number: user.phone || 'N/A', 
            avatarUri: user.avatarUri || 'https://placehold.co/100x100/311B92/FFFFFF/png?text=' + user.name.charAt(0).toUpperCase(),
            age: user.age,
            gender: user.gender,
        };
        
        setScreenState(SCREEN_STATE.SUCCESS); 
        const transitionTime = 2500; 

        setTimeout(() => {
            // CRITICAL: This is where the AuthContext signIn function is called with the role.
            signIn(token, role, userData); 
            // Reset states for next sign-in
            setScreenState(SCREEN_STATE.FORM);
            setAuthStep(AUTH_STEP.EMAIL_INPUT); 
            setOtp(''); 
            setPassword('');
            setEmail('');
        }, transitionTime);
    }
    
    // Determine the primary button action and text
    let primaryAction, buttonText;

    if (isOTPFlow) {
        primaryAction = authStep === AUTH_STEP.EMAIL_INPUT ? handleSendOtp : handleVerifyOtpAndLogin;
        buttonText = authStep === AUTH_STEP.EMAIL_INPUT ? 'SEND OTP' : 'VERIFY & LOGIN';
    } else {
        // Password Flow
        primaryAction = handlePasswordLogin;
        buttonText = 'LOGIN WITH PASSWORD';
    }


    // --- Conditional Full-Screen RENDER (Success/Error Transitions) ---

    if (screenState === SCREEN_STATE.SUCCESS || screenState === SCREEN_STATE.ERROR) {
        const transitionSource = screenState === SCREEN_STATE.SUCCESS 
            ? MAIN_LOCK_ANIMATION 
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
                    {screenState === SCREEN_STATE.SUCCESS ? 'Access Granted' : 'Authentication Error'}
                </Text>
            </View>
        );
    }

    // --- FORM RENDER (Default State) ---

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={darkCardColors.darkCard} barStyle="light-content" />
            
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                <View style={styles.lottieContainer}>
                    <LottieView
                        source={AUTH_IDLE_ANIMATION}
                        autoPlay
                        loop={true}
                        style={styles.lottie}
                    />
                </View>
                
                <Text style={styles.appTitle}>CardiaMind</Text>
                
                {/* --- Authentication Method Selector --- */}
                <View style={styles.authMethodSelector}>
                    <TouchableOpacity
                        style={[styles.methodButton, isOTPFlow && styles.methodButtonActive]}
                        onPress={() => switchAuthMethod(AUTH_METHOD.OTP)}
                        disabled={isButtonLoading}
                    >
                        <Text style={[styles.methodText, isOTPFlow && styles.methodTextActive]}>Login with OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.methodButton, !isOTPFlow && styles.methodButtonActive]}
                        onPress={() => switchAuthMethod(AUTH_METHOD.PASSWORD)}
                        disabled={isButtonLoading}
                    >
                        <Text style={[styles.methodText, !isOTPFlow && styles.methodTextActive]}>Login with Password</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.subtitle}>
                    {isOTPFlow 
                        ? (authStep === AUTH_STEP.EMAIL_INPUT 
                            ? 'Enter your email to receive a secure one-time password.' 
                            : `A 6-digit OTP has been sent to ${email}. Please enter it below.`)
                        : 'Enter your email and password to log in.'
                    }
                </Text>

                <View style={styles.card}>
                    
                    {/* Email Input (Always Visible) */}
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., test@user.com"
                        placeholderTextColor={darkCardColors.subText}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        color={darkCardColors.mainText}
                        // Lock email after sending OTP (but allow changing if in password flow)
                        editable={!isButtonLoading && (isOTPFlow ? authStep === AUTH_STEP.EMAIL_INPUT : true)} 
                    />

                    {/* Password Input (Visible only for Password Flow) */}
                    {!isOTPFlow && (
                        <>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your password"
                                placeholderTextColor={darkCardColors.subText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                color={darkCardColors.mainText}
                                editable={!isButtonLoading}
                            />
                            <TouchableOpacity 
                                style={styles.forgotPasswordButton} 
                                // You can implement a separate navigation or state for Forgot Password flow
                                onPress={() => Alert.alert("Forgot Password", "Redirecting to password reset flow...")}
                                disabled={isButtonLoading}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </>
                    )}


                    {/* OTP Input (Visible only for OTP Flow - Step 2) */}
                    {isOTPFlow && authStep === AUTH_STEP.OTP_VERIFY && (
                        <>
                            <Text style={styles.inputLabel}>One-Time Password (OTP)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter 6-digit OTP"
                                placeholderTextColor={darkCardColors.subText}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                secureTextEntry={false}
                                autoCapitalize="none"
                                color={darkCardColors.mainText}
                                editable={!isButtonLoading}
                            />
                             {/* Resend/Change Email Button for OTP Step 2 */}
                            <TouchableOpacity 
                                style={styles.resendOtpButton} 
                                onPress={() => {
                                    setAuthStep(AUTH_STEP.EMAIL_INPUT);
                                    setOtp('');
                                    Alert.alert('Email Changed', 'Please enter your email again to resend the OTP.');
                                }}
                                disabled={isButtonLoading}
                            >
                                <Text style={styles.resendOtpText}>Resend OTP or Change Email</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    

                    {/* Primary Action Button */}
                    <TouchableOpacity 
                        onPress={primaryAction} 
                        style={[styles.signInButton, isButtonLoading && styles.signInButtonLoading]}
                        disabled={isButtonLoading}
                    >
                        {isButtonLoading ? (
                            <LottieView
                                source={LOADING_ANIMATION} 
                                autoPlay
                                loop
                                style={styles.buttonLottie}
                            />
                        ) : (
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        )}
                    </TouchableOpacity>
                    
                    {/* Divider and Sign Up Link */}
                    <View style={styles.divider} />
                    <View style={styles.signUpLinkContainer}>
                        <Text style={styles.linkText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={isButtonLoading}>
                            <Text style={styles.linkButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkCardColors.darkBackground,
    },
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
    scrollContent: {
        flexGrow: 1, 
        padding: 25,
        paddingBottom: 50, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- Lottie Styles ---
    lottieContainer: {
        width: '80%',
        maxWidth: 200, 
        height: 120, 
        alignSelf: 'center',
        marginBottom: 5, 
    },
    lottie: {
        flex: 1,
    },
    buttonLottie: {
        width: 50,
        height: 50,
    },
    // --- Text & Layout Styles (Your Original Styles) ---
    appTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: darkCardColors.primaryHighlight,
        marginBottom: 5,
    },
    // --- New Method Selector Styles ---
    authMethodSelector: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 400,
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: darkCardColors.darkCard,
        borderWidth: 1,
        borderColor: darkCardColors.primaryHighlight,
    },
    methodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: darkCardColors.darkCard,
    },
    methodButtonActive: {
        backgroundColor: darkCardColors.primaryHighlight,
    },
    methodText: {
        color: darkCardColors.primaryHighlight,
        fontWeight: '600',
    },
    methodTextActive: {
        color: darkCardColors.white,
    },
    // ---------------------------------
    subtitle: {
        fontSize: 16,
        color: darkCardColors.subText,
        marginBottom: 20,
        textAlign: 'center',
        maxWidth: 400,
    },
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
    resendOtpButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    resendOtpText: {
        color: darkCardColors.greenSuccess,
        fontSize: 14,
        fontWeight: '600',
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: 5,
    },
    forgotPasswordText: {
        color: darkCardColors.yellowWarning,
        fontSize: 14,
        fontWeight: '600',
    },
    signInButton: {
        backgroundColor: darkCardColors.primaryHighlight,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10,
    },
    signInButtonLoading: {
        padding: 5,
        height: 50,
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
    signUpLinkContainer: {
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
});

export default SignInScreen;