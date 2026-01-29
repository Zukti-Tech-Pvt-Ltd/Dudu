import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Order } from './order';
import { Picker } from '@react-native-picker/picker';
import {
  editMerchantOrder,
  getOneOrder,
} from '../../api/merchantOrder/orderApi';
import { User, Phone, Bike, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { getDeliveryOrderPerOrder } from '../../api/deliveryOrderApi';
import { connectSocket } from '../../helper/socket';

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

  // State
  // console.log('Initial Order Props:', order);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [deliveryOrder, setDeliveryOrder] = useState<any[]>([]);
  const [status, setStatus] = useState(order.status);

  // 1. REUSABLE FETCH FUNCTION
  const refreshData = useCallback(async () => {
    try {
      // console.log('🔄 Refreshing data for order:', order.id);

      // A. Fetch Delivery Info
      const deliveryRes = await getDeliveryOrderPerOrder(order.id);
      if (deliveryRes && deliveryRes.data) {
        setDeliveryOrder(deliveryRes.data);
      }

      // B. Fetch Latest Order Details
      const orderRes = await getOneOrder(order.id);
      if (orderRes) {
        const freshOrder = orderRes.data || orderRes;
        setStatus(freshOrder.status); // Sync status
      }
    } catch (error) {
      console.error('Error refreshing order details:', error);
    }
  }, [order.id]);

  // 2. FOCUS EFFECT (Initial Load & Navigation Back)
  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => {};
    }, [refreshData]),
  );

  // 3. SOCKET EFFECT (Real-time Updates)
  useEffect(() => {
    const socket = connectSocket();

    // Listener for order updates
    const handleSocketUpdate = (data: any) => {
      // Only refresh if the update is for THIS order
      if (data.orderId === order.id) {
        // console.log('⚡ Socket Trigger: Order Updated');
        refreshData();
      }
    };

    socket.on('orderUpdated', handleSocketUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('orderUpdated', handleSocketUpdate);
    };
  }, [order.id, refreshData]);

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await editMerchantOrder(newStatus, order.id);

      if (response.status !== 'success') {
        throw new Error('Failed to update status');
      }
      Alert.alert('Success', 'Order status updated!');
      // Update local state immediately
      setCurrentOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not update order status');
    }
  };

  return (
    <View
      className={`flex-1 p-5 pt-10 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}
    >
      <View className="flex-row items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={isDark ? 'white' : 'black'} />
        </TouchableOpacity>

        <View>
          <Text className="text-2xl font-bold text-black dark:text-white">
            Order #{currentOrder.id}
          </Text>
        </View>
      </View>

      {/* Status Picker */}
      <View className="mt-1">
        <Text className="font-semibold mb-1 text-black dark:text-white">
          Order Status:
        </Text>
        <View
          className={`px-2 rounded-xl w-full ${
            status.toLowerCase() === 'delivered'
              ? 'bg-green-500'
              : 'bg-amber-500'
          }`}
        >
          <Picker
            selectedValue={status}
            enabled={false} //disable picker dropdown
            dropdownIconColor="white"
            onValueChange={itemValue => {
              setStatus(itemValue);
              updateStatus(itemValue);
            }}
            style={{ color: 'white' }}
          >
            <Picker.Item label="Confirmed" value="Confirmed" />
            <Picker.Item label="OrderPlaced" value="OrderPlaced" />
            <Picker.Item label="Shipped" value="Shipped" />
            <Picker.Item label="Delivered" value="Delivered" />
            <Picker.Item label="Cancelled" value="Cancelled" />
          </Picker>
        </View>
      </View>

      {/* Order Info */}
      <View className="mb-3 mt-4">
        <Text className="text-xl font-semibold mb-1 text-black dark:text-white">
          Price: Rs.{currentOrder.price}
        </Text>

        {currentOrder.deliveryAddress && (
          <Text className="text-sm -mt-0 text-gray-500 dark:text-gray-400">
            <Text className="font-semibold text-gray-700 dark:text-gray-300">
              Delivery Address:{' '}
            </Text>
            {currentOrder.deliveryAddress}
          </Text>
        )}

        {currentOrder.riderId && (
          <Text className="text-sm -mt-0 text-gray-500 dark:text-gray-400">
            <Text className="font-semibold text-gray-700 dark:text-gray-300">
              Rider Name:{' '}
            </Text>
            {currentOrder.__rider__?.username ?? 'Not Assigned'}
          </Text>
        )}

        <Text className="text-sm -mt-0 text-gray-500 dark:text-gray-400">
          <Text className="font-semibold text-gray-700 dark:text-gray-300">
            Date:{' '}
          </Text>
          {new Date(currentOrder.createdAt).toLocaleString()}
        </Text>
      </View>

      <Text className="text-xl font-bold mb-3 text-black dark:text-white">
        Items:
      </Text>

      <FlatList
        data={currentOrder.__orderItems__}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const product = item.__product__;
          const normalizedImage = product?.image ? product.image : '';

          return (
            <View className="flex-row items-center mb-4 bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm">
              <Image
                source={
                  normalizedImage
                    ? { uri: `${API_BASE_URL}/${normalizedImage}` }
                    : require('../../../assets/images/photo.png')
                }
                className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600"
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-black dark:text-white">
                  {product?.name}
                </Text>
                {product?.category && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {product?.category}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text className="text-lg font-semibold text-black dark:text-white">
                Rs. {item.price}
              </Text>
            </View>
          );
        }}
      />

      {/* Delivery Rider Section */}
      {!deliveryOrder?.length && (
        <TouchableOpacity
          style={{
            backgroundColor: '#4CAF50',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('AvaliableRidersScreen', {
              order: currentOrder,
            })
          }
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            View Available Riders
          </Text>
        </TouchableOpacity>
      )}

      {deliveryOrder?.length > 0 && (
        <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-100 dark:border-blue-800">
          <Text className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">
            Delivery Partner Assigned
          </Text>

          <View className="flex-row items-center mb-2">
            <User size={18} color={isDark ? '#93c5fd' : '#1e40af'} />
            <Text className="ml-2 text-base text-gray-800 dark:text-gray-200 font-semibold">
              {deliveryOrder[0].__deliveryPartner__?.username}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Phone size={18} color={isDark ? '#93c5fd' : '#1e40af'} />
            <Text className="ml-2 text-base text-gray-800 dark:text-gray-200">
              {deliveryOrder[0].__deliveryPartner__?.phoneNumber}
            </Text>
          </View>

          {/* STATUS MESSAGE with Lucide Icons */}
          <View className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-1">
            {status !== 'Delivered' ? (
              <View className="flex-row items-center bg-orange-100 dark:bg-orange-900/40 p-2 rounded-md">
                <Bike size={20} color="#ea580c" />
                <Text className="ml-2 text-orange-800 dark:text-orange-200 font-bold italic">
                  Rider is on the way!
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-green-100 dark:bg-green-900/40 p-2 rounded-md">
                <CheckCircle size={20} color="#16a34a" />
                <Text className="ml-2 text-green-800 dark:text-green-200 font-bold">
                  Successfully Delivered!
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetail;
