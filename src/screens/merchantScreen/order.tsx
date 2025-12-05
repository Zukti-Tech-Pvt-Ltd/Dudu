import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { API_BASE_URL } from '@env';
import { getAllMerchantOrders } from '../../api/merchantOrder/orderApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Interfaces ----------------------------------
type RootStackParamList = {
  OrderDetail: { order: Order };
};
export interface Product {
  id: number;
  image: string;
  name: string;
  category?: string;
  productId?: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  __product__: Product;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  price: string;
  deliveryAddress?: string | null;
  riderId?: number | null;
  createdAt: string;
  __orderItems__: OrderItem[];
}
const filters = [
  { label: 'All Orders' },
  { label: 'OrderPlaced' },
  { label: 'Pending' },
  { label: 'Confirmed' },
  { label: 'Shipped' },
  { label: 'Delivered' },
];
// Component ------------------------------------

const OrderList: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [selected, setSelected] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Fetch Orders from API -----------------------

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllMerchantOrders();
    console.log('data======', data);
    setOrders(data?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-500">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 7,
          marginVertical: 8,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {filters.map((filter, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelected(filter.label)}
              className="px-[10px] h-9 mr-2 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  selected === filter.label ? '#2563eb' : '#e0e7ef',
              }}
            >
              <Text
                className="font-medium text-lg"
                style={{
                  color: selected === filter.label ? 'white' : '#374151',
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <FlatList
        data={
          selected && selected !== 'All Orders'
            ? orders.filter(order => order.status === selected)
            : orders
        }
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const expanded = expandedOrderId === item.id;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('OrderDetail', { order: item })
              }
              activeOpacity={0.8} // optional: slight opacity effect on press
            >
              <View
                className={`m-4 p-5 rounded-2xl shadow border ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Order Summary Header */}
                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-lg font-bold">
                        Order #{item.id}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>

                    <View
                      className={`px-3 py-1 rounded-xl ${
                        item.status.toLowerCase() === 'delivered'
                          ? 'bg-green-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      <Text className="text-white text-xs font-semibold">
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xl font-bold mt-3">
                    Rs. {item.price}
                  </Text>
                </TouchableOpacity>

                {/* Expanded Order Items */}
                {expanded && (
                  <View className="mt-5 border-t border-gray-300 pt-4">
                    {item.__orderItems__.map(orderItem => {
                      const product = orderItem.__product__;

                      // Build full image URL
                      const img = product.image?.startsWith('http')
                        ? product.image
                        : `${API_BASE_URL}/${product.image}`;

                      return (
                        <View
                          key={orderItem.id}
                          className="flex-row items-center mb-4"
                        >
                          <Image
                            source={{ uri: img }}
                            className="w-14 h-14 rounded-lg bg-gray-200"
                          />

                          <View className="flex-1 ml-3">
                            <Text className="text-base font-bold">
                              {product.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Qty: {orderItem.quantity}
                            </Text>
                          </View>

                          <Text className="text-lg font-semibold">
                            Rs. {orderItem.price}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default OrderList;
