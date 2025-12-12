import React, { useState } from 'react';
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
import { signUp } from '../../api/login/loginApi';

export default function SignupScreen({ navigation }: any) {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [userType, setUserType] = useState<
    'customer' | 'delivery' | 'merchant' | null
  >(null);

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Only for delivery user
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [khaltiId, setKhaltiId] = useState('');
  const [esewaId, setEsewaId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!userType) return;

    let payload: any = {
      username,
      password,
      email,
      phoneNumber,
      userType,
      address,
    };

    if (userType === 'delivery') {
      payload.vehicleType = vehicleType;
      payload.vehicleNumber = vehicleNumber;
    }
    if (userType === 'delivery' || userType === 'merchant') {
      payload.khaltiNumber = khaltiId;
      payload.esewaNumber = esewaId;
    }

    console.log('FINAL PAYLOAD ---> ', payload);

    try {
      setLoading(true);
      const response = await signUp(payload);
      console.log('response', response);

      Alert.alert('Signup successful!');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-2xl font-bold mb-6">Select User Type</Text>

        <TouchableOpacity
          onPress={() => {
            setUserType('customer');
            setStep('form');
          }}
          className="w-full bg-blue-500 py-3 rounded-lg mb-4 items-center"
        >
          <Text className="text-white font-semibold">Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setUserType('delivery');
            setStep('form');
          }}
          className="w-full bg-green-500 py-3 rounded-lg mb-4 items-center"
        >
          <Text className="text-white font-semibold">Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setUserType('merchant');
            setStep('form');
          }}
          className="w-full bg-purple-500 py-3 rounded-lg mb-4 items-center"
        >
          <Text className="text-white font-semibold">Merchant</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />

        <Text className="text-xl font-bold mb-4 capitalize">
          Signup as {userType}
        </Text>

        {/* COMMON FIELDS */}
        {/* COMMON FIELDS */}
        <Text className="w-full text-gray-600 mb-1">Username</Text>
        <TextInput
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />

        <Text className="w-full text-gray-600 mb-1">Email</Text>
        <TextInput
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />

        <Text className="w-full text-gray-600 mb-1">Phone Number</Text>
        <TextInput
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />

        <Text className="w-full text-gray-600 mb-1">Address</Text>
        <TextInput
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />

        {/* DELIVERY ONLY FIELDS */}
        {userType === 'delivery' && (
          <>
            <Text className="w-full text-gray-600 mb-1">Vehicle Type</Text>
            <TextInput
              placeholder="Eg: Scooter, Bike"
              value={vehicleType}
              onChangeText={setVehicleType}
              className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
            />

            <Text className="w-full text-gray-600 mb-1">Vehicle Number</Text>
            <TextInput
              placeholder="Eg: BA 23 PA 1234"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
            />
          </>
        )}
        {(userType === 'delivery' || userType === 'merchant') && (
          <>
            <Text className="w-full text-gray-600 mb-1">khaltiId</Text>
            <TextInput
              placeholder="Enter Khalti Number"
              value={khaltiId}
              onChangeText={setKhaltiId}
              className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
            />

            <Text className="w-full text-gray-600 mb-1">EsewaId</Text>
            <TextInput
              placeholder="Enter Esewa Number"
              value={esewaId}
              onChangeText={setEsewaId}
              className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
            />
          </>
        )}

        {/* PASSWORD */}
        <Text className="w-full text-gray-600 mb-1">Password</Text>
        <TextInput
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
        />

        <Text className="w-full text-gray-600 mb-1">Confirm Password</Text>
        <TextInput
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-6"
        />

        <TouchableOpacity
          className={`w-full py-3 rounded-md items-center ${
            loading ? 'bg-blue-300' : 'bg-blue-600'
          }`}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <Text className="text-white font-semibold text-lg">Loading...</Text>
          ) : (
            <Text className="text-white font-semibold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={() => navigation.goBack()}>
          <Text className="text-blue-600">Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
