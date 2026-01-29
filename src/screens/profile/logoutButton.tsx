import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../helper/authContext';
import { decodeToken } from '../../api/indexAuth';
import { removeDeviceToken } from '../../api/login/loginApi';

export type RootStackParamList = {
  maintab: undefined;
  HomeScreen: undefined;
  // ... other routes
};

const LogoutButton = () => {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const [visible, setVisible] = useState(false);
  const { setToken, fcmToken } = useContext(AuthContext); // get from context

  const handleLogoutConfirm = async () => {
    setVisible(false);
    try {
      const user = await decodeToken();
      if (user && fcmToken) {
        await removeDeviceToken(user.userId, fcmToken);
      }

      await setToken(null); //clears AsyncStorage + updates context

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'maintab',
            state: { routes: [{ name: 'profile' }] },
          },
        ],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        // Light: Red-50 bg, Red-200 border
        // Dark: Red-900/20 bg, Red-800 border
        className="w-full py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex-row justify-center items-center"
        activeOpacity={0.8}
      >
        <Text className="text-red-600 dark:text-red-400 font-semibold text-base mr-2">
          {'\u2192'}
        </Text>
        <Text className="text-red-600 dark:text-red-400 font-semibold text-base">
          Sign Out
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: '#00000066', // Semi-transparent black overlay works for both modes
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            // bg-white -> dark:bg-neutral-800
            className="bg-white dark:bg-neutral-800 w-72 rounded-xl p-6 shadow-xl"
            onPress={e => e.stopPropagation()}
          >
            <Text className="text-lg font-bold mb-4 text-black dark:text-white">
              Confirm Logout
            </Text>
            <Text className="text-base mb-6 text-gray-800 dark:text-gray-300">
              Are you sure you want to log out?
            </Text>

            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="bg-[#3b82f6] dark:bg-blue-600 rounded-lg px-5 py-2"
              >
                <Text className="text-white font-semibold text-base text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogoutConfirm}
                className="bg-red-600 dark:bg-red-700 rounded-lg px-5 py-2"
              >
                <Text className="text-white font-semibold text-base text-center">
                  Yes, Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default LogoutButton;
