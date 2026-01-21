import { callManager } from '@/services/CallManager';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PlaceSearchScreen() {
    const [plate, setPlate] = useState('');
    const router = useRouter();
    const { session } = useStore();

    const handleConnect = async () => {
        if (!plate.trim() || !session) return;
        
        // Init if needed
        await callManager.initialize(session.plate);

        useStore.getState().setActiveCallTarget({ plate: plate.toUpperCase(), id: 'manual' } as any);
        useStore.getState().setCallState('CONNECTING');
        
        // Start Call
        await callManager.startCall(plate.toUpperCase(), true);
        
        router.push('/call/active');
    };

    return (
        <View className="flex-1 bg-background items-center justify-center p-6 space-y-6">
            <Text className="text-white text-2xl font-bold">Connect by Plate</Text>
            
            <TextInput
                className="w-full bg-slate-800 text-white p-4 rounded-xl text-center text-xl font-bold tracking-widest border border-slate-600"
                placeholder="ENTER PLATE ID"
                placeholderTextColor="#64748B"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
            />
            
            <TouchableOpacity 
                className={`flex-row items-center px-8 py-4 rounded-full ${plate.trim() ? 'bg-primary' : 'bg-slate-700'}`}
                onPress={handleConnect}
                disabled={!plate.trim()}
            >
                <Phone color="white" size={24} />
                <Text className="text-white font-bold ml-3 text-lg">CONNECT</Text>
            </TouchableOpacity>
        </View>
    );
}
