import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  StatusBar,
  Modal, // <--- Added Modal import
} from 'react-native';
import { signUp } from '../../api/login/loginApi';
// <--- Added Icons
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

// ---------------------------------------------------------
// ✅ FormInput Component
// ---------------------------------------------------------
const FormInput = ({ label, isDarkMode, ...props }: any) => {
  const colors = {
    placeholder: isDarkMode ? '#9ca3af' : '#9ca3af',
  };

  return (
    <View className="mb-4">
      <Text className="w-full text-gray-700 dark:text-gray-300 mb-1.5 font-medium text-sm">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.placeholder}
        className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg px-4 py-3 text-black dark:text-white"
        {...props}
      />
    </View>
  );
};

export default function SignupScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic colors configuration
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#f9fafb',
  };

  const [step, setStep] = useState<'select' | 'form'>('select');
  const [userType, setUserType] = useState<
    'customer' | 'delivery' | 'merchant' | null
  >(null);

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Delivery / Merchant specific fields
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [khaltiId, setKhaltiId] = useState('');
  const [esewaId, setEsewaId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSignup = async () => {
    if (!userType) return;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhoneNumber = phoneNumber.trim();
    const cleanAddress = address.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    // Password match check
    if (cleanPassword !== cleanConfirmPassword) {
      showStatus('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }

    let payload: any = {
      username: cleanUsername,
      password: cleanPassword,
      email: cleanEmail,
      phoneNumber: cleanPhoneNumber,
      userType,
      address: cleanAddress,
    };

    if (userType === 'delivery') {
      payload.vehicleType = vehicleType.trim();
      payload.vehicleNumber = vehicleNumber.trim();
    }

    if (userType === 'delivery' || userType === 'merchant') {
      payload.khaltiNumber = khaltiId.trim();
      payload.esewaNumber = esewaId.trim();
    }

    try {
      setLoading(true);
      await signUp(payload);
      setLoading(false);

      showStatus('success', 'Success', 'Account created successfully!', () =>
        navigation.goBack(),
      );
    } catch (error) {
      setLoading(false);
      showStatus('error', 'Error', 'Signup failed. Please try again.');
    }
  };

  // --- User Type Selection Screen ---
  if (step === 'select') {
    const SelectionCard = ({ title, type }: { title: string; type: any }) => (
      <TouchableOpacity
        onPress={() => {
          setUserType(type);
          setStep('form');
        }}
        activeOpacity={0.7}
        className="w-full mb-4 p-5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm flex-row justify-between items-center"
      >
        <View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign up as a {title.toLowerCase()}
          </Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 items-center justify-center">
          <Text className="text-gray-400 dark:text-gray-300 font-bold">
            {'>'}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.screenBg }}
      >
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <View className="w-full mb-8">
          <Text className="text-3xl font-extrabold mb-2 text-center text-gray-900 dark:text-white">
            Welcome
          </Text>
          <Text className="text-base text-center text-gray-500 dark:text-gray-400">
            Choose your account type to get started
          </Text>
        </View>

        <SelectionCard title="Customer" type="customer" />
        <SelectionCard title="Delivery Partner" type="delivery" />
        <SelectionCard title="Merchant" type="merchant" />

        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8">
          <Text className="text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Text className="text-blue-600 dark:text-blue-400 font-semibold">
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Registration Form Screen ---
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.screenBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../../assets/images/dudu.png')}
          className="w-24 h-24 mb-6"
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-8 text-center capitalize text-gray-900 dark:text-white">
          {userType} Registration
        </Text>

        <View className="w-full">
          {/* COMMON FIELDS */}
          <FormInput
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            isDarkMode={isDarkMode}
          />

          <FormInput
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            isDarkMode={isDarkMode}
          />

          <FormInput
            label="Phone Number"
            placeholder="Your mobile number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            isDarkMode={isDarkMode}
          />

          <FormInput
            label="Address"
            placeholder="Current location"
            value={address}
            onChangeText={setAddress}
            isDarkMode={isDarkMode}
          />

          {/* DELIVERY ONLY FIELDS */}
          {userType === 'delivery' && (
            <>
              <FormInput
                label="Vehicle Type"
                placeholder="e.g. Bike, Scooter"
                value={vehicleType}
                onChangeText={setVehicleType}
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="Vehicle Number"
                placeholder="e.g. BA 2 PA 0000"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                isDarkMode={isDarkMode}
              />
            </>
          )}

          {/* DELIVERY OR MERCHANT FIELDS */}
          {(userType === 'delivery' || userType === 'merchant') && (
            <>
              <FormInput
                label="Khalti ID"
                placeholder="Khalti mobile number"
                value={khaltiId}
                onChangeText={setKhaltiId}
                keyboardType="phone-pad"
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="eSewa ID"
                placeholder="eSewa mobile number"
                value={esewaId}
                onChangeText={setEsewaId}
                keyboardType="phone-pad"
                isDarkMode={isDarkMode}
              />
            </>
          )}

          {/* PASSWORD */}
          <FormInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            isDarkMode={isDarkMode}
          />

          <FormInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            isDarkMode={isDarkMode}
          />

          <TouchableOpacity
            className={`w-full py-4 rounded-xl items-center mt-4 shadow-sm ${
              loading ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <Text className="text-white font-semibold text-lg">
                Creating Account...
              </Text>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-6 mb-10 self-center"
            onPress={() => {
              if (step === 'form') setStep('select');
              else navigation.goBack();
            }}
          >
            <Text className="text-gray-500 dark:text-gray-400">
              Back to{' '}
              <Text className="text-blue-600 dark:text-blue-400 font-medium">
                Selection
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
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
