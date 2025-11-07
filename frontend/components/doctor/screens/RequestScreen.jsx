// File: components/doctor/screens/RequestScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { AuthContext } from '../../../App';

// --- API and COLORS ---
const API_HOST = '192.168.137.1';
const PENDING_REQUESTS_ENDPOINT = `http://${API_HOST}:5000/api/v1/appointments/doctorappointment`; 
const UPDATE_STATUS_ENDPOINT = (id) => `http://${API_HOST}:5000/api/v1/appointments/${id}`;

// Define global colors used in styles locally within this file
const PRIMARY_COLOR = '#311B92';
const ACCENT_COLOR = '#880E4F';
const SUCCESS_COLOR = '#1B5E20';
const DANGER_COLOR = '#B71C1C';
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const GRAY = '#E5E7EB'; 
const LIGHT_GRAY = '#F5F5F5';

const TAB_BAR_HEIGHT = 70; // Used for scroll padding

const getAuthHeaders = (token) => ({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }
});
// ----------------------

// --- Request Card Component ---
const RequestItem = ({ request, onAccept, onReject, theme }) => (
    <Card style={[requestStyles.requestCard, { backgroundColor: theme.card, borderColor: PRIMARY_COLOR }]}>
        <Card.Content>
            <View style={requestStyles.requestHeader}>
                <Text style={[requestStyles.patientName, { color: theme.text }]}>
                    {request.patientName}
                </Text>
                <Chip 
                    style={requestStyles.statusChip}
                    textStyle={{ color: request.status === 'pending' ? PRIMARY_COLOR : SUCCESS_COLOR, fontWeight: 'bold' }}
                >
                    {request.status.toUpperCase()}
                </Chip>
            </View>

            <Text style={[requestStyles.reason, { color: theme.textSecondary }]}>
                Reason: <Text style={{ fontWeight: 'normal' }}>{request.reason}</Text>
            </Text>
            <Text style={[requestStyles.meta, { color: theme.textSecondary }]}>
                Requested on: <Text style={{ fontWeight: 'normal' }}>{new Date(request.requestedOn).toLocaleDateString()}</Text>
            </Text>

            <View style={requestStyles.actionRow}>
                <Button 
                    mode="contained" 
                    onPress={() => onAccept(request.id)}
                    disabled={request.status !== 'pending'}
                    style={requestStyles.actionButton}
                    contentStyle={{ backgroundColor: SUCCESS_COLOR }}
                    labelStyle={{ color: WHITE }}
                >
                    Accept
                </Button>
                <Button 
                    mode="outlined" 
                    onPress={() => onReject(request.id)}
                    disabled={request.status !== 'pending'}
                    style={requestStyles.actionButton}
                    labelStyle={{ color: DANGER_COLOR }}
                >
                    Reject
                </Button>
            </View>
        </Card.Content>
    </Card>
);

// --- Main Component ---
export default function RequestScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { userToken } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const bottomContentPadding = TAB_BAR_HEIGHT + insets.bottom + 10; 

    // --- API Calls (Omitted for brevity, assuming logic is functional) ---
    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        if (!userToken) {
            setError("Authentication token missing.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(PENDING_REQUESTS_ENDPOINT, getAuthHeaders(userToken));
            const responseData = await response.json();
            const rawAppointments = Array.isArray(responseData.data) ? responseData.data : [];
            
            const formattedRequests = rawAppointments.map(app => ({
                id: app._id,
                patientName: app.patientId?.name || 'Unknown Patient', 
                reason: app.reason,
                status: app.status,
                requestedOn: app.createdAt || new Date(),
            }));
            
            setRequests(formattedRequests.filter(req => req.status === 'pending'));

        } catch (err) {
            console.error("Request Fetch Error:", err);
            setError(`Network error: Could not connect to ${API_HOST}. Ensure server is running.`);
        } finally {
            setLoading(false);
        }
    };
    
    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(UPDATE_STATUS_ENDPOINT(appointmentId), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify({ status: newStatus }),
            });
            const responseData = await response.json();
            if (response.ok && responseData.success !== false) {
                Alert.alert("Success", `Request ${newStatus} successfully.`);
                fetchRequests();
            } else {
                Alert.alert("Failed", responseData.message || `Could not update status to ${newStatus}.`);
            }
        } catch (e) {
            Alert.alert("Error", "Network error during update.");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [userToken]);

    const handleAccept = (id) => updateAppointmentStatus(id, 'accepted');
    const handleReject = (id) => updateAppointmentStatus(id, 'rejected');

    // --- Render Content ---
    if (loading) {
        return <View style={requestStyles.statusContainer}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
    }

    if (error) {
        return <View style={requestStyles.statusContainer}><Text style={{ color: DANGER_COLOR }}>Error: {error}</Text><Button onPress={fetchRequests}>Retry</Button></View>;
    }
    
    return (
        <View style={[requestStyles.container, { backgroundColor: theme.background }]}>
            <View style={requestStyles.headerContainer}>
                <Text style={[requestStyles.headerTitle, { color: theme.text }]}>Appointment Requests</Text>
                <Text style={[requestStyles.headerSubtitle, { color: theme.textSecondary }]}>{requests.length} new appointments pending review.</Text>
            </View>

            {requests.length === 0 ? (
                <View style={requestStyles.statusContainer}>
                    <Text style={{ color: theme.textSecondary }}>No new requests at this time.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RequestItem 
                            request={item} 
                            onAccept={handleAccept} 
                            onReject={handleReject} 
                            theme={theme} 
                        />
                    )}
                    // Apply padding to the FlatList content
                    contentContainerStyle={{ paddingBottom: bottomContentPadding, paddingHorizontal: 10 }}
                />
            )}
        </View>
    );
}

const requestStyles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        marginBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: GRAY, 
    },
    headerTitle: {
        fontSize: 26, 
        fontWeight: 'bold', 
        marginTop: 6, 
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    requestCard: {
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 12,
        elevation: 2, 
        shadowColor: BLACK, 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3,
        borderLeftWidth: 5,
        borderLeftColor: PRIMARY_COLOR,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusChip: {
        backgroundColor: LIGHT_GRAY,
        height: 25,
        justifyContent: 'center',
    },
    reason: {
        fontSize: 14,
        marginBottom: 6,
    },
    meta: {
        fontSize: 12,
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 8,
    },
});