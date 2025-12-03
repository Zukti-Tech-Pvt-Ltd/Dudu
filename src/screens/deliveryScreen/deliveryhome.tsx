import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  Pressable,
} from 'react-native';
import {
  Plus,
  CheckCircle,
  Truck,
  BatteryCharging,
  ArrowRight,
  Activity,
  Pin,
  Map,
} from 'lucide-react-native';
import { getDeliveryOrder } from '../../api/deliveryOrderApi';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../helper/authContext';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { getUser } from '../../api/userApi';
import { decodeToken } from '../../api/indexAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

interface StatusCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
  dark?: boolean;
  onPress?: () => void;
}
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
  status: string;
  __customer__: DeliveryCustomer;
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  value,
  label,
  className = '',
  dark,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className={`w-1/3 p-3  rounded-xl shadow-lg items-center justify-center ${className}
      ${dark ? 'bg-gray-800' : 'bg-gray-100'}
    `}
    style={{ aspectRatio: 1 }}
    android_ripple={{ color: dark ? '#333' : '#ccc', borderless: false }}
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

interface AppDetailsProps {
  appId: string;
  userId: string;
  dbStatus: 'Connected' | 'Disconnected';
  dark?: boolean;
}

const AppDetails: React.FC<AppDetailsProps> = ({
  appId,
  userId,
  dbStatus,
  dark,
}) => (
  <View className="mt-10 px-4">
    <Text className={`${dark ? 'text-gray-400' : 'text-gray-700'} text-xs`}>
      App ID:{' '}
      <Text className={`${dark ? 'text-cyan-400' : 'text-cyan-600'}`}>
        {appId}
      </Text>
    </Text>

    <Text
      className={`${dark ? 'text-gray-400' : 'text-gray-700'} text-xs mt-1`}
    >
      User ID:{' '}
      <Text className={`${dark ? 'text-white' : 'text-black'}`}>{userId}</Text>
    </Text>

    <Text
      className={`${dark ? 'text-gray-400' : 'text-gray-700'} text-xs mt-1`}
    >
      DB Status:{' '}
      <Text
        className={`font-semibold ${
          dbStatus === 'Connected'
            ? dark
              ? 'text-green-400'
              : 'text-green-600'
            : dark
            ? 'text-red-400'
            : 'text-red-600'
        }`}
      >
        {dbStatus}
      </Text>
    </Text>
  </View>
);

