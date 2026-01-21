import { useStore } from '@/store/useStore';
import { Audio as ExpoAudio } from 'expo-av';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const session = useStore((state) => state.session);
  const router = useRouter();

  const [locationPerm] = Location.useForegroundPermissions();
  const [audioPerm] = ExpoAudio.usePermissions();

  useEffect(() => {
    // Perform any initial checks here (e.g. check local storage for persisted session)
    // For now we just check store.
    
    // Permission Check
    if (!locationPerm || !audioPerm) return; // Loading
    
    if (!locationPerm.granted || !audioPerm.granted) {
        // If not granted, go to onboarding
        router.replace('/onboarding');
        return;
    }

    const timer = setTimeout(() => {
        if (!session) {
             router.replace('/auth');
        } else {
             router.replace('/(tabs)/radar');
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [session, locationPerm, audioPerm]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B101B', justifyContent: 'center', alignItems: 'center' }}>
       <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
