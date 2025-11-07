import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator, 
    StatusBar,
    Alert,
    Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeContext.js'; 
import { AuthContext } from '../../../App.js'; 
import { SegmentedButtons } from 'react-native-paper'; 
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'; 
import io from 'socket.io-client'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 

// CRITICAL: Import for handling screen boundaries on modern phones
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// --- API and SOCKET PATHS ---
const API_HOST = '192.168.137.1';
const API_PORT = '5000';
const ACCEPTED_PATIENTS_ENDPOINT = `http://${API_HOST}:${API_PORT}/api/v1/appointments/doctor-patients`; 
const SOCKET_URL = `http://${API_HOST}:${API_PORT}`; 

// Lottie animation for the patient avatar
const PATIENT_AVATAR_ANIMATION = require('../../../assets/animations/Profile.json'); 

// --- COLORS ---
const cardColors = {
    grayText: '#6b7280', 
    white: '#ffffff',
    greenAccent: '#10b981', 
    maroonPrimary: '#881337', 
    maroonLight: '#fdf2f8', 
    redDanger: '#B71C1C',
    inputBg: '#f0f0f0',
    darkGray: '#333333',
};

// Helper for authorized fetch headers
const getAuthHeaders = (token, method = 'GET') => ({
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }
});

// --- Custom Patient Avatar Component using Lottie ---
const PatientAvatar = () => (
    <View style={sharedStyles.avatar}>
        <LottieView
            source={PATIENT_AVATAR_ANIMATION}
            autoPlay
            loop
            style={sharedStyles.lottieAvatar}
        />
    </View>
);

// Component for a single chat item (Used in DoctorChatScreen)
const ChatItem = ({ item, onPress, theme }) => (
    <TouchableOpacity style={[sharedStyles.chatItemContainer, { backgroundColor: theme.card }]} onPress={() => onPress(item)}>
        <PatientAvatar /> 
        <View style={sharedStyles.chatDetails}>
            <View style={sharedStyles.nameTimeRow}>
                <Text style={[sharedStyles.patientName, { color: theme.text }]} numberOfLines={1}>
                    {item.name} 
                </Text>
                <Text style={[sharedStyles.timeText, { color: theme.textSecondary }]}>{item.time}</Text> 
            </View>
            <View style={sharedStyles.messageUnreadRow}>
                <Text style={[sharedStyles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                    <View style={sharedStyles.unreadBadge}>
                        <Text style={sharedStyles.unreadText}>{item.unread}</Text>
                    </View>
                )}
            </View>
        </View>
    </TouchableOpacity>
);

