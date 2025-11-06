import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Title, Paragraph, TextInput, IconButton, Chip, Avatar, SegmentedButtons, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { initialMessages, ashaWorkers, aiChatResponses } from '../data/sampleData';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [chatType, setChatType] = useState('asha');
  const [ashaMessages, setAshaMessages] = useState(initialMessages.asha);
  const [patientMessages, setPatientMessages] = useState(initialMessages.patients);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      senderId: 'ai',
      senderName: 'Medical AI Assistant',
      senderType: 'ai',
      text: 'Hello Doctor! I can help you with medical information and treatment guidelines. Ask me about diabetes, hypertension, pregnancy care, anemia, asthma, and more.',
      timestamp: new Date(),
      read: true
    }
  ]);
  const [inputText, setInputText] = useState('');

  const getCurrentMessages = () => {
    switch(chatType) {
      case 'asha':
        return ashaMessages;
      case 'patients':
        return patientMessages;
      case 'ai':
        return aiMessages;
      default:
        return [];
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      senderId: 'doctor',
      senderName: 'Dr. Verma',
      senderType: 'doctor',
      text: inputText,
      timestamp: new Date(),
      read: true
    };

    if (chatType === 'asha') {
      setAshaMessages([...ashaMessages, newMessage]);
    } else if (chatType === 'patients') {
      setPatientMessages([...patientMessages, newMessage]);
    } else if (chatType === 'ai') {
      setAiMessages([...aiMessages, newMessage]);
      
      setTimeout(() => {
        const aiResponse = getAiResponse(inputText);
        const aiReply = {
          id: Date.now() + 1,
          senderId: 'ai',
          senderName: 'Medical AI Assistant',
          senderType: 'ai',
          text: aiResponse,
          timestamp: new Date(),
          read: true
        };
        setAiMessages(prev => [...prev, aiReply]);
      }, 1000);
    }

    setInputText('');
  };

  const getAiResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    for (const keyword in aiChatResponses) {
      if (lowerQuestion.includes(keyword)) {
        return aiChatResponses[keyword];
      }
    }
    return aiChatResponses.default;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const messages = getCurrentMessages();

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.segmentContainer, { backgroundColor: theme.surface }] }>
        <SegmentedButtons
          value={chatType}
          onValueChange={setChatType}
          buttons={[
            {
              value: 'asha',
              label: 'ASHA Workers',
              icon: 'account-group',
            },
            {
              value: 'patients',
              label: 'Patients',
              icon: 'account-multiple',
            },
            {
              value: 'ai',
              label: 'AI Assistant',
              icon: 'robot',
            },
          ]}
          style={[styles.segmentedButtons, { backgroundColor: theme.surface }]}
        />
      </View>

      <ScrollView 
        style={[styles.messagesContainer, { backgroundColor: theme.background }]}
        ref={ref => {
          if (ref) {
            ref.scrollToEnd({ animated: true });
          }
        }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.senderType === 'doctor' 
                ? styles.doctorBubble 
                : [styles.otherBubble, { backgroundColor: theme.card }]
            ]}
          >
            {message.senderType !== 'doctor' && (
              <Paragraph style={[styles.senderName, { color: theme.primary }]}>{message.senderName}</Paragraph>
            )}
            <Paragraph style={[styles.messageText, message.senderType === 'doctor' ? { color: '#fff' } : { color: theme.text }]}>{message.text}</Paragraph>
            <Paragraph style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTime(message.timestamp)}</Paragraph>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.surface }] }>
        <TextInput
          mode="outlined"
          placeholder={chatType === 'ai' ? 'Ask a medical question...' : 'Type a message...'}
          value={inputText}
          onChangeText={setInputText}
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={500}
        />
        <IconButton
          icon="send"
          mode="contained"
          iconColor="#fff"
          containerColor={theme.primary}
          size={24}
          onPress={sendMessage}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    padding: 8,
    elevation: 2,
  },
  segmentedButtons: {
    marginHorizontal: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    elevation: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
  },
  doctorBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  doctorBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
  },
});
