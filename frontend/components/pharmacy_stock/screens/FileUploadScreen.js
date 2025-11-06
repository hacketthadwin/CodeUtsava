import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { usePharmacy } from '../context/PharmacyContext';
import { COLORS } from '../utils/colors';

export default function FileUploadScreen() {
  const { importMedicines } = usePharmacy();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const bgColor = COLORS.white;
  const textColor = COLORS.black;
  const cardBg = COLORS.gray;

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const medicines = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const medicine = {};
      
      headers.forEach((header, index) => {
        if (header === 'quantity') {
          medicine[header] = parseInt(values[index]) || 0;
        } else {
          medicine[header] = values[index] || '';
        }
      });

      if (medicine.medicine) {
        medicines.push(medicine);
      }
    }

    return medicines;
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setUploadedFile(file);
      setUploading(true);

      setTimeout(async () => {
        try {
          const response = await fetch(file.uri);
          const content = await response.text();

          let medicines = [];

          if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(content);
            medicines = Array.isArray(parsed) ? parsed : [parsed];
          } else if (file.name.endsWith('.csv')) {
            medicines = parseCSV(content);
          }

          if (medicines.length > 0) {
            importMedicines(medicines);
            Alert.alert(
              'Success',
              `Successfully imported ${medicines.length} medicine(s)!`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setUploadedFile(null);
                    setUploading(false);
                  },
                },
              ]
            );
          } else {
            Alert.alert('Error', 'No valid medicine data found in file');
            setUploading(false);
          }
        } catch (error) {
          Alert.alert('Error', `Failed to parse file: ${error.message}`);
          setUploading(false);
        }
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      setUploading(false);
    }
  };

  const sampleJSON = `[
  {
    "pharmacy": "Sample Pharmacy",
    "medicine": "Medicine Name",
    "batch": "B123",
    "quantity": 100,
    "expiry": "2026-12-31",
    "price": "₹20/strip",
    "location": "City"
  }
]`;

  const sampleCSV = `pharmacy,medicine,batch,quantity,expiry,price,location
Sample Pharmacy,Medicine Name,B123,100,2026-12-31,₹20/strip,City`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Upload Stock Report</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.uploadCard, { backgroundColor: cardBg }]}>
          <Ionicons name="cloud-upload-outline" size={64} color={COLORS.primary} />
          <Text style={[styles.uploadTitle, { color: textColor }]}>
            Import Stock Data
          </Text>
          <Text style={[styles.uploadSubtitle, { color: textColor }]}>
            Upload a JSON or CSV file containing medicine data
          </Text>

          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.uploadingText, { color: textColor }]}>
                Processing file...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFilePick}
            >
              <Ionicons name="document-outline" size={24} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>Select File</Text>
            </TouchableOpacity>
          )}

          {uploadedFile && !uploading && (
            <View style={styles.fileInfo}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.tertiary} />
              <Text style={[styles.fileName, { color: textColor }]}>
                {uploadedFile.name}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Supported Formats
          </Text>
          <View style={styles.formatItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.tertiary} />
            <Text style={[styles.formatText, { color: textColor }]}>
              JSON (.json)
            </Text>
          </View>
          <View style={styles.formatItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.tertiary} />
            <Text style={[styles.formatText, { color: textColor }]}>
              CSV (.csv)
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Sample JSON Format
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{sampleJSON}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Sample CSV Format
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{sampleCSV}</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
          <Ionicons name="information-circle" size={24} color={COLORS.darkBlue} />
          <Text style={[styles.infoText, { color: textColor }]}>
            The imported data will be added to your existing stock. Make sure your file contains all required fields: pharmacy, medicine, batch, quantity, expiry, price, and location.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
  },
  formatText: {
    fontSize: 14,
  },
  codeBlock: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#a9b7c6',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
