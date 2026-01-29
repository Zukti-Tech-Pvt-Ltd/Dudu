import { API_BASE_URL } from '@env';
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function OrderItemRow({ item }: any) {
  // console.log('item', item);

  const normalizedImage = item.__product__?.image?.startsWith('/')
    ? item.__product__.image.slice(1)
    : item.__product__?.image || '';

  const imageUri = `${API_BASE_URL}/${normalizedImage}`;

  return (
    <View className="flex-row items-center my-1.5">
      <Image
        source={{ uri: imageUri }}
        // Added background color so transparent images are visible in dark mode
        className="w-[55px] h-[55px] mr-3 rounded-md bg-gray-50 dark:bg-neutral-700"
        resizeMode="contain"
      />

      <View className="flex-1 flex-col">
        {/* Product Name / ID */}
        <Text className="text-base mb-0.5 shrink text-gray-900 dark:text-gray-100">
          {item.__product__?.name
            ? item.__product__.name
            : `Product #${item.__product__.id}`}
        </Text>

        <View className="flex-row justify-between w-full">
          {/* Quantity */}
          <Text className="text-[15px] text-gray-600 dark:text-gray-400">
            Qty: {item.quantity}
          </Text>

          {/* Price */}
          <Text className="text-[15px] font-bold text-black dark:text-white">
            Rs:{item.price}
          </Text>
        </View>
      </View>
    </View>
  );
}
