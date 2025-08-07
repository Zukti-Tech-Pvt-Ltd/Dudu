import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Route, RouteProp, useNavigation, useRoute } from "@react-navigation/native";

const DetailScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation();

  type BottomTabParamsList={
    product:{productId:string;productName:string}
  }

  type ProductRouteProp=RouteProp<BottomTabParamsList,'product'>
    const route = useRoute<ProductRouteProp>();
  
    const { productId = '', productName = '' } = route.params ?? {};

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      <View className="absolute top-10 left-4 z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-black/10 items-center justify-center"
        >
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View className="bg-[#3b82f6] pt-10 pb-5 rounded-b-3xl items-center justify-center relative">
        <Image
          source={{ uri: "https://i.imgur.com/Fm5e22l.png" }}
          className="w-32 h-40 mb-2"
          style={{ resizeMode: "contain" }}
        />

        {/* Right icons */}
        <View className="absolute right-5 top-12 flex-row">
          <TouchableOpacity>
            <Icon name="heart" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="ml-4">
            <Icon name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Organic Badge */}
        <View className="bg-[#37c563] rounded-2xl px-5 py-1 absolute -bottom-3 self-center">
          <Text className="text-white font-medium text-base">100% Organic</Text>
        </View>
      </View>

      {/* Content Card */}
      <View className="mt-10 mx-2 bg-white rounded-2xl p-5 shadow">
        <Text className="text-xl font-semibold text-neutral-800 mb-2">
          Honey Cider (1L)
        </Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-bold text-[#3b82f6]">$180</Text>
          <Text className="ml-2 text-base line-through text-gray-400">$210</Text>
          <View className="bg-yellow-300 rounded px-2 ml-2">
            <Text className="font-medium text-sm text-gray-800">26% off</Text>
          </View>
        </View>
        <View className="flex-row items-center my-3">
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded bg-gray-200 items-center justify-center"
          >
            <Text className="text-xl text-gray-800">-</Text>
          </TouchableOpacity>
          <Text className="mx-4 text-lg font-medium">{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded bg-gray-200 items-center justify-center"
          >
            <Text className="text-xl text-gray-800">+</Text>
          </TouchableOpacity>
        </View>

        <Text className="font-bold mt-2 mb-1 text-base">Description</Text>
        <Text className="text-gray-600 text-sm mb-3">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since.
        </Text>

        {/* Info Grid */}
        <View className="flex-row flex-wrap">
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">Type</Text>
            <Text className="text-base text-gray-800">Yellow honey</Text>
          </View>
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">Weight</Text>
            <Text className="text-base text-gray-800">500gm</Text>
          </View>
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">Organic</Text>
            <Text className="text-base text-green-600 font-bold">✔ Yes</Text>
          </View>
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">Local Bee keeper</Text>
            <Text className="text-base text-green-600 font-bold">✔ Yes</Text>
          </View>
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">Jar Type</Text>
            <Text className="text-base text-gray-800">Plastic</Text>
          </View>
          <View className="w-1/2 my-1">
            <Text className="text-gray-500 font-semibold text-sm">UMF</Text>
            <Text className="text-base text-gray-800">Only forManuka</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default DetailScreen;
