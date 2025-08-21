import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import LogoutButton from './logoutButton'; // Adjust the import path

interface JwtPayload {
  username?: string;
  email?: string;
  phone?: string;
}

type AccountActionProps ={
  icon:any;
  label:string;
  description:string;
}

export default function ProfileScreen({ navigation }: any) {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('sadhubasnet@gmail.com');
  const [phone, setPhone] = useState<string>('+1 (555) 123-4567');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          setUsername(decoded.username || null);
          setEmail(decoded.email || 'sadhubasnet@gmail.com');
          setPhone(decoded.phone || '+1 (555) 123-4567');
          setIsLoggedIn(true);

        } catch (e) {
          setIsLoggedIn(false);
        }
      }else{
                setIsLoggedIn(false);

      }
    };
    fetchToken();
  }, []);
 if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Image
          source={require('../../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200"
        />
        <Text className="font-bold text-lg text-gray-900 mb-2">
          Welcome, Guest
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')} // Navigate to your login screen
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium text-base">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <ScrollView className="flex-1 bg-white px-4">

      {/* Profile Card */}
      <View className="flex-row items-center bg-white rounded-2xl p-4 shadow mb-3">
        <Image
            source={require('../../../assets/images/girl.png')}

          className="w-14 h-14 rounded-full mr-3 bg-gray-200"
        />
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-900">{username ?? 'User name'}</Text>
          <Text className="text-gray-600 text-sm">{email}</Text>
          <Text className="text-gray-600 text-sm">{phone}</Text>
        </View>
        <TouchableOpacity className="bg-blue-50 px-3 py-1 rounded-lg">
          <Text className="text-blue-600 font-medium text-base">Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
          <Text className="font-bold text-base text-gray-900 mb-1">24</Text>
          <Text className="text-gray-500 text-xs">Total Orders</Text>
        </View>
        <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
          <Text className="font-bold text-base text-gray-900 mb-1">$1,240</Text>
          <Text className="text-gray-500 text-xs">Total Spent</Text>
        </View>
        <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
          <Text className="font-bold text-base text-gray-900 mb-1">4.8</Text>
          <Text className="text-gray-500 text-xs">Rating</Text>
        </View>
      </View>

      {/* Account Actions */}
      <View className="bg-white rounded-2xl shadow mb-3">
        <AccountAction
          icon={require('../../../assets/navIcons/pin.png')}
          label="Delivery Address"
          description="Manage your addresses"
        />
        <AccountAction
          icon={require('../../../assets/navIcons/card.png')}
          label="Payment Methods"
          description="Cards and wallets"
        />
        <AccountAction
          icon={require('../../../assets/navIcons/notification.png')}
          label="Notifications"
          description="Order updates and offers"
        />
        <AccountAction
          icon={require('../../../assets/navIcons/insurance.png')}
          label="Privacy & Security"
          description="Account protection"
        />
        <AccountAction
          icon={require('../../../assets/navIcons/question.png')}
          label="Help & Support"
          description="FAQs and contact us"
        />
      </View>

      {/* Sign Out Button */}
      <View className="mt-8 mb-10 items-center">
        <LogoutButton />
      </View>
    </ScrollView>
  );
}

// Account action component with icon
function AccountAction({ icon, label, description }:AccountActionProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-3 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Image source={icon} className="w-6 h-6 mr-3" />
        <View>
          <Text className="font-bold text-base text-gray-900">{label}</Text>
          <Text className="text-gray-500 text-xs">{description}</Text>
        </View>
      </View>
      <Text className="text-lg text-gray-300">{'>'}</Text>
    </TouchableOpacity>
  );
}
