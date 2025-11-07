import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Text, TouchableOpacity, Pressable, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
// 1. Import LottieView
import LottieView from 'lottie-react-native'; 

// 2. Import the Lottie animation file
// Path is relative from components/patient/othercomps/AvatarMenu.js to assets/animations/Profile.json
import ProfileLottie from '../../../assets/animations/Profile.json'; 

// Note: The Image import is kept but the component is replaced with LottieView in the return block

const AvatarMenu = ({ avatarUri, onProfile, onSettings, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      scale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 140 });
    } else {
      scale.value = withTiming(0.95, { duration: 120, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 120 });
    }
  }, [isOpen]);

  const animatedMenuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleToggle = () => {
    const next = !isOpen;
    if (next) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setIsOpen(next);
  };

  const handleSelect = (action) => {
    setIsOpen(false);
    action && action();
  };

  const containerOffsets = useMemo(() => ({
    top: 15, // safe-area + small margin
    right: Math.max(insets.right, 8) + 0, // ensure visible on devices with curved edges
  }), [insets.top, insets.right]);

  return (
    <View
      className="absolute z-50 items-end"
      style={{ top: containerOffsets.top, left: 0, right: 0, paddingRight: containerOffsets.right, elevation: 10 }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleToggle}
        // Removed border-gray-400 and overflow-hidden for Lottie to ensure it renders correctly
        className="w-12 h-12 rounded-full" 
      >
        {/* 3. Replaced Image with LottieView */}
        <LottieView
          source={ProfileLottie} // Use the imported JSON file
          autoPlay={true}      // Start playing when the component mounts
          loop={true}          // Loop the animation continuously
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          // Optional: Add a subtle border or styling to the Lottie container if needed for visual framing
        />
      </TouchableOpacity>

      {isOpen && (
        <>
          {/* Backdrop to capture outside taps */}
          <Pressable
            onPress={() => setIsOpen(false)}
            style={{ position: 'absolute', top: -containerOffsets.top, left: -9999, right: -9999, bottom: -9999 }}
          />

          <Animated.View
            className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-44"
            style={animatedMenuStyle}
          >
            <TouchableOpacity
              onPress={() => handleSelect(onProfile)}
              className="px-4 py-3"
            >
              <Text className="text-gray-800">Profile</Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              onPress={() => handleSelect(onSettings)}
              className="px-4 py-3"
            >
              <Text className="text-gray-800">Settings</Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              onPress={() => handleSelect(onLogout)}
              className="px-4 py-3"
            >
              <Text className="text-red-600">Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
};

export default AvatarMenu;