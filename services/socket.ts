import { io } from 'socket.io-client';

// Replace with your machine's local IP for physical device testing
// e.g., http://192.168.1.5:3000
const SERVER_URL = 'http://192.168.56.1'; 

export const socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ['websocket'],
});
