import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  onPressIn: () => void;
  onPressOut: () => void;
  isTalking: boolean;
}

export const PTTButton = ({ onPressIn, onPressOut, isTalking }: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    onPressIn();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    onPressOut();
  };

  return (
    <View className="items-center justify-center">
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="items-center justify-center"
      >
        <Animated.View 
            style={[{ width: 150, height: 150, borderRadius: 75 }, animatedStyle]}
            className={`items-center justify-center border-4 ${isTalking ? 'bg-red-500 border-red-700' : 'bg-primary border-blue-700'}`}
        >
             <Text className="text-white font-bold text-xl">
                 {isTalking ? 'TALKING' : 'HOLD TO TALK'}
             </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};
