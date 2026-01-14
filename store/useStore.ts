import { create } from 'zustand';

export type Driver = {
  id: string;
  plate: string;
  vehicle_type: string | null;
  lat: number;
  long: number;
  heading: number;
  speed: number;
  relative_bearing?: number; // 0-360 degrees relative to us
  distance?: number; // meters
  last_active: string;
};

interface AppState {
  // Session
  session: { id: string; plate: string; vehicle_type?: string } | null;
  setSession: (session: AppState['session']) => void;

  // My Location
  location: {
    lat: number;
    long: number;
    heading: number;
    speed: number;
  } | null;
  setLocation: (loc: AppState['location']) => void;

  // Nearby
  nearbyDrivers: Driver[];
  setNearbyDrivers: (drivers: Driver[]) => void;

  // Call State
  callState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'TALKING' | 'LISTENING';
  setCallState: (state: AppState['callState']) => void;
  activeCallTarget: Driver | null;
  setActiveCallTarget: (driver: Driver | null) => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),

  location: null,
  setLocation: (location) => set({ location }),

  nearbyDrivers: [],
  setNearbyDrivers: (nearbyDrivers) => set({ nearbyDrivers }),

  callState: 'IDLE',
  setCallState: (callState) => set({ callState }),
  activeCallTarget: null,
  setActiveCallTarget: (activeCallTarget) => set({ activeCallTarget }),
}));
