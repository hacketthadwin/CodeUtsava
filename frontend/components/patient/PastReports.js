import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

const reportData = [
  { id: '1', date: '2025-09-28', doctor: 'Dr. S. Verma', type: 'Blood Test Results' },
  { id: '2', date: '2025-08-15', doctor: 'Dr. P. Sharma', type: 'Consultation Summary' },
  { id: '3', date: '2025-05-10', doctor: 'Dr. A. Singh', type: 'Ultrasound Scan (PDF)' },
  { id: '4', date: '2025-03-01', doctor: 'Dr. R. Gupta', type: 'X-Ray Image' },
  { id: '5', date: '2024-12-19', doctor: 'PHC Clinic', type: 'Vaccination Record' },
];

const ReportItem = ({ date, doctor, type }) => (
  <View style={styles.row}>
    <View style={styles.dateColumn}>
      <Text style={styles.dateText}>{date}</Text>
      <Text style={styles.doctorText}>File: {type}</Text>
      <Text style={styles.doctorText}>Dr.: {doctor}</Text>
    </View>
    <TouchableOpacity
      style={styles.reportTile}
      onPress={() => Alert.alert('View Report', `Viewing the ${type} uploaded on ${date}`)}
    >
      <View style={styles.tileIconContainer}>
        <Text style={styles.tileIcon}>📄</Text>
      </View>
      <Text style={styles.tileText}>Tap to View</Text>
    </TouchableOpacity>
  </View>
);

const PastReports = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Past Reports & Documents</Text>
      <Text style={styles.headerSubtitle}>View and access your archived medical records.</Text>
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, styles.dateColumn]}>DATE & DETAILS</Text>
        <Text style={[styles.listHeaderText, styles.reportTilePlaceholder]}>REPORT</Text>
      </View>
      <FlatList
        data={reportData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportItem date={item.date} doctor={item.doctor} type={item.type} />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: COLORS.darkBlue,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  listHeaderText: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 12,
  },
  listContent: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  dateColumn: {
    flex: 1,
    paddingRight: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  doctorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportTile: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  reportTilePlaceholder: {
    width: 80,
    textAlign: 'center',
  },
  tileIconContainer: {
    marginBottom: 2,
  },
  tileIcon: {
    fontSize: 24,
  },
  tileText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default PastReports;
