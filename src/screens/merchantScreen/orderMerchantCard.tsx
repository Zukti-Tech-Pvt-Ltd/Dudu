import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import DeliveryStatusBar from '../order/deliveryStatusBar';
import OrderItemRow from '../order/orderItemRow';
import { API_BASE_URL } from '@env';
import OrderDetail from './orderDetail';
import { useNavigation } from '@react-navigation/native';
import { Order } from './order';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Angry } from 'lucide-react-native';

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

  console.log('order', order);
  console.log('API_BASE_URL', API_BASE_URL);

  const iconSource = statusIconMap[order.status] || null;
  return (
    <View className="-inset-5 mt-0.5 p-4 bg-white mb-3 rounded-xl shadow-xl">
      <Text className="font-semibold text-gray-700">
        {new Date(order.createdAt).toDateString()}
      </Text>
      <Text className="text-sm -mt-0 text-gray-500">
        <Text className="font-semibold text-gray-700">Rider Name: </Text>
        {order.__rider__?.username ?? 'Not Assigned'}
      </Text>

      <Text className="text-sm -mt-0 text-gray-500">
        <Text className="font-semibold text-gray-700">Delivery Address: </Text>
        {order.deliveryAddress}
      </Text>

      <View className="flex-row justify-end items-center -mt-2 bg-green-100 rounded-lg p-2 py-1 self-end">
        {iconSource && (
          <Image
            source={iconSource}
            className="w-5 h-5 mr-2" // width and height ~20-22px (5*4=20)
            resizeMode="contain"
            style={{ tintColor: '#16a34a' }} // green tint
          />
        )}

        <Text className="text-sm font-bold text-green-700">{order.status}</Text>
      </View>

      <DeliveryStatusBar status={order.status} />

      {order.__orderItems__.map((item: any) => (
        <OrderItemRow key={item.id} item={item} />
      ))}

      <Text className="text-lg font-bold mt-1 ">Total: Rs:{order.price}</Text>

      <TouchableOpacity
        className="bg-blue-600 rounded-lg p-3 mt-2 items-center"
        onPress={() => navigation.navigate('OrderDetail', { order })}
      >
        <Text className="text-white font-bold">View Order</Text>
      </TouchableOpacity>
    </View>
  );
}
