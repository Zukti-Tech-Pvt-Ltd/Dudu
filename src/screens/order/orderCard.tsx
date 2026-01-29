import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import OrderItemRow from './orderItemRow';
import DeliveryStatusBar from './deliveryStatusBar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const statusIconMap: Record<string, any> = {
  OrderPlaced: require('../../../assets/images/clock.png'),
  Confirmed: require('../../../assets/images/check-mark.png'),
  Shipped: require('../../../assets/images/shipped.png'),
  Delivered: require('../../../assets/images/box.png'),
};

type RootStackParamList = {
  OrderCard: undefined;
  PaymentMethodScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
  // other screens...
};

export default function OrderCard({ order }: any) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const iconSource = statusIconMap[order.status] || null;
  // console.log('order', order);

  const selectedItems =
    order.__orderItems__?.map((item: any) => ({
      id: String(item.productId),
      quantity: item.quantity,
      price: Number(item.price),
    })) || [];

  return (
    <View
      className="mt-0.5 p-4 bg-white dark:bg-neutral-800 mb-3 rounded-xl shadow-xl"
      style={{
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        elevation: 3,
      }}
    >
      <Text className="text-sm -mt-2 text-gray-500 dark:text-gray-400">
        {new Date(order.createdAt).toDateString()}
      </Text>

      {/* Status Badge */}
      <View className="flex-row justify-end items-center -mt-2 bg-green-100 dark:bg-green-900/40 rounded-lg p-2 py-1 self-end">
        {iconSource && (
          <Image
            source={iconSource}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
            style={{ tintColor: isDarkMode ? '#4ade80' : '#16a34a' }} // Light green vs Dark green tint
          />
        )}

        <Text className="text-sm font-bold text-green-700 dark:text-green-400">
          {order.status}
        </Text>
      </View>

      <DeliveryStatusBar status={order.status} />

      {/* Order Items */}
      {order.__orderItems__?.map((item: any) => (
        <OrderItemRow key={item.id} item={item} />
      ))}

      {/* Total Price */}
      <Text className="text-lg font-bold mt-1 text-black dark:text-white">
        Total: Rs:{order.price}
      </Text>

      {/* Pay Button */}
      {order.status === 'Pending' && (
        <TouchableOpacity
          className="bg-blue-600 dark:bg-blue-500 rounded-lg p-3 mt-2 items-center"
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('PaymentMethodScreen', {
              selectedItems: selectedItems,
              totalPrice: order.price,
              orderId: order.id,
            });
          }}
        >
          <Text className="text-white font-bold text-base">Pay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
