import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import OrderItemRow from './orderItemRow';
import DeliveryStatusBar from './deliveryStatusBar';

export default function OrderCard({ order }: any) {
  return (
    <View className="m-2 p-4 bg-white rounded-xl shadow">
      <Text className="text-sm text-gray-500">{new Date(order.createdAt).toDateString()}</Text>
      <Text className="text-lg font-bold my-2">{order.status}</Text>

      <DeliveryStatusBar status={order.status} />

      {order.__orderItems__.map((item: any) => (
        <OrderItemRow key={item.id} item={item} />
      ))}

      <Text className="text-lg font-bold mt-3">Total: ${order.price}</Text>

      <TouchableOpacity className="bg-blue-600 rounded-lg p-3 mt-4 items-center">
        <Text className="text-white font-bold">Track Order</Text>
      </TouchableOpacity>
    </View>
  );
}
