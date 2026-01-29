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
  StatusBar,
} from 'react-native';
import { API_BASE_URL } from '@env';
import { getAllMerchantOrders } from '../../api/merchantOrder/orderApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SortAsc, SortDesc } from 'lucide-react-native';

import { AuthContext } from '../../helper/authContext';
import OrderMerchantCard from './orderMerchantCard';
import { connectSocket } from '../../helper/socket';

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

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#ffffff',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    chipActiveBg: '#2563eb',
    chipInactiveBg: isDarkMode ? '#262626' : '#e0e7ef',
    chipActiveText: '#ffffff',
    chipInactiveText: isDarkMode ? '#d1d5db' : '#374151',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)',
    iconColor: isDarkMode ? '#ffffff' : '#000000',
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('All Orders');

  //refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    const socket = connectSocket();

    socket.on('orderUpdated', async (data: any) => {
      console.log('Realtime order update:', data);
      const dataa = await getAllMerchantOrders('');
      setOrders(dataa);
    });

    return () => {
      socket.off('orderUpdated');
    };
  }, []);

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

  // ✅ New function: Handle filter switching with artificial loading
  const handleFilterSelect = (label: string) => {
    if (label === selected) return;

    setLoading(true); // 1. Start loading

    // 2. Wait 500ms
    setTimeout(() => {
      setSelected(label); // 3. Change selection
      setLoading(false); // 4. Stop loading
    }, 500);
  };

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
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Image
          source={require('../../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200 dark:bg-neutral-800"
        />
        <Text className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
          Please login first
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 relative"
      style={{ backgroundColor: colors.screenBg }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      <TouchableOpacity
        onPress={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        style={{
          position: 'absolute',
          top: -45, // Adjust based on your header layout context
          right: 10,
          padding: 10,
          zIndex: 20,
        }}
      >
        {sortOrder === 'asc' ? (
          <SortAsc color={colors.iconColor} size={22} />
        ) : (
          <SortDesc color={colors.iconColor} size={22} />
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
              onPress={() => handleFilterSelect(filter.label)} // ✅ Updated Handler
              className="px-[10px] h-9 mr-2 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  selected === filter.label
                    ? colors.chipActiveBg
                    : colors.chipInactiveBg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color:
                    selected === filter.label
                      ? colors.chipActiveText
                      : colors.chipInactiveText,
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#fff' : '#000'}
            colors={['#2563eb']}
          />
        }
        renderItem={({ item }) => <OrderMerchantCard order={item} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center mt-10 text-gray-500 dark:text-gray-400">
              No orders found.
            </Text>
          ) : null
        }
        contentContainerStyle={
          displayOrders.length === 1
            ? { paddingBottom: 600 }
            : { paddingBottom: 250 }
        }
      />

      {/* Loading Overlay */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.overlay,
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
