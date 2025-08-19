import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getOne } from '../../api/serviceList/productApi';
import { API_BASE_URL } from '@env';

const DetailScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  type BottomTabParamsList = {
    product: { productId: number; productName: string; tableName: string };
  };

  type ProductRouteProp = RouteProp<BottomTabParamsList, 'product'>;
  const route = useRoute<ProductRouteProp>();

  const { productId = 0 } = route.params ?? {};

  const getItems = async () => {
    try {
      console.log('productId', productId);

      const data = await getOne(productId);
      console.log('data', data);
      return data || null;
    } catch (err) {
      console.log(err);
    }
    // const { data, error } = await supabase
    //   .from(tableName)
    //   .select('*')
    //   .eq('id', productId)
    //   .single();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const item = await getItems();
      if (item) {
        setProduct(item.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [productId]);
  console.log('product===============', product);
  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      ) : product ? (
        <View style={{ flex: 1 }}>
          {/* Back Button */}
          <View className="absolute top-10 left-4 z-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-9 h-9 rounded-full bg-black/10 items-center justify-center"
            >
              <Image
                source={require('../../../assets/navIcons/left-arrow.png')}
                className="w-4 h-4 tint-yellow-400"
              />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View className="bg-[#3b82f6] h-52 w-full rounded-b-3xl items-center justify-center relative">
            <Image
              source={{ uri: `${API_BASE_URL}/${product.image}` }}
              className="absolute top-0 left-0 w-full h-full rounded-b-3xl object-cover"
            />

            {/* Right Icons */}
            <View className="absolute right-5 top-12 flex-row">
              <TouchableOpacity>
                <Image
                  source={require('../../../assets/navIcons/heart.png')}
                  className="w-4 h-4 tint-yellow-400"
                />
              </TouchableOpacity>
              <TouchableOpacity className="ml-4">
                <Image
                  source={require('../../../assets/navIcons/send.png')}
                  className="w-4 h-4 tint-yellow-400"
                />
              </TouchableOpacity>
            </View>

            {/* Badge */}
            <View className="bg-[#37c563] rounded-2xl px-5 py-1 absolute -bottom-3 self-center">
              <Text className="text-white font-medium text-base">
                100% Organic
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="mt-10 mx-2 bg-white rounded-2xl p-5 shadow">
            <Text className="text-xl font-semibold text-neutral-800 mb-2">
              {product.name?.trim()}
            </Text>

            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-[#3b82f6]">
                ${product.price ?? 0}
              </Text>
            </View>

            {/* Quantity Controls */}
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

            {/* Description */}
            <Text className="font-bold mt-2 mb-1 text-base">Description</Text>
            <Text className="text-gray-600 text-sm mb-3">
              {product.description || 'No description available.'}
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>No Product Found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DetailScreen;
