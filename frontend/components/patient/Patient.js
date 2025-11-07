import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useContext } from 'react';
import AvatarMenu from './othercomps/AvatarMenu'; 
import HealthChatBot from './othercomps/HealthChatBot'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext'; 
import { AuthContext } from '../../App'; 
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
    primary: '#311B92',
    secondary: '#880E4F',
    tertiary: '#1B5E20',
    danger: '#B71C1C',
    darkBlue: '#0047AB',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#E5E7EB',
    lightGray: '#F5F5F5',
    darkyellow: '#b88600'
};

// --- API ENDPOINTS ---
const PROCESS_API_URL = 'http://192.168.137.1:8000/process';
const MONGO_API_URL = 'http://192.168.137.1:5000/api/v1/records/post-symptom';

// --- DUMMY DATA ---
const symptomLogData = [
    { id: 1, date: '2025-11-20', symptom: 'Fever', details: 'Max temp 38.5°C at 4 PM.', temperature: 38.5, status: 'High Fever', color: COLORS.danger },
    { id: 2, date: '2025-11-19', symptom: 'Cough', details: 'Occasional dry cough, mostly morning.', temperature: 37.0, status: 'Mild', color: COLORS.tertiary },
    { id: 3, date: '2025-11-19', symptom: 'Rash', details: 'Small red dots on tummy, not itchy.', temperature: 37.1, status: 'Tracked', color: COLORS.darkBlue },
    { id: 4, date: '2025-11-18', symptom: 'Fever', details: 'Spike to 39.2°C. Gave acetaminophen.', temperature: 39.2, status: 'Urgent', color: COLORS.danger },
];
const tempTrend = [36.9, 37.5, 37.1, 36.8, 37.5, 37.0, 38.5, 39.2];
const dummyReportData = [
    { id: 101, title: 'Annual Checkup 2025', type: 'Blood Test', date: '2025-09-15' },
    { id: 102, title: 'COVID Test Result', type: 'PCR Report', date: '2025-01-20' },
];

// --- HELPER COMPONENTS (Standard React Native structure) ---

const SymptomCard = ({ data, theme }) => (
    <View style={[styles.logCard, { backgroundColor: theme.card || COLORS.white, borderLeftColor: data.color, shadowColor: theme.textMuted || COLORS.black }]}>
        <View style={styles.logCardHeader}>
            <Text style={[styles.logCardDate, { color: theme.textSecondary || '#888' }]}>{data.date}</Text>
            <View style={[styles.statusTag, { backgroundColor: data.color }]}>
                <Text style={styles.statusText}>{data.status}</Text>
            </View>
        </View>
        <Text style={[styles.logCardSymptom, { color: theme.text || COLORS.black }]}>{data.symptom}</Text>
        {data.temperature > 37.5 && (
            <Text style={[styles.logCardTemperature, { color: theme.textSecondary || COLORS.black }]}>
                Temp: <Text style={{ fontWeight: 'bold', color: COLORS.secondary }}>{data.temperature}°C</Text>
            </Text>
        )}
        <Text style={[styles.logCardDetails, { color: theme.textSecondary || '#555' }]}>{data.details}</Text>
    </View>
);

const TemperatureChart = ({ data }) => {
    const chartHeight = 100;
    const maxTemp = 40;
    const minTemp = 36;
    const range = maxTemp - minTemp;
    const horizontalSpacing = 35;

    const normalizedData = data.map(temp => ({
        temp,
        y: chartHeight - ((temp - minTemp) / range) * chartHeight,
        isFever: temp > 38.0,
    }));

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Last 8 Temperature Readings (°C)</Text>
            <View style={styles.chartArea}>
                <View style={[styles.tempLine, { top: chartHeight - ((38 - minTemp) / range) * chartHeight, borderColor: COLORS.danger }]} />
                <Text style={[styles.tempLabel, { top: chartHeight - ((38 - minTemp) / range) * chartHeight - 10, color: COLORS.danger }]}>38°C (Fever)</Text>

                {normalizedData.map((p, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dataPoint,
                            {
                                top: p.y - 5,
                                left: (i * horizontalSpacing) + 5,
                                backgroundColor: p.isFever ? COLORS.danger : COLORS.primary,
                            }
                        ]}
                    />
                ))}
            </View>
            <View style={styles.x_axis_wrapper}>
                {data.map((temp, i) => (
                    <Text key={i} style={styles.x_axis_label}>R{i + 1}</Text>
                ))}
            </View>
        </View>
    );
};

