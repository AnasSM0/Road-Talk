import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const session = useStore((state) => state.session);
  const router = useRouter();

  useEffect(() => {
    // Perform any initial checks here (e.g. check local storage for persisted session)
    // For now we just check store.
    const timer = setTimeout(() => {
        if (!session) {
             router.replace('/auth');
        } else {
             router.replace('/(tabs)/radar');
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [session]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B101B', justifyContent: 'center', alignItems: 'center' }}>
       <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
