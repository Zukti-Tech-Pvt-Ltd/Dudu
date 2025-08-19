import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      className="flex-1 bg-white items-center justify-center px-6"
    >
      <Image
        source={require('../../../assets/images/dudu.png')}
        className="w-32 h-32 mb-8"
        resizeMode="contain"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-6"
      />
      <TouchableOpacity
        className="w-full bg-[#3b82f6] py-3 rounded-md items-center"
        onPress={() => {
          // handle signup logic here
        }}
      >
        <Text className="text-white font-semibold text-lg">Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-4"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-[#3b82f6]">Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
