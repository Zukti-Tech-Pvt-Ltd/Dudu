// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  setFcmToken: (token: string | null) => void;
  fcmToken: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  setToken: async () => {},
  setFcmToken: () => {},

  fcmToken: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  console.log('000000000000------00000000000000000000000000');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem('token', newToken);
      setIsLoggedIn(true);
    } else {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    }
    setTokenState(newToken);
  };
  console.log('setToken', setToken);
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode<JwtPayload & { exp?: number }>(storedToken);

          // check expiration
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            // expired
            await AsyncStorage.removeItem('token');
            setTokenState(null);
            console.log('00000000000000000000000000000000000000');

            setIsLoggedIn(false);
            return;
          }
          console.log('111111111111111111111111111111111111111');

          setTokenState(storedToken);
          setIsLoggedIn(true);
        } catch {
          console.log('2222222222222222222222222222222222222222');

          setIsLoggedIn(false);
          setTokenState(null);
        }
      } else {
        console.log('333333333333333333333333333333333333333333');

        setIsLoggedIn(false);
        setTokenState(null);
      }
    };
    fetchToken();
  }, []);
  console.log('ttttttttttttokennnnnnnnnnn', token);
  console.log('iiiiiiiiiisLoggedInnnnnnnnnnnnn', isLoggedIn);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, setToken, fcmToken, setFcmToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
