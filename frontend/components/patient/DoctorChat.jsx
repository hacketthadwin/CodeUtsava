import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator, 
    Alert,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext'; // Adjusted path
import { AuthContext } from '../../App.js'; // Adjusted path
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'; 
import io from 'socket.io-client'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// --- SOCKET PATH ---
const API_HOST = '192.168.137.1';
const API_PORT = '5000';
const SOCKET_URL = `http://${API_HOST}:${API_PORT}`; 

// --- COLORS (Reused for Bubble Styling) ---
const cardColors = {
    grayText: '#6b7280', 
    white: '#ffffff',
    greenAccent: '#10b981', 
    maroonPrimary: '#881337', 
    maroonLight: '#fdf2f8', 
    inputBg: '#f0f0f0',
    darkGray: '#333333',
    redDanger: '#B71C1C',
};

// ===============================================
//           🟢 PATIENT CHAT ROOM (DoctorChat.jsx)
// ===============================================
export default function DoctorChat() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    
    // CRITICAL: Get patient's own user object and token
    const { user, userToken } = useContext(AuthContext); 
    // Get the doctor data passed from ChatWithDoctor.jsx
    const doctor = route.params?.doctor; 

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null); 
    const chatRoomIdRef = useRef(null); 

    // Set screen title to the Doctor's name
    useEffect(() => {
        if (doctor?.name) {
            navigation.setOptions({ title: doctor.name });
        }
    }, [navigation, doctor]);

    // --- SOCKET.IO CONNECTION & HANDLERS ---
    useEffect(() => {
        // 1. Validation Check: Ensure patient (user) and doctor data exist
        if (!user || !doctor || !userToken || !user.id || !doctor.id) {
             console.error("Chat Error: Missing patient or doctor data/token. User:", user, "Doctor:", doctor);
             Alert.alert("Authentication Error", "Missing patient or doctor ID. Cannot start chat.", [{ text: "OK" }]);
             return; 
        }

        // 2. Determine unique Room ID (always sorted)
        const sortedIds = [user.id, doctor.id].sort();
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;
        chatRoomIdRef.current = roomId;

        // 3. Initialize Socket Connection (passing token for backend authentication)
        const socket = io(SOCKET_URL, {
            query: { token: userToken }, 
            transports: ['websocket'],
        });
        socketRef.current = socket; 

        socket.on('connect', () => {
            console.log('✅ Connected to chat server. Joining room:', roomId);
            // Request to join the room, identifying the user as the Patient
            socket.emit('joinRoom', { 
                roomId: roomId, 
                userId: user.id, 
                role: 'Patient' // CRITICAL: Identify the role
            }); 
            setIsLoading(false);
        });

        // 4. Handle Historical Messages
        socket.on('previousMessages', (historicalMessages) => {
            const formattedMessages = historicalMessages.map(msg => ({
                _id: msg._id,
                text: msg.message,
                createdAt: new Date(msg.timestamp || msg.createdAt),
                user: {
                    _id: msg.sender, 
                    // Determine sender name: if sender ID matches patient's ID, use patient's name, otherwise use doctor's name
                    name: msg.sender === user.id ? user.name : doctor.name,
                },
            })).reverse(); 

            setMessages(formattedMessages);
            setIsLoading(false);
        });

        // 5. Handle Incoming Live Messages (from the server broadcast)
        socket.on('receiveMessage', (messageData) => {
            const incomingMessage = {
                _id: messageData.timestamp + Math.random(), 
                text: messageData.message,
                createdAt: new Date(messageData.timestamp),
                user: {
                    _id: messageData.senderId,
                    name: messageData.senderName,
                },
            };
            setMessages(previousMessages => GiftedChat.append(previousMessages, [incomingMessage]));
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
            Alert.alert("Connection Failed", `Could not connect to chat server. Error: ${err.message}`);
            setIsLoading(false);
        });
        
        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, doctor, userToken, navigation]);

    // Function to handle sending a new message
    const onSend = useCallback((newMessages = []) => {
        
        if (socketRef.current && socketRef.current.connected) {
            newMessages.forEach(message => {
                const chatPayload = {
                    roomId: chatRoomIdRef.current,
                    senderId: user.id, // Patient is the sender
                    senderName: user.name, 
                    receiverId: doctor.id, // Doctor is the receiver
                    message: message.text,
                };
                // Emit to the server. The server handles saving and broadcasting.
                socketRef.current.emit('sendMessage', chatPayload);
            });
        } else {
            Alert.alert("Error", "Chat server is not connected. Message not sent.");
        }
    }, [user, doctor]); 

    // --- Custom Render Functions for UI/UX ---

    // Patient messages should be on the right (primary color)
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    // Patient is the current user (user._id === props.currentMessage.user._id)
                    right: {
                        backgroundColor: theme.primary || cardColors.maroonPrimary,
                        borderTopLeftRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 3,
                    },
                    // Doctor is the other user
                    left: {
                        backgroundColor: theme.card || cardColors.inputBg,
                        borderTopRightRadius: 15, borderBottomRightRadius: 15, borderBottomLeftRadius: 3,
                    },
                }}
                textStyle={{
                    right: { color: theme.onPrimary || cardColors.white, fontWeight: '500' },
                    left: { color: theme.text || cardColors.darkGray, fontWeight: '500' },
                }}
            />
        );
    };

    const renderSend = (props) => {
        return (
            <Send {...props} containerStyle={chatStyles.sendContainer}>
                <View style={chatStyles.sendingButton}>
                    <MaterialCommunityIcons 
                        name="send-circle" 
                        size={32} 
                        color={props.text ? theme.primary || cardColors.maroonPrimary : theme.border || cardColors.grayText} 
                    />
                </View>
            </Send>
        );
    };

    const renderInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={{
                backgroundColor: theme.surface || cardColors.white,
                borderTopColor: theme.border || cardColors.grayText,
                borderTopWidth: StyleSheet.hairlineWidth,
            }}
            primaryStyle={chatStyles.inputToolbarPrimary}
        />
    );


    if (isLoading) {
        return (
            <View style={[chatStyles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary || cardColors.maroonPrimary} />
                <Text style={{ color: theme.text, marginTop: 10 }}>Connecting to Chat...</Text>
            </View>
        );
    }
    
    if (!user || !user.id || !doctor) {
         return (
             <View style={[chatStyles.loadingContainer, { backgroundColor: theme.background }]}>
                 <Text style={{ color: cardColors.redDanger, fontSize: 18, textAlign: 'center', margin: 20 }}>
                     🛑 Chat Initialization Failed: Missing User or Doctor Data.
                 </Text>
             </View>
         );
    }

    return (
        <View style={[chatStyles.container, { 
            backgroundColor: theme.background, 
            paddingBottom: insets.bottom 
        }]}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: user.id, // CRITICAL: This MUST be the patient's ID
                    name: user.name,
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                
                textInputStyle={{ color: theme.text, backgroundColor: theme.card || cardColors.white, borderRadius: 15, paddingHorizontal: 12 }}
                placeholder={`Message Dr. ${doctor.name}...`}
                
                bottomOffset={Platform.OS === 'ios' ? 0 : 0} 
            />
        </View>
    );
}

const chatStyles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sendContainer: {
        marginRight: 5,
        justifyContent: 'center',
    },
    sendingButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});