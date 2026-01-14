import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Driver } from '@/store/useStore';
import { Car, Truck } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RADAR_SIZE = SCREEN_WIDTH - 32; // Margin 16
const CENTER = RADAR_SIZE / 2;
const MAX_RANGE = 500; // Meters

interface Props {
  drivers: Driver[];
  range?: number; // meters
}

export const RadarDisplay = ({ drivers, range = MAX_RANGE }: Props) => {
  return (
    <View 
      className="bg-slate-900 rounded-full overflow-hidden border-2 border-slate-700 shadow-lg shadow-blue-500/20"
      style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
    >
      {/* Grid Rings */}
      <View className="absolute inset-0 justify-center items-center">
        <View className="w-[33%] h-[33%] border border-slate-800 rounded-full opacity-50" />
      </View>
      <View className="absolute inset-0 justify-center items-center">
        <View className="w-[66%] h-[66%] border border-slate-800 rounded-full opacity-50" />
      </View>
      <View className="absolute inset-0 justify-center items-center">
        <View className="w-full h-[1px] bg-slate-800 opacity-50" />
        <View className="h-full w-[1px] bg-slate-800 opacity-50 absolute" />
      </View>

      {/* Me (Center) */}
      <View className="absolute top-1/2 left-1/2 -ml-3 -mt-3">
         <View className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white items-center justify-center shadow-lg shadow-blue-500/50">
            <View className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white" />
         </View>
      </View>

      {/* Blips */}
      {drivers.map((driver) => {
        const dist = driver.distance || 0;
        if (dist > range) return null;

        // Convert relative bearing to screen coordinates
        // 0 deg = Up (North relative to car)
        // x = sin(theta) * r
        // y = -cos(theta) * r
        
        const bearing = driver.relative_bearing || 0;
        const rad = (bearing * Math.PI) / 180;
        
        // Normalize distance to radius (keep some padding)
        const r = (dist / range) * (CENTER - 20); 
        
        const x = CENTER + r * Math.sin(rad);
        const y = CENTER - r * Math.cos(rad);

        // Vehicle Icon
        const isTruck = driver.vehicle_type === 'Truck';

        return (
          <View
            key={driver.id}
            className="absolute items-center justify-center w-8 h-8 -ml-4 -mt-4"
            style={{ left: x, top: y }}
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center ${isTruck ? 'bg-orange-500' : 'bg-emerald-500'} border border-white shadow-sm`}>
                {isTruck ? <Truck size={14} color="white" /> : <Car size={16} color="white" />}
            </View>
            <Text className="text-[10px] text-white font-bold bg-black/50 px-1 rounded mt-8 absolute whitespace-nowrap">
                {driver.plate}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