// --- SOCKET.IO CONNECTION & HANDLERS ---
// ===============================================
//           🟢 PATIENT CHAT ROOM COMPONENT
// ===============================================
// Exported as a named export
export function PatientChatRoom() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    
    const insets = useSafeAreaInsets();
    
    // CRITICAL: Destructure 'user' (which is the full user object from AuthContext)
    const { user, userToken } = useContext(AuthContext); 
    const patient = route.params?.user; 

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null); 
    const chatRoomIdRef = useRef(null); 

    // Set screen title
    useEffect(() => {
        if (patient?.name) {
            navigation.setOptions({ title: patient.name });
        }
    }, [navigation, patient]);

    useEffect(() => {
        // Validation check for CRITICAL null values
        // Check for 'user' and 'user.id' is now safe because 'user' is guaranteed to be the full object from App.js context
        if (!user || !patient || !userToken || !user.id) {
             console.error("Chat Error: Missing Doctor user data or token. User:", user);
             
             if (!user || !user.id) {
                 Alert.alert(
                     "Developer Error", 
                     "The Doctor's user ID is missing from the AuthContext. Check App.js state initialization.",
                     [{ text: "OK" }]
                 );
             }

             // Stop execution and render the static error screen below
             return; 
        }

        const sortedIds = [user.id, patient.id].sort();
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;
        chatRoomIdRef.current = roomId;

        const socket = io(SOCKET_URL, {
            query: { token: userToken }, 
            transports: ['websocket'],
        });
        socketRef.current = socket; 

        socket.on('connect', () => {
            console.log('✅ Connected to chat server. Joining room:', roomId);
            socket.emit('joinRoom', { 
                roomId: roomId, 
                userId: user.id, // Safe to access now
                role: 'Doctor' 
            }); 
            // Hide loading indicator upon successful connection (even if no messages yet)
            setIsLoading(false);
        });

        socket.on('previousMessages', (historicalMessages) => {
            const formattedMessages = historicalMessages.map(msg => ({
                _id: msg._id,
                text: msg.message,
                createdAt: new Date(msg.timestamp || msg.createdAt),
                user: {
                    _id: msg.sender, 
                    // Determine sender name based on ID
                    name: msg.sender === user.id ? user.name : patient.name,
                },
            })).reverse(); 

            setMessages(formattedMessages);
            setIsLoading(false);
        });

        // CRITICAL: Handle incoming messages broadcast from the server
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
            Alert.alert("Connection Failed", `Could not connect to chat server. Check backend console. Error: ${err.message}`);
            setIsLoading(false);
        });
        
        // Cleanup function on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, patient, userToken, navigation]); // Dependencies are clean

    // Function to handle sending a new message
    const onSend = useCallback((newMessages = []) => {
        
        if (socketRef.current && socketRef.current.connected) {
            newMessages.forEach(message => {
                const chatPayload = {
                    roomId: chatRoomIdRef.current,
                    senderId: user?.id,
                    senderName: user?.name,
                    receiverId: patient.id, 
                    message: message.text,
                };
                // Emit to the server. The server will save the message and broadcast it back.
                socketRef.current.emit('sendMessage', chatPayload);
            });
            // We do NOT update local state here; we wait for the server's broadcast ('receiveMessage')
            // to ensure synchronization and database saving confirmation.
        } else {
            Alert.alert("Error", "Chat server is not connected. Message not sent.");
        }
    }, [user, patient]); 

    // --- Custom Render Functions for UI/UX ---

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: theme.primary || cardColors.maroonPrimary,
                        borderTopLeftRadius: 15,
                        borderBottomLeftRadius: 15,
                        borderBottomRightRadius: 3,
                    },
                    left: {
                        backgroundColor: theme.card || cardColors.inputBg,
                        borderTopRightRadius: 15,
                        borderBottomRightRadius: 15,
                        borderBottomLeftRadius: 3,
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
    
    // Fallback for missing critical data (should be caught by the useEffect alert)
    if (!user || !user.id || !patient) {
         return (
             <View style={[chatStyles.loadingContainer, { backgroundColor: theme.background }]}>
                 <Text style={{ color: cardColors.redDanger, fontSize: 18, textAlign: 'center', margin: 20 }}>
                     🛑 Chat Initialization Failed: Missing User Data.
                 </Text>
             </View>
         );
    }

    return (
        // Apply dynamic bottom padding for safe area
        <View style={[chatStyles.container, { 
            backgroundColor: theme.background, 
            paddingBottom: insets.bottom 
        }]}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: user.id, // Use the verified user ID
                    name: user.name,
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                
                textInputStyle={{ color: theme.text, backgroundColor: theme.card || cardColors.white, borderRadius: 15, paddingHorizontal: 12 }}
                placeholder="Type your message..."
                
                // Rely on parent container paddingBottom and InputToolbar fix for safe area handling
                bottomOffset={Platform.OS === 'ios' ? 0 : 0} 
            />
        </View>
    );
}

