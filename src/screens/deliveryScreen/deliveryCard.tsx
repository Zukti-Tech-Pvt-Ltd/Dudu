import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import {
  googleReverseGeocode,
  openMap,
  openMapWithPlace,
} from '../merchantScreen/availableRider';
import { DeliveryTaskItem } from './deliveryhome';

export const DeliveryCard = ({
  item,
  dark,
  onPress,
}: {
  item: DeliveryTaskItem;
  dark: boolean;
  onPress?: () => void;
}) => {
  const [pickupAddress, setPickupAddress] = useState<string>('Loading...');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Loading...');
  useEffect(() => {
    const fetchAddresses = async () => {
      const pickup = await googleReverseGeocode(item.pickupLat, item.pickupLng);
      setPickupAddress(pickup);

      // const delivery = await googleReverseGeocode(
      //   item.deliveryLat,
      //   item.deliveryLng,
      // );
      // setDeliveryAddress(delivery);
    };

    fetchAddresses();
  }, []);
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
      <View className="mt-2">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Delivery Date
        </Text>
        <Text className={`${dark ? 'text-white' : 'text-black'} font-semibold`}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {/* Pickup */}
      <View className="mt-2">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Pickup Address
        </Text>
        <Pressable onPress={() => openMap(item.pickupLat, item.pickupLng)}>
          <Text
            className={`${
              dark ? 'text-white' : 'text-black'
            } font-semibold underline`}
          >
            {pickupAddress}
          </Text>
        </Pressable>
      </View>

      {/* Delivery */}
      <View className="mt-3">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Delivery Address
        </Text>
        <Pressable onPress={() => openMapWithPlace(item.deliveryAddress)}>
          <Text
            className={`${
              dark ? 'text-white' : 'text-black'
            } font-semibold underline`}
          >
            {item.deliveryAddress}
          </Text>
        </Pressable>
      </View>
      <View className="mt-3">
        <Text className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
          Merchant
        </Text>
        <Text
          className={`${dark ? 'text-white' : 'text-black'} font-semibold `}
        >
          {item.__merchant__.username} ({item.__merchant__.phoneNumber})
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
        {/* 
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
            Rs.80
          </Text>
        </View> */}
      </View>
    </Pressable>
  );
};
