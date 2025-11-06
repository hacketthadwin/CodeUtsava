import { StyleSheet, Text, View, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
};

// --- FAQ DATA ---
const faqData = [
  {
    id: 1,
    question: "How does the AI Chatbot ensure my data privacy?",
    answer: "The AI Chatbot operates on a privacy-focused model. Chat logs are anonymized and are NOT linked to your personal health records (Aadhar, DOB). We use advanced encryption protocols to secure all communication.",
    category: 'Privacy',
  },
  {
    id: 2,
    question: "Can I trust the information provided by the health assistant?",
    answer: "The assistant uses Google Search grounding and is prompted to provide only general, expert-reviewed health information. It should never replace a consultation with a qualified doctor. Always consult a professional for a diagnosis.",
    category: 'General',
  },
  {
    id: 3,
    question: "How do I request a consultation with a specific PHC doctor?",
    answer: "Navigate to the 'Request Consult' section and select a doctor from the available list. Your request will be sent to the Primary Health Center (PHC), and the doctor will be in touch to schedule an appointment.",
    category: 'Consultation',
  },
  {
    id: 4,
    question: "What should I do if the Contact SOS button is accidentally pressed?",
    answer: "If pressed accidentally, do not panic. Call your emergency contact immediately to inform them it was an error. The app sends a short delay message, giving you a small window to cancel the alert.",
    category: 'Safety',
  },
  {
    id: 5,
    question: "How do I upload a document or lab report?",
    answer: "From the main dashboard, use the 'Upload Report' button. You can select an image or document from your phone's gallery. The file is uploaded securely and archived under 'Past Reports' for your reference.",
    category: 'Reports',
  },
];

// --- ACCORDION ROW COMPONENT ---
const AccordionItem = ({ item, isOpen, onPress }) => (
  <View style={styles.accordionContainer}>
    <TouchableOpacity style={styles.questionButton} onPress={onPress}>
      <Text style={styles.questionText}>{item.question}</Text>
      <Text style={styles.arrowIcon}>{isOpen ? '▲' : '▼'}</Text>
    </TouchableOpacity>

    {/* Animated Answer Section */}
    {isOpen && (
      <View style={styles.answerContent}>
        <Text style={styles.answerText}>{item.answer}</Text>
        <Text style={styles.categoryTag}>Category: {item.category}</Text>
      </View>
    )}
  </View>
);

// --- MAIN COMPONENT ---
const FAQ = () => {
  const [openId, setOpenId] = useState(null);
  const insets = useSafeAreaInsets();

  const handlePress = (id) => {
    // Enable layout animation before state change for smooth transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.headerSubtitle}>Find answers regarding privacy, safety, and core app features.</Text>
        
        <View style={styles.faqList}>
          {faqData.map(item => (
            <AccordionItem 
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onPress={() => handlePress(item.id)}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default FAQ;

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
    marginTop: 10,
  },
  headerSubtitle: {
    color: COLORS.darkBlue,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  faqList: {
    marginTop: 10,
  },
  // --- Accordion Styles ---
  accordionContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  questionButton: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginRight: 10,
  },
  arrowIcon: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  answerContent: {
    padding: 15,
    backgroundColor: COLORS.gray, // Light grey for the answer background
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  categoryTag: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  }
});
