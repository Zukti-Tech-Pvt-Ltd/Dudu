import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDeliveryOrder } from '../../api/deliveryOrderApi';
import { DeliveryCard } from './deliveryCard';
import { DeliveryTaskItem } from './deliveryhome';

type RootStackParamList = {
  ActiveDelivery: undefined;
  CompletedDelivery: undefined;
  DeliveryStatusScreen: { deliveryItem: DeliveryTaskItem };
  DeliveryMapsScreen: undefined;
};

type completedDeliveryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CompletedDelivery'
>;

export default function CompletedDelivery() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<completedDeliveryNavigationProp>();

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#F9FAFB',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    border: isDarkMode ? '#404040' : '#E5E7EB',
    loading: isDarkMode ? '#FFFFFF' : '#333333',
  };

  const [loading, setLoading] = useState(true);
  const [deliveryData, setDeliveryData] = useState<DeliveryTaskItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDeliveryOrder();

      if (response && response.data) {
        // Keep only COMPLETED/DELIVERED deliveries
        const completed = response.data.filter(
          (item: any) => item.status?.toLowerCase() === 'delivered',
        );
        // Sort by newest first
        completed.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setDeliveryData(completed);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      {/* --- HEADER --- */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.screenBg,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}
        >
          Completed Deliveries
        </Text>
      </View>

      {/* --- CONTENT --- */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.loading} />
        </View>
      ) : deliveryData.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -50,
          }}
        >
          <Text style={{ fontSize: 18, color: colors.textSecondary }}>
            No completed deliveries yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {deliveryData.map(item => (
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
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
