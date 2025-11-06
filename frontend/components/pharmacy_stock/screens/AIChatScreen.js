import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import { COLORS } from '../utils/colors';

export default function AIChatScreen() {
  const { medicines } = usePharmacy();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I can help you find medicines in stock. Try asking me about a specific medicine or pharmacy!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const bgColor = COLORS.white;
  const textColor = COLORS.black;
  const userMessageBg = COLORS.lightBlue;
  const aiMessageBg = COLORS.gray;

  const getMockAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('available') || lowerQuery.includes('stock')) {
      const medicineName = lowerQuery.match(/\b(\w+)\s+(available|stock)/)?.[1];
      if (medicineName) {
        const found = medicines.filter(m => 
          m.medicine.toLowerCase().includes(medicineName)
        );
        
        if (found.length > 0) {
          const details = found.map(m => 
            `${m.medicine} at ${m.pharmacy} (${m.location}) - Quantity: ${m.quantity}, Expiry: ${m.expiry}`
          ).join('\n');
          return `Found ${found.length} result(s):\n\n${details}`;
        } else {
          return `Sorry, I couldn't find any medicines matching "${medicineName}" in stock.`;
        }
      }
    }
    
    if (lowerQuery.includes('expir')) {
      const expiringSoon = medicines.filter(m => {
        const expiryDate = new Date(m.expiry);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow;
      });
      
      if (expiringSoon.length > 0) {
        const details = expiringSoon.map(m => 
          `${m.medicine} at ${m.pharmacy} - Expiry: ${m.expiry}`
        ).join('\n');
        return `Found ${expiringSoon.length} medicine(s) expiring soon:\n\n${details}`;
      } else {
        return 'No medicines expiring in the next 3 months.';
      }
    }
    
    if (lowerQuery.includes('low stock') || lowerQuery.includes('running out')) {
      const lowStock = medicines.filter(m => m.quantity < 10);
      
      if (lowStock.length > 0) {
        const details = lowStock.map(m => 
          `${m.medicine} at ${m.pharmacy} - Only ${m.quantity} left`
        ).join('\n');
        return `Found ${lowStock.length} medicine(s) with low stock:\n\n${details}`;
      } else {
        return 'All medicines have adequate stock levels!';
      }
    }
    
    if (lowerQuery.includes('pharmacy') || lowerQuery.includes('location')) {
      const locations = [...new Set(medicines.map(m => m.location))];
      const pharmacies = [...new Set(medicines.map(m => m.pharmacy))];
      
      return `We have ${pharmacies.length} pharmacies across ${locations.length} locations:\n\nLocations: ${locations.join(', ')}\n\nPharmacies: ${pharmacies.join(', ')}`;
    }
    
    return 'I can help you with:\n\n• Check if a medicine is available (e.g., "Is Paracetamol available?")\n• Find medicines expiring soon\n• Check low stock items\n• List pharmacies and locations\n\nWhat would you like to know?';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: getMockAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.isUser ? userMessageBg : aiMessageBg,
          },
        ]}
      >
        {!item.isUser && (
          <View style={styles.aiHeader}>
            <Ionicons name="flask" size={16} color={COLORS.primary} />
            <Text style={[styles.aiLabel, { color: COLORS.primary }]}>Stock AI</Text>
          </View>
        )}
        <Text style={[styles.messageText, { color: item.isUser ? COLORS.white : textColor }]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, { color: item.isUser ? COLORS.white : textColor }]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="chatbubbles" size={24} color={textColor} />
          <Text style={[styles.title, { color: textColor }]}>AI Assistant</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Stock</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      <View style={[styles.inputContainer, { borderTopColor: '#ddd' }]}>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: COLORS.gray }]}
          placeholder="Ask about medicines..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
