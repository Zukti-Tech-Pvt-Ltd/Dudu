import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';

import {
  googleReverseGeocode,
  openMap,
} from '../merchantScreen/availableRider';
import { DeliveryTaskItem } from './deliveryhome';

export const openMapWithPlace = (placeName: string) => {
  const encoded = encodeURIComponent(placeName);
  const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  Linking.openURL(url);
};

export const DeliveryCard = ({
  item,
  dark,
  onPress,
}: {
  item: DeliveryTaskItem;
  dark: boolean;
  onPress?: () => void;
}) => {
  // Dynamic Theme Colors
  const colors = {
    cardBg: dark ? '#262626' : '#F3F4F6', // Neutral 800 vs Gray 100
    textPrimary: dark ? '#FFFFFF' : '#111827',
    textSecondary: dark ? '#9CA3AF' : '#4B5563',
    border: dark ? '#404040' : 'transparent',
    link: dark ? '#60A5FA' : '#2563EB', // Blue 400 vs Blue 600
    ripple: dark ? '#404040' : '#E5E7EB',
  };

  const [pickupAddress, setPickupAddress] = useState<string>('Loading...');

  useEffect(() => {
    const fetchAddresses = async () => {
      const pickup = await googleReverseGeocode(item.pickupLat, item.pickupLng);
      setPickupAddress(pickup);
    };

    fetchAddresses();
  }, []);

  // Status Badge Logic
  const getStatusStyle = () => {
    if (item.status === 'pending') {
      return {
        bg: dark ? '#B45309' : '#FEF3C7', // Yellow 700 vs Yellow 100
        text: dark ? '#FFFFFF' : '#92400E',
      };
    }
    return {
      bg: dark ? '#15803D' : '#DCFCE7', // Green 700 vs Green 100
      text: dark ? '#FFFFFF' : '#166534',
    };
  };

  const statusStyle = getStatusStyle();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.border,
        borderWidth: dark ? 1 : 0,
      }}
      className="rounded-xl p-4 mb-4 shadow-sm"
      android_ripple={{ color: colors.ripple }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          style={{ color: colors.textPrimary }}
          className="font-bold text-lg"
        >
          Delivery #{item.id}
        </Text>

        <View
          style={{ backgroundColor: statusStyle.bg }}
          className="px-3 py-1 rounded-full"
        >
          <Text
            style={{ color: statusStyle.text }}
            className="text-xs font-semibold uppercase"
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="mt-2">
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          Delivery Date
        </Text>
        <Text style={{ color: colors.textPrimary }} className="font-semibold">
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      {/* Pickup */}
      <View className="mt-3">
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          Pickup Address
        </Text>
        <Pressable
          onPress={() => openMap(item.pickupLat, item.pickupLng)}
          className="self-start active:opacity-70"
        >
          <Text
            style={{
              color: colors.textPrimary,
              textDecorationLine: 'underline',
            }}
            className="font-semibold"
          >
            {pickupAddress}
          </Text>
        </Pressable>
      </View>

      {/* Delivery */}
      <View className="mt-3">
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          Delivery Address
        </Text>
        <Pressable
          onPress={() => openMapWithPlace(item.deliveryAddress)}
          className="self-start active:opacity-70"
        >
          <Text
            style={{
              color: colors.textPrimary,
              textDecorationLine: 'underline',
            }}
            className="font-semibold"
          >
            {item.deliveryAddress}
          </Text>
        </Pressable>
      </View>

      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
        <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">
          Merchant Info
        </Text>
        <Text style={{ color: colors.textPrimary }} className="font-semibold">
          {item.__merchant__.username}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          {item.__merchant__.phoneNumber}
        </Text>
      </View>

      {/* Footer */}
      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
        <View>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs mb-1"
          >
            Customer Info
          </Text>
          <Text style={{ color: colors.textPrimary }} className="font-semibold">
            {item.__customer__.username}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            {item.__customer__.phoneNumber}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
