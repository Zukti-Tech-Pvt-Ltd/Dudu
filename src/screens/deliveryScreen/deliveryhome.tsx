import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  Pressable,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  Truck,
  CheckCircle,
  BatteryCharging,
  Map,
  SortAsc,
  SortDesc,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info'; // Ensure this is installed

import { AuthContext } from '../../helper/authContext';
import { decodeToken } from '../../api/indexAuth';
import { getUser, editUser } from '../../api/userApi';
import { getDeliveryOrder } from '../../api/deliveryOrderApi';
import { DeliveryCard } from './deliveryCard';
import { connectSocket } from '../../helper/socket';

type RootStackParamList = {
  DeliveryHubScreen: undefined;
  ActiveDelivery: undefined;
  CompletedDelivery: undefined;
  DeliveryStatusScreen: { deliveryItem: DeliveryTaskItem };
  DeliveryMapsScreen: undefined;
};

type deliveryHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryHubScreen'
>;

interface DeliveryCustomer {
  id: number;
  username: string;
  phoneNumber: string;
}

export interface DeliveryTaskItem {
  id: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  deliveryFee: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  __merchant__: DeliveryCustomer;
  __customer__: DeliveryCustomer;
}

/* ---------------- STATUS CARD ---------------- */

const StatusCard = ({
  icon,
  value,
  label,
  colors,
  onPress,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  colors: any;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: colors.cardBg,
      borderColor: colors.border,
      borderWidth: 1,
    }}
    className="w-[31%] p-3 rounded-xl shadow-sm items-center justify-center aspect-square"
  >
    {icon}
    <Text
      style={{ color: colors.textPrimary }}
      className="text-xl font-bold mt-2"
    >
      {value}
    </Text>
    <Text
      style={{ color: colors.textSecondary }}
      className="text-xs mt-1 font-medium"
    >
      {label}
    </Text>
  </Pressable>
);

/* ---------------- MAIN SCREEN ---------------- */

