import { API_BASE_URL } from '@env';
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function OrderItemRow({ item }: any) {
  const isDeleted = item.__product__?.isDeleted || item.isProductDeleted;

  const normalizedImage = item.__product__?.image?.startsWith('/')
    ? item.__product__.image.slice(1)
    : item.__product__?.image || '';

  const imageUri = `${API_BASE_URL}/${normalizedImage}`;

  return (
    <View className="flex-row items-center my-1.5">
      <View>
        <Image
          source={{ uri: imageUri }}
          className={`w-[55px] h-[55px] mr-3 rounded-md bg-gray-50 dark:bg-neutral-700 ${
            isDeleted ? 'opacity-40' : ''
          }`}
          resizeMode="contain"
        />
        {/* Not Available Overlay on Image */}
        {isDeleted && (
          <View className="absolute top-0 left-0 right-3 bottom-0 justify-center items-center">
            <View className="bg-red-600 px-1 rounded">
              {/* <Text className="text-[8px] text-white font-bold">
                UNAVAILABLE
              </Text> */}
            </View>
          </View>
        )}
      </View>

      <View className="flex-1 flex-col">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-base mb-0.5 shrink font-medium ${
              isDeleted
                ? 'text-gray-400 line-through'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {item.__product__?.name || `Product #${item.productId}`}
          </Text>

          {/* Status Badge */}
          {isDeleted && (
            <Text className="text-[10px] font-bold text-red-500 ml-2">
              Item Deleted
            </Text>
          )}
        </View>

        <View className="flex-row justify-between w-full">
          <Text className="text-[15px] text-gray-600 dark:text-gray-400">
            Qty: {item.quantity}
          </Text>

          <Text className="text-[15px] font-bold text-black dark:text-white">
            Rs:{item.price}
          </Text>
        </View>
      </View>
    </View>
  );
}
