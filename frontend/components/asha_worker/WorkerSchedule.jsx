import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// --- Color Scheme ---
const cardColors = {
  darkBluePrimary: '#0047AB',
  darkBlueDark: '#00378D',
  darkBlueLight: '#E6F0FF', // Calculated light blue
  grayText: '#6b7280',
  white: '#ffffff',
  greenAccent: '#10b981', // Used for highlighting today/success
  redDanger: '#B71C1C',
  grayDisabled: '#ccc', // For past dates
};

// --- Helper Functions ---
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const formatVisitDate = (date) => {
  if (date.toDateString() === TODAY.toDateString()) return 'Today';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// --- Mock Data ---
const mockPastVisits = [
  { id: 'p1', date: new Date(TODAY.getTime() - 86400000 * 2), time: '10:00 AM', location: 'Ward 3, Suman Devi Home' },
  { id: 'p2', date: new Date(TODAY.getTime() - 86400000 * 5), time: '02:30 PM', location: 'PHC Checkup Center' },
  { id: 'p3', date: new Date(TODAY.getTime() - 86400000 * 10), time: '11:00 AM', location: 'Ward 1, Amit Verma Home' },
  { id: 'p4', date: new Date(TODAY.getTime() - 86400000 * 15), time: '09:00 AM', location: 'Community Hall Meeting' },
];

const mockFutureVisits = [
  { id: 'f1', date: new Date(TODAY.getTime() + 86400000 * 1), time: '10:30 AM', location: 'Ward 4, New Mother Follow-up' },
  { id: 'f2', date: new Date(TODAY.getTime() + 86400000 * 3), time: '04:00 PM', location: 'Rajesh Kumar Checkup' },
  { id: 'f3', date: new Date(TODAY.getTime() + 86400000 * 7), time: '09:30 AM', location: 'Vaccination Drive, School' },
  { id: 'f4', date: new Date(TODAY.getTime() + 86400000 * 14), time: '11:00 AM', location: 'Ward 2, Sanitation Survey' },
];

// --- Sub-Components ---

// Reusable Visit Card
const VisitCard = ({ visit, type }) => (
  <View style={[styles.visitCard, type === 'past' ? styles.pastCard : styles.futureCard]}>
    <Text style={styles.visitDate}>
      {formatVisitDate(visit.date)} at {visit.time}
    </Text>
    <Text style={styles.visitLocation}>
      Location: {visit.location}
    </Text>
    <Text style={styles.visitType}>
      {type === 'past' ? 'Completed' : 'Upcoming'}
    </Text>
  </View>
);

// --- Modal 1: Date Picker (Calendar) ---

const getCalendarDates = () => {
  const dates = [];
  const start = new Date(TODAY.getTime() - 86400000 * 2); // Start 2 days before today
  for (let i = 0; i < 16; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const DatePickerModal = ({ isVisible, onClose, onDateSelect }) => {
  const dates = getCalendarDates();

  const handleDatePress = (dateObject) => {
    const dateCheck = new Date(dateObject);
    dateCheck.setHours(0, 0, 0, 0);

    if (dateCheck.getTime() < TODAY.getTime()) {
      Alert.alert('Cannot Select Past Date', 'Please select today or a future date for scheduling.');
      return;
    }
    onDateSelect(dateObject);
  };

  const renderDateItem = ({ item: dateObject }) => {
    const isPast = dateObject.getTime() < TODAY.getTime();
    const isToday = dateObject.toDateString() === TODAY.toDateString();

    return (
      <TouchableOpacity
        style={[
          modalStyles.dateButton,
          isPast && modalStyles.dateButtonDisabled,
          isToday && modalStyles.dateButtonToday,
        ]}
        onPress={() => handleDatePress(dateObject)}
        disabled={isPast}
      >
        <Text style={[modalStyles.dateDay, isPast && modalStyles.dateTextDisabled]}>
          {dateObject.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[modalStyles.dateNumber, isPast && modalStyles.dateTextDisabled]}>
          {dateObject.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Select a Date</Text>
          <FlatList
            data={dates}
            keyExtractor={(item) => item.toISOString()}
            numColumns={7}
            renderItem={renderDateItem}
            contentContainerStyle={modalStyles.dateList}
          />
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Text style={modalStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Modal 2: Time Picker ---
const TimePickerModal = ({ isVisible, onClose, onTimeSelect, dateObject }) => {
  const [timeInput, setTimeInput] = useState('');
  
  const handleConfirm = () => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeInput)) {
      onTimeSelect(timeInput);
      setTimeInput('');
    } else {
      Alert.alert('Invalid Time', 'Please enter time in 24-hour format (HH:MM), e.g., 14:30.');
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>
            Time for {dateObject ? formatVisitDate(dateObject) : ''}
          </Text>
          <TextInput
            style={modalStyles.timeInput}
            placeholder="HH:MM (24hr clock)"
            placeholderTextColor={cardColors.grayText}
            keyboardType="default" // CHANGED from 'numeric' to 'default'
            maxLength={5}
            value={timeInput}
            onChangeText={setTimeInput}
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[modalStyles.actionButton, { backgroundColor: cardColors.redDanger }]}>
              <Text style={modalStyles.closeButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={modalStyles.actionButton} disabled={!timeInput}>
              <Text style={modalStyles.closeButtonText}>Confirm Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Modal 3: Location Input ---
const LocationInputModal = ({ isVisible, onClose, onAddVisit }) => {
  const [locationInput, setLocationInput] = useState('');

  const handleAdd = () => {
    if (locationInput.trim()) {
      onAddVisit(locationInput.trim());
      setLocationInput('');
    } else {
      Alert.alert('Location Required', 'Please enter the visit location.');
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Enter Visit Location</Text>
          <TextInput
            style={modalStyles.locationInput}
            placeholder="e.g., Ward 5, Pooja Sharma Home"
            placeholderTextColor={cardColors.grayText}
            value={locationInput}
            onChangeText={setLocationInput}
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[modalStyles.actionButton, { backgroundColor: cardColors.redDanger }]}>
              <Text style={modalStyles.closeButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={modalStyles.actionButton} disabled={!locationInput}>
              <Text style={modalStyles.closeButtonText}>Add Visit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Component ---
const WorkerSchedule = () => {
  const { theme } = useTheme();
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [pastVisits, setPastVisits] = useState(mockPastVisits);
  const [futureVisits, setFutureVisits] = useState(mockFutureVisits.sort((a, b) => a.date - b.date));
  
  // State for Pagination (Simplified Mocking)
  const [pastPage, setPastPage] = useState(1);
  const [futurePage, setFuturePage] = useState(1);
  
  // State for Scheduling Flow
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  
  const [newVisitData, setNewVisitData] = useState({ date: null, time: null, location: '' });

  // --- Pagination Handlers (Mock) ---
  const handlePrevPage = () => {
    Alert.alert('Mock Action', 'Loading older visits (Page ' + (pastPage + 1) + ')');
    setPastPage(pastPage + 1);
    // In a real app, you would fetch older data here
  };

  const handleNextPage = () => {
    Alert.alert('Mock Action', 'Loading more future visits (Page ' + (futurePage + 1) + ')');
    setFuturePage(futurePage + 1);
    // In a real app, you would fetch future data here
  };
  
  // --- Scheduling Handlers ---
  const handlePlanNewVisit = () => {
    // Reset and start flow
    setNewVisitData({ date: null, time: null, location: '' });
    setIsDateModalVisible(true);
  };
  
  const handleDateSelect = (dateObject) => {
    setNewVisitData({ ...newVisitData, date: dateObject });
    setIsDateModalVisible(false);
    setIsTimeModalVisible(true); // Move to time picker
  };
  
  const handleTimeSelect = (time24hr) => {
    setNewVisitData({ ...newVisitData, time: time24hr });
    setIsTimeModalVisible(false);
    setIsLocationModalVisible(true); // Move to location input
  };
  
  const handleAddVisit = (location) => {
    setIsLocationModalVisible(false);
    
    // Create new visit object
    const finalVisit = {
      id: Date.now().toString(),
      date: newVisitData.date,
      time: newVisitData.time,
      location: location,
    };
    
    // Add to future visits and sort (new entry appears on top)
    const updatedFutureVisits = [finalVisit, ...futureVisits].sort((a, b) => a.date - b.date);
    setFutureVisits(updatedFutureVisits);

    // Show success alert
    Alert.alert(
      'Success',
      `Planned a new visit on ${formatVisitDate(finalVisit.date)} at ${finalVisit.time} in ${finalVisit.location}.`,
      [{ text: 'OK' }]
    );
  };

  const closeModal = (setModalVisible) => () => {
      setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.headerBackground} />
      
      {/* Modals */}
      <DatePickerModal 
          isVisible={isDateModalVisible} 
          onClose={closeModal(setIsDateModalVisible)} 
          onDateSelect={handleDateSelect} 
      />
      <TimePickerModal 
          isVisible={isTimeModalVisible} 
          onClose={closeModal(setIsTimeModalVisible)} 
          onTimeSelect={handleTimeSelect} 
          dateObject={newVisitData.date}
      />
      <LocationInputModal 
          isVisible={isLocationModalVisible} 
          onClose={closeModal(setIsLocationModalVisible)} 
          onAddVisit={handleAddVisit} 
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={[styles.headerSubtitle, { color: theme.surface }]}>Community Visits and Appointments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Plan New Visit Button */}
        <TouchableOpacity onPress={handlePlanNewVisit} style={[styles.planButton, { backgroundColor: '#10b981' }]}>
          <Text style={styles.planButtonText}>Plan New Visit</Text>
        </TouchableOpacity>

        {/* Schedule Grid */}
        <View style={styles.gridContainer}>
          
          {/* Column 1: Past Visits */}
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>Past Visits (Last {pastVisits.length})</Text>
            <View style={styles.visitList}>
              {pastVisits.map((visit) => (
                <View key={visit.id} style={[styles.visitCard, styles.pastCard, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
                  <Text style={[styles.visitDate, { color: theme.primary }]}>{formatVisitDate(visit.date)}</Text>
                  <Text style={[styles.visitLocation, { color: theme.textSecondary }]}>{visit.location}</Text>
                  <Text style={[styles.visitType, { color: theme.textSecondary }]}>{visit.time}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={handlePrevPage} style={styles.pageButton}>
              <Text style={styles.pageButtonText}>← Previous</Text>
            </TouchableOpacity>
          </View>

          {/* Column 2: Future Visits */}
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>Future Visits (Next {futureVisits.length})</Text>
            <View style={styles.visitList}>
              {futureVisits.map((visit) => (
                <View key={visit.id} style={[styles.visitCard, styles.futureCard, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
                  <Text style={[styles.visitDate, { color: theme.primary }]}>{formatVisitDate(visit.date)}</Text>
                  <Text style={[styles.visitLocation, { color: theme.textSecondary }]}>{visit.location}</Text>
                  <Text style={[styles.visitType, { color: theme.textSecondary }]}>{visit.time}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={handleNextPage} style={styles.pageButton}>
              <Text style={styles.pageButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <DatePickerModal
        isVisible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cardColors.darkBlueLight,
  },
  header: {
    backgroundColor: cardColors.darkBluePrimary,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cardColors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: cardColors.white,
    opacity: 0.8,
  },
  scrollContent: {
    padding: 10,
    alignItems: 'center',
  },
  planButton: {
    backgroundColor: cardColors.greenAccent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 15,
    elevation: 3,
  },
  planButtonText: {
    color: cardColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cardColors.darkBlueDark,
    marginBottom: 10,
    textAlign: 'center',
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: cardColors.darkBluePrimary,
  },
  visitList: {
    minHeight: 300,
  },
  visitCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  pastCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  futureCard: {
    backgroundColor: cardColors.white,
    borderColor: cardColors.darkBlueLight,
    shadowColor: cardColors.darkBlueDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  visitDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cardColors.darkBluePrimary,
  },
  visitLocation: {
    fontSize: 13,
    color: '#333',
    marginVertical: 2,
  },
  visitType: {
    fontSize: 12,
    color: cardColors.grayText,
    fontStyle: 'italic',
  },
  pageButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: cardColors.darkBlueDark,
    alignItems: 'center',
    marginVertical: 5,
  },
  pageButtonText: {
    color: cardColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: cardColors.white,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cardColors.darkBluePrimary,
    marginBottom: 20,
  },
  dateList: {
    width: '100%',
    justifyContent: 'center',
  },
  dateButton: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: cardColors.darkBlueLight,
    borderWidth: 1,
    borderColor: cardColors.darkBlueLight,
  },
  dateButtonDisabled: {
    backgroundColor: '#F0F0F0', // Gray background for past dates
    borderColor: cardColors.grayDisabled,
  },
  dateButtonToday: {
    backgroundColor: cardColors.greenAccent, // Highlight today
    borderColor: cardColors.greenAccent,
  },
  dateTextDisabled: {
    color: cardColors.grayDisabled,
  },
  dateDay: {
    fontSize: 10,
    color: cardColors.darkBlueDark,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cardColors.darkBluePrimary,
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
  timeInput: {
    height: 40,
    borderColor: cardColors.grayText,
    borderWidth: 1,
    width: '100%',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  locationInput: {
    height: 50,
    borderColor: cardColors.grayText,
    borderWidth: 1,
    width: '100%',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: cardColors.darkBluePrimary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default WorkerSchedule;
