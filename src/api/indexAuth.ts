import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Instance with token interceptor (for authorized requests)
export const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  timeout: 200000,
});

console.log('apiAuth', apiAuth);

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