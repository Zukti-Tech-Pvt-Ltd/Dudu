import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { API_BASE_URL } from '@env';
import { getAllMerchantOrders } from '../../api/merchantOrder/orderApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SortAsc, SortDesc } from 'lucide-react-native';

import { AuthContext } from '../../helper/authContext';
import OrderMerchantCard from './orderMerchantCard';

export type Product = {
  id: number;
  image: string;
  video: string;
  name: string;
  category: string;
  description: string;
  order: number;
  price: number;
  rate: number;
  count: number;
  type?: string | null;
  createdAt: string;
};
export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  createdAt: string;
  __product__: Product;
};
export type Rider = {
  email: string;
  phoneNumber: string;
  username: string;
};
export type Order = {
  id: number;
  userId: number;
  status: string;
  deliveryAddress?: string | null;
  riderId?: number | null;
  price: string;
  createdAt: string;
  estimatedDeliveryDate: string;
  __orderItems__: OrderItem[];
  __rider__: Rider;
};

const filters = [
  { label: 'All Orders' },
  { label: 'OrderPlaced' },
  { label: 'Confirmed' },
  { label: 'Shipped' },
  { label: 'Delivered' },
];

export default function OrderList() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isLoggedIn } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');

  //refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();

    setRefreshing(false);
  };

  // 🔥 Sorting State (default ascending)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortOrders = (list: Order[], type: 'asc' | 'desc') => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return type === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // State for filtered & sorted list
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const fetchOrders = async () => {
    try {
      const data = await getAllMerchantOrders('');
      setOrders(data);

      const filtered = data.filter((order: Order) =>
        selected === '' || selected === 'All Orders'
          ? true
          : order.status === selected,
      );

      setDisplayOrders(sortOrders(filtered, sortOrder));
    } catch (err) {
      console.log(err);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;

      setLoading(true);
      fetchOrders().finally(() => setLoading(false));
    }, [isLoggedIn]),
  );
  // Whenever filter or sort changes, just update displayOrders locally
  useEffect(() => {
    const filtered = orders.filter(order =>
      selected === '' || selected === 'All Orders'
        ? true
        : order.status === selected,
    );
    setDisplayOrders(sortOrders(filtered, sortOrder));
  }, [selected, sortOrder, orders]);

  if (!isLoggedIn) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <Image
          source={require('../../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200"
        />
        <Text
          className={`font-bold text-lg mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Please login first
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <TouchableOpacity
        onPress={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        style={{
          position: 'absolute',
          top: -45,
          right: 10,
          padding: 10,
          zIndex: 20,
        }}
      >
        {sortOrder === 'asc' ? (
          <SortAsc color={isDarkMode ? 'white' : 'black'} size={22} />
        ) : (
          <SortDesc color={isDarkMode ? 'white' : 'black'} size={22} />
        )}
      </TouchableOpacity>
      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 7, marginVertical: 8 }}
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
      {/* Orders List */}
      <FlatList
        data={displayOrders}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => <OrderMerchantCard order={item} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-gray-500 mt-10">
              No orders found.
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      {/* Loading Overlay */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </View>
  );
}
