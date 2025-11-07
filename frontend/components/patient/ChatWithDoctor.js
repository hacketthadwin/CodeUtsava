import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
    Modal,
    TextInput,
    // Dimensions is not used, can be removed from imports
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../App';
import { useNavigation } from '@react-navigation/native';

// --- API and LOTTIE PATHS ---
const API_HOST = '192.168.137.1';
const API_BASE = `http://${API_HOST}:5000/api/v1`;

// Endpoints
const ACCEPTED_DOCTORS_ENDPOINT = `${API_BASE}/appointments/patient-doctors`;
const BOOK_APPOINTMENT_ENDPOINT = `${API_BASE}/appointments/book`;
const ALL_DOCTORS_ENDPOINT = `${API_BASE}/book-appointment/users?role=Doctor`;

// Lottie animation for the doctor avatar
const DOCTOR_AVATAR_ANIMATION = require('../../assets/animations/Profile.json');

const cardColors = {
    grayText: '#6b7280',
    white: '#ffffff',
    greenAccent: '#10b981',
    maroonPrimary: '#881337',
    maroonLight: '#fdf2f8',
    redDanger: '#B71C1C',
};

// Helper for authorized fetch headers
const getAuthHeaders = (token, method = 'GET') => ({
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }
});

// --- Custom Doctor Avatar Component using Lottie ---
const DoctorAvatar = () => (
    <View style={styles.avatar}>
        <LottieView
            source={DOCTOR_AVATAR_ANIMATION}
            autoPlay
            loop
            style={styles.lottieAvatar}
        />
    </View>
);

// Component for a single chat item
const ChatItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.chatItemContainer} onPress={() => onPress(item)}>
        <DoctorAvatar />
        <View style={styles.chatDetails}>
            <View style={styles.nameTimeRow}>
                <Text style={styles.doctorName} numberOfLines={1}>
                    {item.name}
                </Text>
                {/* CORRECTION 1: Display the time/status that came from the server (or default)
                Not using item.time anymore, but item.status/item.lastMessageTime 
                If you integrate a real-time status/time, you will display it here.
                For now, we'll remove the unread count logic from this spot.
                */}
                <Text style={styles.timeText}>{item.lastMessageTime}</Text> 
            </View>
            <View style={styles.messageUnreadRow}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {/* Display the actual last message content or a standard message */}
                    {item.lastMessage} 
                </Text>
                {/* CORRECTION 2: Check for a real, non-placeholder unread count.
                The logic below remains correct *if* item.unread is real data.
                Since it's not, the fix is in the fetchDoctors mapping.
                */}
                {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                )}
            </View>
        </View>
    </TouchableOpacity>
);

