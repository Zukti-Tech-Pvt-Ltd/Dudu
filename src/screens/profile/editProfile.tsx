import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthContext } from '../../helper/authContext';
import { decodeToken } from '../../api/indexAuth';
import { getUser, editUser } from '../../api/userApi';

export default function EditProfileScreen({ navigation }: any) {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

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
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Please login to edit profile</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-8 py-6">
      <Text className="text-xl font-bold mb-4">Edit your profile</Text>

      <Input
        label="Username"
        value={form.username}
        onChange={v => handleChange('username', v)}
      />
      <Input
        label="Email"
        value={form.email}
        onChange={v => handleChange('email', v)}
      />
      <Input
        label="Phone Number"
        value={form.phoneNumber}
        onChange={v => handleChange('phoneNumber', v)}
      />
      <Input
        label="Address"
        value={form.address}
        onChange={v => handleChange('address', v)}
      />
      <Input
        label="Vehicle Type"
        value={form.vehicleType}
        onChange={v => handleChange('vehicleType', v)}
      />
      <Input
        label="Vehicle Number"
        value={form.vehicleNumber}
        onChange={v => handleChange('vehicleNumber', v)}
      />
      <Input
        label="eSewa Number"
        value={form.esewaNumber}
        onChange={v => handleChange('esewaNumber', v)}
      />
      <Input
        label="Khalti Number"
        value={form.khaltiNumber}
        onChange={v => handleChange('khaltiNumber', v)}
      />

      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-lg mt-6"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="text-gray-700 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />
    </View>
  );
}
