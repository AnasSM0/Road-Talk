import { AudioVisualizer } from '@/components/AudioVisualizer';
import { PTTButton } from '@/components/PTTButton';
import { Text, View } from '@/components/Themed';
import { useStore } from '@/store/useStore';
import { Audio } from 'expo-av';
import React, { useState } from 'react';

export default function HighwayScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [metering, setMetering] = useState(-160);
  const { setCallState } = useStore();

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
           Audio.RecordingOptionsPresets.HIGH_QUALITY,
           (status) => {
               if (status.metering) setMetering(status.metering);
           },
           100 // update interval
        );
        setRecording(recording);
        setCallState('TALKING');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setCallState('IDLE');
    setMetering(-160);
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    console.log('Recording stopped and stored at', uri);
    // Here we would send the binary blob via Socket.io
    
    setRecording(null);
  }

  return (
    <View className="flex-1 items-center justify-center bg-background space-y-10">
      <View className="h-20 justify-end">
          {recording && <AudioVisualizer metering={metering} />}
      </View>
      
      <PTTButton 
        isTalking={!!recording}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      />

      <Text className="text-gray-400 text-sm mt-4">
          Highway Mode Active
      </Text>
    </View>
  );
}
