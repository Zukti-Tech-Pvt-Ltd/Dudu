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
} from 'react-native';
import { getMultiple } from '../../api/serviceList/productApi';
import { API_BASE_URL } from '@env';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Or any icon library
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import PaymentMethodScreen from '../payment/paymentScreen';
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
  };
  // other screens...
};

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'CheckoutScreen'>;
export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const route = useRoute<CheckoutScreenRouteProp>();
  const [claim, setClaim] = useState<Record<string, any> | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const { selectedItems } = route.params;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  console.log('Received selectedItems:', selectedItems);
  const selectedIds = selectedItems.map(item => item.id);
  useEffect(() => {
    const fetchToken = async () => {
      const decoded = await decodeToken();
      console.log('decoded=============', decoded);
      const userData = await getUser(decoded!.userId);
      console.log('userData', userData);

      console.log('userData', userData);
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

        console.log('selectedIds', selectedIds);

        const productData = await getMultiple(selectedIds);
        console.log('Products fetched for checkout:', productData);
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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <SafeAreaView
      className="bg-white flex-1 "
      style={{
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingBottom: insets.bottom || 10,
      }}
    >
      {/* Header */}
      <View
        className="bg-white py-4 px-4  flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 mt-4 -ml-3  items-center justify-center"
        >
          <Image
            source={require('../../../assets/navIcons/left-arrow.png')}
            style={{ width: 16, height: 16, tintColor: '#000000' }}
          />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-1 mt-4 text-black">
          Checkout
        </Text>
      </View>

      {/* Delivery Address */}
      <View className="px-4 mt-3">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Delivery Address
        </Text>

        <View className="bg-white rounded-2xl border border-blue-300 shadow-sm p-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mr-3">
              <Image
                source={require('../../../assets/navIcons/profile.png')}
                style={{
                  tintColor: 'white',
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
              />{' '}
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {username || 'Customer'}
            </Text>
          </View>

          <View className="border-t border-gray-200" />

          <View className="mt-1">
            <Text className="text-sm text-gray-600 mb-1">
              <Text className="font-medium text-gray-700">Address: </Text>
              {address || 'Not provided'}
            </Text>
            <Text className="text-sm text-gray-600">
              <Text className="font-medium text-gray-700">Phone: </Text>
              {phone || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Shopping List */}
      <ScrollView className="flex-grow px-2">
        <Text className="text-lg font-semibold mb-3 px-3">Shopping List</Text>
        {products.map(product => {
          const normalizedImage =
            product && product.image
              ? product.image.startsWith('/')
                ? product.image.slice(1)
                : product.image
              : null;
          return (
            <View
              key={product.id}
              className="bg-white rounded-xl mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center p-3">
                {normalizedImage && (
                  <Image
                    source={{ uri: `${API_BASE_URL}/${product.image}` }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-base font-bold mb-1">
                    {product.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    Variation: {product.variation}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-yellow-500 text-base mr-1">★</Text>
                    <Text className="text-base font-medium mr-1">
                      {product.rate}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {product.brand}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-lg text-blue-600 font-bold mr-3">
                      ${product.price.toFixed(2)}
                    </Text>
                    {/* <Text className="text-base text-gray-400 line-through">
                  ${product.oldPrice.toFixed(2)}
                </Text> */}
                  </View>
                </View>
              </View>
              <View className="flex-row justify-between items-center bg-gray-50 px-4 py-2 rounded-b-xl">
                {(() => {
                  const selectedItem = selectedItems.find(
                    item => Number(item.id) === Number(product.id),
                  );
                  const quantity = selectedItem ? selectedItem.quantity : 1;

                  return (
                    <>
                      <Text className="text-base font-bold">
                        Total ({quantity}) :
                      </Text>
                      <Text className="text-base font-bold">
                        ${(product.price * quantity).toFixed(2)}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="bg-gray-50 px-4 py-6 border-t border-gray-200">
        {/* Increased py-6 adds more vertical padding, pushing button up */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-base font-bold">Total Price :</Text>
          <Text className="text-base font-bold">${totalPrice.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            try {
              setButtonLoading(true); // Start loading
              console.log('Creating order with items:', selectedItems);

              const orderItemsPayload = selectedItems.map(item => {
                // const product = products.find(
                //   p => Number(p.id) === Number(item.id),
                // );
                // console.log('Matching product for item:', item, product);

                return {
                  productId: Number(item.id),
                  price: item.price, // Fallback to 0 if product not found
                  quantity: item.quantity,
                };
              });
              await createOrder({
                status: 'Pending',
                price: totalPrice,
                estimatedDeliveryDate: new Date().toISOString(),
                orderItems: orderItemsPayload,
              });

              navigation.navigate('PaymentMethodScreen', {
                selectedItems: selectedItems,
                totalPrice: totalPrice,
              }); // ✅ correct navigation
            } catch (err) {
              console.log(API_BASE_URL);
              console.error('Failed to create order', err);
            } finally {
              setButtonLoading(false); // Stop loading
            }
          }}
          activeOpacity={0.8}
          className="bg-blue-500 rounded-2xl flex-row items-center justify-center px-4 py-3 shadow-2xl w-full"
          style={{ shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
        >
          {buttonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base mr-2">
              Place Order
            </Text>
          )}
          {/* <Image
      source={require('../../../assets/navIcons/check.png')}
      className="w-5 h-5 tint-white"
      style={{ tintColor: 'white' }}
    /> */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
