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
} from 'react-native';
import {
  Truck,
  CheckCircle,
  BatteryCharging,
  Activity,
  Map,
  SortAsc,
  SortDesc,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  dark,
  onPress,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  dark: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`w-1/3 p-3 rounded-xl shadow items-center justify-center ${
      dark ? 'bg-gray-800' : 'bg-gray-100'
    }`}
    style={{ aspectRatio: 1 }}
  >
    {icon}
    <Text
      className={`${dark ? 'text-white' : 'text-black'} text-xl font-bold mt-2`}
    >
      {value}
    </Text>
    <Text
      className={`${dark ? 'text-gray-400' : 'text-gray-700'} text-xs mt-1`}
    >
      {label}
    </Text>
  </Pressable>
);

/* ---------------- MAIN SCREEN ---------------- */

const DeliveryHubScreen: React.FC = () => {
  const navigation = useNavigation<deliveryHomeNavigationProp>();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryTaskItem[]>([]);
  const [userData, setUserData] = useState<any>(null);

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

      setUserData((prev: any) => ({
        ...prev,
        isOnline: status,
      }));
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
    <SafeAreaView className={`flex-1 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* 🔴 BACKDROP */}
      {menuOpen && (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
          }}
        />
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center">
              <View
                className={`rounded-full p-2 ${
                  dark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <Text className={`${dark ? 'text-white' : 'text-black'}`}>
                  👤
                </Text>
              </View>

              <View className="ml-3">
                <Text
                  className={`${
                    dark ? 'text-white' : 'text-black'
                  } text-xl font-bold`}
                >
                  {userData?.username}
                </Text>

                <Text
                  className={`text-sm font-semibold ${
                    isOnline
                      ? dark
                        ? 'text-green-400'
                        : 'text-green-600'
                      : dark
                      ? 'text-red-400'
                      : 'text-red-600'
                  }`}
                >
                  Status: {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            {/* MENU */}
            <View style={{ position: 'relative', zIndex: 20 }}>
              <Pressable onPress={() => setMenuOpen(v => !v)} hitSlop={10}>
                <Text
                  className={`text-2xl ${dark ? 'text-white' : 'text-black'}`}
                >
                  ⋮
                </Text>
              </Pressable>

              {menuOpen && (
                <View
                  className={`absolute right-0 top-8 w-36 rounded-xl shadow-xl ${
                    dark ? 'bg-gray-900' : 'bg-white'
                  }`}
                  style={{ zIndex: 30 }}
                >
                  <Pressable
                    onPress={() => setStatus(true)}
                    className="px-4 py-3 flex-row items-center"
                  >
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <Text className="text-green-500 font-semibold text-sm">
                      Go Online
                    </Text>
                  </Pressable>

                  <View className="h-px bg-gray-200 dark:bg-gray-700" />

                  <Pressable
                    onPress={() => setStatus(false)}
                    className="px-4 py-3 flex-row items-center"
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
          <View className="flex-row space-x-2 px-4">
            <StatusCard
              icon={<Truck size={28} color="#22c55e" />}
              value={deliveryData
                .filter(d => d.status === 'picked_up')
                .length.toString()}
              label="Active"
              dark={dark}
              onPress={() => navigation.navigate('ActiveDelivery')}
            />

            <StatusCard
              icon={<CheckCircle size={28} color="#3b82f6" />}
              value={deliveryData
                .filter(d => d.status === 'delivered')
                .length.toString()}
              label="Completed"
              dark={dark}
              onPress={() => navigation.navigate('CompletedDelivery')}
            />

            <StatusCard
              icon={<BatteryCharging size={28} color="#ef4444" />}
              value="85%"
              label="Battery"
              dark={dark}
            />
          </View>

          {/* TASK LIST */}
          <View className="p-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={`text-lg font-bold ${
                  dark ? 'text-white' : 'text-black'
                }`}
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
                className="p-2 rounded bg-gray-200 dark:bg-gray-700"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc color={dark ? 'white' : 'black'} />
                ) : (
                  <SortDesc color={dark ? 'white' : 'black'} />
                )}
              </TouchableOpacity>
            </View>

            {deliveryData.length === 0 ? (
              <Text
                className={`text-center mt-12 ${
                  dark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                No active deliveries.
              </Text>
            ) : (
              deliveryData
                .filter(item => item.__customer__ && item.__merchant__) // <-- ensure objects exist
                .map(item => (
                  <DeliveryCard
                    key={item.id}
                    item={item}
                    dark={dark}
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
          className={`absolute bottom-8 right-8 w-16 h-16 rounded-full items-center justify-center ${
            dark ? 'bg-blue-500' : 'bg-blue-600'
          }`}
        >
          <Map size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryHubScreen;
