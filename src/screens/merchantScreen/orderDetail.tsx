import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Order } from './order';
import { Picker } from '@react-native-picker/picker'; // Install: npm install @react-native-picker/picker
import { editMerchantOrder } from '../../api/merchantOrder/orderApi';
import DropDownPicker from 'react-native-dropdown-picker';

type RootStackParamList = {
  OrderDetail: { order: Order };
  AvaliableRidersScreen: { order: Order };
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetail: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute<OrderDetailRouteProp>();
  const { order } = route.params;

  // State for status
  const [status, setStatus] = useState(order.status);

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await editMerchantOrder(newStatus, order.id);

      if (response.status !== 'success') {
        throw new Error('Failed to update status');
      }
      Alert.alert('Success', 'Order status updated!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not update order status');
    }
  };

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

        {/* Status Picker */}
        <View className="mt-2">
          <Text className="font-semibold mb-1">Order Status:</Text>
          <View
            className={`px-2 py-[0px] rounded-xl w-full ${
              status.toLowerCase() === 'delivered'
                ? 'bg-green-500'
                : 'bg-amber-500'
            }`}
          >
            <Picker
              selectedValue={status}
              onValueChange={itemValue => {
                setStatus(itemValue);
                updateStatus(itemValue); // Call updateStatus immediately
              }}
              style={{ color: 'white' }}
            >
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Confirmed" value="Confirmed" />

              <Picker.Item label="OrderPlaced" value="OrderPlaced" />
              <Picker.Item label="Shipped" value="Shipped" />
              <Picker.Item label="Delivered" value="Delivered" />
              <Picker.Item label="Cancelled" value="Cancelled" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Order Info */}
      <View className="mb-4">
        <Text className="text-xl font-semibold mb-1">
          Price: Rs.{order.price}
        </Text>
        {order.deliveryAddress && (
          <Text className="text-sm -mt-0 text-gray-500">
            <Text className="font-semibold text-gray-700">
              Delivery Address:
            </Text>
            {order.deliveryAddress}
          </Text>
        )}
        {order.riderId && (
          <Text className="text-sm -mt-0 text-gray-500">
            <Text className="font-semibold text-gray-700">Rider Name: </Text>
            {order.__rider__?.username ?? 'Not Assigned'}
          </Text>
        )}
      </View>

      <Text className="text-xl font-bold mb-3">Items:</Text>
      <FlatList
        data={order.__orderItems__}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const product = item.__product__;
          const normalizedImage = product?.image ? product.image : '';

          return (
            <View className="flex-row items-center mb-4">
              <Image
                source={
                  normalizedImage
                    ? { uri: `${API_BASE_URL}/${normalizedImage}` }
                    : require('../../../assets/images/photo.png')
                }
                className="w-16 h-16 rounded-lg bg-gray-200"
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold">{product?.name}</Text>
                {product?.category && (
                  <Text className="text-xs text-gray-500">
                    {product?.category}
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
      <TouchableOpacity
        style={{
          backgroundColor: '#4CAF50',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('AvaliableRidersScreen', { order })}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          View Available Riders
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderDetail;
