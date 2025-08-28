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
import { getByName, getOne } from '../../api/serviceList/productApi';
import { API_BASE_URL } from '@env';
import { createCart } from '../../api/cartApi';
import BuyNowPopup from '../popUp/buyNowPop';

interface ProductDataType {
  id: number;
  name: string;
  image: string;
  price: number;
  // add other fields as needed
  video?: string;
  category?: string;
  description?: string;
  order?: number;
  rate?: number;
  count?: number;
  type?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

let getItems: () => Promise<ApiResponse<ProductDataType> | null>;
const DetailScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBuyNowPopup, setShowBuyNowPopup] = useState(false);

  const handleShowPopup = () => setShowBuyNowPopup(true);
  const handleClosePopup = () => setShowBuyNowPopup(false);

  const navigation = useNavigation();

  type BottomTabParamsList = {
    product: { productId: number; productName: string; tableName: string };
  };

  type ProductRouteProp = RouteProp<BottomTabParamsList, 'product'>;
  const route = useRoute<ProductRouteProp>();

  const { productId = 0 } = route.params ?? {};
  const { productName = '' } = route.params ?? {};

  const handleAddToCart = async () => {
    const response = await createCart(product.id, quantity);
    if (response.status === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    }
  };
  let getItems: () => Promise<ApiResponse<ProductDataType> | null>;
  console.log('productId', productId);
  if (productId) {
    getItems = async () => {
      try {
        const data = await getOne(productId);
        return data || null;
      } catch (err) {
        console.log(err);
        return null;
      }
    };
    console.log('getItems', getItems);
  } else {
    console.log('productName', productName);
    getItems = async () => {
      try {
        const data = await getByName(productName);
        console.log('dataaaaaaaaaaa', data);
        return data || null;
      } catch (err) {
        console.log(err);
        return null;
      }
    };
  }

  const normalizedImage =
    product && product.image
      ? product.image.startsWith('/')
        ? product.image.slice(1)
        : product.image
      : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const item = await getItems();
      console.log('item', item);
      if (item) {
        setProduct(item.data); // no .data here
      }
      setLoading(false);
    };
    fetchData();
  }, [productId, productName]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-2">Loading...</Text>
        </View>
      ) : product ? (
        <View className="flex-1">
          {/* Back Button */}
          <View className="absolute top-10 left-4 z-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-9 h-9 rounded-full bg-black/10 items-center justify-center"
            >
              <Image
                source={require('../../../assets/navIcons/left-arrow.png')}
                style={{ width: 16, height: 16, tintColor: '#FBBF24' }}
              />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View className="bg-blue-500 h-52 w-full rounded-b-[48px] items-center justify-center relative">
            {normalizedImage && (
              <Image
                source={{ uri: `${API_BASE_URL}/${product.image}` }}
                className="absolute top-0 left-0 w-full h-full rounded-b-[48px]"
                resizeMode="cover"
              />
            )}

            {/* Right Icons */}
            <View className="absolute right-5 top-12 flex-row">
              <TouchableOpacity>
                <Image
                  source={require('../../../assets/navIcons/heart.png')}
                  style={{ width: 16, height: 16, tintColor: '#FBBF24' }}
                />
              </TouchableOpacity>
              <TouchableOpacity className="ml-4">
                <Image
                  source={require('../../../assets/navIcons/send.png')}
                  style={{ width: 16, height: 16, tintColor: '#FBBF24' }}
                />
              </TouchableOpacity>
            </View>

            {/* Badge */}
            <View className="bg-green-500 rounded-3xl px-5 py-1.5 absolute -bottom-3">
              <Text className="text-white font-medium text-base">
                100% Organic
              </Text>
            </View>
          </View>

          {/* Content */}
          <View
            className="mt-7 mb-4 mx-2 bg-white rounded-[48px] p-5 shadow-md flex-1"
            style={{
              shadowColor: '#000000', // black shadow color
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, // medium opacity
              shadowRadius: 6, // blur radius
              elevation: 8, // Android shadow elevation
            }}
          >
            <Text className="text-xl font-semibold text-gray-800 mb-2">
              {product.name?.trim()}
            </Text>
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-blue-500">
                ${product.price ?? 0}
              </Text>
            </View>
            {/* Quantity Controls */}
            <View className="flex-row items-center my-3">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-md bg-gray-200 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700">-</Text>
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-medium">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-md bg-gray-200 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700">+</Text>
              </TouchableOpacity>
            </View>
            {/* Description */}
            <Text className="font-bold mt-3 mb-1.5 text-base">Description</Text>
            <Text className="text-gray-600 text-sm mb-5">
              {product.description || 'No description available.'}
            </Text>
          </View>
          <View className="absolute bottom-8 right-5 flex-row">
        <TouchableOpacity
          onPress={handleShowPopup} // Show popup on press
          activeOpacity={0.8}
          className="bg-blue-500 rounded-2xl flex-row items-center px-4 py-2 mr-3 shadow-2xl"
          style={{
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <Text className="text-white font-semibold text-base mr-2">
            Buy Now
          </Text>
          <Image
            source={require('../../../assets/navIcons/check.png')}
            className="w-5 h-5 tint-white"
            style={{ tintColor: 'white' }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddToCart}
          activeOpacity={0.8}
          className="bg-blue-500 rounded-2xl flex-row items-center px-4 py-2 shadow-2xl"
          style={{
            shadowOffset: { width: 0, height: 8 },

            elevation: 10,
          }}
        >
          <Text className="text-white font-semibold text-base mr-2">
            Add to Cart
          </Text>
          <Image
            source={require('../../../assets/navIcons/cart.png')}
            className="w-5 h-5 tint-white"
            style={{ tintColor: 'white' }}
          />
        </TouchableOpacity>
      </View>

      {/* Success Popup */}
      {showSuccess && (
        <View className="absolute top-0 left-0 right-0 bottom-0 flex-1 justify-center items-center z-50">
          <View className="bg-green-600 py-3 px-6 rounded-xl shadow-lg min-w-[150px] max-w-[250px]">
            <Text className="text-white font-semibold text-lg text-center">
              Added to Cart!
            </Text>
          </View>
        </View>
      )}

      {/* Render BuyNowPopup conditionally */}
      {showBuyNowPopup && <BuyNowPopup onClose={handleClosePopup}name={product.name} image={product.image} count={product.count }/>}
        </View>
        
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text>No Product Found</Text>
        </View>
      )}

      
    </SafeAreaView>
  );
};

export default DetailScreen;
