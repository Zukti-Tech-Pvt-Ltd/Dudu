import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { AuthContext } from '../../helper/authContext';
import { decodeToken } from '../../api/indexAuth';
import { getUser, editUser } from '../../api/userApi';

export default function EditProfileScreen({ navigation }: any) {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    vehicleType: '',
    vehicleNumber: '',
    esewaNumber: '',
    khaltiNumber: '',
  });

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const decoded = await decodeToken();
        setUserId(decoded!.userId);

        const res = await getUser(decoded!.userId);
        const user = res.data;

        setForm({
          username: user.username ?? '',
          email: user.email ?? '',
          phoneNumber: user.phoneNumber ?? '',
          address: user.address ?? '',
          vehicleType: user.vehicleType ?? '',
          vehicleNumber: user.vehicleNumber ?? '',
          esewaNumber: user.esewaNumber ?? '',
          khaltiNumber: user.khaltiNumber ?? '',
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      await editUser(userId, form);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Text className="text-gray-900 dark:text-white">
          Please login to edit profile
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#ffffff' : '#0000ff'}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-900 px-8 py-6"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Edit your profile
      </Text>

      <Input
        label="Username"
        value={form.username}
        onChange={v => handleChange('username', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Email"
        value={form.email}
        onChange={v => handleChange('email', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Phone Number"
        value={form.phoneNumber}
        onChange={v => handleChange('phoneNumber', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Address"
        value={form.address}
        onChange={v => handleChange('address', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Vehicle Type"
        value={form.vehicleType}
        onChange={v => handleChange('vehicleType', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Vehicle Number"
        value={form.vehicleNumber}
        onChange={v => handleChange('vehicleNumber', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="eSewa Number"
        value={form.esewaNumber}
        onChange={v => handleChange('esewaNumber', v)}
        isDarkMode={isDarkMode}
      />
      <Input
        label="Khalti Number"
        value={form.khaltiNumber}
        onChange={v => handleChange('khaltiNumber', v)}
        isDarkMode={isDarkMode}
      />

      <TouchableOpacity
        className="bg-blue-600 dark:bg-blue-500 py-3 rounded-lg mt-6 mb-10"
        onPress={handleSave}
      >
        <Text className="text-white text-center font-bold text-base">
          Save Changes
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({
  label,
  value,
  onChange,
  isDarkMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isDarkMode: boolean;
}) {
  return (
    <View className="mb-3">
      <Text className="text-gray-700 dark:text-gray-300 mb-1 font-medium">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={isDarkMode ? '#9ca3af' : '#9ca3af'}
        className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
      />
    </View>
  );
}
