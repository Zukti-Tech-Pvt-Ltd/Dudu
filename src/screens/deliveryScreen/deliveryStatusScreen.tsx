// screens/DeliveryStatusScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryTaskItem } from './deliveryhome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  DeliveryStatusScreen: { deliveryItem: DeliveryTaskItem };
};

type deliveryStatusNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryStatusScreen'
>;

type deliveryStatusRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryStatusScreen'
>;

const STATUS_OPTIONS = ['pending', 'accepted', 'delivered'];

const DeliveryStatusScreen: React.FC = () => {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const insets = useSafeAreaInsets(); // detects notch + gesture area space

  const navigation = useNavigation<deliveryStatusNavigationProp>();
  const route = useRoute<deliveryStatusRouteProp>();
  const { deliveryItem } = route.params;

  const [selectedStatus, setSelectedStatus] = useState<string>(
    deliveryItem.status,
  );

  const handleSave = () => {
    // Here you would call your API to update the status
    // e.g., await updateDeliveryStatus(deliveryItem.id, selectedStatus)
    Alert.alert(
      'Status Updated',
      `Delivery #${deliveryItem.id} is now ${selectedStatus}`,
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView className={`flex-1 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
      <View
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: insets.top + 10 }} // add safe area inset + extra spacing
      >
        <Text
          className={`text-2xl font-bold ${
            dark ? 'text-white' : 'text-gray-800'
          }`}
        >
          Delivery Status
        </Text>
      </View>
      <View className="p-4">
        <Text
          className={`${
            dark ? 'text-white' : 'text-black'
          } text-xl font-bold mb-4`}
        >
          Update Delivery Status
        </Text>

        <View className="p-4 rounded-xl shadow-md bg-gray-100 dark:bg-gray-800">
          <Text
            className={`${
              dark ? 'text-gray-300' : 'text-gray-600'
            } text-sm mb-2`}
          >
            Delivery #{deliveryItem.id}
          </Text>
          <Text
            className={`${dark ? 'text-white' : 'text-black'} font-semibold`}
          >
            Pickup: {deliveryItem.pickupAddress}
          </Text>
          <Text
            className={`${
              dark ? 'text-white' : 'text-black'
            } font-semibold mt-1`}
          >
            Delivery: {deliveryItem.deliveryAddress}
          </Text>
        </View>

        <View className="mt-6">
          <Text
            className={`${
              dark ? 'text-gray-300' : 'text-gray-600'
            } text-sm mb-2`}
          >
            Select Status
          </Text>

          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              className={`p-4 rounded-lg mb-2 border ${
                selectedStatus === status
                  ? dark
                    ? 'border-green-400 bg-green-700'
                    : 'border-green-600 bg-green-100'
                  : dark
                  ? 'border-gray-600 bg-gray-800'
                  : 'border-gray-300 bg-gray-100'
              }`}
            >
              <Text
                className={`font-semibold text-center ${
                  selectedStatus === status
                    ? dark
                      ? 'text-white'
                      : 'text-black'
                    : dark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleSave}
            className={`mt-6 p-4 rounded-lg ${
              dark ? 'bg-blue-600' : 'bg-blue-500'
            }`}
          >
            <Text className="text-white text-center font-bold text-lg">
              Save Status
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryStatusScreen;
