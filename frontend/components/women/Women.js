import { Alert, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native'; // <-- NEW: Import navigation hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AvatarMenu from './othercomps/AvatarMenu'; 

const Women = () => {
  const navigation = useNavigation(); // <-- NEW: Initialize navigation
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

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
    <View className="flex-1 items-center pt-40" style={{ paddingBottom: insets.bottom + 40, backgroundColor: theme.background }}>

      {/* Avatar Menu top-right */}
      {/* Dashboard Title */}
      <Text className="font-extrabold text-4xl mb-2 tracking-tight" style={{ color: theme.text }}>
        Women Dashboard
      </Text>
      
      <Text className="font-semibold text-lg mb-12" style={{ color: theme.primary }}>
        Privacy Focused Features
      </Text>

      {/* Cards */}
      <View className="flex-row flex-wrap justify-center w-full max-w-lg">
        <Card
          title="Private Consults"
          subtitle="Connect with Female Specialists"
          onPress={() => navigation.navigate('WomenPrivateConsults')}
          customColorClasses="bg-[#311B92] active:bg-[#1A0C6B]"
        />

        <Card
          title="Period Tracker"
          subtitle="Log & Predict Cycles Securely"
          onPress={() => navigation.navigate('PeriodTracker')}
          customColorClasses="bg-[#880E4F] active:bg-[#5C0834]"
        />

        <Card
          title="Nutrition & Wellness"
          subtitle="Tailored Health Tips"
          // --- NAVIGATION CHANGE ---
          onPress={() => navigation.navigate('WomenWellness')} // Navigate using the screen name defined in App.js
          customColorClasses="bg-[#1B5E20] active:bg-[#0F3B13]"
        />

        <Card
          title="Safety & SOS"
          subtitle="Quick Access to Helplines"
          onPress={() => navigation.navigate('WomenSafety')}
          customColorClasses="bg-[#B71C1C] active:bg-[#820909]" 
        />
      </View>
    </View>
  );
};

export default Women;
