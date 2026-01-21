import { callManager } from '@/services/CallManager';
import { Driver, useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { Car, Mic, Truck } from 'lucide-react-native';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriversScreen() {
    const nearbyDrivers = useStore(s => s.nearbyDrivers);
    const session = useStore(s => s.session);
    const router = useRouter();

    const handleConnect = async (driver: Driver) => {
        if (!session) return;
        
        // 1. Initialize logic if not already
        await callManager.initialize(session.plate);
        
        // 2. Start Call
        useStore.getState().setActiveCallTarget(driver);
        useStore.getState().setCallState('CONNECTING');
        
        callManager.startCall(driver.plate, true); // Initiator
        
        // 3. Navigate to UI
        router.push('/call/active');
    };

    const renderItem = ({ item }: { item: Driver }) => (
        <View style={{ backgroundColor: '#1e293b', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center' }}>
             <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: item.vehicle_type === 'Truck' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}>
                {item.vehicle_type === 'Truck' ? <Truck size={24} color="#f97316" /> : <Car size={24} color="#3b82f6" />}
             </View>
             
             <View style={{ flex: 1 }}>
                 <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{item.plate}</Text>
                 <Text style={{ color: '#94a3b8', fontSize: 14 }}>{item.vehicle_type} • {Math.round(item.distance || 0)}m away</Text>
             </View>

             <TouchableOpacity 
                style={{ backgroundColor: '#16a34a', padding: 12, borderRadius: 999 }}
                onPress={() => handleConnect(item)}
             >
                <Mic size={20} color="white" />
             </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B101B', paddingHorizontal: 16 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 16, marginTop: 8 }}>Nearby Drivers</Text>
            
            <FlatList
                data={nearbyDrivers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 80 }}>
                        <Text style={{ color: '#64748b' }}>No active drivers nearby.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
