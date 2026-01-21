import { RadarDisplay } from '@/components/RadarDisplay';
import { View } from '@/components/Themed';
import { useLocationRadar } from '@/hooks/useLocationRadar';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export default function RadarScreen() {
  const { nearbyDrivers, setSession } = useStore();
  
  // temporary mock session for dev
  useEffect(() => {
     if (!useStore.getState().session) {
         setSession({ id: '123', plate: 'MY-CAR-01', vehicle_type: 'Car' });
     }
  }, []);

  useLocationRadar();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="mb-8">
          <RadarDisplay drivers={nearbyDrivers} />
      </View>
    </View>
  );
}
