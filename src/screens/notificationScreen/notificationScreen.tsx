import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { getnotification } from '../../api/notificationApi';
import { orderReceivedByUser } from '../../api/orderApi';
import { connectSocket } from '../../helper/socket';

/* -------------------- TYPES -------------------- */
type NotificationTab = 'All' | 'Fund Request' | 'News' | 'Order';

type ApiNotification = {
  id: number;
  title: string;
  message: string;
  userId: number;
  merchantId: number;
  orderId: number;
  notificationType: string;
  createdAt: string;
};

const TABS: NotificationTab[] = ['All', 'Order', 'Fund Request', 'News'];

/* -------------------- HELPER FUNCTIONS -------------------- */
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/* -------------------- COMPONENT -------------------- */
export default function NotificationScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<NotificationTab>('All');
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    try {
      const response = await getnotification();
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  //socket for when new notification is created
  useEffect(() => {
    const socket = connectSocket();
    const handleNotificationUpdate = (data: ApiNotification[]) => {
      fetchNotifications();
    };
    socket.on('notificationUpdate', handleNotificationUpdate);
    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, []);

  //socket for when order is delivered to user and user accepts and tap yes in notificaiton
  useEffect(() => {
    const socket = connectSocket();
    const handleOrderUpdate = (data: ApiNotification[]) => {
      fetchNotifications();
    };
    socket.on('orderUpdated', handleOrderUpdate);
    return () => {
      socket.off('orderUpdated', handleOrderUpdate);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  // --- HANDLE ORDER BUTTON PRESS ---
  const handleOrderAction = async (item: ApiNotification) => {
    await orderReceivedByUser(item.orderId);
    Alert.alert('Order Accepted', `You clicked Yes for Order #${item.id}`);
  };

  // --- FILTER LOGIC ---
  const filteredData = notifications.filter(item => {
    if (activeTab === 'All') return true;
    return item.notificationType === activeTab;
  });

  const renderItem = ({ item }: { item: ApiNotification }) => (
    <View
      className={`mx-4 mb-3 rounded-xl p-4 shadow-sm bg-white dark:bg-neutral-800`}
      style={{
        elevation: 2,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
      }}
    >
      <View className="flex-row justify-between mb-1">
        <Text
          className={`text-base font-bold flex-1 text-gray-900 dark:text-white`}
        >
          {item.title}
        </Text>
        {/* Type Badge */}
        <View className="bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded self-start ml-2">
          <Text className="text-[10px] text-gray-500 dark:text-gray-300 uppercase">
            {item.notificationType}
          </Text>
        </View>
      </View>

      <Text
        className={`mb-2 text-sm leading-5 text-gray-600 dark:text-gray-300`}
      >
        {item.message}
      </Text>

      <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">
        {formatDate(item.createdAt)}
      </Text>

      {/* --- CONDITIONALLY RENDER BUTTON IF TYPE IS ORDER --- */}
      {item.notificationType === 'Order' && (
        <View className="mt-2 border-t border-gray-100 dark:border-neutral-700 pt-2">
          <TouchableOpacity
            onPress={() => handleOrderAction(item)}
            className="bg-blue-500 dark:bg-blue-600 py-2 px-6 rounded-lg self-start items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm">Yes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      className={`flex-1 bg-gray-50 dark:bg-neutral-900`}
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#171717' : '#ffffff'}
      />

      {/* ---------------- CUSTOM HEADER ---------------- */}
      <View className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-1 mr-3"
          >
            <ArrowLeft size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold text-gray-900 dark:text-white`}>
            Notification History
          </Text>
        </View>

        {/* Header Row: Tabs */}
        <View className="flex-row justify-between px-2">
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={`flex-1 items-center py-3 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab
                    ? 'text-blue-500 font-bold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---------------- LIST CONTENT ---------------- */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#ffffff' : '#3B82F6'}
              colors={['#3B82F6']}
            />
          }
          ListEmptyComponent={
            <View className="mt-10 items-center justify-center">
              <Text className="text-gray-400 dark:text-gray-500">
                No notifications found in "{activeTab}".
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
