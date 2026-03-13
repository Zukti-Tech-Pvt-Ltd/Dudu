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
import { getUserWallet } from '../../api/wallet/walletApi';
import { Wallet } from 'lucide-react-native'; // Added Lucide icon for wallet

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
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const { isLoggedIn, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const decoded = await decodeToken();

          if (decoded && decoded.userId) {
            // 1. Fetch User Details
            const userData = await getUser(decoded.userId);
            if (userData && userData.data) {
              setUsername(userData.data.username);
              setUserType(userData.data.userType);
              setEmail(userData.data.email);
              setPhone(userData.data.phoneNumber);
            }

            // 2. Fetch Wallet Balance Safely
            const amountwallet = await getUserWallet();

            // Check if the response contains the 'data' object and 'balance'
            if (amountwallet && amountwallet.status === 'success' && amountwallet.data) {
              setWalletBalance(amountwallet.data.balance);
            } else {
              setWalletBalance(0); // Fallback if API fails or returns []
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data or wallet:", error);
        }
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
      {/* --- Profile Card with Wallet Balance --- */}
      <View className="flex-row items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow mb-5 border border-gray-100 dark:border-neutral-700">
        <View className="flex-1">
          <Text className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {username ?? 'User name'}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            {email}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            {phone}
          </Text>
        </View>

        {/* Display Wallet Balance Prominently on the Right */}
        {userType === 'customer' && (
          <View className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 rounded-xl items-center justify-center border border-blue-100 dark:border-blue-800/50">
            <View className="flex-row items-center mb-1">
              <Wallet size={14} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
              <Text className="text-xs font-semibold text-blue-500 dark:text-blue-400 ml-1 uppercase tracking-wider">
                Balance
              </Text>
            </View>
            <Text className="font-bold text-lg text-blue-600 dark:text-blue-300">
              Rs. {walletBalance}
            </Text>
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View className="bg-white dark:bg-neutral-800 rounded-2xl shadow mb-3 border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <AccountAction
          icon={require('../../../assets/navIcons/profile.png')}
          label="Edit Profile"
          description="Edit your personal information"
          navigation={navigation}
          route="EditProfileScreen"
          isDarkMode={isDarkMode}
        />
        <AccountAction
          icon={require('../../../assets/navIcons/message.png')}
          label="Messages"
          description="View your messages"
          navigation={navigation}
          route="MessageProfileScreen"
          isDarkMode={isDarkMode}
        />

        {userType === 'customer' && (
          <>
            <AccountAction
              icon={require('../../../assets/navIcons/orders.png')}
              label="Order History"
              description="View your order history"
              navigation={navigation}
              route="OrdersScreen"
              isDarkMode={isDarkMode}
            />

            <AccountAction
              icon={require('../../../assets/navIcons/topup.png')}
              label="TopUp"
              description="TopUp your wallet"
              navigation={navigation}
              route="WalletScreen"
              isDarkMode={isDarkMode}
            />
            {/* --- ADDED COUPON SECTION --- */}
            <AccountAction
              icon={require('../../../assets/navIcons/ticket.png')}
              label="My Coupons"
              description="View your available discount coupons"
              navigation={navigation}
              route="CouponsScreen" // <-- Make sure to create this screen!
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </View>

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
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100 dark:border-neutral-700/50 last:border-b-0"
      activeOpacity={0.7}
      onPress={() => {
        if (navigation && route) {
          navigation.navigate(route);
        }
      }}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-50 dark:bg-neutral-700 items-center justify-center mr-3">
          <Image
            source={icon}
            className="w-5 h-5"
            style={{ tintColor: isDarkMode ? '#ffffff' : '#000000' }}
          />
        </View>
        <View>
          <Text className="font-bold text-base text-gray-900 dark:text-white">
            {label}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            {description}
          </Text>
        </View>
      </View>
      <Text className="text-xl font-light text-gray-300 dark:text-gray-600">{'>'}</Text>
    </TouchableOpacity>
  );
}