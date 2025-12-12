import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { getAllOrders } from '../../api/orderApi';
import OrderCard from './orderCard';
import { FlatList } from 'react-native';

import { AuthContext } from '../../helper/authContext';
type Product = {
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
type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  createdAt: string;
  _product_: Product;
};

type Order = {
  id: number;
  userId: number;
  status: string;
  price: string;
  createdAt: string;
  estimatedDeliveryDate: string;
  _orderItems_: OrderItem[];
};
const filters = [
  { label: 'All Orders' },
  { label: 'OrderPlaced' },
  { label: 'Pending' },
  { label: 'Confirmed' },
  { label: 'Shipped' },
  { label: 'Delivered' },
];
export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isLoggedIn } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const filterParam = selected === 'All Orders' ? '' : selected;
      const data = await getAllOrders(filterParam);
      setOrders(data);
    } catch (err) {
      console.error(err);
    }

    if (showLoader) setLoading(false);
  };

  // ✅ UseEffect should always run (or at least hook called)
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchOrders();
  }, [selected, isLoggedIn]);

  // Conditional rendering is fine *after all hooks*
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
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-gray-500 mt-10">
              No orders found.
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchOrders(false); // ⬅ no overlay loading
              setRefreshing(false);
            }}
            tintColor={isDarkMode ? '#fff' : '#000'}
            colors={['#2563eb']}
          />
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
