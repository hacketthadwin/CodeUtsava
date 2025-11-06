import { Alert, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit'; // <-- Import LineChart
import { useTheme } from '../../contexts/ThemeContext';
import AvatarMenu from './othercomps/AvatarMenu'; 
import HealthChatBot from '../patient/othercomps/HealthChatBot';

// Get screen width for responsive chart layout
const screenWidth = Dimensions.get('window').width;

// Define colors used in Tailwind classes (based on established scheme)
const cardColors = {
    // Tailwind classes
    indigoPrimary: "bg-[#311B92] active:bg-[#1A0C6B]",
    maroonSecondary: "bg-[#880E4F] active:bg-[#5C0834]",
    greenTertiary: "bg-[#1B5E20] active:bg-[#0F3B13]",
    darkBlue: "bg-[#0047AB] active:bg-[#00378D]",
    redDanger: "bg-[#B71C1C] active:bg-[#820909]",

    // Hex values for ChartKit
    greenPrimaryHex: '#1B5E20', // Darker green for a good header contrast
    greenChartLine: '#388E3C', // Lighter green for the line
    white: '#ffffff',
    black: '#000000',
};

// Sample data for the chart: Months vs. Number of Visits
const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        {
            data: [30, 45, 28, 80, 56, 42],
            color: (opacity = 1) => cardColors.greenChartLine, // Line color
            strokeWidth: 2 
        }
    ],
    legend: ["Monthly Visits"] 
};

