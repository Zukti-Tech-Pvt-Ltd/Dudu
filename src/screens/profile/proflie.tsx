import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import LogoutButton from './logoutButton'; // Adjust the import path
import { AuthContext } from '../../helper/authContext';
import { decodeToken } from '../../api/indexAuth';
import { getUser } from '../../api/userApi';

interface JwtPayload {
  username?: string;
  email?: string;
  phone?: string;
}

type AccountActionProps = {
  icon: any;
  label: string;
  description: string;
  navigation: any;
  route?: string;
  isDarkMode: boolean; // Pass theme prop
};

export default function ProfileScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('sadhubasnet@gmail.com');
  const [phone, setPhone] = useState<string>('+1 (555) 123-4567');
  const [userType, setUserType] = useState<string | null>(null);

  const { isLoggedIn, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const decoded = await decodeToken();
        const userData = await getUser(decoded!.userId);
        setUsername(userData.data.username);
        setUserType(userData.data.userType);
        setEmail(userData.data.email);
        setPhone(userData.data.phoneNumber);
      }
    };

    fetchUser();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchUser();
    });

    return unsubscribe;
  }, [navigation, token]);

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Image
          source={require('../../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200 dark:bg-neutral-800"
        />
        <Text className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          Welcome, Guest
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium text-base">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-900 px-4"
      contentContainerStyle={{ paddingTop: 20 }}
    >
      {/* Profile Card */}
      <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow mb-3">
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-900 dark:text-white">
            {username ?? 'User name'}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {email}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            {phone}
          </Text>
        </View>
      </View>

      {/* Account Actions */}
      <View className="bg-white dark:bg-neutral-800 rounded-2xl shadow mb-3">
        <AccountAction
          icon={require('../../../assets/navIcons/profile.png')}
          label="Edit Profile"
          description="Edit your personal information"
          navigation={navigation}
          route="EditProfileScreen"
          isDarkMode={isDarkMode}
        />
      </View>

      {userType === 'customer' && (
        <View className="bg-white dark:bg-neutral-800 rounded-2xl shadow mb-3">
          <AccountAction
            icon={require('../../../assets/navIcons/profile.png')}
            label="Order History"
            description="View your order history"
            navigation={navigation}
            route="OrdersScreen"
            isDarkMode={isDarkMode}
          />
        </View>
      )}

      {/* Sign Out Button */}
      <View className="flex-1 justify-end items-center pb-10 mt-6">
        <LogoutButton />
      </View>
    </ScrollView>
  );
}

// Account action component with icon
function AccountAction({
  icon,
  label,
  description,
  navigation,
  route,
  isDarkMode,
}: AccountActionProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-3 border-b border-gray-100 dark:border-neutral-700"
      activeOpacity={0.7}
      onPress={() => {
        if (navigation && route) {
          navigation.navigate(route);
        }
      }}
    >
      <View className="flex-row items-center">
        <Image
          source={icon}
          className="w-6 h-6 mr-3"
          style={{ tintColor: isDarkMode ? '#ffffff' : '#000000' }}
        />
        <View>
          <Text className="font-bold text-base text-gray-900 dark:text-white">
            {label}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            {description}
          </Text>
        </View>
      </View>
      <Text className="text-lg text-gray-300 dark:text-gray-600">{'>'}</Text>
    </TouchableOpacity>
  );
}
