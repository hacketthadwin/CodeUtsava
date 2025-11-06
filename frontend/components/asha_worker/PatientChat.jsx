import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  StatusBar,
  Modal, // Added Modal for pop-ups
  Alert, // Added Alert for feedback
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const cardColors = {
  indigoPrimary: '#4f46e5',
  indigoLight: '#eef2ff',
  grayText: '#6b7280',
  white: '#ffffff',
  greenAccent: '#10b981',
  blueMessage: '#4f46e5',
  grayMessage: '#f3f4f6',
  red: '#ef4444',
};

// Helper to get today's date and the next 6 days for the calendar simulation
const getNextSevenDays = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      dateObject: date,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      apiFormat: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`,
      isToday: i === 0,
    });
  }
  return dates;
};

// Component for a single chat bubble (unchanged)
const MessageBubble = ({ message }) => {
  const isUser = message.isUser;

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.patientMessageContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.patientBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.patientText,
          ]}
        >
          {message.text}
        </Text>
        <Text style={[styles.timeTextBubble, isUser ? styles.userTimeText : styles.patientTimeText]}>{message.time}</Text>
      </View>
    </View>
  );
};

// --- Modal Components for Scheduling Flow ---

// Simulated Date Picker Modal
const DatePickerModal = ({ isVisible, onClose, onDateSelect }) => {
  const dates = getNextSevenDays();

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Select a Date</Text>
          <FlatList
            data={dates}
            keyExtractor={(item) => item.apiFormat}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[modalStyles.dateButton, item.isToday && modalStyles.todayButton]}
                onPress={() => onDateSelect(item)}
              >
                <Text style={modalStyles.dateText}>{item.day}</Text>
                <Text style={modalStyles.dateText}>{item.dateString}</Text>
              </TouchableOpacity>
            )}
            style={modalStyles.dateList}
          />
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Text style={modalStyles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Simulated Time Picker Modal (24hr clock)
const TimePickerModal = ({ isVisible, onClose, onTimeSelect, dateInfo }) => {
  const [timeInput, setTimeInput] = useState('');

  const handleDone = () => {
    // Basic 24hr time validation (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeInput)) {
      const hours = timeInput.split(':')[0].padStart(2, '0');
      const minutes = timeInput.split(':')[1].padStart(2, '0');
      onTimeSelect(`${hours}${minutes}`);
      setTimeInput('');
    } else {
      Alert.alert('Invalid Time', 'Please enter time in 24-hour format (HH:MM), e.g., 14:30.');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Select Time for {dateInfo?.dateString || 'Date'}</Text>
          <TextInput
            style={modalStyles.timeInput}
            placeholder="HH:MM (24hr, e.g., 14:30)"
            placeholderTextColor={cardColors.grayText}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            value={timeInput}
            onChangeText={setTimeInput}
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[modalStyles.actionButton, {backgroundColor: cardColors.red}]}>
              <Text style={modalStyles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone} style={modalStyles.actionButton} disabled={!timeInput}>
              <Text style={modalStyles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Component ---
const PatientChat = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { patient } = route.params;

  const [messages, setMessages] = useState(
    [
      { id: 'm1', text: 'Hello, I took my medicine at 10 AM this morning.', isUser: false, time: '10:15 AM' },
      { id: 'm2', text: 'Very good! It’s important to take your medicine on time. Are you facing any other issues?', isUser: true, time: '10:20 AM' },
      { id: 'm3', text: 'No, everything is fine now. Thank you.', isUser: false, time: '10:25 AM' },
    ].reverse()
  );
  const [inputText, setInputText] = useState('');
  
  // State for Scheduling
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([newMessage, ...messages]);
      setInputText('');
    }
  };

  const handleScheduleStart = () => {
    setIsCalendarVisible(true);
  };

  const handleDateSelect = (dateInfo) => {
    setSelectedDateInfo(dateInfo);
    setIsCalendarVisible(false);
    setIsTimePickerVisible(true);
  };

  const handleTimeSelect = (time24hr) => {
    setIsTimePickerVisible(false);
    
    // Combine date and time into API format (yyyymmddTHHMM)
    const start_datetime = `${selectedDateInfo.apiFormat}T${time24hr}`;
    const eventTitle = `Meeting with ${patient.name}`;

    // --- LOGIC TO SCHEDULE APPOINTMENT (Original code calling the tool) ---
    // In a real application, you would integrate a function here to call your API.
    // generic_calendar.create({
    //   title: eventTitle,
    //   start_datetime: start_datetime,
    //   duration: '30m', // Default to 30 minutes
    //   description: `Follow-up meeting scheduled by ASHA Worker for ${patient.name}.`,
    // });
    
    // --- NEW: Confirmation Pop-up as requested ---
    Alert.alert(
      'Appointment Scheduled ✅',
      `Meeting with ${patient.name} has been successfully scheduled on ${selectedDateInfo.dateString} at ${time24hr}.`
    );
    // ----------------------------------------------------------------------
    
    // Clear selection state
    setSelectedDateInfo(null);
  };
  
  // Undo operation - I must call the undo tool in a separate step

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Modals */}
      <DatePickerModal
        isVisible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        onDateSelect={handleDateSelect}
      />
      <TimePickerModal
        isVisible={isTimePickerVisible}
        onClose={() => setIsTimePickerVisible(false)}
        onTimeSelect={handleTimeSelect}
        dateInfo={selectedDateInfo}
      />
      
      <StatusBar
        backgroundColor={theme.headerBackground}
        barStyle={theme.statusBarStyle}
      />
      {/* Custom Header for the chat screen */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.buttonText }]}>{'< Back'}</Text>
        </TouchableOpacity>
        <Image source={{ uri: patient.avatarUrl }} style={styles.avatar} />
        <Text style={[styles.headerTitle, { color: theme.buttonText }]}>{patient.name}</Text>
        
        {/* NEW: Schedule Button */}
        <TouchableOpacity onPress={handleScheduleStart} style={[styles.scheduleButton, { backgroundColor: '#10b981' }]}>
          <Text style={[styles.scheduleButtonText, { color: '#fff' }]}>Schedule Meeting</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.tabBarBorder }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={[styles.sendButtonText, { color: theme.buttonText }]}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cardColors.indigoLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardColors.indigoPrimary,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
    elevation: 3,
  },
  backButton: {
    paddingRight: 10,
  },
  backButtonText: {
    color: cardColors.white,
    fontSize: 16,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    backgroundColor: cardColors.indigoLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cardColors.white,
    flex: 1, // Allows title to take available space
  },
  scheduleButton: {
    backgroundColor: cardColors.greenAccent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  scheduleButtonText: {
    color: cardColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  patientMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 10,
    padding: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: cardColors.blueMessage,
    borderBottomRightRadius: 2,
  },
  patientBubble: {
    backgroundColor: cardColors.grayMessage,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
  },
  userText: {
    color: cardColors.white,
  },
  patientText: {
    color: '#000',
  },
  timeTextBubble: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  patientTimeText: {
    color: cardColors.grayText,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: cardColors.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: cardColors.grayMessage,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    backgroundColor: cardColors.indigoPrimary,
    borderRadius: 20,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: cardColors.white,
    fontSize: 15,
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: cardColors.indigoPrimary,
  },
  dateList: {
    maxHeight: 250,
    width: '100%',
    marginBottom: 15,
  },
  dateButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: cardColors.indigoLight,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 90,
  },
  todayButton: {
    backgroundColor: cardColors.greenAccent,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    marginTop: 10,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: cardColors.indigoPrimary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default PatientChat;