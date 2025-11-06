// PickerComponent.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
// NOTE: You must install the Picker package: npm install @react-native-picker/picker

const cardColors = {
  grayText: '#6b7280',
  greenLight: '#e0f7e9',
  greenPrimary: '#10b981',
  white: '#ffffff',
};

const PickerComponent = ({ label, selectedValue, onValueChange, items }) => (
  <View style={styles.pickerContainer}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={cardColors.greenPrimary}
      >
        {/* Default option */}
        <Picker.Item label={`Select ${label.toLowerCase()}`} value="" />
        {/* Dynamic items */}
        {items.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  </View>
);

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: cardColors.grayText,
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: cardColors.greenPrimary,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: cardColors.white,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333',
  },
});

export default PickerComponent;