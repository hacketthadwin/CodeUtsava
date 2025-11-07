import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { View, StyleSheet, Text, Platform, Alert, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { useRoute, useNavigation } from '@react-navigation/native';
import io from 'socket.io-client'; // <-- MUST install this library (npm install socket.io-client)
import { useTheme } from '../../../contexts/ThemeContext'; 
import { AuthContext } from '../../../App'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- API and SOCKET URL ---
// Use the same IP and port the server is listening on
const API_HOST = '192.168.137.1'; 
const SOCKET_URL = `http://${API_HOST}:5000`; 

export default function PatientChatRoom() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    
    // Get logged-in Doctor details and token
    const { user, userToken } = useContext(AuthContext); 
    
    // The patient object passed from DoctorChatScreen
    const patient = route.params?.user; 

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null); // Ref to hold the socket connection
    const chatRoomIdRef = useRef(null); // Ref to hold the room ID

    // Set the screen title to the patient's name
    useEffect(() => {
        if (patient?.name) {
            navigation.setOptions({ title: patient.name });
        }
    }, [navigation, patient]);

    // ------------------------------------
    // 🌐 SOCKET.IO CONNECTION & HANDLERS
    // ------------------------------------
    useEffect(() => {
        if (!user || !patient || !userToken) {
            Alert.alert("Error", "Authentication or patient details missing.");
            navigation.goBack();
            return;
        }

        // 1. Calculate Room ID: CRITICAL to use a consistent method
        // Sort IDs to ensure both doctor and patient calculate the same room ID
        const sortedIds = [user.id, patient.id].sort();
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;
        chatRoomIdRef.current = roomId; // Store room ID in ref

        // 2. Establish Socket Connection
        const socket = io(SOCKET_URL, {
            query: { token: userToken }, // Pass auth token if needed for middleware (though your current backend doesn't seem to use it)
            transports: ['websocket'], // Prefer WebSocket transport
        });
        socketRef.current = socket; // Store socket instance in ref

        // 3. Connection and Room Joining
        socket.on('connect', () => {
            console.log('✅ Connected to chat server. Joining room:', roomId);
            
            socket.emit('joinRoom', { 
                roomId: roomId, 
                userId: user.id, // Doctor's ID
                role: 'Doctor' 
            }); 
        });

        // 4. Handle Historical Messages
        socket.on('previousMessages', (historicalMessages) => {
            console.log('Received previous messages:', historicalMessages.length);
            
            // Map server message format to GiftedChat format
            const formattedMessages = historicalMessages.map(msg => ({
                _id: msg._id,
                text: msg.message,
                createdAt: new Date(msg.timestamp || msg.createdAt),
                user: {
                    _id: msg.sender, // Server stores sender ID in 'sender' field
                    name: msg.sender === user.id ? user.name : patient.name,
                    // Note: Avatar logic can be added here
                },
            })).reverse(); // GiftedChat displays messages in reverse chronological order

            setMessages(formattedMessages);
            setIsLoading(false);
        });

        // 5. Handle Incoming Real-time Messages
        socket.on('receiveMessage', (messageData) => {
            console.log('📬 Received new message:', messageData);
            
            // Map incoming server message to GiftedChat format
            const incomingMessage = {
                _id: messageData.timestamp + Math.random(), // Use a unique ID
                text: messageData.message,
                createdAt: new Date(messageData.timestamp),
                user: {
                    _id: messageData.senderId,
                    name: messageData.senderName,
                },
            };
            
            // Append message to the state
            setMessages(previousMessages => GiftedChat.append(previousMessages, [incomingMessage]));
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
            Alert.alert("Connection Failed", `Could not connect to chat server at ${SOCKET_URL}`);
            setIsLoading(false);
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from chat server.');
        });
        
        // 6. CLEANUP: Disconnect socket when component unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, patient, userToken, navigation]); // Re-run if user/patient changes

    // Function to handle sending a new message
    const onSend = useCallback((newMessages = []) => {
        // Optimistically update the UI with the sent message
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
        
        // Send the message via Socket.IO
        if (socketRef.current && socketRef.current.connected) {
            newMessages.forEach(message => {
                const chatPayload = {
                    roomId: chatRoomIdRef.current,
                    senderId: user?.id,
                    senderName: user?.name,
                    receiverId: patient.id, // This is needed by your backend's Message.create
                    message: message.text,
                };

                socketRef.current.emit('sendMessage', chatPayload);
                console.log('📤 Emitting message:', chatPayload);
            });
        } else {
            Alert.alert("Error", "Chat server is not connected. Please try again.");
            console.error("Attempted to send message while socket is disconnected.");
        }
    }, [user, patient]); 
    // ------------------------------------

    // --- Custom Render Functions for GiftedChat ---

    // 1. Custom Bubble Styling
    const renderBubble = (props) => {
        const isUser = props.currentMessage.user._id === user.id;
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: theme.primary,
                        borderBottomRightRadius: 2,
                    },
                    left: {
                        backgroundColor: theme.card,
                        borderBottomLeftRadius: 2,
                    },
                }}
                textStyle={{
                    right: {
                        color: theme.onPrimary || cardColors.white,
                    },
                    left: {
                        color: theme.text,
                    },
                }}
            />
        );
    };

    // 2. Custom Send Button 
    const renderSend = (props) => {
        return (
            <Send {...props}>
                <View style={styles.sendingContainer}>
                    <MaterialCommunityIcons 
                        name="send" 
                        size={24} 
                        color={props.text ? theme.primary : theme.textSecondary} 
                    />
                </View>
            </Send>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.text, marginTop: 10 }}>Connecting to Chat...</Text>
            </View>
        );
    }
    
    if (!patient) {
        return (
             <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Chat unavailable. Invalid Patient.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: user?.id || 'DOCTOR_ID_UNKNOWN', 
                    name: user?.name || 'MyDoctor',
                    // The server determines the avatar via senderId in a real app
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                textInputStyle={{ color: theme.text }}
                placeholder="Type your message..."
                bottomOffset={Platform.OS === 'ios' ? 0 : 0} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        width: 44,
        marginRight: 10,
    },
});

// Define cardColors for fallback in renderBubble if theme is incomplete
const cardColors = {
    white: '#ffffff',
    maroonPrimary: '#881337', 
};