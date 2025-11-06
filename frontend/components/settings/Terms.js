import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './Themes'; // Import the theme hook

// Component for a single policy paragraph
const TermsSection = ({ title, children, isWarning, currentTheme }) => (
  <View style={[
    styles.section, 
    { backgroundColor: currentTheme.cardBackground },
    isWarning && { backgroundColor: currentTheme.warningBackground, borderLeftColor: currentTheme.warningBorder, borderLeftWidth: 5 }
  ]}>
    <Text style={[styles.sectionTitle, { color: currentTheme.primary, borderBottomColor: currentTheme.primary }, isWarning && { color: currentTheme.secondary, borderBottomColor: currentTheme.secondary }]}>{title}</Text>
    {children}
  </View>
);

const TermsOfService = () => {
  const insets = useSafeAreaInsets();
  // Consume theme logic from the mock hook
  const { isDarkMode, toggleTheme, colors: currentTheme } = useTheme(); 
  const commonTextStyle = { color: currentTheme.text };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: currentTheme.background }]}>
      
      {/* Header and Theme Toggle */}
      <View style={styles.topBar}>
        <Text style={[styles.headerTitle, { color: currentTheme.primary }]}>Terms of Service</Text>
        <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeToggleText, commonTextStyle]}>{isDarkMode ? 'Dark' : 'Light'} Mode</Text>
            <Switch
                trackColor={{ false: currentTheme.cardBackground, true: currentTheme.primary }}
                thumbColor={currentTheme.white}
                onValueChange={toggleTheme}
                value={isDarkMode}
            />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        
        <Text style={[styles.dateText, { color: currentTheme.darkBlue }]}>Last Updated: October 2, 2025</Text>
        <Text style={[styles.introText, commonTextStyle, { borderBottomColor: currentTheme.cardBackground }]}>
          Welcome to our health application. Please read these Terms of Service ("Terms") carefully. By accessing or using our service, you agree to be bound by these Terms.
        </Text>

        {/* 1. Agreement to Terms */}
        <TermsSection title="1. Agreement to Terms" currentTheme={currentTheme}>
          <Text style={[styles.policyText, commonTextStyle]}>
            This application is provided for informational and logistical purposes only (e.g., tracking cycles, consulting doctor schedules). You must be 18 years of age or older, or have parental consent, to use this service.
          </Text>
        </TermsSection>

        {/* 2. Disclaimer of Medical Advice (CRITICAL) */}
        <TermsSection title="2. Not Medical Advice" isWarning={true} currentTheme={currentTheme}>
          <Text style={[styles.policyText, commonTextStyle]}>
            <Text style={[styles.policyTextHighlight, { color: currentTheme.warningText }]}>CRITICAL WARNING:</Text> The AI Chatbot, symptom tracker, and all informational content **DO NOT** constitute professional medical advice, diagnosis, or treatment. Always seek the advice of a physician or other qualified health provider with any questions you may have regarding a medical condition.
          </Text>
          <Text style={[styles.policyText, commonTextStyle]}>
            We are not responsible for any actions taken based on information from the AI assistant.
          </Text>
        </TermsSection>

        {/* 3. Emergency Services Limitation */}
        <TermsSection title="3. Emergency Services" currentTheme={currentTheme}>
          <Text style={[styles.policyText, commonTextStyle]}>
            The **Emergency SOS** function is designed to assist by locating you and notifying nearby services/contacts. It is a convenience feature and is NOT a substitute for dialing the local emergency number (e.g., 911, 112, 100) directly.
          </Text>
        </TermsSection>
        
        {/* 4. User Responsibilities */}
        <TermsSection title="4. User Obligations" currentTheme={currentTheme}>
          <Text style={[styles.policyText, commonTextStyle]}>
            You agree not to misuse the service, including:
          </Text>
          <Text style={styles.policyListItem}>
            <Text style={{color: currentTheme.darkBlue}}>- Providing false medical information.</Text>
          </Text>
          <Text style={styles.policyListItem}>
            <Text style={{color: currentTheme.darkBlue}}>- Harassing or abusing doctors or other users through the consultation service.</Text>
          </Text>
          <Text style={styles.policyListItem}>
            <Text style={{color: currentTheme.darkBlue}}>- Repeatedly misusing the SOS button for non-emergencies.</Text>
          </Text>
        </TermsSection>

        {/* 5. Termination */}
        <TermsSection title="5. Termination" currentTheme={currentTheme}>
          <Text style={[styles.policyText, commonTextStyle]}>
            We reserve the right to suspend or terminate your account immediately, without prior notice or liability, if you breach the Terms.
          </Text>
        </TermsSection>

        <Text style={[styles.footerText, { color: currentTheme.darkBlue }]}>
          Your continued use of the app signifies your acceptance of these updated Terms.
        </Text>

      </ScrollView>
    </View>
  );
};

export default TermsOfService;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#AAAAAA20',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 16,
    marginRight: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
  introText: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
    fontWeight: '500',
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
  },
  warningSection: {
    // borderLeftWidth is applied dynamically via the component props
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  policyText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  policyTextHighlight: {
    fontWeight: 'bold',
  },
  policyListItem: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
    lineHeight: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 20,
  }
});
