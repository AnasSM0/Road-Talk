import { socket } from '@/services/socket';
import { Driver, useStore } from '@/store/useStore';
import * as Location from 'expo-location';
import { getDistance, getRhumbLineBearing } from 'geolib';
import { useEffect } from 'react';

export const useLocationRadar = () => {
    const { 
        session, setLocation, location, 
        setNearbyDrivers, nearbyDrivers 
    } = useStore();

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        
        const startTracking = async () => {
             // 1. Permissions
             const { status } = await Location.requestForegroundPermissionsAsync();
             if (status !== 'granted') {
                 console.log('Permission to access location was denied');
                 return;
             }

             // 2. Connect Socket if not connected
             if (!socket.connected && session?.plate) {
                 socket.connect();
                 socket.emit('join', { plate: session.plate });
             }

            // 3. Watch Position
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (loc) => {
                    const { latitude, longitude, heading, speed } = loc.coords;
                    
                    // Update Local Store
                    const myLoc = { 
                        lat: latitude, 
                        long: longitude, 
                        heading: heading || 0, 
                        speed: speed || 0 
                    };
                    setLocation(myLoc);

                    // Emit to Server
                    if (session?.plate) {
                        socket.emit('update_location', {
                            plate: session.plate,
                            vehicle_type: session.vehicle_type || 'Car',
                            ...myLoc
                        });
                    }
                }
            );
        };

        startTracking();

        // 4. Listen for other drivers
        const handleLocationUpdate = (data: any) => {
             // data: { plate, lat, long, heading, speed, vehicle_type }
             if (!location) return; // Can't calculate relative if we don't know where we are

             // Calculate Distance
             const dist = getDistance(
                 { latitude: location.lat, longitude: location.long },
                 { latitude: data.lat, longitude: data.long }
             );

             // Filter < 500m
             if (dist < 500) {
                 // Calculate Relative Bearing
                 const bearingToTarget = getRhumbLineBearing(
                     { latitude: location.lat, longitude: location.long },
                     { latitude: data.lat, longitude: data.long }
                 );
                 
                 // My heading 0 is UP. 
                 // Relative bearing = TargetBearing - MyHeading
                 let relative = bearingToTarget - location.heading;
                 if (relative < 0) relative += 360;

                 const newDriver: Driver = {
                     id: data.plate, // Use plate as ID for now
                     plate: data.plate,
                     vehicle_type: data.vehicle_type,
                     lat: data.lat,
                     long: data.long,
                     heading: data.heading,
                     speed: data.speed,
                     distance: dist,
                     relative_bearing: relative,
                     last_active: new Date().toISOString(),
                 };

                 useStore.setState((state) => {
                     // Update existing or add new
                     const existing = state.nearbyDrivers.filter(d => d.plate !== data.plate);
                     return { nearbyDrivers: [...existing, newDriver] };
                 });
             }
        };

        socket.on('location_update', handleLocationUpdate);

        return () => {
            subscription?.remove();
            socket.off('location_update', handleLocationUpdate);
            // socket.disconnect(); // Maybe keep connected?
        };
    }, [session?.plate, location?.lat]); // Re-run if my location changes significantly (dependency-wise, careful with loops) 
    // Optimization: location?.lat might cause re-subscription too often. 
    // Better: Ref existing location inside the socket callback or use functional state update.
    // For MVP, letting it re-bind listener is okay but `watchPosition` should stick.
    // Actually, `startTracking` should only run once.
};
