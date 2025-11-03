import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';


// Instance with token interceptor (for authorized requests)
const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});




apiAuth.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      // Use the set method
      config.headers.set('Authorization', `Bearer ${token}`);
    }



    return config;
  },
  (error) => Promise.reject(error)
);

export default apiAuth;





// utils/jwt.ts or wherever is appropriate

 // Module-level variable (cache)
let cachedToken: string | null = null;

// Async function that returns decoded JWT claims
export async function decodeToken(): Promise<null | Record<string, any>> {
  try {
    if (!cachedToken) {
      cachedToken = await AsyncStorage.getItem('token');
    }
    if (!cachedToken) return null;
    const base64Url = cachedToken.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
  Buffer.from(base64, 'base64')
    .toString('utf-8')
    .split('')
    .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
    .join('')
);

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT decode failed:', err);
    return null;
  }
}

// Optional function to reset cache (when user logs out or token changes)
export function resetTokenCache() {
  cachedToken = null;
}