// ===============================================
//           ✅ DOCTOR CHAT LIST COMPONENT
// ===============================================
// Exported as default export
export default function DoctorChatScreen() {
    const navigation = useNavigation();
    const { userToken } = useContext(AuthContext);
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState('patients'); 
    
    // --- Fetch Accepted Patients (Current Chat List) ---
    const fetchPatients = async () => {
        if (!userToken) {
            setError("Authentication token missing. Please sign in again.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(ACCEPTED_PATIENTS_ENDPOINT, getAuthHeaders(userToken, 'GET'));
            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                setError(responseData.message || `Failed to fetch accepted patients. Status: ${response.status}`);
                setPatients([]);
                return;
            }
            
            const rows = Array.isArray(responseData.data) ? responseData.data : [];
            
            const patientList = rows
                .map(row => row.patientId) 
                .filter(p => p && p.role === 'Patient') 
                .map(p => ({
                    id: p._id,
                    name: p.name,
                    role: 'Patient',
                    lastMessage: 'Tap to start consultation...', 
                    time: 'Active', 
                    unread: Math.floor(Math.random() * 3), 
                }));
                
            setPatients(patientList);

        } catch (err) {
            console.error("Patient Fetch Error:", err);
            setError(`Network error: Could not connect to ${API_HOST}:${API_PORT}. Ensure server is running and route is correct.`);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (viewType === 'patients') {
            fetchPatients();
        }
    }, [userToken, viewType]); 

    // --- Handlers ---
    const navigateToChatRoom = (patient) => {
        // Navigates to the named export component above
        navigation.navigate('PatientChatRoom', { user: patient }); 
    };
    
    // --- Render Content ---
    const renderPatientListContent = () => {
        if (loading) {
            return (
                <View style={[sharedStyles.statusContainer, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.primary || cardColors.maroonPrimary} />
                    <Text style={[sharedStyles.statusText, { color: theme.textSecondary }]}>Loading accepted patients...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={[sharedStyles.statusContainer, { backgroundColor: theme.background }]}>
                    <Text style={[sharedStyles.statusText, { color: cardColors.redDanger, marginBottom: 10 }]}>
                        Error: {error}
                    </Text>
                    <TouchableOpacity style={[sharedStyles.retryButton, { backgroundColor: theme.primary || cardColors.maroonPrimary }]} onPress={fetchPatients}>
                        <Text style={sharedStyles.retryButtonText}>Retry Accepted Patients</Text>
                    </TouchableOpacity>
                    <Text style={sharedStyles.statusHint}>Check server connection or authentication status.</Text>
                </View>
            );
        }
        
        if (patients.length === 0) {
            return (
                <View style={[sharedStyles.statusContainer, { backgroundColor: theme.background }]}>
                    <Text style={[sharedStyles.statusText, { color: theme.textSecondary }]}>
                        You have no active or accepted patient consultations yet.
                    </Text>
                </View>
            );
        }
        
        return (
            <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatItem item={item} onPress={navigateToChatRoom} theme={theme} />
                )}
                ItemSeparatorComponent={() => <View style={[sharedStyles.separator, { backgroundColor: theme.border || '#ccc' }]} />}
            />
        );
    };
    
    const renderAIChatContent = () => (
        <View style={sharedStyles.statusContainer}>
            <Text style={[sharedStyles.statusText, { color: theme.textSecondary }]}>
                AI Chat Assistant functionality needs a separate screen or implementation here.
            </Text>
        </View>
    );

    // --- Main Render ---
    return (
        <View style={[sharedStyles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                backgroundColor={theme.primary || cardColors.maroonPrimary}
                barStyle="light-content"
            />
            
            <View style={[sharedStyles.header, { backgroundColor: theme.primary || cardColors.maroonPrimary, paddingTop: insets.top + 10 }]}>
              <View style={sharedStyles.headerRow}>
                <View style={sharedStyles.headerTextContainer}>
                  <Text style={sharedStyles.headerTitle}>
                    {viewType === 'patients' ? 'Patient Consults' : 'AI Assistant'}
                  </Text>
                  <Text style={[sharedStyles.headerSubtitle, { color: theme.onPrimary || cardColors.maroonLight }]}>
                    {viewType === 'patients' 
                      ? 'Select an accepted patient to begin chatting'
                      : 'Get quick access to medical information'
                    }
                  </Text>
                </View>
              </View>
            </View>

            <View style={[sharedStyles.segmentContainer, { backgroundColor: theme.surface || cardColors.white }] }>
                <SegmentedButtons
                    value={viewType}
                    onValueChange={setViewType}
                    buttons={[
                        { value: 'patients', label: 'Patient List', icon: 'account-multiple' },
                        { value: 'ai', label: 'AI Assistant', icon: 'robot' },
                    ]}
                    style={[sharedStyles.segmentedButtons, { backgroundColor: theme.surface || cardColors.white }]}
                />
            </View>

            {viewType === 'patients' ? renderPatientListContent() : renderAIChatContent()}

        </View>
    );
}

// ===============================================
//                🎨 STYLES
// ===============================================

// Styles shared between the list and chat screens
const sharedStyles = StyleSheet.create({
    container: { flex: 1 },
    statusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    statusText: { fontSize: 16, color: cardColors.grayText, marginTop: 10, textAlign: 'center' },
    retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15 },
    retryButtonText: { color: cardColors.white, fontWeight: 'bold' },
    statusHint: { marginTop: 20, fontSize: 12, color: cardColors.grayText, textAlign: 'center' },
    // Header paddingTop is adjusted dynamically in DoctorChatScreen
    header: { paddingHorizontal: 16, paddingBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    headerTextContainer: { flex: 1, paddingRight: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: cardColors.white },
    headerSubtitle: { fontSize: 14, marginTop: 2, opacity: 0.9 },
    segmentContainer: { padding: 8, elevation: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
    segmentedButtons: { marginHorizontal: 8 },
    chatItemContainer: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: cardColors.maroonLight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    lottieAvatar: { width: 80, height: 80 },
    chatDetails: { flex: 1 },
    nameTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    patientName: { fontSize: 16, fontWeight: '600', color: '#000' },
    timeText: { fontSize: 12, color: cardColors.grayText },
    messageUnreadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMessage: { fontSize: 14, color: cardColors.grayText, flex: 1, marginRight: 10 },
    unreadBadge: { backgroundColor: cardColors.greenAccent, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
    unreadText: { color: cardColors.white, fontSize: 11, fontWeight: 'bold' },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc', marginLeft: 80 },
});

// Styles specific to PatientChatRoom
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