const ReportCard = ({ data, theme }) => (
    <View style={[styles.reportCard, { backgroundColor: theme.card || COLORS.white, borderColor: COLORS.primary }]}>
        <Text style={[styles.reportTitle, { color: theme.text || COLORS.black }]}>{data.title}</Text>
        <Text style={[styles.reportDetails, { color: theme.textSecondary || '#555' }]}>Type: {data.type}</Text>
        <Text style={[styles.reportDate, { color: COLORS.secondary }]}>Date: {data.date}</Text>
    </View>
);

const TabBar = ({ activeTab, setActiveTab, navigation, insets }) => {
    const { theme } = useTheme();
    const TAB_BAR_CONTENT_HEIGHT = 50;

    const handleTabPress = (tabName) => {
        setActiveTab(tabName);
    };

    const tabs = [
        { name: 'Home', label: 'Home', icon: '🏠', target: 'Log' },
        { name: 'AddRecord', label: 'Add Record', icon: '📝', target: 'NewEntry' },
        { name: 'PastRecords', label: 'Past Records', icon: '📜', target: 'PastReports' },
    ];

    const visualActiveTab = activeTab;

    return (
        <View style={[
            styles.tabBar,
            {
                height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
                backgroundColor: theme.tabBarBackground || COLORS.white,
                borderTopColor: theme.tabBarBorder || COLORS.gray
            }
        ]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.name}
                    style={styles.tabButtonNav}
                    onPress={() => handleTabPress(tab.target)}
                >
                    <Text style={[
                        styles.tabIcon,
                        { color: tab.target === visualActiveTab ? COLORS.primary : theme.textSecondary || '#888' }
                    ]}>
                        {tab.icon}
                    </Text>
                    <Text style={[
                        styles.tabLabel,
                        { color: tab.target === visualActiveTab ? COLORS.primary : theme.textSecondary || '#888' }
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};


// --- MAIN COMPONENT ---
const Patient = () => {
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();
    // Get user object from AuthContext
    const { signOut, user } = useContext(AuthContext); 

    const [activeTab, setActiveTab] = useState('Log');

    // --- State for Form Inputs ---
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [bpm, setBpm] = useState('');
    const [medicationName, setMedicationName] = useState('');
    const [medicationMg, setMedicationMg] = useState('');
    const [medicationDosage, setMedicationDosage] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false); // Loading state
    const [imageUri, setImageUri] = useState(null); // State to store temporary image URI

    const handleChatbotPress = () => {
        setIsChatbotVisible(true);
    };

    const closeChatbot = () => {
        setIsChatbotVisible(false);
    };

    const handleImageUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access media library is needed to upload an image.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImageUri(uri);
            Alert.alert('Image Selected', 'Image is ready to be attached to your entry!');
        }
    };

    // Helper to validate and convert input strings to number strings or null
    const safeParseInt = (value) => {
        if (!value || isNaN(parseInt(value, 10))) {
            return null;
        }
        return parseInt(value, 10).toString();
    };
    
    /**
     * @function handleSaveEntry
     * Handles form submission: sends data as FormData to the FastAPI Processing API (API 1),
     * and then sends the processed response (JSON) to the MongoDB API (API 2).
     */
    const handleSaveEntry = async () => {
        if (isSaving) return;

        // Basic validation
        if (!date || !title || !systolic || !bpm) {
            Alert.alert('Missing Fields', 'Please fill out Date, Title, Systolic, and BPM fields at minimum.');
            return;
        }

        setIsSaving(true);
        
        // Extract user data from AuthContext
        const userName = user?.name || 'Unknown Patient';
        const userAge = user?.age || 30; 
        const userGender = user?.gender || 'Unknown'; 
        const userEmail = user?.email || 'unknown@example.com';
        const userNumber = user?.number || '000-000-0000'; 
        
        // --- 1. Prepare FormData for FastAPI (API 1) ---
        const formData = new FormData();

        // 1a. REQUIRED Fields (Must be appended)
        formData.append('patient_name', userName);
        formData.append('age', userAge.toString()); 
        formData.append('sex', userGender); 
        
        // 1b. OPTIONAL Numeric Fields (Append ONLY if valid number is present)
        const parsedSystolic = safeParseInt(systolic);
        const parsedDiastolic = safeParseInt(diastolic);
        const parsedBpm = safeParseInt(bpm);

        if (parsedSystolic) {
            formData.append('bp_systolic', parsedSystolic);
        }
        if (parsedDiastolic) {
            formData.append('bp_diastolic', parsedDiastolic);
        }
        if (parsedBpm) {
            formData.append('pulse_bpm', parsedBpm);
        }
        
        // CRITICAL FIX: Omit optional fields not collected in the form (like temperature_c and spo2_percent) 
        // as appending an empty string ("") causes FastAPI to throw a 422 error.
        
        // 1c. Prepare Medication/Symptom JSON string for the 'symptoms' field
        const symptomsData = {
            date: date,
            title: title,
            medication: medicationName ? [{
                name: medicationName,
                mg: parseInt(medicationMg, 10) || null,
                dosage: medicationDosage
            }] : [],
            medical_history: medicalHistory,
            additional_notes: additionalNotes,
        };
        formData.append('symptoms', JSON.stringify(symptomsData));


        // 1d. Append Image File (if available)
        if (imageUri) {
            const fileName = imageUri.split('/').pop();
            const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
            
            formData.append('pdf_file', {
                uri: imageUri,
                name: fileName,
                type: fileType,
            });
        }

        let processedData;

        // --- 2. POST to Processing API (FastAPI) ---
        try {
            const processResponse = await fetch(PROCESS_API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!processResponse.ok) {
                const errorText = await processResponse.text();
                // Log detailed error from FastAPI to the client console
                console.error("FastAPI Detailed Error Response:", errorText); 
                Alert.alert('Processing API Failed', `Status ${processResponse.status}. Server validation failed.`);
                throw new Error(`API 1 (Processing) failed with status ${processResponse.status}`);
            }

            processedData = await processResponse.json();
            console.log('Successfully received response from API 1:', processedData);
            Alert.alert('Step 1 Complete','AI Feedback Generated Successfully');

        } catch (error) {
            console.error('API 1 Processing Error:', error.message);
            Alert.alert(
                'Submission Failed (API 1)', 
                `Error: ${error.message}. Check FastAPI console for detailed validation failure.`
            );
            setIsSaving(false);
            return;
        }
        
        // --- 3. Prepare Payload for MongoDB API (API 2) and Step 4: POST
        const mongoPayload = {
            email: userEmail,
            number: userNumber, 
            jsonData: {
                ...processedData,
                patient: {
                    patient_id: user?.id || user?._id || 'guest',
                    patient_name: userName,
                    age: userAge,
                    sex: userGender,
                },
                timestamp: new Date().toISOString(),
            },
        };

        try {
            const mongoResponse = await fetch(MONGO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mongoPayload), 
            });

            if (!mongoResponse.ok) {
                const errorText = await mongoResponse.text();
                Alert.alert('MongoDB Save Failed', `Status ${mongoResponse.status}. Server response: ${errorText.substring(0, 100)}...`);
                throw new Error(`API 2 (MongoDB) failed with status ${mongoResponse.status}`);
            }

            console.log('Successfully saved to MongoDB.');
            Alert.alert('Success!', 'Symptom entry saved and recorded as your medical record.');

            // Clear form after successful submission
            setDate(''); setTitle(''); setSystolic(''); setDiastolic(''); setBpm('');
            setMedicationName(''); setMedicationMg(''); setMedicationDosage('');
            setMedicalHistory(''); setAdditionalNotes('');
            setImageUri(null); // Clear image reference

        } catch (error) {
            console.error('API 2 MongoDB Save Error:', error.message);
            Alert.alert('Step 2 Failed', `Data was processed but failed to save to MongoDB: ${error.message}.`);
        } finally {
            setIsSaving(false);
        }
    };


    // Function to render content based on activeTab state (remains the same)
    const renderContent = () => {
        switch (activeTab) {
            case 'Log': // Home Content
                return (
                    <>
                        <Text style={[styles.greeting, { color: theme.text }]}>Hi, {user?.name || 'User'}</Text>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Temperature Trends</Text>
                        <TemperatureChart data={tempTrend} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Symptoms</Text>
                        {symptomLogData.map(data => (
                            <SymptomCard key={data.id} data={data} theme={theme} />
                        ))}
                        <TouchableOpacity
                            style={[styles.chatButton, { backgroundColor: COLORS.darkyellow }]}
                            onPress={() => navigation.navigate('ChatWithDoctor')}
                        >
                            <Text style={styles.chatButtonText}>Chat with Doctors</Text>
                        </TouchableOpacity>
                    </>
                );

            case 'NewEntry': // Add Record Content
                return (
                    <>
                    <Text style={[styles.greeting, { color: theme.text }]}>Log New Record</Text>

                    <View style={[styles.formContainer, { backgroundColor: theme.surface || COLORS.lightGray }]}>

                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 0 }]}>
                        Log Symptoms or Reports
                    </Text>

                    {/* === Image Upload Button === */}
                    <TouchableOpacity
                        style={[styles.imageUploadButton, { backgroundColor: imageUri ? COLORS.secondary : COLORS.darkBlue }]}
                        onPress={handleImageUpload}
                    >
                        <Text style={styles.imageUploadButtonText}>
                            {imageUri ? '✅ Image Selected: ' + imageUri.split('/').pop().substring(0, 20) : '📎 Upload Report / File'}
                        </Text>
                    </TouchableOpacity>

                    {/* === Date and Title === */}
                    <TextInput
                        style={[
                        styles.input,
                        {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                        },
                        ]}
                        placeholder="Date (YYYY-MM-DD) - e.g. 2025-11-21"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        value={date}
                        onChangeText={setDate}
                    />

                    <TextInput
                        style={[
                        styles.input,
                        {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                        },
                        ]}
                        placeholder="Symptom / Report Title"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* === VITALS SECTION === */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>
                        Vitals
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TextInput
                        style={[
                            styles.inputSmall,
                            {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                            },
                        ]}
                        placeholder="Systolic (mmHg)"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        keyboardType="numeric"
                        value={systolic}
                        onChangeText={setSystolic}
                        />
                        <TextInput
                        style={[
                            styles.inputSmall,
                            {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                            },
                        ]}
                        placeholder="Diastolic (mmHg)"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        keyboardType="numeric"
                        value={diastolic}
                        onChangeText={setDiastolic}
                        />
                        <TextInput
                        style={[
                            styles.inputSmall,
                            {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                            },
                        ]}
                        placeholder="BPM"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        keyboardType="numeric"
                        value={bpm}
                        onChangeText={setBpm}
                        />
                    </View>

                    {/* === MEDICATION TABLE === */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>
                        Current Medication
                    </Text>
                    <View
                        style={{
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderColor: theme.tabBarBorder || COLORS.gray,
                        paddingBottom: 4,
                        marginBottom: 4,
                        }}
                    >
                        <Text style={[styles.tableHeaderText, { flex: 2, color: theme.text }]}>
                        Medicine Name
                        </Text>
                        <Text style={[styles.tableHeaderText, { flex: 1, color: theme.text }]}>
                        mg
                        </Text>
                        <Text style={[styles.tableHeaderText, { flex: 1, color: theme.text }]}>
                        Dosage
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <TextInput
                        style={[
                            styles.tableInput,
                            { flex: 2, backgroundColor: theme.card || COLORS.white, color: theme.text },
                        ]}
                        placeholder="Paracetamol"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        value={medicationName}
                        onChangeText={setMedicationName}
                        />
                        <TextInput
                        style={[
                            styles.tableInput,
                            { flex: 1, backgroundColor: theme.card || COLORS.white, color: theme.text },
                        ]}
                        placeholder="500"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        keyboardType="numeric"
                        value={medicationMg}
                        onChangeText={setMedicationMg}
                        />
                        <TextInput
                        style={[
                            styles.tableInput,
                            { flex: 1, backgroundColor: theme.card || COLORS.white, color: theme.text },
                        ]}
                        placeholder="1/day"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        value={medicationDosage}
                        onChangeText={setMedicationDosage}
                        />
                    </View>

                    {/* === MEDICAL HISTORY === */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>
                        Medical History
                    </Text>
                    <TextInput
                        style={[
                        styles.inputArea,
                        {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                        },
                        ]}
                        placeholder="Describe patient's medical history..."
                        placeholderTextColor={theme.textSecondary || "#888"}
                        multiline
                        value={medicalHistory}
                        onChangeText={setMedicalHistory}
                    />

                    {/* === Notes / Findings === */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>
                        Additional Notes
                    </Text>
                    <TextInput
                        style={[
                        styles.inputArea,
                        {
                            backgroundColor: theme.card || COLORS.white,
                            color: theme.text,
                            borderColor: theme.tabBarBorder || COLORS.gray,
                        },
                        ]}
                        placeholder="Detailed notes (e.g., findings, medicine given)"
                        placeholderTextColor={theme.textSecondary || "#888"}
                        multiline
                        value={additionalNotes}
                        onChangeText={setAdditionalNotes}
                    />

                    {/* === SAVE BUTTON (Triggers API chain) === */}
                    <TouchableOpacity
                        style={[styles.submitButton, { opacity: isSaving ? 0.7 : 1 }]}
                        onPress={handleSaveEntry}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Save Entry</Text>
                        )}
                    </TouchableOpacity>

                    </View>
                    </>
                );

            case 'PastReports': // Past Records Content
                return (
                    <>
                        <Text style={[styles.greeting, { color: theme.text }]}>Past Records</Text>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Uploaded Reports</Text>
                        {dummyReportData.map(data => (
                            <ReportCard key={data.id} data={data} theme={theme} />
                        ))}

                        <TouchableOpacity
                            style={[styles.uploadButton, { backgroundColor: COLORS.secondary }]}
                            onPress={() => setActiveTab('NewEntry')}
                        >
                            <Text style={styles.submitButtonText}>Upload New Report</Text>
                        </TouchableOpacity>
                    </>
                );

            default:
                return null;
        }
    };


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>

                {/* --- FIXED HEADER (Avatar Menu) --- */}
                <View style={styles.headerContainer}>
                    <AvatarMenu
                        avatarUri={require('../p.jpg')}
                        onProfile={() => navigation.navigate('Profile')}
                        onSettings={() => navigation.navigate('Settings')}
                        onLogout={() => signOut()}
                    />
                </View>

                <View
                    style={styles.mainContentArea}
                    pointerEvents={isChatbotVisible ? 'none' : 'auto'}
                >

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 85 }]}
                    >
                        {renderContent()}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.fab, styles.fabShadow, { bottom: 50 + insets.bottom + 20, right: 24 }]}
                        onPress={handleChatbotPress}
                    >
                        <Text style={styles.fabText}>🧠</Text>
                    </TouchableOpacity>

                </View>

                {/* --- BOTTOM NAVIGATION BAR --- */}
                <TabBar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    navigation={navigation}
                    insets={insets}
                />

                {isChatbotVisible && (
                    <View style={styles.overlay}>
                        <HealthChatBot onClose={closeChatbot} bottomInset={insets.bottom} />
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

export default Patient;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    headerContainer: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
    mainContentArea: { flex: 1 },
    scrollView: { flex: 1, },
    scrollContent: { paddingHorizontal: 20 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: COLORS.black, marginTop: 10, marginBottom: 10, },

    // --- Tab Bar Styles ---
    tabBar: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 5,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    tabButtonNav: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    tabIcon: { fontSize: 24, marginBottom: 2, },
    tabLabel: { fontSize: 12, fontWeight: '600', },
    // --- Content Styles ---
    chatButton: { paddingVertical: 15, borderRadius: 10, marginTop: 20, marginHorizontal: 0 },
    uploadButton: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
    chatButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', },
    sectionTitle: { color: COLORS.black, fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 15, },

    // NEW: Image Upload Button Style
    imageUploadButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    imageUploadButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Report Card Styles
    reportCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 5,
        marginBottom: 10,
        borderColor: COLORS.darkBlue,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    reportTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 5 },
    reportDetails: { fontSize: 14, color: '#555' },
    reportDate: { fontSize: 12, color: COLORS.secondary, marginTop: 5, fontWeight: '600' },

    // Rest of the styles (chart, form, etc.)
    chartContainer: { backgroundColor: COLORS.lightGray, borderRadius: 15, padding: 15, marginBottom: 20, marginHorizontal: 0, },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10, },
    chartArea: { width: '100%', height: 100, marginBottom: 5, position: 'relative', overflow: 'hidden', },
    tempLine: { position: 'absolute', left: 0, right: 0, borderBottomWidth: 1, borderStyle: 'dashed', },
    tempLabel: { position: 'absolute', right: 5, fontSize: 10, fontWeight: 'bold', },
    dataPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, zIndex: 10, },
    x_axis_wrapper: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, },
    x_axis_label: { fontSize: 10, color: '#888', },
    logCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, borderLeftWidth: 5, marginBottom: 10, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, marginHorizontal: 0, },
    logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, },
    logCardDate: { fontSize: 12, color: '#888', fontWeight: '600', },
    statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15, },
    statusText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', },
    logCardSymptom: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, },
    logCardDetails: { fontSize: 14, color: '#555', marginTop: 5, },
    logCardTemperature: { fontSize: 14, color: COLORS.black, marginTop: 5, },
    formContainer: { backgroundColor: COLORS.lightGray, padding: 20, borderRadius: 15, marginTop: 10, marginHorizontal: 0, },
    input: { height: 50, backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, color: COLORS.black, marginBottom: 15, borderWidth: 1, borderColor: COLORS.gray, },
    inputSmall: { flex: 1, height: 50, backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 10, fontSize: 14, color: COLORS.black, marginBottom: 15, borderWidth: 1, borderColor: COLORS.gray, marginHorizontal: 4 },
    tableInput: { height: 40, backgroundColor: COLORS.white, borderRadius: 8, paddingHorizontal: 10, fontSize: 14, color: COLORS.black, borderWidth: 1, borderColor: COLORS.gray, marginHorizontal: 4 },
    tableHeaderText: { fontSize: 14, fontWeight: '600', textAlign: 'center', },
    inputArea: { height: 100, backgroundColor: COLORS.white, borderRadius: 10, padding: 15, fontSize: 16, color: COLORS.black, marginBottom: 20, borderWidth: 1, borderColor: COLORS.gray, textAlignVertical: 'top', },
    submitButton: { backgroundColor: COLORS.tertiary, padding: 15, borderRadius: 10, alignItems: 'center', },
    submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', },
    fab: { position: 'absolute', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBlue, },
    fabText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', },
    fabShadow: { shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8, },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end', alignItems: 'center', zIndex: 10, },
});