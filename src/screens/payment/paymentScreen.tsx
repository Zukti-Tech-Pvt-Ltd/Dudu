import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Card = styled(View);
const CardText = styled(Text);
const CardRow = styled(View);
type RootStackParamList = {
  PaymentMethodScreen: { selectedItems: { id: string; quantity: number,price: number }[],totalPrice: number };
    ESewaTestPayment: { selectedItems: { id: string; quantity: number,price: number }[],totalPrice: number };
    KhaltiPayment: { selectedItems: { id: string; quantity: number,price: number }[],totalPrice: number };

};
type checkOutNavigationProp = RouteProp<
  RootStackParamList,
  'PaymentMethodScreen'
>;
export default function PaymentMethodScreen() {
      const insets = useSafeAreaInsets();

    const route = useRoute<checkOutNavigationProp>();
  
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const { selectedItems } = route.params;
      const { totalPrice } = route.params;
        const [loading, setLoading] = useState(false);
        const [products, setProducts] = useState<any[]>([]);
        console.log('Received selectedItems:', selectedItems);
        const selectedIds = selectedItems.map(item => item.id);
    
  return (
    <SafeAreaView
    
      style={{
        flex: 1,
        backgroundColor: '#f9fafb', 
        paddingBottom: insets.bottom || 10, // ensures content never goes behind navbar
      }}
    >
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-6 pb-4 border-b border-gray-200 bg-white">
        <Text className="text-lg font-semibold text-black">
          Select Payment Method
        </Text>
        <TouchableOpacity>
          <Text className="text-2xl text-gray-400">×</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View className="bg-blue-100 px-5 py-3 mx-5 my-3 rounded flex-row items-start">
        <View className="w-2 h-2 bg-blue-600 rounded-full mt-1 mr-2" />
        <Text className="text-xs text-blue-700 flex-1">
          Ensure you have collected the payment voucher to get Bank and Wallet
          Discounts. 0% EMI available on selected bank partners.
        </Text>
      </View>

      {/* Payment Methods */}
      <ScrollView className="flex-1">
        {/* Recommended */}
        <Text className="px-5 pb-2 pt-2 text-sm text-gray-400 font-medium">
          Recommended methods
        </Text>
        <TouchableOpacity className="bg-gray-50 px-5 py-4 mx-4 my-1 rounded flex-row items-center">
          <Image
            source={require('../../../assets/navIcons/wallet.png')}
            className="w-7 h-7 mr-4"
          />
          <View className="flex-1">
            <Text className="font-bold text-base text-black">
              Credit/Debit Card
            </Text>
            <Text className="text-xs text-gray-400">Credit/Debit Card</Text>
          </View>
        </TouchableOpacity>

        {/* Other Payment Methods */}
        <Text className="px-5 pb-2 pt-4 text-sm text-gray-400 font-medium">
          Other Payment Methods
        </Text>

        {/* Khalti by IME */}
        <TouchableOpacity 
                  onPress={() => navigation.navigate('KhaltiPayment',{
                    selectedItems: selectedItems,
                    totalPrice: totalPrice
                  })}

        className="bg-white px-5 py-4 mx-4 my-1 rounded flex-row items-center border border-gray-200">
          
          <Image
            source={require('../../../assets/images/khalti.png')}
            className="w-7 h-7 mr-4"
          />
          <View className="flex-1">
            <Text className="font-bold text-base text-black">
              Khalti by IME
            </Text>
            <Text className="text-xs text-gray-400">Mobile Wallet</Text>
          </View>
          <Text className="text-gray-300">{'>'}</Text>
        </TouchableOpacity>

        {/* eSewa */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ESewaTestPayment',{
                    selectedItems: selectedItems,
                    totalPrice: totalPrice
                  })}
          className="bg-white px-5 py-4 mx-4 my-1 rounded flex-row items-center border border-gray-200"
        >
          <Image
            source={require('../../../assets/images/esewa.png')}
            className="w-7 h-7 mr-4"
          />
          <View className="flex-1">
            <Text className="font-bold text-base text-black">
              eSewa Mobile Wallet
            </Text>
            <Text className="text-xs text-gray-400">eSewa Mobile Wallet</Text>
          </View>
          <Text className="text-gray-300">{'>'}</Text>
        </TouchableOpacity>

        {/* Cash on Delivery */}
        <TouchableOpacity className="bg-white px-5 py-4 mx-4 my-1 rounded flex-row items-center border border-gray-200">
          <Image
            source={require('../../../assets/images/pay.png')}
            className="w-7 h-7 mr-4"
          />
          <View className="flex-1">
            <Text className="font-bold text-base text-black">
              Cash on Delivery
            </Text>
            <Text className="text-xs text-gray-400">Cash on Delivery</Text>
          </View>
          <Text className="text-gray-300">{'>'}</Text>
        </TouchableOpacity>

        {/* Gateway Icons */}
        {/* <View className="flex-row justify-center items-center mt-5">
          <Image source={require('../../../assets/navIcons/wallet.png')} className="w-8 h-3 mr-3" />
          <Image source={require('../../../assets/navIcons/wallet.png')} className="w-7 h-3 mr-3" />
          <Image source={require('../../../assets/navIcons/wallet.png')} className="w-8 h-3 mr-3" />
          <Image source={require('../../../assets/navIcons/wallet.png')} className="w-9 h-3" />
        </View> */}
      </ScrollView>

      {/* Subtotal/Total */}
      <View className="flex-row justify-between items-center border-t border-gray-200 px-5 py-3 mt-4">
        <Text className="text-sm text-gray-400">Subtotal</Text>
        <Text className="text-sm text-gray-400">Rs. {totalPrice}</Text>
      </View>
      <View className="flex-row justify-between items-center px-5 pb-6">
        <Text className="font-bold text-base text-gray-800">Total Amount</Text>
        <Text className="font-bold text-base text-orange-400">Rs.{totalPrice}</Text>
      </View>
    </View>
    </SafeAreaView>
  );
}
