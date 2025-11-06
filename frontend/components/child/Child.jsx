import { Alert, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AvatarMenu from './othercomps/AvatarMenu'; 
import ChildHealthBot from './ChildHealthBot'; // Import the new AI Chatbot component
import { useTheme } from '../../contexts/ThemeContext';

const Child = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Define colors (for Tailwind classes)
  const darkBlueForLog = '#0047AB'; // Color for Symptom Log
  const indigoPrimary = '#311B92'; // Primary color for Consults and Growth
  
  const Card = ({ title, subtitle, onPress, customColorClasses }) => (
    <TouchableOpacity
      className={`w-40 h-40 m-2 justify-center rounded-2xl shadow-xl shadow-gray-300 transition-all duration-150 ${customColorClasses}`}
      onPress={onPress}
    >
      <View className="items-center p-3">
        <Text className="text-white font-bold text-lg text-center mb-1">{title}</Text>
        <Text className="text-white text-sm text-center font-light leading-snug">{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 items-center pt-24" style={{ paddingBottom: insets.bottom + 40, backgroundColor: theme.background }}>
      {/* Avatar Menu top-right */}
      
      {/* Dashboard Title */}
      <Text className="font-extrabold text-4xl mb-2 tracking-tight" style={{ color: theme.text }}>
        Child Dashboard
      </Text>
      
      <Text className="font-semibold text-lg mb-12" style={{ color: theme.primary }}>
        Privacy Focused Features
      </Text>
      
      {/* Cards - Six essential features */}
      <View className="flex-row flex-wrap justify-center w-full max-w-lg">
        {/* Row 1 */}
        <Card
          title="Private Consults"
          subtitle="Connect with Female Specialists"
          onPress={() => navigation.navigate('PrivateConsults')}
          customColorClasses="bg-[#311B92] active:bg-[#1A0C6B]"
        />
        <Card
          title="Vaccination Tracker"
          subtitle="Track Schedule & Status Securely"
          onPress={() => navigation.navigate('VaccinationTracker')}
          customColorClasses="bg-[#880E4F] active:bg-[#5C0834]"
        />

        {/* Row 2 */}
        <Card
          title="Nutrition & Wellness"
          subtitle="Tailored Health Tips"
          onPress={() => navigation.navigate('WellnessLibrary')}
          customColorClasses="bg-[#1B5E20] active:bg-[#0F3B13]"
        />
        <Card
          title="Safety & SOS"
          subtitle="Quick Access to Helplines"
          onPress={() => navigation.navigate('SafetyChild')}
          customColorClasses="bg-[#B71C1C] active:bg-[#820909]" 
        />

        {/* Growth & Milestones (Navigates to GrowthAndMilestones) */}
        <Card
          title="Growth & Milestones"
          subtitle="Track Height, Weight & Head Circumference"
          onPress={() => navigation.navigate('GrowthAndMilestones')}
          customColorClasses="bg-[#FF8F00] active:bg-[#FF6F00]"
        />
        
        {/* Symptom & Illness Log (Navigates to SymptomIllnessLog) */}
        <Card
          title="Symptom & Illness Log"
          subtitle="Track Fevers, Rashes & Doctor Visits"
          onPress={() => navigation.navigate('SymptomIllnessLog')}
          customColorClasses="bg-[#0047AB] active:bg-[#5C0834]"
        />
      </View>
      
      {/* Floating AI Chatbot Component, absolutely positioned at bottom right */}
    </View>
  );
};

export default Child
