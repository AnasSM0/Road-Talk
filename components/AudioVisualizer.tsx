import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
  metering: number; // -160 to 0
}

const BAR_COUNT = 5;

export const AudioVisualizer = ({ metering }: Props) => {
  // Metering is usually -160 (silence) to 0 (loud).
  // We want to map this to height.
  // Normalize: (-60 to 0) -> (0 to 1)
  const normalized = Math.max(0, (metering + 60) / 60);
  
  // Create shared values for bars
  const randoms = Array.from({ length: BAR_COUNT }).map(() => useSharedValue(10));

  useEffect(() => {
    randoms.forEach((val) => {
      // Randomize height based on volume
      const height = 10 + (normalized * 50) + (Math.random() * 20 * normalized);
      val.value = withTiming(height, { duration: 100 });
    });
  }, [metering]); // Updates heavily, might be slow with useEffect. UseDerivedValue is better but complex setup.

  return (
    <View className="flex-row items-center justify-center space-x-1 h-20">
      {randoms.map((height, i) => {
        const style = useAnimatedStyle(() => ({
          height: height.value,
          backgroundColor: '#22C55E' // Accent Color
        }));

        return (
            <Animated.View 
                key={i} 
                style={[{ width: 8, borderRadius: 4 }, style]} 
            />
        );
      })}
    </View>
  );
};