export const DeliveryCard = ({
  item,
  dark,
  onPress,
}: {
  item: DeliveryTaskItem;
  dark: boolean;
  onPress?: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl p-4 mb-4 ${
        dark ? 'bg-gray-800' : 'bg-gray-100'
      } shadow`}
      android_ripple={{ color: dark ? '#333' : '#ccc' }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={`${dark ? 'text-white' : 'text-black'} font-bold text-lg`}
        >
          Delivery #{item.id}
        </Text>

        <Text
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            item.status === 'pending'
              ? dark
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-200 text-yellow-900'
              : dark
              ? 'bg-green-600 text-white'
              : 'bg-green-200 text-green-900'
          }`}
        >
          {item.status}
        </Text>
      </View>

      {/* Pickup */}
      <View className="mt-2">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Pickup Address
        </Text>
        <Text className={`${dark ? 'text-white' : 'text-black'} font-semibold`}>
          {item.pickupAddress}
        </Text>
      </View>

      {/* Delivery */}
      <View className="mt-3">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Delivery Address
        </Text>
        <Text className={`${dark ? 'text-white' : 'text-black'} font-semibold`}>
          {item.deliveryAddress}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center mt-4">
        <View>
          <Text
            className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}
          >
            Customer
          </Text>
          <Text
            className={`${dark ? 'text-white' : 'text-black'} font-semibold`}
          >
            {item.__customer__.username} ({item.__customer__.phoneNumber})
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}
          >
            Fee
          </Text>
          <Text
            className={`${
              dark ? 'text-green-400' : 'text-green-600'
            } font-bold`}
          >
            ${item.deliveryFee}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const DeliveryHubScreen: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigation = useNavigation<deliveryHomeNavigationProp>();

  const scheme = useColorScheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryTaskItem[]>([]);
  const [userData, setUserData] = useState<any | null>(null);

  const dark = scheme === 'dark';
  const fetchData = async () => {
    setLoading(true);
    const decoded = await decodeToken();
    const user = await getUser(decoded!.userId);
    setUserData(user.data); // extract actual user

    if (!token) return;
    try {
      const response = await getDeliveryOrder();
      if (response && response.data) {
        setDeliveryData(response.data);
      } else {
        setDeliveryData([]);
      }
    } catch (err) {
      console.error(err);
      setDeliveryData([]);
    } finally {
      setLoading(false);
    }
  };
  console.log('userDat22222a', userData);
  console.log('deliveryData', deliveryData);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );
  return (
    <SafeAreaView className={`flex-1 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Header */}
          <View className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center">
              <View
                className={`rounded-full p-2 ${
                  dark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`${
                    dark ? 'text-white' : 'text-black'
                  } text-lg font-bold`}
                >
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
                  className={`font-semibold text-sm ${
                    dark ? 'text-green-400' : 'text-green-600'
                  }`}
                >
                  {userData?.isOnline}
                  Status:
                  {userData?.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <TouchableOpacity className="p-2">
              <ArrowRight size={24} color={dark ? '#f87171' : '#dc2626'} />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="p-4">
            <View className="flex-row space-x-2 px-1">
              <StatusCard
                icon={<Truck size={28} color={dark ? '#4ade80' : '#16a34a'} />}
                value={deliveryData
                  .filter(item => item.status?.toLowerCase() === 'accepted')
                  .length.toString()}
                label="Active"
                dark={dark}
                onPress={() => navigation.navigate('ActiveDelivery')}
              />

              <StatusCard
                icon={
                  <CheckCircle size={28} color={dark ? '#60a5fa' : '#1d4ed8'} />
                }
                value={deliveryData
                  .filter(item => item.status?.toLowerCase() === 'delivered')
                  .length.toString()}
                label="Completed Today"
                dark={dark}
                onPress={() => navigation.navigate('CompletedDelivery')}
              />

              <StatusCard
                icon={
                  <BatteryCharging
                    size={28}
                    color={dark ? '#ef4444' : '#be123c'}
                  />
                }
                value="85%"
                label="Device Battery"
                dark={dark}
              />
            </View>

            {/* Tasks Section */}
            <View className="mt-8">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Activity size={20} color={dark ? '#e5e5e5' : '#111'} />
                  <Text
                    className={`${
                      dark ? 'text-white' : 'text-black'
                    } text-lg font-bold ml-2`}
                  >
                    Active Tasks ({deliveryData.length})
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text
                    className={`${
                      dark ? 'text-blue-400' : 'text-blue-600'
                    } font-semibold`}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              {deliveryData.length === 0 ? (
                <View className="items-center justify-center mt-12 mb-12">
                  <View
                    className={`p-2 rounded-full transform rotate-45 mb-4 ${
                      dark ? 'bg-green-500' : 'bg-green-600'
                    }`}
                  >
                    <Truck size={32} color={dark ? '#0a0a0a' : '#ffffff'} />
                  </View>

                  <Text
                    className={`${
                      dark ? 'text-white' : 'text-black'
                    } text-base font-semibold`}
                  >
                    No active deliveries currently assigned.
                  </Text>
                  <Text
                    className={`${
                      dark ? 'text-gray-400' : 'text-gray-600'
                    } text-sm mt-1`}
                  >
                    Take a break or check for new tasks.
                  </Text>
                </View>
              ) : (
                deliveryData.map(item => (
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

              {/* <AppDetails
              appId="c_52f99807e097976e_DeliveryAppHome.jsx-438"
              userId="05915764922349435223"
              dbStatus="Connected"
              dark={dark}
            /> */}
            </View>
          </View>
        </ScrollView>
        {/* FAB */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryMapsScreen')}
          className={`w-16 h-16 rounded-full items-center justify-center shadow-2xl ${
            dark ? 'bg-blue-500' : 'bg-blue-600'
          }`}
          style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            elevation: 10,
          }}
        >
          <Map size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryHubScreen;
