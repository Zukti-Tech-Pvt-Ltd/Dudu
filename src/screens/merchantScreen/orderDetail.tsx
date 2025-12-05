// src/screens/OrderDetail.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { Order } from './order';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  OrderDetail: { order: Order };
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetail: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute<OrderDetailRouteProp>();
  const { order } = route.params;

  return (
    <View className={`flex-1 p-5 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mb-4 flex-row items-center"
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDark ? 'white' : 'black'}
        />
        <Text
          className="ml-2 text-lg font-semibold"
          style={{ color: isDark ? 'white' : 'black' }}
        >
          Back
        </Text>
      </TouchableOpacity>
      <View className="mb-4">
        <Text className="text-2xl font-bold mb-2">Order #{order.id}</Text>
        <Text className="text-gray-500">
          {new Date(order.createdAt).toLocaleString()}
        </Text>
        <Text
          className={`mt-2 px-3 py-1 rounded-xl text-white w-max ${
            order.status.toLowerCase() === 'delivered'
              ? 'bg-green-500'
              : 'bg-amber-500'
          }`}
        >
          {order.status}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-xl font-semibold mb-1">
          Price: Rs. {order.price}
        </Text>
        {order.deliveryAddress && (
          <Text className="text-gray-500">
            Delivery: {order.deliveryAddress}
          </Text>
        )}
        {order.riderId && (
          <Text className="text-gray-500">Rider ID: {order.riderId}</Text>
        )}
      </View>

      <Text className="text-xl font-bold mb-3">Items:</Text>

      <FlatList
        data={order.__orderItems__}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const product = item.__product__;
          const img = product.image?.startsWith('http')
            ? product.image
            : `${API_BASE_URL}/${product.image}`;

          return (
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: img }}
                className="w-16 h-16 rounded-lg bg-gray-200"
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold">{product.name}</Text>
                {product.category && (
                  <Text className="text-xs text-gray-500">
                    {product.category}
                  </Text>
                )}
                <Text className="text-xs text-gray-500">
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text className="text-lg font-semibold">Rs. {item.price}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default OrderDetail;