const Worker = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);
    
    // Placeholder for user name login
    const userName = "Pooja"; 

    // Chart config adapted to theme
    const themedChartConfig = {
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${theme.text === '#FFFFFF' ? '255,255,255' : '0,0,0'}, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(${theme.text === '#FFFFFF' ? '255,255,255' : '0,0,0'}, ${opacity})`,
        fillShadowGradient: cardColors.greenPrimaryHex,
        fillShadowGradientOpacity: 0.2,
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: cardColors.greenPrimaryHex,
        },
        propsForLabels: {
            fontSize: 10,
        },
    };
    
    // Modified Card component with new default larger dimensions
    const Card = ({ title, subtitle, subHeading, onPress, customColorClasses, customHeightClass = 'h-52', customWidthClass = 'w-48' }) => (
        <TouchableOpacity
          // Reduced margin to 'm-1' for tighter packing
          className={`${customWidthClass} ${customHeightClass} m-1 justify-center rounded-2xl shadow-xl shadow-gray-300 transition-all duration-150 ${customColorClasses}`}
          onPress={onPress}
        >
          <View className="items-center p-3">
            {subHeading && <Text className="text-white text-xs font-semibold mb-1 opacity-80">{subHeading}</Text>}
            <Text className="text-white font-bold text-xl text-center mb-1">{title}</Text>
            <Text className="text-white text-base text-center font-light leading-snug">{subtitle}</Text>
          </View>
        </TouchableOpacity>
    );


  return (
    // Outer View container remains fixed to hold the static header and allow flex-1 to push ScrollView
    <View className="flex-1" style={{ backgroundColor: theme.background }}> 

        {/* --- FIXED HEADER CONTENT --- */}
        <View className="items-center pt-12 px-4">
            {/* Avatar Menu top-right (Assumed to be positioned absolutely or fixed) */}
            <AvatarMenu
                avatarUri={require('../m.png')} 
                onProfile={() => navigation.navigate('Profile')}
                onSettings={() => navigation.navigate('Settings')}
                onLogout={() => Alert.alert('Logout clicked')}
            />

            {/* Greeting and Role Title */}
            <Text className="font-extrabold text-4xl my-1 tracking-tight text-left self-start" style={{ color: theme.text }}>
                Hi {userName}
            </Text>

            <Text className="font-semibold text-lg mb-6 tracking-tight text-left self-start" style={{ color: theme.primary }}>
                ASHA Worker Dashboard
            </Text>
        </View>
        {/* --- END FIXED HEADER --- */}

        {/* --- SCROLLABLE CARD AREA --- */}
        <ScrollView contentContainerStyle={{ 
            alignItems: 'center', 
            paddingBottom: 100 
        }} className="w-full">
            
            {/* Subheading: Performance Overview (New Section) */}
            <Text className="w-full text-center font-bold text-3xl mt-4 mb-2 px-2" style={{ color: theme.text }}>
                Performance Overview
            </Text>

            {/* Monthly Visits Chart */}
            <View className="w-full items-center mb-6">
                <Text className="text-lg font-bold mb-2" style={{ color: theme.textSecondary }}>Monthly Community Visits</Text>
                <LineChart
                    data={chartData}
                    width={screenWidth * 0.9} // Use 90% of screen width
                    height={220}
                    chartConfig={themedChartConfig}
                    bezier // Smooth curve
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        shadowColor: cardColors.black,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        elevation: 5,
                    }}
                />
            </View>


            {/* Cards Container */}
            <View className="flex-row flex-wrap justify-center w-full max-w-lg px-1">
            
                {/* Subheading: Communication Hub */}
                <Text className="w-full text-center font-semibold text-xl mt-4 mb-2 px-2" style={{ color: theme.text }}>
                    Communication Hub
                </Text>
                
                {/* Chat with Patient */}
                <Card
                    title="Chat with Patient"
                    subtitle="Direct messaging with community members."
                    subHeading="Field Support"
                    onPress={() => navigation.navigate('ChatWithPatient')}
                    customColorClasses={cardColors.indigoPrimary}
                />
                
                {/* Chat with Doctor */}
                <Card
                    title="Chat with Doctor"
                    subtitle="Consult with PHC medical staff."
                    subHeading="PHC Connection"
                    onPress={() => navigation.navigate('ChatWithDoctor')}
                    customColorClasses={cardColors.maroonSecondary}
                />

                {/* Subheading: Task Management */}
                <Text className="w-full text-center font-semibold text-xl mt-6 mb-2 px-2" style={{ color: theme.text }}>
                    Task Management
                </Text>
                
                {/* Upload Patient Records */}
                <Card
                    title="Upload Patient Records"
                    subtitle="Digitize and submit community health data."
                    subHeading="Data Entry"
                    onPress={() => navigation.navigate('UploadPatientRecord')}
                    customColorClasses={cardColors.greenTertiary}
                />
                
                {/* Worker Schedule (MUCH TALLER: h-80, w-48) */}
                <Card
                    title="Worker Schedule"
                    subtitle="View and manage daily appointments & visits."
                    subHeading="Priority View"
                    onPress={() => navigation.navigate('WorkerSchedule')}
                    customColorClasses={cardColors.darkBlue}
                />
                
                {/* Subheading: Emergency Services */}
                <Text className="w-full text-center font-semibold text-xl mt-6 mb-2 px-2" style={{ color: theme.text }}>
                    Immediate Response
                </Text>
                
                {/* Emergency SOS Card (FULL WIDTH) */}
                <View className="w-full items-center mb-4 px-8">
                    <Card
                        title="Emergency SOS"
                        subtitle="Alert PHC/Supervisor for immediate support."
                        subHeading="Crisis Contact"
                        onPress={() => navigation.navigate('Safety')}
                        customColorClasses={cardColors.redDanger}
                        customWidthClass="w-full" // Increased width to span the whole row
                    />
                </View>
            </View>
        </ScrollView>

        {/* Floating AI Chatbot Button */}
        <TouchableOpacity
          onPress={() => setIsChatbotVisible(true)}
          style={{ position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.darkBlue, alignItems: 'center', justifyContent: 'center', elevation: 6 }}
        >
          <Text style={{ color: theme.buttonText, fontSize: 24, fontWeight: 'bold' }}>🧠</Text>
        </TouchableOpacity>

        {isChatbotVisible && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' }}>
            <HealthChatBot onClose={() => setIsChatbotVisible(false)} bottomInset={24} />
          </View>
        )}
    </View>
  )
}

export default Worker