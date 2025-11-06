import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Color scheme derived from the user's components
const COLORS = {
    primary: '#311B92',   // Dark Indigo (Used for main accents)
    secondary: '#880E4F', // Dark Maroon (Used for key data)
    tertiary: '#1B5E20',   // Dark Forest Green
    danger: '#B71C1C',     // Dark Red
    darkBlue: '#0047AB',  // Used for subtitles/secondary info
    white: '#FFFFFF',
    black: '#000000',
    gray: '#E5E7EB', // Light background for inputs/cards
    lightGray: '#F5F5F5',
};

// --- DUMMY DATA ---
const BABY_DOB = new Date(2025, 4, 15); // May 15, 2025 (Example)

const growthData = [
    { age: 'Birth', weight: 3.2, height: 50, head: 35.0, date: 'May 15' },
    { age: '1 Month', weight: 4.5, height: 54, head: 37.5, date: 'Jun 15' },
    { age: '2 Months', weight: 5.8, height: 58, head: 40.1, date: 'Jul 15' },
    { age: '4 Months', weight: 7.0, height: 63, head: 42.5, date: 'Sep 15' },
    { age: '6 Months', weight: 8.1, height: 67, head: 44.0, date: 'Nov 15' },
];

const initialMilestoneData = [
    { id: 1, milestone: 'Smiles Responsively', age: '2 Months', status: 'Completed', color: COLORS.tertiary },
    { id: 2, milestone: 'Holds Head Up Steady', age: '3 Months', status: 'Completed', color: COLORS.tertiary },
    { id: 3, milestone: 'Rolls Over (Back to Tummy)', age: '4 Months', status: 'Completed', color: COLORS.tertiary },
    { id: 4, milestone: 'Sits without Support', age: '6 Months', status: 'Pending', color: COLORS.secondary },
    { id: 5, milestone: 'Responds to Name', age: '7 Months', status: 'Pending', color: COLORS.secondary },
    { id: 6, milestone: 'Pulls Self to Stand', age: '9 Months', status: 'Upcoming', color: COLORS.darkBlue },
];

// --- HELPER FUNCTIONS ---
const getAgeText = (dob) => {
    const diffTime = Math.abs(new Date() - dob);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30.44); // Average month length
    const days = Math.round(diffDays % 30.44);

    if (months === 0) return `${days} Days Old`;
    if (months > 12) return `${(months / 12).toFixed(1)} Years Old`;
    return `${months} Months, ${days} Days Old`;
};

// --- SUB-COMPONENTS ---

const GrowthChartSimulation = () => {
    const latestWeight = growthData[growthData.length - 1].weight;

    // Simulated visual growth bar based on weight
    const getWeightBarWidth = (weight) => {
        // Assuming 10kg is near the top of the infant chart (100% width)
        return Math.min((weight / 10) * 100, 100);
    };

    return (
        <View style={chartStyles.chartContainer}>
            <Text style={chartStyles.chartTitle}>Weight Trend (Simulated Percentile)</Text>

            {growthData.slice(-3).map((data, index) => (
                <View key={index} style={chartStyles.dataRow}>
                    <Text style={chartStyles.rowLabel}>{data.age}</Text>
                    <View style={chartStyles.barWrapper}>
                        <View style={[chartStyles.bar, { width: `${getWeightBarWidth(data.weight)}%` }]} />
                        <Text style={chartStyles.barText}>{data.weight} kg</Text>
                    </View>
                </View>
            ))}

            <Text style={chartStyles.summaryText}>
                Latest: <Text style={{ fontWeight: 'bold', color: COLORS.secondary }}>{latestWeight} kg</Text> (Checkup Recommended Every 2 Months)
            </Text>
        </View>
    );
};

const GrowthDataTable = () => (
    <View style={tableStyles.table}>
        <View style={tableStyles.rowHeader}>
            <Text style={[tableStyles.cell, tableStyles.headerCell, { flex: 1.5 }]}>Age</Text>
            <Text style={[tableStyles.cell, tableStyles.headerCell, { flex: 2 }]}>Weight (kg)</Text>
            <Text style={[tableStyles.cell, tableStyles.headerCell, { flex: 2 }]}>Height (cm)</Text>
            <Text style={[tableStyles.cell, tableStyles.headerCell, { flex: 2 }]}>Head (cm)</Text>
        </View>
        {growthData.reverse().map((data, index) => (
            <View key={index} style={tableStyles.row}>
                <Text style={[tableStyles.cell, { flex: 1.5, fontWeight: '600' }]}>{data.age}</Text>
                <Text style={[tableStyles.cell, { flex: 2 }]}>{data.weight.toFixed(1)}</Text>
                <Text style={[tableStyles.cell, { flex: 2 }]}>{data.height.toFixed(1)}</Text>
                <Text style={[tableStyles.cell, { flex: 2 }]}>{data.head.toFixed(1)}</Text>
            </View>
        ))}
    </View>
);

const MilestoneItem = ({ milestone, age, status, color }) => (
    <View style={milestoneStyles.itemContainer}>
        <View style={milestoneStyles.textWrapper}>
            <Text style={milestoneStyles.milestoneText}>{milestone}</Text>
            <Text style={milestoneStyles.ageText}>Expected: {age}</Text>
        </View>
        <View style={[milestoneStyles.statusTag, { backgroundColor: color }]}>
            <Text style={milestoneStyles.statusText}>{status}</Text>
        </View>
    </View>
);


