import { Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

// Updated API Key with the user-provided value.
const API_KEY = "AIzaSyA2HOvE8mQWwwupFCtl-4Zw53nlttWFK50"; 
// Using the supported model and the new API key.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

const COLORS = {
  primary: '#311B92',   
  darkBlue: '#0047AB',  
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  inputBg: '#F0FFFF',
};

const INITIAL_MESSAGE = {
  id: 'sys0',
  text: "Hello! I am your privacy-focused AI health assistant. Please ask me any general health, wellness, or women's health-related questions.",
  sender: 'ai',
};

const screenHeight = Dimensions.get('window').height;
const minChatbotHeight = screenHeight * 0.2;
const maxChatbotHeight = screenHeight * 0.9;
const initialChatbotHeight = screenHeight * 0.65;

const HealthChatBot = ({ onClose, bottomInset = 0 }) => { 
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = React.useRef();

  // Reanimated state
  const chatbotHeight = useSharedValue(initialChatbotHeight);
  const previousHeight = useSharedValue(initialChatbotHeight);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      previousHeight.value = chatbotHeight.value;
    })
    .onUpdate((event) => {
      const newHeight = previousHeight.value - event.translationY;
      const clampedHeight = Math.min(Math.max(newHeight, minChatbotHeight), maxChatbotHeight);
      chatbotHeight.value = clampedHeight;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return { 
        height: chatbotHeight.value,
        // Added bottom inset to account for navigation bars/safe area
        marginBottom: bottomInset + 10 
    };
  });
  
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const MAX_RETRIES = 3;
    let delay = 1000; // Start with 1 second delay

    const userMessage = { id: Date.now(), text: input.trim(), sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const userQuery = input.trim();

      const payload = {
        contents: [{ role: "user", parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [{
            text: "You are a friendly, compassionate, and highly knowledgeable AI health assistant for wellness. Your sole purpose is to answer health, fitness, menstrual, and nutritional questions. You MUST politely decline if asked about politics, finance, or non-health topics."
          }]
        },
      };
      
      let successfulResponse = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          // Success, store response and break loop
          successfulResponse = response;
          break; 
        } else if (response.status === 503 && attempt < MAX_RETRIES - 1) {
          // 503 error, not the last attempt: wait and retry
          console.warn(`API Status 503 (Unavailable). Retrying in ${delay / 1000}s (Attempt ${attempt + 1}/${MAX_RETRIES}).`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff: 1s, 2s, 4s...
        } else {
          // Non-retryable error or last attempt failed
          const errorBody = await response.text();
          console.error(`API Error Status: ${response.status}`, errorBody);
          throw new Error(`Failed to fetch content after ${attempt + 1} attempts. HTTP Status: ${response.status}`);
        }
      } // end for loop

      if (successfulResponse) {
        const result = await successfulResponse.json();
        console.log("Gemini response received successfully.");

        const aiResponseText =
          result?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't fetch an answer right now. Please try again or check the console for API details.";

        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponseText,
          sender: 'ai'
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
          // This path is only reached if all retries failed due to 503 and an exception wasn't thrown earlier.
          throw new Error("API call failed after all retries.");
      }

    } catch (error) {
      console.error("Gemini API Error after all retries:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error connecting to the health assistant: ${error.message || 'Unknown network error'}. The model may be overloaded.`,
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const ChatBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
      <View style={[
        styles.bubbleWrapper,
        isUser ? styles.userWrapper : styles.aiWrapper,
      ]}>
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.chatModal, 
        animatedStyle, 
      ]}>
        
        <GestureDetector gesture={dragGesture}>
          <View style={styles.handleBarWrapper}>
            <View style={styles.handleBar} />
          </View>
        </GestureDetector>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wellness Chat</Text>
          <Text style={styles.headerStatus}>Online | Privacy Secured 🔒</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a health question..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && {backgroundColor: COLORS.darkBlue}]}
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{paddingVertical: 10}}
        >
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  chatModal: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  handleBarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCCCCC',
  },
  header: {
    padding: 15,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#AAAAAA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 15,
    padding: 13,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 35,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: COLORS.inputBg,
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  sendButton: {
    width: 60,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  userWrapper: {
    justifyContent: 'flex-end',
    marginLeft: 40,
  },
  aiWrapper: {
    justifyContent: 'flex-start',
    marginRight: 40,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: COLORS.gray,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: COLORS.darkBlue,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 15,
  },
  userText: {
    color: COLORS.black,
  },
  aiText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 12,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default HealthChatBot;
