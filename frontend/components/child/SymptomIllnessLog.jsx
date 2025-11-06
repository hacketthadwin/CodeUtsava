import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';

// Color scheme derived from the user's components
const COLORS = {
  primary: '#311B92',   // Dark Indigo (Main accents/Active tabs)
  secondary: '#880E4F', // Dark Maroon (Used for key data/Temperature)
  tertiary: '#1B5E20',   // Dark Forest Green (Positive notes/Status)
  danger: '#B71C1C',     // Dark Red (High fever/Urgent symptom)
  darkBlue: '#0047AB',  // Subtitles/Secondary info
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB', // Light background for inputs/cards
  lightGray: '#F5F5F5',
};

// --- DUMMY DATA ---
const symptomLogData = [
  { 
    id: 1, 
    date: '2025-11-20', 
    symptom: 'Fever', 
    details: 'Max temp 38.5°C at 4 PM.', 
    temperature: 38.5,
    status: 'High Fever',
    color: COLORS.danger 
  },
  { 
    id: 2, 
    date: '2025-11-19', 
    symptom: 'Cough', 
    details: 'Occasional dry cough, mostly morning.', 
    temperature: 37.0,
    status: 'Mild',
    color: COLORS.tertiary 
  },
  { 
    id: 3, 
    date: '2025-11-19', 
    symptom: 'Rash', 
    details: 'Small red dots on tummy, not itchy.', 
    temperature: 37.1,
    status: 'Tracked',
    color: COLORS.darkBlue
  },
  { 
    id: 4, 
    date: '2025-11-18', 
    symptom: 'Fever', 
    details: 'Spike to 39.2°C. Gave acetaminophen.', 
    temperature: 39.2,
    status: 'Urgent',
    color: COLORS.danger
  },
];

// FIX: Remove one of the reverse calls, and keep this data as is (latest reading last)
// The "R1, R2, R3..." labels will now correctly map to the data array index.
const tempTrend = [36.9, 37.5, 37.1, 36.8, 37.5, 37.0, 38.5, 39.2]; // Last 8 readings (R8 is 39.2)

// --- SUB-COMPONENTS ---

const SymptomCard = ({ data }) => (
  <View style={[logStyles.card, { borderLeftColor: data.color }]}>
    <View style={logStyles.cardHeader}>
      <Text style={logStyles.cardDate}>{data.date}</Text>
      <View style={[logStyles.statusTag, { backgroundColor: data.color }]}>
        <Text style={logStyles.statusText}>{data.status}</Text>
      </View>
    </View>
    <Text style={logStyles.cardSymptom}>{data.symptom}</Text>
    <Text style={logStyles.cardDetails}>{data.details}</Text>
    {data.temperature > 37.5 && (
      <Text style={logStyles.cardTemperature}>
        Temp: <Text style={{fontWeight: 'bold', color: COLORS.secondary}}>{data.temperature}°C</Text>
      </Text>
    )}
  </View>
);

