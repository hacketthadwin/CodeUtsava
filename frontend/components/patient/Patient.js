import { StyleSheet, Text, View, Alert, TouchableOpacity, Dimensions, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import AvatarMenu from './othercomps/AvatarMenu'; 
import HealthChatBot from './othercomps/HealthChatBot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  tertiary: '#1B5E20', 
  danger: '#B71C1C', 
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightGray: '#F5F5F5',
  darkyellow:'#b88600'
};

// --- DUMMY DATA ---
const symptomLogData = [
  { id: 1, date: '2025-11-20', symptom: 'Fever', details: 'Max temp 38.5°C at 4 PM.', temperature: 38.5, status: 'High Fever', color: COLORS.danger },
  { id: 2, date: '2025-11-19', symptom: 'Cough', details: 'Occasional dry cough, mostly morning.', temperature: 37.0, status: 'Mild', color: COLORS.tertiary },
  { id: 3, date: '2025-11-19', symptom: 'Rash', details: 'Small red dots on tummy, not itchy.', temperature: 37.1, status: 'Tracked', color: COLORS.darkBlue },
  { id: 4, date: '2025-11-18', symptom: 'Fever', details: 'Spike to 39.2°C. Gave acetaminophen.', temperature: 39.2, status: 'Urgent', color: COLORS.danger },
];
const tempTrend = [36.9, 37.5, 37.1, 36.8, 37.5, 37.0, 38.5, 39.2];

// --- HELPER COMPONENTS (Moved outside main function) ---
const SymptomCard = ({ data }) => (
  <View style={[styles.logCard, { borderLeftColor: data.color }]}>
    <View style={styles.logCardHeader}>
      <Text style={styles.logCardDate}>{data.date}</Text>
      <View style={[styles.statusTag, { backgroundColor: data.color }]}>
        <Text style={styles.statusText}>{data.status}</Text>
      </View>
    </View>
    <Text style={styles.logCardSymptom}>{data.symptom}</Text>
    {data.temperature > 37.5 && (
      <Text style={styles.logCardTemperature}>
        Temp: <Text style={{fontWeight: 'bold', color: COLORS.secondary}}>{data.temperature}°C</Text>
      </Text>
    )}
    <Text style={styles.logCardDetails}>{data.details}</Text>
  </View>
);

const TemperatureChart = ({ data }) => {
  const chartHeight = 100;
  const maxTemp = 40; 
  const minTemp = 36;
  const range = maxTemp - minTemp;
  const horizontalSpacing = 35;

  const normalizedData = data.map(temp => ({
    temp,
    y: chartHeight - ((temp - minTemp) / range) * chartHeight,
    isFever: temp > 38.0,
  }));
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Last 8 Temperature Readings (°C)</Text>
      <View style={styles.chartArea}>
        <View style={[styles.tempLine, { top: chartHeight - ((38 - minTemp) / range) * chartHeight, borderColor: COLORS.danger }]} />
        <Text style={[styles.tempLabel, { top: chartHeight - ((38 - minTemp) / range) * chartHeight - 10, color: COLORS.danger }]}>38°C (Fever)</Text>

        {normalizedData.map((p, i) => (
          <View
            key={i}
            style={[
              styles.dataPoint,
              {
                top: p.y - 5,
                left: (i * horizontalSpacing) + 5,
                backgroundColor: p.isFever ? COLORS.danger : COLORS.primary,
              }
            ]}
          />
        ))}
      </View>
      <View style={styles.x_axis_wrapper}>
        {data.map((temp, i) => (
          <Text key={i} style={styles.x_axis_label}>R{i + 1}</Text>
        ))}
      </View>
    </View>
  );
};


