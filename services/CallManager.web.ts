import { useStore } from '@/store/useStore';
import { supabase } from '@/supabase/client';

const CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class SignalService {
  private channel: any;

  constructor(myPlate: string, onSignal: (payload: any) => void) {
    this.channel = supabase.channel(`call:${myPlate}`);
    this.channel
      .on('broadcast', { event: 'signal' }, (payload: any) => {
          console.log('Got signal', payload);
          onSignal(payload.payload);
      })
      .subscribe();
  }
  
  sendSignal(targetPlate: string, payload: any) {
    console.log('Sending signal to', targetPlate, payload.type);
    supabase.channel(`call:${targetPlate}`).send({
        type: 'broadcast',
        event: 'signal',
        payload: payload
    });
  }
  
  cleanup() {
    if (this.channel) supabase.removeChannel(this.channel);
  }
}

export class CallManager {
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private signal: SignalService | null = null;
  private targetPlate: string | null = null;
  
  async initialize(myPlate: string) {
    this.signal = new SignalService(myPlate, this.handleSignal.bind(this));
  }

  private async handleSignal(data: any) {
     if (!this.peer && data.type === 'OFFER') {
        useStore.getState().setCallState('CONNECTING');
        useStore.getState().setActiveCallTarget({ plate: data.from, id: 'unknown' } as any);
        
        await this.startCall(data.from, false); 
        await this.peer?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await this.peer?.createAnswer();
        await this.peer?.setLocalDescription(answer as RTCSessionDescription);
        
        this.signal?.sendSignal(data.from, { 
            type: 'ANSWER', 
            sdp: answer, 
            from: useStore.getState().session?.plate 
        });
        
     } else if (this.peer) {
         if (data.type === 'ANSWER') {
             await this.peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
         } else if (data.type === 'CANDIDATE') {
             await this.peer.addIceCandidate(new RTCIceCandidate(data.candidate));
         } else if (data.type === 'BYE') {
             this.endCall();
         }
     }
  }

  async startCall(targetPlate: string, isInitiator: boolean = true) {
    this.targetPlate = targetPlate;
    this.peer = new RTCPeerConnection(CONFIG);
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        this.localStream = stream;
        
        stream.getAudioTracks().forEach(track => {
             track.enabled = false; 
             this.peer?.addTrack(track, stream);
        });

    } catch(e) {
        console.error('Mic Error', e);
        return;
    }

    this.peer.onicecandidate = (event) => {
        if (event.candidate) {
            this.signal?.sendSignal(targetPlate, {
                type: 'CANDIDATE',
                candidate: event.candidate,
                from: useStore.getState().session?.plate
            });
        }
    };
    
    this.peer.onconnectionstatechange = () => {
        console.log('Connection State:', this.peer?.connectionState);
        if (this.peer?.connectionState === 'connected') {
            useStore.getState().setCallState('CONNECTED');
        } else if (this.peer?.connectionState === 'disconnected' || this.peer?.connectionState === 'failed') {
             this.endCall();
        }
    };

    if (isInitiator) {
        const offer = await this.peer.createOffer({});
        await this.peer.setLocalDescription(offer);
        this.signal?.sendSignal(targetPlate, {
            type: 'OFFER',
            sdp: offer,
            from: useStore.getState().session?.plate
        });
    }
  }

  setTalking(isTalking: boolean) {
      if (this.localStream) {
          this.localStream.getAudioTracks().forEach((t) => t.enabled = isTalking);
      }
  }

  endCall() {
      if (this.targetPlate) {
          this.signal?.sendSignal(this.targetPlate, { type: 'BYE', from: useStore.getState().session?.plate });
      }
      if (this.peer) {
          this.peer.close();
          this.peer = null;
      }
      if (this.localStream) {
          this.localStream.getTracks().forEach((t) => t.stop());
          this.localStream = null;
      }
      useStore.getState().setCallState('IDLE');
      useStore.getState().setActiveCallTarget(null);
      this.targetPlate = null;
  }
}

export const callManager = new CallManager();
