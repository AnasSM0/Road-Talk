import { callManager } from '@/services/CallManager';
import { useStore } from '@/store/useStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

// This component should be mounted high up (e.g. in (tabs) layout)
export function useIncomingCallListener() {
  const session = useStore(s => s.session);
  const callState = useStore(s => s.callState);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (session?.plate) {
        // Initialize listener for MY plate
        callManager.initialize(session.plate);
    }
    
    return () => {
        callManager.cleanup();
    };
  }, [session]);

  // Watch for incoming call state to navigate
  useEffect(() => {
     // If we are 'CONNECTING' (incoming) and NOT on the call screen, push it.
     if (callState === 'CONNECTING' || callState === 'CONNECTED') {
         // Check if already there to avoid dupes
         const inCallScreen = segments.includes('call');
         if (!inCallScreen) {
             router.push('/call');
         }
     }
  }, [callState, segments]);
}