const AddMilestoneModal = ({ isVisible, onClose, onSave }) => {
    const [milestone, setMilestone] = useState('');
    const [age, setAge] = useState('');

    const handleSave = () => {
        if (milestone && age) {
            onSave({ milestone, age });
            setMilestone('');
            setAge('');
        } else {
            Alert.alert('Error', 'Please fill in both fields.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Add New Milestone</Text>
                    <TextInput
                        style={modalStyles.input}
                        placeholder="Milestone (e.g., Sits without support)"
                        placeholderTextColor="#999"
                        value={milestone}
                        onChangeText={setMilestone}
                    />
                    <TextInput
                        style={modalStyles.input}
                        placeholder="Expected Age (e.g., 6 Months)"
                        placeholderTextColor="#999"
                        value={age}
                        onChangeText={setAge}
                    />
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity style={[modalStyles.button, modalStyles.cancelButton]} onPress={onClose}>
                            <Text style={modalStyles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[modalStyles.button, modalStyles.saveButton]} onPress={handleSave}>
                            <Text style={modalStyles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


// --- MAIN COMPONENT ---

const GrowthMilestones = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('Growth'); // 'Growth' or 'Milestones'
    const [isModalVisible, setModalVisible] = useState(false);
    const [milestoneData, setMilestoneData] = useState(initialMilestoneData);

    const handleAddMilestone = (newMilestone) => {
        const newId = milestoneData.length > 0 ? Math.max(...milestoneData.map(m => m.id)) + 1 : 1;
        const newItem = {
            id: newId,
            milestone: newMilestone.milestone,
            age: newMilestone.age,
            status: 'Upcoming',
            color: COLORS.darkBlue,
        };
        setMilestoneData([...milestoneData, newItem]);
        setModalVisible(false);
    };


    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Growth & Milestones</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Monitor physical development and track key achievements.</Text>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Baby's Age Today:</Text>
                <Text style={[styles.summaryValue, { color: theme.primary }]}>{getAgeText(BABY_DOB)}</Text>
                <Text style={[styles.summaryDate, { color: theme.textSecondary }]}>Date of Birth: {BABY_DOB.toDateString().substring(4)}</Text>
            </View>

            {/* Tab Navigation */}
            <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Growth' && styles.activeTab]}
                    onPress={() => setActiveTab('Growth')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'Growth' ? COLORS.white : theme.text }, activeTab === 'Growth' && styles.activeTabText]}>Growth Data</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Milestones' && styles.activeTab]}
                    onPress={() => setActiveTab('Milestones')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'Milestones' ? COLORS.white : theme.text }, activeTab === 'Milestones' && styles.activeTabText]}>Milestones</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {activeTab === 'Growth' ? (
                    <View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Physical Growth Tracking</Text>
                        <GrowthChartSimulation />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Detailed Measurements (kg/cm)</Text>
                        <GrowthDataTable />
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Developmental Achievements</Text>
                        <Text style={[milestoneStyles.milestoneInfo, { color: theme.textSecondary }]}>
                            Check off milestones as your child completes them. These are estimates, every child develops at their own pace.
                        </Text>
                        {milestoneData.map(item => (
                            <MilestoneItem
                                key={item.id}
                                milestone={item.milestone}
                                age={item.age}
                                status={item.status}
                                color={item.color}
                            />
                        ))}
                        <TouchableOpacity
                            style={milestoneStyles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={milestoneStyles.addButtonText}>+ Add New Milestone Check</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            <AddMilestoneModal
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddMilestone}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white, paddingTop: 60 },
    headerTitle: { color: COLORS.black, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    headerSubtitle: { color: COLORS.darkBlue, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { color: COLORS.black, fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 15 },
    summaryCard: { marginHorizontal: 20, backgroundColor: COLORS.lightGray, borderRadius: 15, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray },
    summaryLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
    summaryValue: { fontSize: 34, color: COLORS.secondary, fontWeight: 'bold', marginVertical: 5 },
    summaryDate: { fontSize: 12, color: '#777', marginTop: 5 },
    tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, marginBottom: 10, backgroundColor: COLORS.lightGray, borderRadius: 10, overflow: 'hidden' },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    activeTab: { backgroundColor: COLORS.primary, borderRadius: 10, margin: 2, shadowColor: COLORS.black, shadowOpacity: 0.1, elevation: 3 },
    tabText: { color: COLORS.darkBlue, fontWeight: '600', fontSize: 16 },
    activeTabText: { color: COLORS.white, fontWeight: 'bold' },
});

const chartStyles = StyleSheet.create({
    chartContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowLabel: {
        width: 80,
        fontSize: 14,
        color: COLORS.black,
    },
    barWrapper: {
        flex: 1,
        height: 25,
        backgroundColor: COLORS.gray,
        borderRadius: 5,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    bar: {
        position: 'absolute',
        height: '100%',
        backgroundColor: COLORS.secondary,
        borderRadius: 5,
        left: 0,
    },
    barText: {
        fontSize: 12,
        color: COLORS.white,
        position: 'absolute',
        right: 5,
        fontWeight: 'bold',
    },
    summaryText: {
        marginTop: 15,
        fontSize: 14,
        color: '#666',
    }
});

const tableStyles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.gray,
        backgroundColor: COLORS.white,
    },
    rowHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.darkBlue,
        borderBottomWidth: 1,
        borderColor: COLORS.gray,
    },
    cell: {
        padding: 12,
        textAlign: 'center',
        fontSize: 14,
        color: COLORS.black,
    },
    headerCell: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});

const milestoneStyles = StyleSheet.create({
    milestoneInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    itemContainer: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.primary,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    textWrapper: {
        flex: 1,
    },
    milestoneText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    ageText: {
        fontSize: 13,
        color: COLORS.darkBlue,
        marginTop: 3,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    addButton: {
        backgroundColor: COLORS.tertiary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.primary,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        color: COLORS.black,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 15,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: COLORS.gray,
    },
    saveButton: {
        backgroundColor: COLORS.tertiary,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default GrowthMilestones;