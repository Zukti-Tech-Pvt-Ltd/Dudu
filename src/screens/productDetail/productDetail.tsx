import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  Modal,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  getByName,
  getOne,
  getAllImagePerProduct,
} from '../../api/serviceList/productApi';
import { createCart } from '../../api/cartApi';
import BuyNowPopup from '../popUp/buyNowPop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductImageCarousel from './productImageCarousel';
import { AuthContext } from '../../helper/authContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { decodeToken } from '../../api/indexAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProductDataType {
  id: number;
  name: string;
  image: string | any;
  price: number;
  video?: string; // Video URL from API
  category?: string;
  description?: string;
  order?: number;
  rate?: number;
  count?: number;
  userId?: number;
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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isLoggedIn } = useContext(AuthContext);

  const themeIconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const themeBackgroundColor = isDarkMode ? '#171717' : '#f9fafb';

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyNowPopup, setShowBuyNowPopup] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined,
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();

  const { productId = 0, productName = '' } = route.params ?? {};

  const handleShowPopup = () => {
    if (!isLoggedIn) {
      showStatus('error', 'Login Required', 'You must be logged in to purchase items.');
      return;
    }
    setShowBuyNowPopup(true);
  };

  const handleClosePopup = () => setShowBuyNowPopup(false);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      showStatus('error', 'Login Required', 'You must be logged in to add items to your cart.');
      return;
    }

    try {
      const response = await createCart(product.id, quantity);
      if (response.status === 'success') {
        showStatus('success', 'Added to Cart', 'Item added to your cart successfully!');
      } else {
        showStatus('error', 'Error', 'Failed to add item to cart.');
      }
    } catch (error) {
      showStatus('error', 'Error', 'Something went wrong.');
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
      await Share.share({ message, url, title: product.name });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const item = productId ? await getOne(productId) : await getByName(productName);
        await productImagesArray();
        if (item) setProduct(item.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, productName]);

  // --- PREPARE MEDIA ARRAY FOR CAROUSEL ---
  let mediaItems: { type: 'image' | 'video'; url: string }[] = [];

  if (product) {
    // 1. Add Main Image
    if (product.image) {
      mediaItems.push({ type: 'image', url: product.image });
    }

    // 2. Add Video (if it exists)
    if (product.video) {
      mediaItems.push({ type: 'video', url: product.video });
    }

    // 3. Add Gallery Images (excluding the main image if it's duplicated)
    if (productImages.length > 0) {
      const gallery = productImages
        .map(img => img.image)
        .filter(img => img !== product.image)
        .map(img => ({ type: 'image' as const, url: img }));

      mediaItems = [...mediaItems, ...gallery];
    }

    // Fallback if completely empty
    if (mediaItems.length === 0) {
      mediaItems.push({ type: 'image', url: '' }); // Will trigger placeholder
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-neutral-900 -mb-2"
      style={{ flex: 1, backgroundColor: themeBackgroundColor, paddingBottom: insets.bottom || 10 }}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDarkMode ? '#ffffff' : '#007AFF'} />
          <Text className="mt-2 text-gray-800 dark:text-gray-200">Loading...</Text>
        </View>
      ) : product ? (
        <View className="flex-1">
          <View className="absolute top-10 left-4 z-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-9 h-9 rounded-full bg-white/50 dark:bg-neutral-800/50 items-center justify-center"
            >
              <Image
                source={require('../../../assets/navIcons/left-arrow.png')}
                style={{ width: 16, height: 16, tintColor: themeIconColor }}
              />
            </TouchableOpacity>
          </View>

          {/* Pass the new mediaItems array */}
          <ProductImageCarousel mediaItems={mediaItems} />

          <View
            className="mt-7 mb-4 mx-2 bg-white dark:bg-neutral-800 rounded-[48px] p-5 shadow-md flex-1"
            style={{
              shadowColor: isDarkMode ? '#ffffff' : '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.1 : 0.5,
              elevation: 3,
            }}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xl font-semibold text-gray-800 dark:text-white flex-1 mr-2">
                {product.name?.trim()}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={async () => {
                    if (!isLoggedIn) {
                      showStatus('error', 'Login Required', 'You must be logged in to chat.');
                      return;
                    }
                    try {
                      const decoded = await decodeToken();
                      if (decoded && decoded.userId) {
                        navigation.navigate('ChatScreen', {
                          senderId: decoded.userId,
                          receiverId: product.userId,
                          product: { id: product.id, name: product.name, price: product.price, image: product.image },
                        });
                      } else {
                        showStatus('error', 'Auth Error', 'Could not verify identity.');
                      }
                    } catch (error) {
                      showStatus('error', 'Error', 'Something went wrong.');
                    }
                  }}
                  className="mt-1 p-3 mr-4"
                >
                  <Image source={require('../../../assets/navIcons/message.png')} style={{ width: 24, height: 24, tintColor: themeIconColor }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} className="mt-1 p-3">
                  <Image source={require('../../../assets/navIcons/send.png')} style={{ width: 22, height: 22, tintColor: themeIconColor }} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-blue-500 dark:text-blue-400">
                Rs.{product.price ?? 0}
              </Text>
            </View>

            <View className="flex-row items-center my-3">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-md bg-gray-200 dark:bg-neutral-700 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700 dark:text-gray-200">-</Text>
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-medium text-black dark:text-white">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-md bg-gray-200 dark:bg-neutral-700 items-center justify-center"
              >
                <Text className="text-2xl text-gray-700 dark:text-gray-200">+</Text>
              </TouchableOpacity>
            </View>

            <Text className="font-bold mt-3 mb-1.5 text-base text-black dark:text-white">Description</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-5">{product.description || 'No description available.'}</Text>
          </View>

          <View className="absolute bottom-6 left-0 right-0 flex-row items-center px-12">
            <View className="flex-1 flex-row">
              <TouchableOpacity onPress={handleShowPopup} activeOpacity={0.8} className="bg-blue-500 rounded-xl flex-row justify-center items-center h-11 flex-1 shadow-md mr-2" style={{ elevation: 4 }}>
                <Text className="text-white font-bold text-xs mr-1" numberOfLines={1}>Buy Now</Text>
                <Image source={require('../../../assets/navIcons/check.png')} style={{ width: 16, height: 16, tintColor: 'white' }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.8} className="bg-blue-500 rounded-xl flex-row justify-center items-center h-11 flex-1 shadow-md" style={{ elevation: 2 }}>
                <Text className="text-white font-bold text-xs mr-1" numberOfLines={1}>Add to Cart</Text>
                <Image source={require('../../../assets/navIcons/cart.png')} style={{ width: 16, height: 16, tintColor: 'white' }} />
              </TouchableOpacity>
            </View>
          </View>

          {showBuyNowPopup && (
            <BuyNowPopup onClose={handleClosePopup} name={product.name} id={product.id} image={product.image ?? require('../../../assets/images/photo.png')} quantity={quantity} price={product.price} />
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-800 dark:text-white">No Product Found</Text>
        </View>
      )}

      <Modal animationType="fade" transparent={true} visible={statusModal.visible} onRequestClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-xl items-center">
            <View className={`p-4 rounded-full mb-4 ${statusModal.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : statusModal.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
              {statusModal.type === 'success' && <CheckCircle size={32} color="#16a34a" />}
              {statusModal.type === 'error' && <AlertCircle size={32} color="#ef4444" />}
              {statusModal.type === 'info' && <Info size={32} color="#3b82f6" />}
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{statusModal.title}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">{statusModal.message}</Text>
            <TouchableOpacity onPress={() => { setStatusModal(prev => ({ ...prev, visible: false })); if (statusModal.onClose) statusModal.onClose(); }} className={`w-full py-3.5 rounded-2xl ${statusModal.type === 'success' ? 'bg-green-500' : statusModal.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
              <Text className="text-white font-bold text-center text-lg">Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DetailScreen;