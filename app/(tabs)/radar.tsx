import { RadarDisplay } from '@/components/RadarDisplay';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useStore } from '@/store/useStore';
import { supabase } from '@/supabase/client';
import { Car, Truck } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RadarScreen() {
  useLocationTracking(); // Start tracking when on this screen (or main app)
  
  const session = useStore(s => s.session);
  const location = useStore(s => s.location);
  
  const setNearby = useStore(s => s.setNearbyDrivers);
  const nearbyDrivers = useStore(s => s.nearbyDrivers);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Polling for nearby drivers
  React.useEffect(() => {
    if (!session) return;
    
    // Initial fetch
    fetchDrivers();

    const interval = setInterval(fetchDrivers, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [session, location]); // Re-fetch if location changes significanlty? Maybe just time based is enough.

  const fetchDrivers = async () => {
    if (!session) return;
    // RPC: get_nearby_drivers(p_session_id, radius_meters)
    
    // In a real scenario, we might want to handle 'no location yet'
    // But the RPC uses the *User's last stored location* in the DB.
    // So as long as we are sending updates via useLocationTracking, this simple RPC call works.
    
    try {
        const { data, error } = await supabase.rpc('get_nearby_drivers', {
            p_session_id: session.id,
            radius_meters: 500.0 // 500km? No, meters. 
        });
        
        if (error) {
            console.log('Radar/FetchError:', error.message);
            // It might error if RPC not found or network fail.
        } else if (data) {
            // Map keys if necessary, but our types align closely
            setNearby(data);
        }
    } catch (e) {
        console.log('Radar/Error', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B101B' }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
         <View>
             <Text style={{ color: 'white', fontSize: 30, fontWeight: '900' }}>RADAR</Text>
             <Text style={{ color: '#60a5fa', fontWeight: 'bold', letterSpacing: 2, fontSize: 12 }}>V2V ACTIVE • 500M</Text>
         </View>
         <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#334155' }}>
             <Text style={{ color: '#cbd5e1', fontSize: 12, fontFamily: 'Courier New' }}>
                 {location?.speed ? Math.round(location.speed * 3.6) : 0} KM/H
             </Text>
         </View>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginVertical: 16 }}>
         <RadarDisplay drivers={nearbyDrivers} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
         <Text style={{ color: '#64748b', fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 }}>Nearby ({nearbyDrivers.length})</Text>
         <ScrollView showsVerticalScrollIndicator={false}>
            {nearbyDrivers.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.5 }}>
                    <Text style={{ color: '#475569' }}>No active drivers in range.</Text>
                    <Text style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>Updates every 5s</Text>
                </View>
            ) : (
                nearbyDrivers.map(d => (
                    <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.5)' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: d.vehicle_type === 'Truck' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
                             {d.vehicle_type === 'Truck' ? <Truck size={20} color="#f97316" /> : <Car size={20} color="#10b981" />}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{d.plate}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{d.vehicle_type || 'Unknown'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>{Math.round(d.distance || 0)}m</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {/* Simple arrow logic could go here based on bearing */}
                                <Text style={{ color: '#64748b', fontSize: 12 }}>{Math.round(d.relative_bearing || 0)}°</Text>
                            </View>
                        </View>
                    </View>
                ))
            )}
         </ScrollView>
      </View>
    </SafeAreaView>
  );
}