// --- MAIN COMPONENT ---
const Patient = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Log');

  const handleChatbotPress = () => {
    setIsChatbotVisible(true);
  };

  const closeChatbot = () => {
    setIsChatbotVisible(false);
  };

  const handleUploadReport = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is needed to upload a report.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1 });
    if (!result.canceled) {
      // Navigate to Past Reports after a successful mock upload to view it.
      navigation.navigate('PastReports');
      Alert.alert('Report Uploaded', 'Your report has been successfully uploaded to your profile!');
    }
  };
  
  const handleContactSOS = () => {
    // Navigate to the primary SOS screen
    navigation.navigate('ContactSOS');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View 
          style={styles.mainContentArea}
          pointerEvents={isChatbotVisible ? 'none' : 'auto'}
        >

          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
    <AvatarMenu
      avatarUri={require('../p.jpg')} 
      onProfile={() => navigation.navigate('Profile')}
      onSettings={() => navigation.navigate('Settings')}
      onLogout={() => Alert.alert('Logout clicked')}
    />

            {/* --- TOP HOME PAGE DASHBOARD --- */}
            <Text style={[styles.greeting, { color: theme.text }]}>Hi, Adarsh</Text>

            <TouchableOpacity 
              style={styles.reportsTab} 
              onPress={() => navigation.navigate('PastReports')} // Navigate to PastReports
            >
              <Text style={styles.reportsTabText}>Past Reports</Text>
            </TouchableOpacity>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tabButton, activeTab === 'Log' && styles.activeTab]} onPress={() => setActiveTab('Log')}>
                <Text style={[styles.tabText, { color: activeTab === 'Log' ? COLORS.white : theme.text }, activeTab === 'Log' && styles.activeTabText]}>Symptom Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabButton, activeTab === 'NewEntry' && styles.activeTab]} onPress={() => setActiveTab('NewEntry')}>
                <Text style={[styles.tabText, { color: activeTab === 'NewEntry' ? COLORS.white : theme.text }, activeTab === 'NewEntry' && styles.activeTabText]}>+ New Entry</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'Log' ? (
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Temperature Trends</Text>
                <TemperatureChart data={tempTrend} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Symptoms</Text>
                {symptomLogData.map(data => (
                  <View key={data.id} style={[styles.logCard, { backgroundColor: theme.card, borderLeftColor: data.color, shadowColor: theme.textMuted }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={[styles.logCardDate, { color: theme.textSecondary }]}>{data.date}</Text>
                      <View style={[styles.statusTag, { backgroundColor: data.color }]}>
                        <Text style={styles.statusText}>{data.status}</Text>
                      </View>
                    </View>
                    <Text style={[styles.logCardSymptom, { color: theme.text }]}>{data.symptom}</Text>
                    {data.temperature > 37.5 && (
                      <Text style={[styles.logCardTemperature, { color: theme.textSecondary }]}>
                        Temp: <Text style={{fontWeight: 'bold', color: COLORS.secondary}}>{data.temperature}°C</Text>
                      </Text>
                    )}
                    <Text style={[styles.logCardDetails, { color: theme.textSecondary }]}>{data.details}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Log New Symptoms</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.tabBarBorder }]} placeholder="Date (YYYY-MM-DD)" placeholderTextColor={theme.textSecondary} />
                <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.tabBarBorder }]} placeholder="Symptom (e.g., Fever, Rash, Vomiting)" placeholderTextColor={theme.textSecondary} />
                <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.tabBarBorder }]} placeholder="Temperature (°C, optional)" placeholderTextColor={theme.textSecondary} keyboardType="numeric" />
                <TextInput style={[styles.inputArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.tabBarBorder }]} placeholder="Detailed notes" placeholderTextColor={theme.textSecondary} multiline />
                <TouchableOpacity style={styles.submitButton} onPress={() => Alert.alert('Logged!', 'Symptom entry saved successfully.')}>
                  <Text style={styles.submitButtonText}>Save Symptom Entry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- CHAT WITH DOCTORS (MOVED HERE) --- */}
            <TouchableOpacity 
              style={[styles.chatButton, { backgroundColor: COLORS.darkyellow }]} 
              onPress={() => navigation.navigate('ChatWithDoctor')} // Navigate to ChatWithDoctor
            >
              <Text style={styles.chatButtonText}>Chat with Doctors</Text>
            </TouchableOpacity>
            
            {/* --- ACTION BUTTONS GRID --- */}
            <View style={styles.buttonGrid}>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.primary, width: '48%'}]} onPress={() => navigation.navigate('Women')}>
                <Text style={styles.buttonText}>Women's Issues</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.tertiary, width: '48%'}]} onPress={() => navigation.navigate('Child')}>
                <Text style={styles.buttonText}>Child Issues</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.secondary, width: '48%', marginTop: 10}]} onPress={handleUploadReport}>
                <Text style={styles.buttonText}>Upload Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.darkBlue, width: '48%', marginTop: 10}]} onPress={() => navigation.navigate('RequestConsults')}>
                <Text style={styles.buttonText}>Request Consult</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.danger, width: '98%', marginTop: 10}]} onPress={handleContactSOS}>
                <Text style={styles.buttonText}>Contact SOS</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.fab, styles.fabShadow, { bottom: Math.max(24, insets.bottom + 10), right: 24 }]}
            onPress={handleChatbotPress}
          >
            <Text style={styles.fabText}>🧠</Text>
          </TouchableOpacity>
        </View>
        
        {isChatbotVisible && (
          <View style={styles.overlay}>
            <HealthChatBot onClose={closeChatbot} bottomInset={insets.bottom} />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default Patient; 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  mainContentArea: { flex: 1 },
  scrollView: { paddingHorizontal: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: COLORS.black, marginTop: 20, marginBottom: 10, },
  reportsTab: { backgroundColor: COLORS.gray, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, marginBottom: 10, },
  reportsTabText: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, },
  chatButton: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, marginBottom: 20, },
  chatButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', },
  tabContainer: { flexDirection: 'row', marginHorizontal: 0, marginTop: 20, marginBottom: 10, backgroundColor: COLORS.lightGray, borderRadius: 10, overflow: 'hidden', },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', },
  activeTab: { backgroundColor: COLORS.primary, borderRadius: 10, margin: 2, shadowColor: COLORS.black, shadowOpacity: 0.1, elevation: 3, },
  tabText: { color: COLORS.darkBlue, fontWeight: '600', fontSize: 16, },
  activeTabText: { color: COLORS.white, fontWeight: 'bold', },
  sectionTitle: { color: COLORS.black, fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 15, },
  chartContainer: { backgroundColor: COLORS.lightGray, borderRadius: 15, padding: 15, marginBottom: 20, alignItems: 'center', },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10, },
  chartArea: { width: '100%', height: 100, marginBottom: 5, position: 'relative', overflow: 'hidden', },
  tempLine: { position: 'absolute', left: 0, right: 0, borderBottomWidth: 1, borderStyle: 'dashed', },
  tempLabel: { position: 'absolute', right: 5, fontSize: 10, fontWeight: 'bold', },
  dataPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, zIndex: 10, },
  x_axis_wrapper: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, },
  x_axis_label: { fontSize: 10, color: '#888', },
  logCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, borderLeftWidth: 5, marginBottom: 10, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, },
  logCardDate: { fontSize: 12, color: '#888', fontWeight: '600', },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15, },
  statusText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', },
  logCardSymptom: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, },
  logCardDetails: { fontSize: 14, color: '#555', marginTop: 5, },
  logCardTemperature: { fontSize: 14, color: COLORS.black, marginTop: 5, },
  formContainer: { backgroundColor: COLORS.lightGray, padding: 20, borderRadius: 15, marginTop: 10, },
  input: { height: 50, backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, color: COLORS.black, marginBottom: 15, borderWidth: 1, borderColor: COLORS.gray, },
  inputArea: { height: 100, backgroundColor: COLORS.white, borderRadius: 10, padding: 15, fontSize: 16, color: COLORS.black, marginBottom: 20, borderWidth: 1, borderColor: COLORS.gray, textAlignVertical: 'top', },
  submitButton: { backgroundColor: COLORS.tertiary, padding: 15, borderRadius: 10, alignItems: 'center', },
  submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20, },
  actionButton: { borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13, textAlign: 'center', },
  fab: { position: 'absolute', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBlue, },
  fabText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', },
  fabShadow: { shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8, },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end', alignItems: 'center', zIndex: 10, },
})
