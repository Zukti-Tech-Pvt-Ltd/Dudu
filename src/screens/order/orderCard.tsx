import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import OrderItemRow from './orderItemRow';
import DeliveryStatusBar from './deliveryStatusBar';
const statusIconMap: Record<string, any> = {
  OrderPlaced: require('../../../assets/images/clock.png'),
  Confirmed: require('../../../assets/images/check-mark.png'),
  Shipped: require('../../../assets/images/shipped.png'),
  Delivered: require('../../../assets/images/box.png'),
};
export default function OrderCard({ order }: any) {
    const iconSource = statusIconMap[order.status] || null;

  return (
    <View className="m-2 -mt-0.5 p-4 bg-white rounded-xl shadow">
      <Text className="text-sm  text-gray-500">{new Date(order.createdAt).toDateString()}</Text>
  <View className="flex-row justify-end items-center  bg-green-100 rounded-lg p-2 py-1 self-end">
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

      <Text className="text-lg font-bold mt-3">Total: ${order.price}</Text>

      <TouchableOpacity className="bg-blue-600 rounded-lg p-3 mt-4 items-center">
        <Text className="text-white font-bold">Track Order</Text>
      </TouchableOpacity>
    </View>
  );
}
