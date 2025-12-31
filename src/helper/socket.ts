import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@env';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL); // replace with your backend URL
  }
  return socket;
};

export const getSocket = () => socket;
