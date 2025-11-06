// ChatWithPatient.jsx (Corrected for React Native)

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native'; // <-- CORRECTED IMPORT

const cardColors = {
  indigoPrimary: '#4f46e5', // A strong indigo for the primary color
  indigoLight: '#eef2ff', // A very light indigo for backgrounds
  grayText: '#6b7280', // Text color for subtitles and last messages
  white: '#ffffff',
  greenAccent: '#10b981', // A green for unread counts (like WhatsApp)
};

// Mock Data for Patients (Last messages updated to English)
const mockPatients = [
  {
    id: 'p1',
    name: 'Pooja Sharma',
    lastMessage: 'Yes, I took my medicine today.', 
    time: '1:45 PM',
    unread: 2,
    avatarUrl: 'https://i.pravatar.cc/150?img=1', // Random avatar
  },
  {
    id: 'p2',
    name: 'Rajesh Kumar',
    lastMessage: 'When is the next vaccine scheduled?', 
    time: 'Yesterday',
    unread: 0,
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
  },
  {
    id: 'p3',
    name: 'Suman Devi',
    lastMessage: 'Okay, I will come to the center tomorrow morning.', 
    time: '9/29/2025',
    unread: 1,
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 'p4',
    name: 'Amit Verma',
    lastMessage: 'Can you please check my report?', 
    time: '9/28/2025',
    unread: 0,
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'p5',
    name: 'Ananya Singh',
    lastMessage: 'When is the next scheduled?', 
    time: '9/28/2025',
    unread: 0,
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
  },
];

// Component for a single chat item
const ChatItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.chatItemContainer} onPress={onPress}>
    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
    <View style={styles.chatDetails}>
      <View style={styles.nameTimeRow}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.messageUnreadRow}>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const ChatWithPatient = ({ navigation }) => {
  // Function to handle navigation to the individual chat screen
  const navigateToChat = (patient) => {
    // Assuming you have a route named 'PatientChat' in your navigator
    navigation.navigate('PatientChat', { patient });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={cardColors.indigoPrimary}
        barStyle="light-content"
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Text style={styles.headerSubtitle}>Field Support</Text>
      </View>

      <FlatList
        data={mockPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={() => navigateToChat(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cardColors.white,
  },
  header: {
    backgroundColor: cardColors.indigoPrimary,
    paddingTop: 40, // Space for status bar
    paddingHorizontal: 16,
    paddingBottom: 15,
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cardColors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: cardColors.indigoLight,
    marginTop: 2,
    opacity: 0.8,
  },
  chatItemContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: cardColors.white,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: cardColors.indigoLight,
  },
  chatDetails: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: cardColors.grayText,
  },
  messageUnreadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: cardColors.grayText,
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: cardColors.greenAccent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: cardColors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
    marginLeft: 80, // Start separator after the avatar
  },
});

export default ChatWithPatient;