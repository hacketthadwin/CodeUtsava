import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

export default function SettingsScreen() {
  const bgColor = COLORS.white;
  const textColor = COLORS.black;
  const cardBg = COLORS.gray;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            About
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColor }]}>App Name:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              Pharmacy Stock Manager
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColor }]}>Version:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColor }]}>Mode:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              Standalone (Mock Data)
            </Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
          <Ionicons name="information-circle" size={24} color={COLORS.darkBlue} />
          <Text style={[styles.infoText, { color: textColor }]}>
            This is a standalone version using local mock data. Authentication and PHC Dashboard integration will be added in future updates.
          </Text>
        </View>
      </View>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
