import { Audio as ExpoAudio } from 'expo-av';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Check, MapPin, Mic, ShieldAlert } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
    const [locationPerm, requestLocation] = Location.useForegroundPermissions();
    const [audioPerm, requestAudio] = ExpoAudio.usePermissions();
    const router = useRouter();

    const locationGranted = locationPerm?.granted;
    const audioGranted = audioPerm?.granted;

    const handleContinue = () => {
        if (locationGranted && audioGranted) {
            router.replace('/');
        } else {
            Alert.alert('Permissions Required', 'Please grant both permissions to use RoadWave.');
        }
    };

    useEffect(() => {
        if (locationGranted && audioGranted) {
            router.replace('/');
        }
    }, [locationGranted, audioGranted]);

    return (
        <View className="flex-1 bg-background items-center justify-center p-8 space-y-10">
             <View className="items-center space-y-4">
                 <ShieldAlert size={64} color="#2563EB" />
                 <Text className="text-white text-3xl font-bold text-center">Safety First</Text>
                 <Text className="text-slate-400 text-center text-lg">
                     RoadWave requires access to your Location and Microphone to function safely on the highway.
                 </Text>
             </View>

             <View className="w-full space-y-4">
                 {/* Location Button */}
                 <TouchableOpacity 
                    className={`flex-row items-center p-4 rounded-xl border ${locationGranted ? 'bg-green-500/10 border-green-500' : 'bg-slate-800 border-slate-700'}`}
                    onPress={requestLocation}
                    disabled={locationGranted}
                 >
                     <View className={`w-12 h-12 rounded-full items-center justify-center ${locationGranted ? 'bg-green-500' : 'bg-slate-700'}`}>
                         {locationGranted ? <Check color="white" size={24} /> : <MapPin color="white" size={24} />}
                     </View>
                     <View className="ml-4 flex-1">
                         <Text className="text-white font-bold text-lg">Location Access</Text>
                         <Text className="text-slate-400">To show you nearby drivers</Text>
                     </View>
                 </TouchableOpacity>

                 {/* Mic Button */}
                 <TouchableOpacity 
                    className={`flex-row items-center p-4 rounded-xl border ${audioGranted ? 'bg-green-500/10 border-green-500' : 'bg-slate-800 border-slate-700'}`}
                    onPress={requestAudio}
                    disabled={audioGranted}
                 >
                     <View className={`w-12 h-12 rounded-full items-center justify-center ${audioGranted ? 'bg-green-500' : 'bg-slate-700'}`}>
                         {audioGranted ? <Check color="white" size={24} /> : <Mic color="white" size={24} />}
                     </View>
                     <View className="ml-4 flex-1">
                         <Text className="text-white font-bold text-lg">Microphone Access</Text>
                         <Text className="text-slate-400">For Push-to-Talk communication</Text>
                     </View>
                 </TouchableOpacity>
             </View>
             
             {/* Continue Button (Optional if we auto-redirect) */}
             {/* <TouchableOpacity 
                 className={`w-full py-4 rounded-full items-center ${locationGranted && audioGranted ? 'bg-primary' : 'bg-slate-700'}`}
                 onPress={handleContinue}
             >
                 <Text className="text-white font-bold text-lg">CONTINUE</Text>
             </TouchableOpacity> */}
        </View>
    );
}
