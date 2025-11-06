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
} from 'react-native';
import LottieView from 'lottie-react-native';

// --- Lottie Assets & Paths (Assuming components/auth/signin/ is the location) ---
const ROOT_PATH = '../../../'; 
// SUCCESS TRANSITION (lock.json)
const MAIN_LOCK_ANIMATION = require(ROOT_PATH + 'assets/animations/Lock.json');
// IDLE ABOVE FORM (password_auth.json)
const AUTH_IDLE_ANIMATION = require(ROOT_PATH + 'assets/animations/password_auth.json');
// ERROR TRANSITION (error_anim.json)
const AUTH_ERROR_ANIMATION = require(ROOT_PATH + 'assets/animations/error_anim.json');


const darkCardColors = {
  // --- Dark Theme Palette ---
  darkBackground: '#1E1E1E', 
  darkCard: '#2C2C2C',       
  primaryHighlight: '#4A90E2', 
  mainText: '#F0F0F0',         
  subText: '#888888',          
  white: '#ffffff',
  redDanger: '#B71C1C',
};

// --- Screen States for managing Lottie transitions ---
const SCREEN_STATE = {
  FORM: 'form',
  LOADING: 'loading_button', // For the button animation
  SUCCESS: 'success_transition',
  ERROR: 'error_transition',
};

// NOTE: The 'navigation' prop is assumed to be passed by our simple App.js state machine
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screenState, setScreenState] = useState(SCREEN_STATE.FORM); 

  const handleSignIn = () => {
    if (screenState !== SCREEN_STATE.FORM) return;
    
    if (!email || !password) {
      Alert.alert('Login Error', 'Please enter both email and password.');
      return;
    }

    setScreenState(SCREEN_STATE.LOADING); 

    // --- FRONTEND SIMULATION ---
    // Fail if email is 'fail@fail.com', otherwise succeed.
    const loginSuccessful = email.toLowerCase() !== 'fail@fail.com';
    const transitionTime = 2500; // Duration for Lottie transitions

    setTimeout(() => {
      if (loginSuccessful) {
        // 1. SUCCESS: Switch to full-screen success animation (lock.json)
        setScreenState(SCREEN_STATE.SUCCESS); 
        
        // Wait for the success animation to play
        setTimeout(() => {
          // 2. Transition to MainDashboard screen
          navigation.navigate('MainDashboard');
          setScreenState(SCREEN_STATE.FORM); // Reset state for future logins
        }, transitionTime); 

      } else {
        // 3. ERROR: Switch to full-screen error animation (error_anim.json)
        setScreenState(SCREEN_STATE.ERROR);
        
        // Wait for the error animation to play
        setTimeout(() => {
          // 4. Transition back to the form state
          Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
          setScreenState(SCREEN_STATE.FORM); 
        }, transitionTime); 
      }
    }, 1000); // Simulate network latency (1 second)
  };
  
  // --- Conditional Full-Screen RENDER (Success/Error Transitions) ---

  if (screenState === SCREEN_STATE.SUCCESS || screenState === SCREEN_STATE.ERROR) {
    const transitionSource = screenState === SCREEN_STATE.SUCCESS 
      ? MAIN_LOCK_ANIMATION 
      : AUTH_ERROR_ANIMATION; 

    return (
      // Full screen container with black background as requested
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

  const isButtonLoading = screenState === SCREEN_STATE.LOADING;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={darkCardColors.darkCard} barStyle="light-content" />
      
      {/* ScrollView enables content to move up with keyboard */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Lottie Animation Display (IDLE - password_auth.json) */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={AUTH_IDLE_ANIMATION}
            autoPlay
            loop={true}
            style={styles.lottie}
          />
        </View>
        
        {/* Header/Title */}
        <Text style={styles.appTitle}>ArogyaLink</Text>
        <Text style={styles.pageTitle}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in to access your dashboard.</Text>

        <View style={styles.card}>
          
          {/* Email Input */}
          <Text style={styles.inputLabel}>Email / ASHA ID</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., test@user.com or fail@fail.com to test error"
            placeholderTextColor={darkCardColors.subText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            color={darkCardColors.mainText}
            editable={!isButtonLoading}
          />

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor={darkCardColors.subText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            color={darkCardColors.mainText}
            editable={!isButtonLoading}
          />
          
          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ForgotPassword')} disabled={isButtonLoading}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button (with Loading Animation) */}
          <TouchableOpacity 
            onPress={handleSignIn} 
            style={[styles.signInButton, isButtonLoading && styles.signInButtonLoading]}
            disabled={isButtonLoading}
          >
            {isButtonLoading ? (
              <LottieView
                source={AUTH_IDLE_ANIMATION} 
                autoPlay
                loop
                style={styles.buttonLottie}
              />
            ) : (
              <Text style={styles.buttonText}>CONTINUE</Text>
            )}
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Sign Up Link */}
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
    // Removed flexGrow: 1 to ensure proper keyboard scroll behavior
    padding: 25,
    paddingBottom: 50, // Added extra padding at the bottom for keyboard clearance
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Lottie Styles ---
  lottieContainer: {
    width: '80%',
    maxWidth: 200, // Max width constraint
    height: 120, // Height for the idle password_auth icon
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
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: darkCardColors.primaryHighlight,
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: darkCardColors.primaryHighlight,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
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