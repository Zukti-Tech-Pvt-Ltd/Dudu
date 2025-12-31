// screens/ActiveDeliveries.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useColorScheme } from 'nativewind';
// import { DeliveryCard } from './deliveryhome';
import { getDeliveryOrder } from '../../api/deliveryOrderApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeliveryCard } from './deliveryCard';

export default function CompletedDelivery() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets(); // detects notch + gesture area space
  const isDarkMode = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [deliveryData, setDeliveryData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDeliveryOrder();

      if (response && response.data) {
        // Keep only ACTIVE deliveries
        const active = response.data.filter(
          (item: any) => item.status?.toLowerCase() === 'delivered',
        );

        setDeliveryData(active);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
        paddingBottom: insets.bottom || 10, // ensures content never goes behind navbar
      }}
    >
      {/* --- START OF ADDED HEADER --- */}
      <View
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: insets.top + 10 }} // add safe area inset + extra spacing
      >
        <Text
          className={`text-2xl font-bold ${
            dark ? 'text-white' : 'text-gray-800'
          }`}
        >
          Completed Deliveries
        </Text>
      </View>
      {/* --- END OF ADDED HEADER --- */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={dark ? '#fff' : '#333'}
          className="mt-20"
        />
      ) : deliveryData.length === 0 ? (
        <View className="items-center justify-center mt-20">
          <Text
            className={`${dark ? 'text-gray-300' : 'text-gray-700'} text-lg`}
          >
            No active deliveries assigned.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        >
          {deliveryData.map((item: any) => (
            <DeliveryCard key={item.id} item={item} dark={dark} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
