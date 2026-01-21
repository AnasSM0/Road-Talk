import { useIncomingCallListener } from '@/hooks/useIncomingCallListener';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Radar, Radio, Settings, Users } from 'lucide-react-native';

export default function TabLayout() {
  useIncomingCallListener();

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0B101B',
            borderTopColor: '#1E293B',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#64748B',
        }}
      >
        <Tabs.Screen
          name="radar"
          options={{
            title: 'Radar',
            tabBarIcon: ({ color }) => <Radar color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="drivers"
          options={{
            title: 'Drivers',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="highway" // This will look for app/(tabs)/highway.tsx. Be careful.
          options={{
            title: 'Highway',
            tabBarIcon: ({ color }) => <Radio color={color} size={24} />, // Need to import Radio
          }}
        />
      </Tabs>
    </>
  );
}
