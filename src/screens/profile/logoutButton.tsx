import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../helper/authContext';
import { decodeToken, resetTokenCache } from '../../api/indexAuth';
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
    resetTokenCache();
    try {
      const user = await decodeToken();
      console.log(
        'user!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        user,
      );
      await removeDeviceToken(user!.userId, fcmToken!);
      // Replace with your token removal logic
      await setToken(null); //clears AsyncStorage + updates context
      // await AsyncStorage.removeItem('token');
      // Replace with your navigation reset logic

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
        className="w-full py-3 bg-red-50 border border-red-200 rounded-xl flex-row justify-center items-center"
        activeOpacity={0.8}
      >
        <Text className="text-red-600 font-semibold text-base mr-2">
          {'\u2192'}
        </Text>
        <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: '#00000066',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-white w-72 rounded-xl p-6"
            onPress={e => e.stopPropagation()}
          >
            <Text className="text-lg font-bold mb-4">Confirm Logout</Text>
            <Text className="text-base mb-6">
              Are you sure you want to log out?
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="bg-[#3b82f6] rounded-lg px-5 py-2"
              >
                <Text className="text-white font-semibold text-base text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                className="bg-red-600 rounded-lg px-5 py-2"
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
