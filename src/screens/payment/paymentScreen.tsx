import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  useColorScheme, // Import useColorScheme
} from 'react-native';
import { styled } from 'nativewind';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Card = styled(View);
const CardText = styled(Text);
const CardRow = styled(View);

type RootStackParamList = {
  PaymentMethodScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
  ESewaTestPayment: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
  KhaltiPayment: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
};

type checkOutNavigationProp = RouteProp<
  RootStackParamList,
  'PaymentMethodScreen'
>;

export default function PaymentMethodScreen() {
  const insets = useSafeAreaInsets();

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeBackgroundColor = isDarkMode ? '#171717' : '#f9fafb';
  const themeIconColor = isDarkMode ? '#FFFFFF' : undefined; // Tint generic icons white in dark mode

  const route = useRoute<checkOutNavigationProp>();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedItems } = route.params;
  const { totalPrice } = route.params;
  const { orderId } = route.params;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  // console.log('Received selectedItems:', selectedItems); // Commented out to reduce noise
  const selectedIds = selectedItems.map(item => item.id);

  return (
    <SafeAreaView
      // Added dark:bg-neutral-900
      className="flex-1 bg-gray-50 dark:bg-neutral-900"
      style={{
        flex: 1,
        backgroundColor: themeBackgroundColor,
        paddingBottom: insets.bottom || 10,
      }}
    >
      <View className="flex-1 bg-white dark:bg-neutral-900">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-14 pb-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <Text className="text-lg font-semibold text-black dark:text-white">
            Select Payment Method
          </Text>
        </View>

        {/* Payment Methods */}
        <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
          {/* Recommended */}
          <Text className="px-5 pb-2 pt-4 text-sm text-gray-400 dark:text-gray-500 font-medium">
            Recommended methods
          </Text>

          <TouchableOpacity className="bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-1 rounded-xl flex-row items-center shadow-sm">
            <Image
              source={require('../../../assets/navIcons/wallet.png')}
              className="w-7 h-7 mr-4"
              style={{ tintColor: isDarkMode ? 'white' : 'black' }}
            />
            <View className="flex-1">
              <Text className="font-bold text-base text-black dark:text-white">
                Credit/Debit Card
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-400">
                Credit/Debit Card
              </Text>
            </View>
          </TouchableOpacity>

          {/* Other Payment Methods */}
          <Text className="px-5 pb-2 pt-6 text-sm text-gray-400 dark:text-gray-500 font-medium">
            Other Payment Methods
          </Text>

          {/* Khalti by IME */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('KhaltiPayment', {
                selectedItems: selectedItems,
                totalPrice: totalPrice,
                orderId: orderId,
              })
            }
            className="bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-1 rounded-xl flex-row items-center border border-gray-200 dark:border-neutral-700 shadow-sm"
          >
            <Image
              source={require('../../../assets/images/khalti.png')}
              className="w-7 h-7 mr-4"
              resizeMode="contain"
              // Logos usually don't need tinting, but verify if your logo has a transparent background
            />
            <View className="flex-1">
              <Text className="font-bold text-base text-black dark:text-white">
                Khalti by IME
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-400">
                Mobile Wallet
              </Text>
            </View>
            <Text className="text-gray-300 dark:text-gray-600">{'>'}</Text>
          </TouchableOpacity>

          {/* eSewa */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ESewaTestPayment', {
                selectedItems: selectedItems,
                totalPrice: totalPrice,
                orderId: orderId,
              })
            }
            className="bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-1 rounded-xl flex-row items-center border border-gray-200 dark:border-neutral-700 shadow-sm"
          >
            <Image
              source={require('../../../assets/images/esewa.png')}
              className="w-7 h-7 mr-4"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="font-bold text-base text-black dark:text-white">
                eSewa Mobile Wallet
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-400">
                eSewa Mobile Wallet
              </Text>
            </View>
            <Text className="text-gray-300 dark:text-gray-600">{'>'}</Text>
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity className="bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-1 rounded-xl flex-row items-center border border-gray-200 dark:border-neutral-700 shadow-sm">
            <Image
              source={require('../../../assets/images/pay.png')}
              className="w-7 h-7 mr-4"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="font-bold text-base text-black dark:text-white">
                Cash on Delivery
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-400">
                Cash on Delivery
              </Text>
            </View>
            <Text className="text-gray-300 dark:text-gray-600">{'>'}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Section */}
        <View className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
          {/* Subtotal */}
          <View className="flex-row justify-between items-center px-5 py-3 mt-2">
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              Subtotal
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-300">
              Rs. {totalPrice}
            </Text>
          </View>

          {/* Total */}
          <View className="flex-row justify-between items-center px-5 pb-6">
            <Text className="font-bold text-base text-gray-800 dark:text-white">
              Total Amount
            </Text>
            <Text className="font-bold text-base text-orange-400 dark:text-orange-400">
              Rs.{totalPrice}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