const TemperatureChart = ({ data }) => {
  const chartHeight = 100;
  const maxTemp = 40; 
  const minTemp = 36;
  const range = maxTemp - minTemp;
  const horizontalSpacing = 35; // Increased spacing for visibility

  // Normalize data points to fit the chart height
  const normalizedData = data.map(temp => ({
    temp,
    // Calculate Y position: 0 is top (max temp), 100 is bottom (min temp)
    y: chartHeight - ((temp - minTemp) / range) * chartHeight,
    isFever: temp > 38.0,
  }));
  
  // NOTE: The path string and line segment logic is removed to fix layout issues.

  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>Last 8 Temperature Readings (°C)</Text>
      <View style={chartStyles.chartArea}>
        
        {/* Baseline Indicators (Fever threshold at 38°C) */}
        <View style={[chartStyles.tempLine, { top: chartHeight - ((38 - minTemp) / range) * chartHeight, borderColor: COLORS.danger }]} />
        <Text style={[chartStyles.tempLabel, { top: chartHeight - ((38 - minTemp) / range) * chartHeight - 10, color: COLORS.danger }]}>38°C (Fever)</Text>

        {/* FIX: Removed the complex line segment view */}
        
        {/* Data points (Dots) - Now rendered with proper horizontal spacing */}
        {normalizedData.map((p, i) => (
          <View 
            key={i} 
            style={[
              chartStyles.dataPoint, 
              { 
                top: p.y - 5, 
                left: (i * horizontalSpacing) + 5, // Use fixed spacing
                backgroundColor: p.isFever ? COLORS.danger : COLORS.primary,
              }
            ]}
          />
        ))}

      </View>
      <View style={chartStyles.x_axis_wrapper}>
        {/* FIX: Ensure labels are placed correctly relative to the dots */}
        {data.map((temp, i) => (
          <Text key={i} style={chartStyles.x_axis_label}>R{i + 1}</Text>
        ))}
      </View>
    </View>
  );
};


// --- MAIN COMPONENT ---

const SymptomIllnessLog = () => {
  const [activeTab, setActiveTab] = useState('Log'); // 'Log' or 'NewEntry'

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Symptom & Illness Log</Text>
      <Text style={styles.headerSubtitle}>Keep track of symptoms, temperatures, and doctor visits.</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Log' && styles.activeTab]}
          onPress={() => setActiveTab('Log')}
        >
          <Text style={[styles.tabText, activeTab === 'Log' && styles.activeTabText]}>Symptom Log</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'NewEntry' && styles.activeTab]}
          onPress={() => setActiveTab('NewEntry')}
        >
          <Text style={[styles.tabText, activeTab === 'NewEntry' && styles.activeTabText]}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'Log' ? (
          <View>
            <Text style={styles.sectionTitle}>Temperature Trends</Text>
            {/* FIX: Pass data directly without reversing it here */}
            <TemperatureChart data={tempTrend} /> 
            
            <Text style={styles.sectionTitle}>Recent Symptoms</Text>
            {symptomLogData.map(data => (
              <SymptomCard key={data.id} data={data} />
            ))}
            
          </View>
        ) : (
          <View style={formStyles.formContainer}>
            <Text style={styles.sectionTitle}>Log New Symptoms</Text>
            
            <TextInput style={formStyles.input} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#888" />
            <TextInput style={formStyles.input} placeholder="Symptom (e.g., Fever, Rash, Vomiting)" placeholderTextColor="#888" />
            <TextInput 
              style={formStyles.input} 
              placeholder="Temperature (°C, optional)" 
              placeholderTextColor="#888" 
              keyboardType="numeric"
            />
            <TextInput 
              style={formStyles.inputArea} 
              placeholder="Detailed notes (Duration, severity, medication given)" 
              placeholderTextColor="#888"
              multiline
            />
            
            <TouchableOpacity 
              style={formStyles.submitButton}
              onPress={() => Alert.alert('Logged!', 'Symptom entry saved successfully.')}
            >
              <Text style={formStyles.submitButtonText}>Save Symptom Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    margin: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  tabText: {
    color: COLORS.darkBlue,
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

// --- Chart Styles ---
const chartStyles = StyleSheet.create({
  chartContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  chartArea: {
    width: '100%',
    height: 100, // Fixed height for visualization
    marginBottom: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  tempLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  tempLabel: {
    position: 'absolute',
    right: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  // Removed lineSegment styles
  x_axis_wrapper: {
    // FIX: Set a width that matches the chart area to align labels
    width: '90%', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  x_axis_label: {
    fontSize: 10,
    color: '#888',
  }
});

// --- Log Card Styles ---
const logStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardSymptom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  cardDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  cardTemperature: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 5,
  }
});

// --- Form Styles ---
const formStyles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  inputArea: {
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.tertiary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SymptomIllnessLog;
