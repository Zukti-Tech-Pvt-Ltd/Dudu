import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import {
  Plus,
  CheckCircle,
  Truck,
  BatteryCharging,
  ArrowRight,
  Activity,
} from 'lucide-react-native';

interface StatusCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
  dark?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  value,
  label,
  className = '',
  dark,
}) => (
  <View
    className={`p-3 rounded-xl w-1/3 items-center justify-center shadow-lg ${className}
      ${dark ? 'bg-gray-800' : 'bg-gray-100'}
    `}
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
  </View>
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
  <View className="mt-8 px-4">
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

const DeliveryHubScreen: React.FC = () => {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
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
                Delivery Hub
              </Text>
              <Text
                className={`font-semibold text-sm ${
                  dark ? 'text-green-400' : 'text-green-600'
                }`}
              >
                Status: Active
              </Text>
            </View>
          </View>

          <TouchableOpacity className="p-2">
            <ArrowRight size={24} color={dark ? '#f87171' : '#dc2626'} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="p-4">
          <View className="flex-row justify-between space-x-3">
            <StatusCard
              icon={<Truck size={28} color={dark ? '#4ade80' : '#16a34a'} />}
              value="0"
              label="Active"
              dark={dark}
            />

            <StatusCard
              icon={
                <CheckCircle size={28} color={dark ? '#60a5fa' : '#1d4ed8'} />
              }
              value="7"
              label="Completed Today"
              dark={dark}
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
                  Active Tasks (0)
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

            {/* FAB */}
            <View className="items-center mt-8">
              <TouchableOpacity
                className={`w-16 h-16 rounded-full items-center justify-center shadow-2xl ${
                  dark ? 'bg-blue-500' : 'bg-blue-600'
                }`}
              >
                <Plus size={32} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <AppDetails
              appId="c_52f99807e097976e_DeliveryAppHome.jsx-438"
              userId="05915764922349435223"
              dbStatus="Connected"
              dark={dark}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryHubScreen;
