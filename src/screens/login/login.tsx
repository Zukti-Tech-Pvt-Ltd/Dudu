import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { login } from '../../api/login/loginApi';
import { AuthContext } from '../../helper/authContext';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, fcmToken } = useContext(AuthContext);
  console.log(
    'fcmToken!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    fcmToken,
  );
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password, fcmToken!);
      console.log('response-------', response);
      if (response.status === 'success' && response.token) {
        await setToken(response.token); //update context + AsyncStorage

        // await AsyncStorage.setItem('token', response.token);
        // Navigate to MainTabs after successful login
        navigation.reset({
          index: 0,
          routes: [{ name: 'maintab' }],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid response from server.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        Alert.alert('Login Failed', error.response.message);
      } else {
        Alert.alert('Login Failed', 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../../assets/images/dudu.png')}
          className="w-32 h-32 mb-8"
          resizeMode="contain"
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-6"
        />
        <TouchableOpacity
          className={`w-full py-3 rounded-md items-center ${
            loading ? 'bg-gray-400' : 'bg-[#3b82f6]'
          }`}
          disabled={loading}
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-4"
          onPress={() => navigation.navigate('Signup')}
        >
          <Text className="text-[#3b82f6]">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
