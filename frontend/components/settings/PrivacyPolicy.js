import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#311B92',    // Dark Indigo (Section headers)
  darkBlue: '#0047AB',   // Key privacy points
  white: '#FFFFFF',
  black: '#000000',      // Main text
  gray: '#F0F0F0',       // Background for containers
  lightGray: '#FFFFFF',  // Row background
};

// Component for a single policy paragraph
const PolicySection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const PrivacyPolicy = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Privacy Policy</Text>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        
        <Text style={styles.dateText}>Effective Date: October 2, 2025</Text>
        <Text style={styles.introText}>
          Your privacy is paramount. This policy explains how we collect, use, protect, and handle your **personal and sensitive health information** within the application.
        </Text>

        {/* 1. Data Collection */}
        <PolicySection title="1. Information We Collect">
          <Text style={styles.policyText}>
            We collect information strictly necessary to provide and improve our services:
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Profile Data:</Text> Name, DOB, Phone Number, and Role (for identity verification).
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Health & Wellness Data:</Text> Symptom logs, temperature records, period cycles, and uploaded medical reports (images/PDFs).
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Location Data:</Text> Collected only when the **Emergency SOS** feature is actively triggered, for dispatching aid.
          </Text>
        </PolicySection>

        {/* 2. Data Usage and Confidentiality */}
        <PolicySection title="2. How We Use Your Data">
          <Text style={styles.policyText}>
            Your health data is used only for:
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Service Delivery:</Text> Providing accurate cycle predictions, enabling consultations, and facilitating emergency services.
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>AI Chatbot Anonymity:</Text> Chat logs are stripped of personal identifiers before being processed by the AI, ensuring conversations remain confidential.
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Consultation:</Text> Shared only with the specific doctor you request a consultation with.
          </Text>
        </PolicySection>

        {/* 3. Data Security and Third Parties */}
        <PolicySection title="3. Security and Storage">
          <Text style={styles.policyText}>
            We employ industry-standard encryption protocols (end-to-end) for all health records.
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Storage:</Text> All health data is stored securely using cloud services compliant with global data protection standards.
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Third Parties:</Text> We do not sell your personal health data. Data is only shared with third-party emergency services (e.g., ambulance dispatch) when you manually trigger the SOS function.
          </Text>
        </PolicySection>

        {/* 4. User Rights and Control */}
        <PolicySection title="4. Your Rights and Controls">
          <Text style={styles.policyText}>
            You have full control over your information via the Settings menu:
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Access and Rectification:</Text> You can view and edit your profile data at any time.
          </Text>
          <Text style={styles.policyListItem}>
            - <Text style={styles.policyListItemHighlight}>Data Deletion:</Text> You can request complete deletion of all your health records and personal data from our servers.
          </Text>
        </PolicySection>

        <Text style={styles.footerText}>
          By using this application, you acknowledge that you have read and understood this Privacy Policy.
        </Text>

      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 20,
  },
  introText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 30,
    lineHeight: 24,
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: COLORS.gray,
    borderRadius: 10,
  },
  sectionTitle: {
    color: COLORS.darkBlue,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 5,
  },
  policyText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 10,
  },
  policyListItem: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    marginBottom: 5,
    lineHeight: 20,
  },
  policyListItemHighlight: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 20,
  }
});