const ChatWithDoctor = () => {
    const navigation = useNavigation();
    const { userToken } = useContext(AuthContext);

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Appointment Request Modal States
    const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [appointmentReason, setAppointmentReason] = useState('');
    const [allDoctors, setAllDoctors] = useState([]);
    const [allDoctorsLoading, setAllDoctorsLoading] = useState(false);
    const [allDoctorsError, setAllDoctorsError] = useState(null);

    // --- Fetch Accepted Doctors (Current Chat List) ---
    const fetchDoctors = async () => {
        if (!userToken) {
            setError("Authentication token missing. Please sign in again.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(ACCEPTED_DOCTORS_ENDPOINT, getAuthHeaders(userToken, 'GET'));
            const responseData = await response.json();

            // ... (rest of the debug logging) ...

            if (!response.ok || !responseData.success) {
                setError(responseData.message || "Failed to fetch accepted doctors.");
                setDoctors([]);
                return;
            }

            const rows = Array.isArray(responseData.data) ? responseData.data : [];

            // This mapping relies on the backend successfully populating 'doctorId'
            // with {_id, name, role}.
            const doctorList = rows
                .map(row => row.doctorId)
                .filter(doc => {
                    // Filter out any rows where population failed or role is incorrect
                    if (!doc || doc.role !== 'Doctor') {
                        console.warn(`Filtering out invalid doctor entry: ${doc ? doc.name : 'Missing Doc Object'}`);
                        return false;
                    }
                    return true;
                })
                .map(doc => ({
                    id: doc._id, // Maps MongoDB _id to client's id
                    name: doc.name,
                    role: doc.role,
                    // CORRECTION 3: Use realistic/empty/default values instead of random placeholders
                    lastMessage: 'Tap to start consultation...', // Default message
                    // CORRECTION 4: The 'time' field was being used for online status. 
                    // Set it to a default, or empty string. To implement real status, you need a WebSocket.
                    // Renamed 'time' to 'lastMessageTime' for clarity.
                    lastMessageTime: 'N/A', // Use 'N/A', or real timestamp if available
                    unread: 0, // CRITICAL FIX: Set unread to 0 initially.
                }));

            setDoctors(doctorList);
            console.log(`Successfully mapped ${doctorList.length} accepted doctors.`);

        } catch (err) {
            console.error("Doctor Fetch Error (Network/JSON):", err);
            setError(`Network error: Could not connect to ${API_HOST}. Check server status.`);
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch All Doctors (For Appointment Request Modal) ---
    // ... (fetchAllDoctors remains the same, as its function is to fetch the list, not chat data) ...
    const fetchAllDoctors = async () => {
        if (!userToken) return;
        setAllDoctorsLoading(true);
        setAllDoctorsError(null);

        try {
            const resp = await fetch(ALL_DOCTORS_ENDPOINT, getAuthHeaders(userToken, 'GET'));
            const data = await resp.json();

            if (!resp.ok || !data.success) {
                setAllDoctorsError(data.message || 'Failed to fetch doctor list (Check Token/Permissions)');
                setAllDoctors([]);
                return;
            }

            const list = Array.isArray(data.data) ? data.data : [];
            const doctorList = list.filter(d => d.role === 'Doctor').map(d => ({ id: d._id, name: d.name, role: d.role }));
            setAllDoctors(doctorList);

        } catch (e) {
            console.error("All Doctors Fetch Error:", e);
            setAllDoctorsError(`Network error: Could not connect to ${API_HOST}.`);
            setAllDoctors([]);
        } finally {
            setAllDoctorsLoading(false);
        }
    };


    // --- Side Effects ---
    useEffect(() => {
        fetchDoctors();
    }, [userToken]);

    useEffect(() => {
        if (isRequestModalVisible) {
            setSelectedDoctorId(null);
            setAppointmentReason('');
            if (allDoctors.length === 0 || allDoctorsError) {
                fetchAllDoctors();
            }
        }
    }, [isRequestModalVisible, userToken]);

    // --- Handlers ---

    const navigateToChat = (doctor) => {
        // Navigates to the patient's dedicated chat room with the doctor
        navigation.navigate('DoctorChat', { doctor });
    };

    const submitAppointmentRequest = async () => {
        if (!selectedDoctorId) {
            Alert.alert('Select Doctor', 'Please select a doctor to request an appointment.');
            return;
        }
        if (!appointmentReason.trim()) {
            Alert.alert('Enter Reason', 'Please enter a reason for the appointment.');
            return;
        }

        try {
            const resp = await fetch(BOOK_APPOINTMENT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ doctorId: selectedDoctorId, reason: appointmentReason.trim() })
            });

            const data = await resp.json();
            if (!resp.ok || !data.success) {
                Alert.alert('Request Failed', data.message || 'Unable to request appointment.');
                return;
            }

            Alert.alert('Requested', 'Appointment request submitted. The doctor will accept the request shortly.');

            setIsRequestModalVisible(false);
            fetchDoctors();
        } catch (e) {
            console.error('Appointment Request Error:', e);
            Alert.alert('Network Error', `Could not reach ${API_HOST}.`);
        }
    };


    // ... (Loading, Error, and Main Render remain the same) ...
    if (loading) {
        return (
            <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={cardColors.maroonPrimary} />
                <Text style={styles.statusText}>Loading accepted doctors...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: cardColors.redDanger, marginBottom: 10 }]}>
                    Error: {error}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
                    <Text style={styles.retryButtonText}>Retry Accepted Doctors</Text>
                </TouchableOpacity>
                <Text style={styles.statusHint}>Ensure the backend is running and your token is valid.</Text>
            </View>
        );
    }
    
    // The rest of the component's JSX (Header, FlatList, Modal) remains unchanged.
    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor={cardColors.maroonPrimary}
                barStyle="light-content"
            />

            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Accepted Consults</Text>
                  <Text style={styles.headerSubtitle}>
                    Start chatting with your approved PHC physician
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsRequestModalVisible(true)}
                  style={styles.requestButton}
                >
                  <Text style={styles.requestButtonText}>Request Appointment</Text>
                </TouchableOpacity>
              </View>
            </View>


            {doctors.length === 0 ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>You have no active or accepted consultations yet. Request a new appointment to begin.</Text>
                    <TouchableOpacity onPress={() => setIsRequestModalVisible(true)} style={[styles.retryButton, { marginTop: 20 }]}>
                               <Text style={styles.retryButtonText}>Request New Appointment</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ChatItem item={item} onPress={navigateToChat} />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}


            {/* Appointment Request Modal (Modal JSX is unchanged) */}
            <Modal visible={isRequestModalVisible} transparent animationType="slide" onRequestClose={() => setIsRequestModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Request Appointment</Text>
                        <Text style={styles.modalLabel}>Select Doctor</Text>

                        {/* Doctor List Container */}
                        <View style={styles.doctorListContainer}>
                            {allDoctorsLoading ? (
                                <View style={{ padding:12 }}><ActivityIndicator color={cardColors.maroonPrimary} /></View>
                            ) : allDoctorsError ? (
                                <View style={{ padding:12 }}><Text style={styles.errorText}>{allDoctorsError}</Text></View>
                            ) : allDoctors.length === 0 ? (
                                <View style={{ padding:12 }}><Text style={{ color: cardColors.grayText }}>No Doctors found in the system.</Text></View>
                            ) : (
                                <FlatList
                                        data={allDoctors}
                                        keyExtractor={(d)=>d.id}
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                onPress={()=>setSelectedDoctorId(item.id)}
                                                style={[styles.doctorItem, selectedDoctorId===item.id && styles.doctorItemSelected]}
                                            >
                                                <DoctorAvatar />
                                                <Text style={styles.doctorItemText}>{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                        ItemSeparatorComponent={() => <View style={styles.doctorItemSeparator} />}
                                />
                            )}
                        </View>

                        <Text style={styles.modalLabel}>Reason for Appointment</Text>
                        <TextInput
                            value={appointmentReason}
                            onChangeText={setAppointmentReason}
                            placeholder="Describe your issue (problems and symptoms)"
                            multiline
                            style={styles.reasonInput}
                        />

                        {/* Modal Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={()=>{setIsRequestModalVisible(false); setSelectedDoctorId(null); setAppointmentReason('');}}
                                style={styles.modalCancelButton}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={submitAppointmentRequest} style={styles.modalSendButton}>
                                <Text style={styles.modalSendButtonText}>Send Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ... (Stylesheets remain unchanged) ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cardColors.white,
    },
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: cardColors.white,
    },
    statusText: {
        fontSize: 16,
        color: cardColors.grayText,
        marginTop: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: cardColors.maroonPrimary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    retryButtonText: {
        color: cardColors.white,
        fontWeight: 'bold',
    },
    statusHint: {
        marginTop: 20,
        fontSize: 12,
        color: cardColors.grayText,
        textAlign: 'center',
    },
    header: {
      backgroundColor: cardColors.maroonPrimary,
      paddingTop: 40, 
      paddingHorizontal: 16,
      paddingBottom: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap', 
      gap: 10,
    },
    
    headerTextContainer: {
      flex: 1,
      paddingRight: 10,
    },
    
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: cardColors.white,
    },
    
    headerSubtitle: {
      fontSize: 14,
      color: cardColors.maroonLight,
      marginTop: 2,
      opacity: 0.9,
    },
    
    requestButton: {
      backgroundColor: cardColors.maroonLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    
    requestButtonText: {
      color: cardColors.maroonPrimary,
      fontWeight: 'bold',
      fontSize: 14,
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
        backgroundColor: cardColors.maroonLight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
    },
    lottieAvatar: {
        width: 80, 
        height: 80,
    },
    chatDetails: {
        flex: 1,
    },
    nameTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    doctorName: {
        fontSize: 16,
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
        marginLeft: 80,
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1, 
        backgroundColor:'rgba(0,0,0,0.6)', 
        justifyContent:'center', 
        padding:16
    },
    modalContent: { 
        backgroundColor:cardColors.white, 
        borderRadius:12, 
        padding:16 
    },
    modalTitle: { 
        fontSize:18, 
        fontWeight:'bold', 
        marginBottom:12, 
        color: cardColors.maroonPrimary 
    },
    modalLabel: { 
        marginBottom:6, 
        color:'#555', 
        fontWeight: '600' 
    },
    doctorListContainer: { 
        maxHeight:220, 
        borderWidth:1, 
        borderColor:'#ddd', 
        borderRadius:8, 
        marginBottom:12,
        overflow: 'hidden',
    },
    doctorItem: { 
        padding:10, 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cardColors.white,
    },
    doctorItemSelected: { 
        backgroundColor: cardColors.maroonLight,
    },
    doctorItemText: {
        fontWeight:'600',
        marginLeft: 10,
        color: '#000',
    },
    doctorItemSeparator: { 
        height:StyleSheet.hairlineWidth, 
        backgroundColor:'#eee' 
    },
    reasonInput: { 
        borderWidth:1, 
        borderColor:'#ddd', 
        borderRadius:8, 
        paddingHorizontal:12, 
        paddingVertical:10, 
        marginBottom:12, 
        minHeight:90, 
        textAlignVertical:'top' 
    },
    modalButtons: { 
        flexDirection:'row', 
        justifyContent:'flex-end' 
    },
    modalCancelButton: { 
        paddingVertical:10, 
        paddingHorizontal:14, 
        marginRight:8 
    },
    modalCancelButtonText: { 
        color: cardColors.grayText 
    },
    modalSendButton: { 
        backgroundColor: cardColors.maroonPrimary, 
        paddingVertical:10, 
        paddingHorizontal:14, 
        borderRadius:8 
    },
    modalSendButtonText: { 
        color:cardColors.white, 
        fontWeight:'bold' 
    },
    errorText: {
        color: cardColors.redDanger,
        textAlign: 'center',
        fontWeight: 'bold',
    }
});

export default ChatWithDoctor;