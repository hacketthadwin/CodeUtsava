// UploadPatientRecord.jsx (FIXED: Using native Modal/TouchableOpacity for dropdown simulation)

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
  Modal, // Included Modal
  FlatList, // Included FlatList for option scrolling
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const cardColors = {
  // Common Colors
  grayText: '#6b7280',
  white: '#ffffff',
  
  // Green Tertiary Scheme
  greenPrimary: '#10b981',
  greenLight: '#e0f7e9',
  greenDark: '#047857',
  red: '#ef4444',
  black: '#000000',
};

// Data for Dropdowns
const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

// --- Reusable Dropdown Component ---

const DropdownPicker = ({ label, selectedValue, onSelect, options }) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleSelect = (value) => {
        onSelect(value);
        setIsVisible(false);
    };
    
    // Fallback display text
    const displayValue = selectedValue || `Select ${label}`;

    return (
        <View style={styles.dropdownContainer}>
            <Text style={styles.pickerLabel}>{label}</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsVisible(true)}>
                <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
                    {displayValue}
                </Text>
            </TouchableOpacity>

            <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={() => setIsVisible(false)}>
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={modalStyles.optionItem} onPress={() => handleSelect(item.value)}>
                                    <Text style={modalStyles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            style={modalStyles.flatList}
                        />
                        <TouchableOpacity style={modalStyles.closeButton} onPress={() => setIsVisible(false)}>
                            <Text style={modalStyles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


// --- Main Component ---
const UploadPatientRecord = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  
  // State for dynamic health records: [{ key: 'temp', value: '37' }]
  const [healthRecords, setHealthRecords] = useState([{ key: '', value: '' }]);

  // --- Handlers for Dynamic Records ---
  
  const handleAddRecord = () => {
    const lastRecord = healthRecords[healthRecords.length - 1];
    if (lastRecord.key.trim() && lastRecord.value.trim()) {
        setHealthRecords([...healthRecords, { key: '', value: '' }]);
    } else {
        Alert.alert('Incomplete Record', 'Please fill in the current key and value before adding a new record.');
    }
  };

  const handleRecordChange = (index, field, text) => {
    const newRecords = healthRecords.map((record, i) => {
      if (i === index) {
        return { ...record, [field]: text };
      }
      return record;
    });
    setHealthRecords(newRecords);
  };
  
  const handleRemoveRecord = (index) => {
      const newRecords = healthRecords.filter((_, i) => i !== index);
      setHealthRecords(newRecords);
  };


  // --- Submit Handler ---

  const handleSubmit = () => {
    if (!name || !age || !gender) {
      Alert.alert('Validation Error', 'Please fill in Name, Age, and Gender.');
      return;
    }
    
    const validRecords = healthRecords.filter(r => r.key.trim() && r.value.trim());

    const data = {
      name,
      age,
      gender,
      records: validRecords,
    };

    console.log('Submitting Data:', data);
    Alert.alert(
      'Success',
      `Patient record for ${name} submitted successfully with ${validRecords.length} health records!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.headerBackground}
        barStyle={theme.statusBarStyle}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Upload Patient Records</Text>
        <Text style={[styles.headerSubtitle, { color: theme.surface }]}>Data Entry</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Primary Patient Info */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Patient Information</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.tabBarBorder }]}
          placeholder="Patient Name"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />

        {/* Age Dropdown */}
        <DropdownPicker
          label="Age"
          selectedValue={age}
          onSelect={setAge}
          options={AGE_OPTIONS}
        />

        {/* Gender Dropdown */}
        <DropdownPicker
          label="Gender"
          selectedValue={gender}
          onSelect={setGender}
          options={GENDER_OPTIONS}
        />
        
        {/* 2. Health Records Section */}
        <View style={[styles.recordsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.recordsSectionTitle, { color: theme.text }]}>Health Records</Text>
            
            {/* Dynamic Record Inputs */}
            {healthRecords.map((record, index) => (
              <View key={index} style={styles.recordRow}>
                <TextInput
                  style={[styles.recordInput, styles.recordKeyInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.tabBarBorder }]}
                  placeholder="Key (e.g., Temp)"
                  placeholderTextColor={theme.textSecondary}
                  value={record.key}
                  onChangeText={(text) => handleRecordChange(index, 'key', text)}
                />
                <TextInput
                  style={[styles.recordInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.tabBarBorder }]}
                  placeholder="Value (e.g., 37)"
                  placeholderTextColor={theme.textSecondary}
                  value={record.value}
                  keyboardType="numeric"
                  onChangeText={(text) => handleRecordChange(index, 'value', text)}
                />
                {healthRecords.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveRecord(index)} style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>—</Text>
                    </TouchableOpacity>
                )}
              </View>
            ))}

            {/* + ADD RECORD Button */}
            <TouchableOpacity onPress={handleAddRecord} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ ADD RECORD</Text>
            </TouchableOpacity>
        </View>

        {/* 3. Submit Button */}
        <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>SUBMIT RECORDS</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cardColors.greenLight,
  },
  header: {
    backgroundColor: cardColors.greenPrimary,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cardColors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: cardColors.white,
    marginTop: 2,
    opacity: 0.8,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cardColors.greenDark,
      marginBottom: 10,
  },
  textInput: {
    height: 50,
    borderColor: cardColors.grayText,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: cardColors.white,
  },
  
  // Dropdown Styling
  dropdownContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: cardColors.grayText,
    marginBottom: 5,
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: cardColors.greenPrimary,
    borderRadius: 8,
    backgroundColor: cardColors.white,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: cardColors.black,
  },
  placeholderText: {
    color: cardColors.grayText,
  },
  
  // Records Card Styling
  recordsCard: {
      backgroundColor: cardColors.white,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
  recordsSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: cardColors.greenDark,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: cardColors.greenLight,
      paddingBottom: 5,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  recordInput: {
    height: 40,
    borderColor: cardColors.grayText,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: cardColors.greenLight,
    flex: 1,
    marginRight: 8,
  },
  recordKeyInput: {
    flex: 1.5,
  },
  removeButton: {
    backgroundColor: cardColors.red,
    width: 30,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: cardColors.white,
    fontSize: 18,
    lineHeight: 18, 
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: cardColors.greenDark,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: cardColors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  
  // Submit Button Styling
  submitButton: {
    backgroundColor: cardColors.greenPrimary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  submitButtonText: {
    color: cardColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// --- Modal Styles ---
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: cardColors.white,
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: cardColors.greenPrimary,
        marginBottom: 15,
    },
    flatList: {
        width: '100%',
    },
    optionItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: cardColors.greenLight,
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: cardColors.black,
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: cardColors.grayText,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    closeButtonText: {
        color: cardColors.white,
        fontWeight: 'bold',
    },
});

export default UploadPatientRecord;