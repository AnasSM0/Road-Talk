import { useStore } from '@/store/useStore';
import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [loading, setLoading] = useState(false);
  const setSession = useStore((state) => state.setSession);
  const router = useRouter();

  const handleLogin = async () => {
    if (plate.length < 3) {
      Alert.alert('Invalid Plate', 'Please enter a valid license plate (min 3 chars).');
      return;
    }
    
    // Normalize plate
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    setLoading(true);
    try {
      // 1. Create or Find Session
      // Note: In a real app we might want to check for existing active sessions, etc.
      // For MVP, we insert a new session for this plate.
      
      // Simple UPSERT logic simulation via INSERT + selection
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          plate_number: cleanPlate,
          vehicle_type: vehicleType,
          last_active: new Date(),
        })
        .select()
        .single();

      let sessionData = data;

      if (error) {
        // If duplicate key error (plate already active), let's try to 'recover' it or just update it
        if (error.code === '23505') { // Unique violation
           const { data: existingData, error: fetchError } = await supabase
             .from('sessions')
             .update({ last_active: new Date(), vehicle_type: vehicleType })
             .eq('plate_number', cleanPlate)
             .select()
             .single();
             
           if (fetchError) throw fetchError;
           sessionData = existingData;
        } else {
            throw error;
        }
      }

      if (!sessionData) throw new Error('Failed to create session');

      // 2. Set Global State
      setSession({
        id: sessionData.id,
        plate: sessionData.plate_number,
        vehicle_type: sessionData.vehicle_type,
      });

      // 3. Navigate
      router.replace('/(tabs)/radar');

    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B101B', paddingHorizontal: 24, justifyContent: 'center' }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 }}>ROAD TALK</Text>
          <Text style={{ color: 'white', fontSize: 36, fontWeight: '800', textAlign: 'center' }}>Identify Yourself</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Enter your plate number to connect with nearby drivers.</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
             <Text style={{ color: '#cbd5e1', marginBottom: 8, fontWeight: '500' }}>LICENSE PLATE</Text>
             <TextInput
                style={{
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    fontSize: 30, 
                    fontWeight: 'bold', 
                    padding: 16, 
                    borderRadius: 12, 
                    textAlign: 'center', 
                    borderWidth: 2, 
                    borderColor: '#334155'
                }}
                placeholder="ABC-1234"
                placeholderTextColor="#475569"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
                maxLength={8}
             />
          </View>

          <TouchableOpacity
            style={{ alignItems: 'center', marginTop: 16 }}
            onPress={() => setVehicleType(vehicleType === 'Car' ? 'Truck' : 'Car')}
          >
             <Text style={{ color: '#64748b' }}>Vehicle Type: <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>{vehicleType}</Text></Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
              marginTop: 40,
              padding: 20,
              borderRadius: 999,
              alignItems: 'center',
              backgroundColor: loading ? '#334155' : '#2563eb'
          }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
             <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>GO ONLINE</Text>
          )}
        </TouchableOpacity>
        
        <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
            By continuing, you agree to use this app hands-free while driving. 
            Safety is your responsibility.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
