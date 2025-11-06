import { Text, View, TouchableOpacity, ScrollView, TextInput, StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, PanResponder } from 'react-native';
import React, { useState, useRef } from 'react';

// Reusing colors for consistency
const COLORS = {
  primary: '#311B92', // Dark Indigo
  secondary: '#880E4F', // Dark Maroon
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  transparentBlack: 'rgba(0, 0, 0, 0.5)',
  translucentBlue: 'rgba(49, 27, 146, 0.85)', // Translucent Primary
  translucentWhite: 'rgba(255, 255, 255, 0.95)', // Translucent White
  gray: '#E5E7EB',
};

// Default size for the chat window
const DEFAULT_HEIGHT = Dimensions.get('window').height * 0.5;
const DEFAULT_WIDTH = Dimensions.get('window').width * 0.85;

const ChildHealthBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your Child Health Assistant. I can help with general health and wellness questions for your baby. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for resizable window dimensions
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);

  const scrollViewRef = useRef();

  // --- GEMINI API INTEGRATION ---
  const handleSendMessage = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    const systemPrompt = "You are a friendly, non-diagnostic AI assistant specializing in newborn and infant health, nutrition, and common symptoms. Provide helpful, non-emergency advice, always reminding the user to consult a pediatrician for definitive medical guidance. Keep answers concise and supportive.";
    const apiKey = "AIzaSyA2HOvE8mQWwwupFCtl-4Zw53nlttWFK50";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const chatHistory = newMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const payload = {
        contents: chatHistory,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    // Retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let responseText = "Sorry, I encountered an error. Please try again.";

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const candidate = result.candidates?.[0];
            
            if (candidate && candidate.content?.parts?.[0]?.text) {
                responseText = candidate.content.parts[0].text;
                break; // Success, exit retry loop
            }

        } catch (error) {
            // Wait with exponential backoff before retrying
            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    setLoading(false);
    setMessages(currentMsgs => [...currentMsgs, { role: 'model', text: responseText }]);
  };

  // --- RESIZING LOGIC ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Increase height and width based on movement from the top-left corner
        setChatWidth(Math.max(250, chatWidth - gestureState.dx));
        setChatHeight(Math.max(300, chatHeight - gestureState.dy));
      },
      onPanResponderRelease: () => {
        // Optional: snap to predefined sizes or log final size
      },
    })
  ).current;

  // --- RENDER FUNCTIONS ---
  const renderChatWindow = () => (
    <View 
      style={[
        chatStyles.chatWindow, 
        { 
          height: chatHeight, 
          width: chatWidth,
        }
      ]}
    >
      {/* Input Box at the Top */}
      <View style={chatStyles.inputContainer}>
        <TextInput
          style={chatStyles.input}
          placeholder={loading ? "AI is thinking..." : "Ask about your baby's health..."}
          placeholderTextColor="#BBBBBB"
          value={input}
          onChangeText={setInput}
          editable={!loading}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
          style={chatStyles.sendButton} 
          onPress={handleSendMessage} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={chatStyles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resizable Corner Handle */}
      <View style={chatStyles.resizeHandleContainer} {...panResponder.panHandlers}>
        <Text style={chatStyles.resizeHandle}>
          {"<>"}
        </Text>
      </View>
      
      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={chatStyles.messageContainer}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View 
            key={index} 
            style={[
              chatStyles.messageBubble, 
              msg.role === 'user' ? chatStyles.userBubble : chatStyles.modelBubble
            ]}
          >
            <Text style={msg.role === 'user' ? chatStyles.userText : chatStyles.modelText}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={botStyles.absoluteWrapper}>
      {isChatOpen && renderChatWindow()}
      
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={botStyles.floatingButton}
        onPress={() => setIsChatOpen(!isChatOpen)}
        activeOpacity={0.8}
      >
        <Text style={botStyles.buttonIcon}>{isChatOpen ? 'x' : 'AI'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- STYLES ---

const botStyles = StyleSheet.create({
  // The wrapper places the chat component fixed in the bottom right corner
  absoluteWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'flex-end', // Ensure contents align to the right
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginTop: 10,
  },
  buttonIcon: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const chatStyles = StyleSheet.create({
  chatWindow: {
    backgroundColor: COLORS.translucentWhite, // Translucent White background
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
    flexDirection: 'column',
    position: 'relative', // Necessary for resize handle positioning
  },
  resizeHandleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  resizeHandle: {
    fontSize: 14,
    color: COLORS.darkBlue,
    transform: [{ rotate: '135deg' }],
  },
  messageContainer: {
    padding: 10,
    flex: 1, // Takes remaining space
  },
  // Input at the TOP (reversed order)
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    backgroundColor: COLORS.translucentBlue, // Translucent Primary for input area
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: COLORS.black,
    height: 40,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    height: 40,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  // Chat bubbles
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  modelBubble: {
    backgroundColor: COLORS.gray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  userText: {
    color: COLORS.white,
  },
  modelText: {
    color: COLORS.black,
  },
});

export default ChildHealthBot;