const DeliveryHubScreen: React.FC = () => {
  const navigation = useNavigation<deliveryHomeNavigationProp>();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#F9FAFB',
    cardBg: isDarkMode ? '#262626' : '#FFFFFF',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    border: isDarkMode ? '#404040' : '#E5E7EB',
    iconBg: isDarkMode ? '#404040' : '#E5E7EB',
    menuBg: isDarkMode ? '#262626' : '#FFFFFF',
  };

  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryTaskItem[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Battery State
  const [batteryLevel, setBatteryLevel] = useState<string>('--%');

  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /* -------- FETCH DATA -------- */

  const fetchData = async () => {
    setLoading(true);
    try {
      const decoded = await decodeToken();
      const user = await getUser(decoded!.userId);
      setUserData(user.data);
      setIsOnline(user.data?.isOnline);

      if (!token) return;

      const response = await getDeliveryOrder();
      if (response?.data) {
        const sorted = [...response.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setDeliveryData(sorted);
      } else {
        setDeliveryData([]);
      }
    } catch (e) {
      console.error(e);
      setDeliveryData([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------- FETCH BATTERY -------- */
  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        setBatteryLevel(`${Math.round(level * 100)}%`);
      } catch (e) {
        console.log('Battery info unavailable');
      }
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 60000);
    return () => clearInterval(interval);
  }, []);

  /* -------- SOCKET -------- */
  useEffect(() => {
    const socket = connectSocket();
    socket.on('deliveryOrderUpdated', (data: DeliveryTaskItem[]) => {
      console.log('Realtime order update:', data);
      fetchData();
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  /* -------- UPDATE ONLINE STATUS -------- */
  const setStatus = async (status: boolean) => {
    if (!userData?.id) return;
    try {
      setIsOnline(status);
      setMenuOpen(false);
      await editUser(userData.id, { isOnline: status });
      setUserData((prev: any) => ({ ...prev, isOnline: status }));
    } catch {
      setIsOnline(userData.isOnline);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      {/* 🔴 BACKDROP for Menu */}
      {menuOpen && (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 25,
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        />
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#ffffff' : '#000000'}
            />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-center p-4 mb-2">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.iconBg }}
                className="rounded-full p-2.5"
              >
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>

              <View className="ml-3">
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-xl font-bold"
                >
                  {userData?.username}
                </Text>

                <View className="flex-row items-center mt-0.5">
                  <View
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <Text
                    style={{ color: isOnline ? '#4ade80' : '#f87171' }}
                    className="text-sm font-semibold"
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>

            {/* MENU */}
            <View style={{ position: 'relative', zIndex: 30 }}>
              <Pressable
                onPress={() => setMenuOpen(v => !v)}
                hitSlop={10}
                style={{ padding: 5 }}
              >
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-2xl font-bold"
                >
                  ⋮
                </Text>
              </Pressable>

              {menuOpen && (
                <View
                  style={{
                    backgroundColor: colors.menuBg,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  className="absolute right-0 top-8 w-40 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <Pressable
                    onPress={() => setStatus(true)}
                    className="px-4 py-3.5 flex-row items-center active:bg-gray-100 dark:active:bg-neutral-700"
                  >
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <Text className="text-green-500 font-semibold text-sm">
                      Go Online
                    </Text>
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: colors.border }} />

                  <Pressable
                    onPress={() => setStatus(false)}
                    className="px-4 py-3.5 flex-row items-center active:bg-gray-100 dark:active:bg-neutral-700"
                  >
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-red-500 font-semibold text-sm">
                      Go Offline
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* STATUS CARDS */}
          <View className="flex-row justify-between px-4">
            <StatusCard
              icon={<Truck size={28} color="#22c55e" />}
              value={deliveryData
                .filter(
                  d => d.status === 'picked_up' || d.status === 'accepted',
                )
                .length.toString()}
              label="Active"
              colors={colors}
              onPress={() => navigation.navigate('ActiveDelivery')}
            />

            <StatusCard
              icon={<CheckCircle size={28} color="#3b82f6" />}
              value={deliveryData
                .filter(d => d.status === 'delivered')
                .length.toString()}
              label="Completed"
              colors={colors}
              onPress={() => navigation.navigate('CompletedDelivery')}
            />

            <StatusCard
              icon={
                <BatteryCharging
                  size={28}
                  color={parseInt(batteryLevel) < 20 ? '#ef4444' : '#eab308'}
                />
              }
              value={batteryLevel}
              label="Battery"
              colors={colors}
            />
          </View>

          {/* TASK LIST */}
          <View className="p-4 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ color: colors.textPrimary }}
                className="text-lg font-bold"
              >
                Active Tasks ({deliveryData.length})
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                  setSortOrder(newOrder);
                  setDeliveryData(prev =>
                    [...prev].sort((a, b) =>
                      newOrder === 'asc'
                        ? new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                        : new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                    ),
                  );
                }}
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
                className="p-2 rounded-lg"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc color={colors.textPrimary} size={20} />
                ) : (
                  <SortDesc color={colors.textPrimary} size={20} />
                )}
              </TouchableOpacity>
            </View>

            {deliveryData.length === 0 ? (
              <View className="mt-12 items-center">
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-base"
                >
                  No active deliveries assigned yet.
                </Text>
              </View>
            ) : (
              deliveryData
                .filter(item => item.__customer__ && item.__merchant__)
                .map(item => (
                  <DeliveryCard
                    key={item.id}
                    item={item}
                    dark={isDarkMode}
                    onPress={() =>
                      navigation.navigate('DeliveryStatusScreen', {
                        deliveryItem: item,
                      })
                    }
                  />
                ))
            )}
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryMapsScreen')}
          className={`absolute bottom-8 right-8 w-16 h-16 rounded-full items-center justify-center shadow-lg ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}
          style={{ elevation: 5 }}
        >
          <Map size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryHubScreen;
