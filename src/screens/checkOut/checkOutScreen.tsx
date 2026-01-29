import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  useColorScheme, // Import useColorScheme
} from 'react-native';
import { getMultiple } from '../../api/serviceList/productApi';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import PaymentMethodScreen from '../payment/paymentScreen'; // Unused import
import { createOrder } from '../../api/orderApi';
import { decodeToken } from '../../api/indexAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUser } from '../../api/userApi';

type RootStackParamList = {
  CheckoutScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
  };
  PaymentMethodScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
  // other screens...
};

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'CheckoutScreen'>;

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeBackgroundColor = isDarkMode ? '#171717' : '#f9fafb';
  const themeTextColor = isDarkMode ? '#FFFFFF' : '#000000';
  const themeIconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const placeholderColor = isDarkMode ? '#9ca3af' : '#999';

  const route = useRoute<CheckoutScreenRouteProp>();
  // const [claim, setClaim] = useState<Record<string, any> | null>(null); // Unused
  const [buttonLoading, setButtonLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const { selectedItems } = route.params;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const selectedIds = selectedItems.map(item => item.id);

  useEffect(() => {
    const fetchToken = async () => {
      const decoded = await decodeToken();
      const userData = await getUser(decoded!.userId);
      setUsername(userData.data.username);
      setEmail(userData.data.email);
      setPhone(userData.data.phoneNumber);
      setAddress(userData.data.address);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchProductForCheckOut = async () => {
      try {
        setLoading(true);
        const productData = await getMultiple(selectedIds);
        setProducts(productData.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductForCheckOut();
  }, [selectedItems]);

  const totalPrice = products.reduce((sum, product) => {
    const selectedItem = selectedItems.find(
      item => Number(item.id) === Number(product.id),
    );
    const quantity = selectedItem ? selectedItem.quantity : 1;
    const totprice = sum + product.price * quantity;
    return totprice;
  }, 0);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#ffffff' : '#0000ff'}
        />
      </View>
    );

  return (
    <SafeAreaView
      className="bg-white dark:bg-neutral-900 flex-1"
      style={{
        flex: 1,
        backgroundColor: themeBackgroundColor,
        paddingBottom: insets.bottom || 10,
      }}
    >
      {/* Header */}
      <View
        className="bg-white dark:bg-neutral-900 py-4 px-4 flex-row items-center"
        style={{
          shadowColor: isDarkMode ? '#000' : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0 : 0.3, // Remove header shadow in dark mode for cleaner look
          shadowRadius: 5,
          elevation: isDarkMode ? 0 : 8,
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: '#262626',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 mt-4 -ml-3 items-center justify-center"
        >
          <Image
            source={require('../../../assets/navIcons/left-arrow.png')}
            style={{ width: 16, height: 16, tintColor: themeIconColor }}
          />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-1 mt-4 text-black dark:text-white">
          Checkout
        </Text>
      </View>

      {/* Content ScrollView */}
      <ScrollView className="flex-grow px-2">
        {/* Delivery Address */}
        <View className="px-2 mt-3">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 px-1">
            Delivery Address
          </Text>

          <View className="bg-white dark:bg-neutral-800 rounded-2xl border border-blue-300 dark:border-neutral-700 shadow-sm p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 justify-center items-center mr-3">
                <Image
                  source={require('../../../assets/navIcons/profile.png')}
                  style={{
                    tintColor: isDarkMode ? '#60a5fa' : 'white', // Adjust tint for visibility
                    width: 30,
                    height: 30,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {username || 'Customer'}
              </Text>
            </View>

            <View className="border-t border-gray-200 dark:border-gray-700" />

            <View className="mt-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                <Text className="font-medium text-gray-700 dark:text-gray-300">
                  Phone:{' '}
                </Text>
                {phone || 'N/A'}
              </Text>
              <View className="mt-2">
                <Text className="font-medium text-gray-700 dark:text-gray-300">
                  Delivery Address:
                </Text>
                <TextInput
                  value={address || ''}
                  onChangeText={setAddress}
                  placeholder="Enter delivery address"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1 text-gray-800 dark:text-white bg-white dark:bg-neutral-900"
                  placeholderTextColor={placeholderColor}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Shopping List Header */}
        <Text className="text-lg font-semibold mb-3 px-3 mt-4 text-black dark:text-white">
          Shopping List
        </Text>

        {products.map(product => {
          const normalizedImage = product?.image ? product.image : '';

          return (
            <View
              key={product.id}
              className="bg-white dark:bg-neutral-800 rounded-xl mb-2 shadow-sm border border-gray-100 dark:border-neutral-700 mx-1"
            >
              <View className="flex-row items-center p-3">
                <Image
                  source={
                    normalizedImage
                      ? { uri: `${API_BASE_URL}/${normalizedImage}` }
                      : require('../../../assets/images/photo.png')
                  }
                  className="w-20 h-20 rounded-lg mr-4 bg-gray-100 dark:bg-gray-700"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-base font-bold mb-0.1 leading-tight text-black dark:text-white">
                    {product.name}
                  </Text>

                  {(() => {
                    const selectedItem = selectedItems.find(
                      item => Number(item.id) === Number(product.id),
                    );
                    const quantity = selectedItem ? selectedItem.quantity : 1;

                    return (
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                        Quantity:{' '}
                        <Text className="text-base font-bold text-black dark:text-gray-200">
                          {quantity}
                        </Text>
                      </Text>
                    );
                  })()}

                  <View className="flex-row items-center mt-1 mb-0.1">
                    <Text className="text-yellow-500 text-base mr-1">★</Text>
                    <Text className="text-base font-medium mr-1 text-black dark:text-white">
                      {product.rate}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {product.brand}
                    </Text>
                  </View>

                  <Text className="text-lg text-blue-600 dark:text-blue-400 font-bold">
                    Rs. {product.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer / Bottom Section */}
      <View className="bg-gray-50 dark:bg-neutral-900 px-4 py-6 border-t border-gray-200 dark:border-neutral-800">
        <View className="flex-row justify-between mb-4">
          <Text className="text-base font-bold text-black dark:text-white">
            Total Price :
          </Text>
          <Text className="text-base font-bold text-black dark:text-white">
            Rs.{totalPrice.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            try {
              setButtonLoading(true);
              const orderItemsPayload = selectedItems.map(item => {
                return {
                  productId: Number(item.id),
                  price: item.price,
                  quantity: item.quantity,
                };
              });

              const data = await createOrder({
                status: 'Pending',
                deliveryAddress: address!,
                estimatedDeliveryDate: new Date().toISOString(),
                orderItems: orderItemsPayload,
              });

              const orderId = data.data.map((item: any) => item.order.id);

              navigation.navigate('PaymentMethodScreen', {
                selectedItems: selectedItems,
                totalPrice: totalPrice,
                orderId: orderId,
              });
            } catch (err) {
              console.error('Failed to create order', err);
            } finally {
              setButtonLoading(false);
            }
          }}
          activeOpacity={0.8}
          className="bg-blue-500 rounded-2xl flex-row items-center justify-center px-4 py-3 shadow-2xl w-full"
          style={{
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
            shadowColor: '#000',
          }}
        >
          {buttonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base mr-2">
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
