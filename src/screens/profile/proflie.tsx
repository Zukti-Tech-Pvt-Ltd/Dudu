import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  username?: string;
  // other fields if you want to type
}

export default function ProfileScreen({ navigation }: any) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          setUsername(decoded.username || null);
        } catch (e) {
          // invalid token or decode error
          setUsername(null);
        }
      }
    };
    fetchToken();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      {username ? (
        <Text className="text-lg font-semibold">Welcome, {username}!</Text>
      ) : (
        <>
          <Text className="text-lg mb-4">You are not signed in</Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-md"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
