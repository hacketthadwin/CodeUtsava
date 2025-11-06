import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, List, Divider, Modal, Portal, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { patients } from '../data/sampleData';

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openPatientProfile = (patient) => {
    setSelectedPatient(patient);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPatient(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <Title style={styles.headerTitle}>Patient List</Title>
        {patients.map((patient) => (
          <TouchableOpacity key={patient.id} onPress={() => openPatientProfile(patient)}>
            <Card style={styles.patientCard}>
              <Card.Content>
                <View style={styles.patientHeader}>
                  <Avatar.Icon 
                    size={48} 
                    icon={patient.gender === 'Male' ? 'account' : 'account-outline'} 
                    style={styles.avatar} 
                  />
                  <View style={styles.patientInfo}>
                    <Title style={styles.patientName}>{patient.name}</Title>
                    <Paragraph style={styles.patientDetails}>
                      {patient.age} years • {patient.gender}
                    </Paragraph>
                    <Paragraph style={styles.villageText}>{patient.village}</Paragraph>
                  </View>
                  <Chip mode="outlined" style={styles.appointmentChip}>
                    {patient.nextAppointment}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
          {selectedPatient && (
            <ScrollView>
              <View style={styles.modalHeader}>
                <Avatar.Icon 
                  size={64} 
                  icon={selectedPatient.gender === 'Male' ? 'account' : 'account-outline'} 
                  style={styles.modalAvatar} 
                />
                <Title style={styles.modalTitle}>{selectedPatient.name}</Title>
                <Paragraph style={styles.modalSubtitle}>
                  {selectedPatient.age} years • {selectedPatient.gender}
                </Paragraph>
              </View>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <Title>Contact Information</Title>
                  <List.Item
                    title="Village"
                    description={selectedPatient.village}
                    left={props => <List.Icon {...props} icon="map-marker" />}
                  />
                  <List.Item
                    title="Phone"
                    description={selectedPatient.phone}
                    left={props => <List.Icon {...props} icon="phone" />}
                  />
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <Title>Medical History</Title>
                  {selectedPatient.medicalHistory.map((condition, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Paragraph style={styles.historyText}>• {condition}</Paragraph>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <Title>Appointments</Title>
                  <List.Item
                    title="Last Visit"
                    description={selectedPatient.lastVisit}
                    left={props => <List.Icon {...props} icon="calendar-check" />}
                  />
                  <List.Item
                    title="Next Appointment"
                    description={selectedPatient.nextAppointment}
                    left={props => <List.Icon {...props} icon="calendar-clock" />}
                  />
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <Title>Health Reports ({selectedPatient.reports.length})</Title>
                  {selectedPatient.reports.map((report) => (
                    <List.Item
                      key={report.id}
                      title={report.name}
                      description={`${report.type} • ${report.date}`}
                      left={props => <List.Icon {...props} icon="file-document" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                  ))}
                </Card.Content>
              </Card>

              <Button mode="contained" onPress={closeModal} style={styles.closeButton}>
                Close
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    margin: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  patientCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 16,
  },
  patientName: {
    fontSize: 18,
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
  },
  villageText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  appointmentChip: {
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#6200ee',
  },
  modalAvatar: {
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    marginTop: 12,
  },
  modalSubtitle: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  infoCard: {
    margin: 16,
  },
  historyItem: {
    marginVertical: 4,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    margin: 16,
    backgroundColor: '#6200ee',
  },
});
