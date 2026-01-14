import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const setSession = useStore(s => s.setSession);
  const router = useRouter();

  const handleLogout = () => {
    setSession(null);
    router.replace('/auth');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B101B] p-4">
      <Text className="text-white text-2xl font-bold mb-6">Settings</Text>
      
      <TouchableOpacity 
        className="bg-red-500/10 border border-red-500 p-4 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-red-500 text-center font-bold">End Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
