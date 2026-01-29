import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  getByName,
  getOne,
  getAllImagePerProduct,
} from '../../api/serviceList/productApi';
// import { API_BASE_URL } from '@env'; // Uncomment if needed
import { createCart } from '../../api/cartApi';
import BuyNowPopup from '../popUp/buyNowPop';
import { Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductImageCarousel from './productImageCarousel';

interface ProductDataType {
  id: number;
  name: string;
  image: string | any;
  price: number;
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
export type ProductImage = { id: number; image: string; productId: number };

const DetailScreen = () => {
  const insets = useSafeAreaInsets();
  // const screenWidth = Dimensions.get('window').width; // Unused
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic colors for inline styles that NativeWind might miss (like Image tintColor)
  const themeIconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const themeBackgroundColor = isDarkMode ? '#171717' : '#f9fafb'; // neutral-900 vs gray-50

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBuyNowPopup, setShowBuyNowPopup] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const handleShowPopup = () => setShowBuyNowPopup(true);
  const handleClosePopup = () => setShowBuyNowPopup(false);

  const navigation = useNavigation();

  type DetailTabParamsList = {
    product: { productId: number; productName: string; tableName: string };
  };

  type DetailScreenRouteProp = RouteProp<DetailTabParamsList, 'product'>;
  const route = useRoute<DetailScreenRouteProp>();

  const { productId = 0 } = route.params ?? {};
  const { productName = '' } = route.params ?? {};

  const handleAddToCart = async () => {
    const response = await createCart(product.id, quantity);
    if (response.status === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    }
  };

  const productImagesArray = async () => {
    if (productId) {
      const res = await getAllImagePerProduct(productId);
      if (res?.status === 'success' && Array.isArray(res.data)) {
        setProductImages(res.data);
      } else {
        setProductImages([]);
      }
    }
  };

  const handleShare = async () => {
    try {
      const url = `https://dudusoftware.com/services/${product.category}/${product.id}`;
      const message = `Check out this product: ${product.name}\n${url}`;
      const result = await Share.share({
        message,
        url,
        title: product.name,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type
        } else {
          // shared successfully
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  let getItems: () => Promise<ApiResponse<ProductDataType> | null>;

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
  } else {
    getItems = async () => {
      try {
        const data = await getByName(productName);
        return data || null;
      } catch (err) {
        console.log(err);
        return null;
      }
    };
  }

  // const normalizedImage = product?.image ? product.image : ''; // Unused

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const item = await getItems();
      await productImagesArray();

      if (item) {
        setProduct(item.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [productId, productName]);

  const galleryImages = productImages
    ? productImages.map(img => img.image).filter(img => img !== product?.image)
    : [];

  const allImages = product ? [product.image, ...galleryImages] : [];

  return (
    <SafeAreaView
      // Added dark:bg-neutral-900 for dark mode background
      className="flex-1 bg-gray-50 dark:bg-neutral-900 -mb-2"
      style={{
        flex: 1,
        // Using dynamic variable for inline background style to match className
        backgroundColor: themeBackgroundColor,
        paddingBottom: insets.bottom || 10,
      }}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDarkMode ? '#ffffff' : '#007AFF'}
          />
          <Text className="mt-2 text-gray-800 dark:text-gray-200">
            Loading...
          </Text>
        </View>
      ) : product ? (
        <View className="flex-1">
          {/* Back Button */}
          <View className="absolute top-10 left-4 z-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              // Added dark:bg-neutral-800/50
              className="w-9 h-9 rounded-full bg-white/50 dark:bg-neutral-800/50 items-center justify-center"
            >
              <Image
                source={require('../../../assets/navIcons/left-arrow.png')}
                // Dynamic tint color
                style={{ width: 16, height: 16, tintColor: themeIconColor }}
              />
            </TouchableOpacity>
          </View>

          <ProductImageCarousel allImages={allImages} />

          {/* Content Container */}
          <View
            // bg-white -> dark:bg-neutral-800 (Card color)
            className="mt-7 mb-4 mx-2 bg-white dark:bg-neutral-800 rounded-[48px] p-5 shadow-md flex-1"
            style={{
              shadowColor: isDarkMode ? '#ffffff' : '#000000', // Subtler shadow in dark mode
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.1 : 0.5,
              elevation: 3,
            }}
          >
            {/* Product Name */}
            <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {product.name?.trim()}
            </Text>

            {/* Right Icons */}
            <View className="absolute right-8 top-12 flex-row">
              {/* Like Button (Commented out in original) */}
              {/* <TouchableOpacity>
                <Image
                  source={require('../../../assets/navIcons/heart.png')}
                  style={{ width: 20, height: 20, tintColor: themeIconColor }}
                />
              </TouchableOpacity> */}

              <TouchableOpacity onPress={handleShare} className="ml-7">
                <Image
                  source={require('../../../assets/navIcons/send.png')}
                  style={{ width: 20, height: 20, tintColor: themeIconColor }}
                />
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-blue-500 dark:text-blue-400">
                Rs.{product.price ?? 0}
              </Text>
            </View>

            {/* Quantity Controls */}
            <View className="flex-row items-center my-3">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                // bg-gray-200 -> dark:bg-neutral-700
                className="w-8 h-8 rounded-md bg-gray-200 dark:bg-neutral-700 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700 dark:text-gray-200">
                  -
                </Text>
              </TouchableOpacity>

              <Text className="mx-4 text-lg font-medium text-black dark:text-white">
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-md bg-gray-200 dark:bg-neutral-700 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700 dark:text-gray-200">
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text className="font-bold mt-3 mb-1.5 text-base text-black dark:text-white">
              Description
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-5">
              {product.description || 'No description available.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="absolute bottom-8 right-5 flex-row">
            <TouchableOpacity
              onPress={handleShowPopup}
              activeOpacity={0.8}
              className="bg-blue-500 rounded-2xl flex-row items-center px-4 py-2 mr-3 shadow-2xl"
              style={{
                shadowOffset: { width: 0, height: 8 },
                elevation: 10,
                shadowColor: '#000', // Keep shadow black even in dark mode for buttons
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
                shadowColor: '#000',
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
          {showBuyNowPopup && (
            <BuyNowPopup
              onClose={handleClosePopup}
              name={product.name}
              id={product.id}
              image={
                product.image ?? require('../../../assets/images/photo.png')
              }
              quantity={quantity}
              price={product.price}
            />
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-800 dark:text-white">
            No Product Found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DetailScreen;
