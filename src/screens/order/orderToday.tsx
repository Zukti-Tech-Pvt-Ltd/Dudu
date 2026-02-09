import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  RefreshControl,
  FlatList,
  StatusBar,
} from 'react-native';
import { getAllOrders, getAllOrderToday } from '../../api/orderApi';
import OrderCard from './orderCard';
import { AuthContext } from '../../helper/authContext';
import { SortAsc, SortDesc } from 'lucide-react-native';
import { connectSocket } from '../../helper/socket';
import { useFocusEffect } from '@react-navigation/native';

/* -------------------- TYPES -------------------- */

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
  isDeleted?: boolean;
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

/* -------------------- COMPONENT -------------------- */

export default function OrderTodayScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isLoggedIn } = useContext(AuthContext);

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#ffffff',
    headerBg: isDarkMode ? '#171717' : '#ffffff',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#262626' : '#e5e7eb',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)',
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState('All Orders');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* -------------------- HELPERS -------------------- */

  const sortOrders = (list: Order[]) => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  /* -------------------- API -------------------- */

  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const data = await getAllOrderToday();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        fetchOrders();
      }
    }, [isLoggedIn]),
  );

  useEffect(() => {
    const socket = connectSocket();

    const handler = (data: any) => {
      fetchOrders();
    };

    socket.on('orderUpdated', handler);

    return () => {
      socket.off('orderUpdated', handler);
    };
  }, []);

  useEffect(() => {
    const filtered =
      selected === 'All Orders'
        ? orders
        : orders.filter(order => order.status === selected);

    setDisplayOrders(sortOrders(filtered));
  }, [orders, selected, sortOrder]);

  /* -------------------- REFRESH -------------------- */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(false);
    setRefreshing(false);
  };

  /* -------------------- NOT LOGGED IN -------------------- */

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

  /* -------------------- UI -------------------- */

  return (
    <View
      className="flex-1 relative"
      style={{ backgroundColor: colors.screenBg }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBg}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 50,
          paddingHorizontal: 16,
          paddingVertical: 15,
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          Orders Today
        </Text>

        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
              setLoading(false);
            }, 300);
          }}
          style={{ padding: 8 }}
        >
          {sortOrder === 'asc' ? (
            <SortAsc color={colors.textPrimary} size={22} />
          ) : (
            <SortDesc color={colors.textPrimary} size={22} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Bar (Hidden / Placeholder logic preserved from original code) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 7, marginVertical: -15 }}
      >
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setSelected('All Orders')}
            className="px-[10px] h-9 mr-2 rounded-full items-center justify-center"
          ></TouchableOpacity>
        </View>
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={displayOrders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        scrollEnabled={displayOrders.length > 0}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center mt-10 text-gray-500 dark:text-gray-400">
              No orders today.
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#fff' : '#000'}
            colors={['#2563eb']}
          />
        }
        contentContainerStyle={
          displayOrders.length === 1
            ? { paddingBottom: 600 }
            : { paddingBottom: 250 }
        }
        style={{ backgroundColor: colors.screenBg }}
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
