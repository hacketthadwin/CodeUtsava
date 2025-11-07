import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, List, Divider, Modal, Portal, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { patients } from '../data/sampleData';

// Reusing primary colors from DoctorMainDashboard for consistent styling
const PRIMARY_COLOR = '#311B92';
const ACCENT_COLOR = '#880E4F';
const DANGER_COLOR = '#B71C1C';
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const GRAY = '#E5E7EB';

// Define the approximate height of the TabBar from DoctorMainDashboard
const TAB_BAR_HEIGHT = 70;

export default function PatientsScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openPatientProfile = (patient) => {
        setSelectedPatient(patient);
        setModalVisible(true);
    };

    // closeModal handles both the button press and the backdrop click (via onDismiss)
    const closeModal = () => {
        setModalVisible(false);
        setSelectedPatient(null);
    };

    // Calculate the required extra padding at the bottom of the ScrollView
    const bottomContentPadding = TAB_BAR_HEIGHT + insets.bottom + 10;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.headerContainer, { paddingTop: insets.top ? 10 : 0 }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Patient Management</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>View patient profiles and reports.</Text>
            </View>
            
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomContentPadding }]}>
                {patients.map((patient) => (
                    <TouchableOpacity key={patient.id} onPress={() => openPatientProfile(patient)} style={styles.cardWrapper}>
                        <Card style={[styles.patientCard, { backgroundColor: theme.card, borderColor: theme.border || GRAY }]}>
                            <Card.Content>
                                <View style={styles.patientHeader}>
                                    <Avatar.Icon 
                                        size={48} 
                                        icon={patient.gender === 'Male' ? 'account' : 'account-outline'} 
                                        style={[styles.avatar, { backgroundColor: PRIMARY_COLOR }]} 
                                        color={WHITE}
                                    />
                                    <View style={styles.patientInfo}>
                                        <Title style={[styles.patientName, { color: theme.text }]}>{patient.name}</Title>
                                        <Paragraph style={[styles.patientDetails, { color: theme.textSecondary }]}>
                                            {patient.age} years • {patient.gender}
                                        </Paragraph>
                                        <Paragraph style={[styles.villageText, { color: theme.textSecondary }]}>{patient.village}</Paragraph>
                                    </View>
                                    <Chip 
                                        mode="flat" 
                                        style={[styles.appointmentChip, { backgroundColor: ACCENT_COLOR }]}
                                        textStyle={{ color: WHITE, fontWeight: '700' }}
                                    >
                                        {patient.nextAppointment}
                                    </Chip>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Portal>
                {/* ✅ FIX 1: The Modal component handles backdrop clicks automatically 
                          by calling the function provided to the 'onDismiss' prop.
                ✅ FIX 2: Updated modalContainer to use a smaller maxHeight (e.g., 75%)
                */}
                <Modal 
                    visible={modalVisible} 
                    onDismiss={closeModal} 
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.background }]}
                >
                    {selectedPatient && (
                        <ScrollView>
                            <View style={[styles.modalHeader, { backgroundColor: PRIMARY_COLOR }]}>
                                <Avatar.Icon 
                                    size={64} 
                                    icon={selectedPatient.gender === 'Male' ? 'account' : 'account-outline'} 
                                    style={styles.modalAvatar} 
                                    color={PRIMARY_COLOR}
                                />
                                <Title style={styles.modalTitle}>{selectedPatient.name}</Title>
                                <Paragraph style={styles.modalSubtitle}>
                                    {selectedPatient.age} years • {selectedPatient.gender}
                                </Paragraph>
                            </View>

                            {/* --- Information Cards --- (Content remains the same) */}
                            <Card style={[styles.infoCard, { backgroundColor: theme.card, shadowColor: theme.shadow || BLACK }]}>
                                <Card.Content>
                                    <Title style={{ color: theme.text }}>Contact Information</Title>
                                    <List.Item
                                        titleStyle={{ color: theme.text }}
                                        descriptionStyle={{ color: theme.textSecondary }}
                                        title="Village"
                                        description={selectedPatient.village}
                                        left={props => <List.Icon {...props} icon="map-marker" color={PRIMARY_COLOR} />}
                                    />
                                    <List.Item
                                        titleStyle={{ color: theme.text }}
                                        descriptionStyle={{ color: theme.textSecondary }}
                                        title="Phone"
                                        description={selectedPatient.phone}
                                        left={props => <List.Icon {...props} icon="phone" color={PRIMARY_COLOR} />}
                                    />
                                </Card.Content>
                            </Card>

                            <Card style={[styles.infoCard, { backgroundColor: theme.card, shadowColor: theme.shadow || BLACK }]}>
                                <Card.Content>
                                    <Title style={{ color: theme.text }}>Medical History</Title>
                                    {selectedPatient.medicalHistory.map((condition, index) => (
                                        <View key={index} style={styles.historyItem}>
                                            <Paragraph style={[styles.historyText, { color: theme.textSecondary }]}>• {condition}</Paragraph>
                                        </View>
                                    ))}
                                </Card.Content>
                            </Card>

                            <Card style={[styles.infoCard, { backgroundColor: theme.card, shadowColor: theme.shadow || BLACK }]}>
                                <Card.Content>
                                    <Title style={{ color: theme.text }}>Health Reports ({selectedPatient.reports.length})</Title>
                                    <List.Item
                                        titleStyle={{ color: theme.text }}
                                        descriptionStyle={{ color: theme.textSecondary }}
                                        title="Last Visit"
                                        description={selectedPatient.lastVisit}
                                        left={props => <List.Icon {...props} icon="calendar-check" color={PRIMARY_COLOR} />}
                                    />
                                    <List.Item
                                        titleStyle={{ color: theme.text }}
                                        descriptionStyle={{ color: theme.textSecondary }}
                                        title="Next Appointment"
                                        description={selectedPatient.nextAppointment}
                                        left={props => <List.Icon {...props} icon="calendar-clock" color={PRIMARY_COLOR} />}
                                    />
                                    {selectedPatient.reports.map((report) => (
                                        <List.Item
                                            key={report.id}
                                            titleStyle={{ color: theme.text }}
                                            descriptionStyle={{ color: theme.textSecondary }}
                                            title={report.name}
                                            description={`${report.type} • ${report.date}`}
                                            left={props => <List.Icon {...props} icon="file-document" color={PRIMARY_COLOR} />}
                                            right={props => <List.Icon {...props} icon="chevron-right" color={theme.textSecondary} />}
                                        />
                                    ))}
                                </Card.Content>
                            </Card>

                            <Button mode="contained" onPress={closeModal} style={[styles.closeButton, { backgroundColor: PRIMARY_COLOR }]}>
                                Close Profile
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
    // --- Dashboard Header Style ---
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        marginBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: GRAY,
    },
    headerTitle: {
        fontSize: 26, 
        fontWeight: 'bold', 
        marginTop: 6, 
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    // --- Patient Card Style ---
    cardWrapper: {
        paddingHorizontal: 10,
    },
    patientCard: {
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2, 
        shadowColor: BLACK, 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3,
        borderLeftWidth: 5,
        borderLeftColor: PRIMARY_COLOR,
    },
    patientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    avatar: {
        backgroundColor: PRIMARY_COLOR, 
    },
    patientInfo: {
        flex: 1,
        marginLeft: 16,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    patientDetails: {
        fontSize: 13,
    },
    villageText: {
        fontSize: 13,
        marginTop: 2,
    },
    appointmentChip: {
        marginLeft: 8,
        height: 30,
        justifyContent: 'center',
        backgroundColor: ACCENT_COLOR,
    },
    // --- Modal Styles (FIXED) ---
    modalContainer: {
        margin: 20,
        borderRadius: 12,
        // ✅ FIX 1: Reduce vertical size significantly
        maxHeight: '75%', 
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: PRIMARY_COLOR,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modalAvatar: {
        backgroundColor: WHITE,
    },
    modalTitle: {
        color: WHITE,
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
    },
    modalSubtitle: {
        color: '#e0e0e0',
        fontSize: 16,
    },
    infoCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 1,
    },
    historyItem: {
        marginVertical: 4,
    },
    historyText: {
        fontSize: 14,
    },
    closeButton: {
        margin: 16,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
    },
});