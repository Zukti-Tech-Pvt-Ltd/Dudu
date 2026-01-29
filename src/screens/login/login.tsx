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
  useColorScheme,
  StatusBar,
} from 'react-native';
import { login } from '../../api/login/loginApi';
import { AuthContext } from '../../helper/authContext';

// 1. Import icons from lucide-react-native
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#ffffff', // Neutral 900 vs White
    inputBg: isDarkMode ? '#262626' : '#ffffff', // Neutral 800 vs White
    textPrimary: isDarkMode ? '#ffffff' : '#000000',
    border: isDarkMode ? '#404040' : '#e5e7eb', // Neutral 700 vs Gray 200
    placeholder: isDarkMode ? '#9ca3af' : '#6b7280',
    icon: isDarkMode ? '#9ca3af' : '#6b7280',
    buttonDisabled: isDarkMode ? '#525252' : '#9ca3af',
  };

  const [loading, setLoading] = useState(false);
  const { setToken, fcmToken } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password, fcmToken!);
      if (response.status === 'success' && response.token) {
        await setToken(response.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'maintab' }],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid response from server.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'An error occurred.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.screenBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

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

        {/* Username Input */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="w-full border rounded-lg px-4 py-3 mb-4"
        />

        {/* Password Input Container */}
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }}
          className="w-full flex-row items-center border rounded-lg px-4 mb-6"
        >
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor={colors.placeholder}
            style={{ color: colors.textPrimary }}
            className="flex-1 py-3"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-2"
          >
            {isPasswordVisible ? (
              <EyeOff size={24} color={colors.icon} />
            ) : (
              <Eye size={24} color={colors.icon} />
            )}
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={{
            backgroundColor: loading ? colors.buttonDisabled : '#3b82f6',
          }}
          className="w-full py-3 rounded-lg items-center"
          disabled={loading}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          className="mt-6"
          onPress={() => navigation.navigate('Signup')}
        >
          <Text className="text-blue-500 font-medium">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
