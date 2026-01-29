import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import DeliveryStatusBar from '../order/deliveryStatusBar';
import OrderItemRow from '../order/orderItemRow';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Order } from './order';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const statusIconMap: Record<string, any> = {
  OrderPlaced: require('../../../assets/images/clock.png'),
  Confirmed: require('../../../assets/images/check-mark.png'),
  Shipped: require('../../../assets/images/shipped.png'),
  Delivered: require('../../../assets/images/box.png'),
};

export default function OrderMerchantCard({ order }: any) {
  type RootStackParamList = {
    OrderMerchantCard: undefined;
    OrderDetail: { order: Order };
  };
  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'OrderMerchantCard'
  >;
  const navigation = useNavigation<HomeNavigationProp>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // console.log('order', order);

  const iconSource = statusIconMap[order.status] || null;

  return (
    <View
      className="-inset-5 mt-0.5 p-4 bg-white dark:bg-neutral-800 mb-3 rounded-xl shadow-xl"
      style={{
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        elevation: 3,
      }}
    >
      {/* Date */}
      <Text className="font-semibold text-gray-700 dark:text-gray-200">
        {new Date(order.createdAt).toDateString()}
      </Text>

      {/* Rider Info */}
      <Text className="text-sm -mt-0 text-gray-500 dark:text-gray-400">
        <Text className="font-semibold text-gray-700 dark:text-gray-300">
          Rider Name:{' '}
        </Text>
        {order.__rider__?.username ?? 'Not Assigned'}
      </Text>

      {/* Address */}
      <Text className="text-sm -mt-0 text-gray-500 dark:text-gray-400">
        <Text className="font-semibold text-gray-700 dark:text-gray-300">
          Delivery Address:{' '}
        </Text>
        {order.deliveryAddress}
      </Text>

      {/* Status Badge */}
      <View className="flex-row justify-end items-center -mt-2 bg-green-100 dark:bg-green-900/40 rounded-lg p-2 py-1 self-end">
        {iconSource && (
          <Image
            source={iconSource}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
            // Light Green tint for Dark Mode, Dark Green for Light Mode
            style={{ tintColor: isDarkMode ? '#4ade80' : '#16a34a' }}
          />
        )}

        <Text className="text-sm font-bold text-green-700 dark:text-green-400">
          {order.status}
        </Text>
      </View>

      <DeliveryStatusBar status={order.status} />

      {order.__orderItems__.map((item: any) => (
        <OrderItemRow key={item.id} item={item} />
      ))}

      <Text className="text-lg font-bold mt-1 text-black dark:text-white">
        Total: Rs:{order.price}
      </Text>

      <TouchableOpacity
        className="bg-blue-600 dark:bg-blue-500 rounded-lg p-3 mt-2 items-center"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrderDetail', { order })}
      >
        <Text className="text-white font-bold">View Order</Text>
      </TouchableOpacity>
    </View>
  );
}
