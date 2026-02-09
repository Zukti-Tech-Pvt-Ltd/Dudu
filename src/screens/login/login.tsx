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
  Modal,
} from 'react-native';
import { login } from '../../api/login/loginApi';
import { AuthContext } from '../../helper/authContext';

// 1. Import icons from lucide-react-native
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react-native';

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
  // --- CUSTOM MODAL STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined,
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };
  const handleLogin = async () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      showStatus(
        'error',
        'Missing Credentials',
        'Username and password are required.',
      );
      return;
    }

    setLoading(true);
    try {
      const response = await login(cleanUsername, cleanPassword, fcmToken!);
      if (response.status === 'success' && response.token) {
        await setToken(response.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'maintab' }],
        });
      } else {
        showStatus(
          'error',
          'Login Failed',
          'Invalid credentials or server response.',
        );
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || 'An error occurred during login.';
      showStatus('error', 'Login Failed', msg);
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
      {/* --- CUSTOM STATUS MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModal.visible}
        onRequestClose={() =>
          setStatusModal(prev => ({ ...prev, visible: false }))
        }
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-xl items-center">
            {/* Dynamic Icon */}
            <View
              className={`p-4 rounded-full mb-4 ${
                statusModal.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : statusModal.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              {statusModal.type === 'success' && (
                <CheckCircle size={32} color="#16a34a" />
              )}
              {statusModal.type === 'error' && (
                <AlertCircle size={32} color="#ef4444" />
              )}
              {statusModal.type === 'info' && (
                <Info size={32} color="#3b82f6" />
              )}
            </View>

            {/* Content */}
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {statusModal.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">
              {statusModal.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setStatusModal(prev => ({ ...prev, visible: false }));
                if (statusModal.onClose) {
                  statusModal.onClose();
                }
              }}
              className={`w-full py-3.5 rounded-2xl ${
                statusModal.type === 'success'
                  ? 'bg-green-500'
                  : statusModal.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                Okay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
