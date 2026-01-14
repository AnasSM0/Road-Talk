import { useStore } from '@/store/useStore';
import { supabase } from '@/supabase/client';
import * as Location from 'expo-location';
import { useEffect } from 'react';

export function useLocationTracking() {
  const session = useStore((state) => state.session);
  const setLocation = useStore((state) => state.setLocation);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      // Start watching
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000, 
          distanceInterval: 10, // Only update if moved 10 meters
        },
        async (loc) => {
          const { latitude, longitude, heading, speed } = loc.coords;
          
          // Update local state
          const newLoc = {
            lat: latitude,
            long: longitude,
            heading: heading || 0,
            speed: speed || 0,
          };
          setLocation(newLoc);

          // Update DB if logged in
          if (session?.id) {
            const { error } = await supabase.rpc('update_curr_location', {
              p_session_id: session.id,
              lat: latitude,
              long: longitude,
              h: heading || 0,
              s: speed || 0,
            });
            
            if (error) console.error('Error updating location:', error);
          }
        }
      );
    };

    if (session) {
        startTracking();
    }

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [session]);
}
