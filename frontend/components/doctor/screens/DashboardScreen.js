import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { schedule } from '../data/sampleData';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title style={styles.welcomeTitle}>Welcome, Dr. Verma</Title>
          <Paragraph style={styles.dateText}>{today}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Today's Summary</Title>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Avatar.Icon size={48} icon="calendar" style={styles.summaryIcon} />
              <Paragraph style={styles.summaryNumber}>{schedule.length}</Paragraph>
              <Paragraph style={styles.summaryLabel}>Appointments</Paragraph>
            </View>
            <View style={styles.summaryItem}>
              <Avatar.Icon size={48} icon="account-group" style={styles.summaryIcon} />
              <Paragraph style={styles.summaryNumber}>42</Paragraph>
              <Paragraph style={styles.summaryLabel}>Total Patients</Paragraph>
            </View>
            <View style={styles.summaryItem}>
              <Avatar.Icon size={48} icon="file-document" style={styles.summaryIcon} />
              <Paragraph style={styles.summaryNumber}>8</Paragraph>
              <Paragraph style={styles.summaryLabel}>New Reports</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Today's Schedule</Title>
      
      {schedule.map((appointment) => (
        <Card key={appointment.id} style={styles.appointmentCard}>
          <Card.Content>
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentInfo}>
                <Title style={styles.patientName}>{appointment.patientName}</Title>
                <Paragraph style={styles.villageText}>{appointment.village}</Paragraph>
              </View>
              <Chip mode="outlined" style={styles.typeChip}>{appointment.type}</Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Avatar.Icon size={24} icon="clock-outline" style={styles.detailIcon} />
                <Paragraph style={styles.detailText}>{appointment.time}</Paragraph>
              </View>
              <View style={styles.detailRow}>
                <Avatar.Icon size={24} icon="timer-outline" style={styles.detailIcon} />
                <Paragraph style={styles.detailText}>{appointment.duration}</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#6200ee',
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 24,
  },
  dateText: {
    color: '#e0e0e0',
    marginTop: 4,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  summaryIcon: {
    backgroundColor: '#6200ee',
  },
  summaryNumber: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  appointmentCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    marginBottom: 4,
  },
  villageText: {
    color: '#666',
    fontSize: 14,
  },
  typeChip: {
    height: 32,
  },
  divider: {
    marginVertical: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
  },
});
