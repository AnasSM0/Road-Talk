import { callManager } from '@/services/CallManager';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { Mic, PhoneOff, Radio } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ActiveCallScreen() {
  const router = useRouter();
  const callState = useStore(s => s.callState);
  const target = useStore(s => s.activeCallTarget);
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    if (callState === 'IDLE') {
        router.back();
    }
  }, [callState]);

  const handlePressIn = () => {
    setIsTalking(true);
    callManager.setTalking(true);
    useStore.getState().setCallState('TALKING');
    // Haptics here
  };

  const handlePressOut = () => {
    setIsTalking(false);
    callManager.setTalking(false);
    useStore.getState().setCallState('CONNECTED'); // or LISTENING
  };

  const handleEndCall = () => {
      callManager.endCall();
      router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B101B', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 48 }}>
       {/* Header */}
       <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: 2, fontSize: 12, marginBottom: 8 }}>CONNECTED TO</Text>
          <Text style={{ color: 'white', fontSize: 48, fontWeight: '900' }}>{target?.plate || 'CONNECTING...'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
             <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 8, backgroundColor: callState === 'CONNECTED' || callState === 'TALKING' ? '#22c55e' : '#eab308' }} />
             <Text style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 14 }}>{callState}</Text>
          </View>
       </View>

       {/* Waveform Visualization (Fake for MVP) */}
       <View style={{ height: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {[...Array(10)].map((_, i) => (
             <View 
                key={i} 
                style={{ 
                    width: 8, 
                    backgroundColor: '#3b82f6', 
                    borderRadius: 999, 
                    marginHorizontal: 4,
                    height: isTalking ? 64 : 8,
                    opacity: isTalking ? 1 : 0.2 
                }} 
             />
          ))}
       </View>

       {/* PTT Button */}
       <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={callState !== 'CONNECTED' && callState !== 'TALKING' && callState !== 'LISTENING'}
          style={{ alignItems: 'center', justifyContent: 'center' }}
       >
          <View 
            style={{ 
                width: SCREEN_WIDTH * 0.7, 
                height: SCREEN_WIDTH * 0.7,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                backgroundColor: isTalking ? '#16a34a' : '#1e293b',
                borderColor: isTalking ? '#4ade80' : '#475569',
                // Shadow simulation
                shadowColor: isTalking ? '#22c55e' : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 50
            }}
          >
              {isTalking ? (
                  <Mic size={80} color="white" />
              ) : (
                  <Radio size={80} color="#64748B" />
              )}
              <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 16, letterSpacing: 1, fontSize: 18 }}>
                  {isTalking ? 'TRANSMITTING' : 'HOLD TO TALK'}
              </Text>
          </View>
       </TouchableOpacity>

       {/* Footer Controls */}
       <View style={{ flexDirection: 'row' }}>
           <TouchableOpacity 
             onPress={handleEndCall}
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 24, borderRadius: 999, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}
           >
               <PhoneOff size={32} color="#EF4444" />
           </TouchableOpacity>
       </View>
    </View>
  );
}
