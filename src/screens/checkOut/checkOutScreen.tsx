import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Or any icon library

const address = {
  name: 'Chris Hemsworth',
  street: 'R-56, West street, Pennsylvania, USA.',
  mobile: '+96-012 3445 44',
};

const products = [
  {
    id: 1,
    name: "Women's Casual Wear",
    image: require('../../../assets/images/dudu.png'), // Replace with your image asset
    variation: 'Yellow, L',
    rating: 4.8,
    brand: 'US Fashion',
    price: 67,
    oldPrice: 77,
    quantity: 2,
  },
  {
    id: 2,
    name: "Men's Green Jacket",
    image: require('../../../assets/images/dudu.png'),
    variation: 'Green, L',
    rating: 4.8,
    brand: 'US Fashion',
    price: 46,
    oldPrice: 65,
    quantity: 1,
  },

    {
    id: 3,
    name: "Men's Green Jacket",
    image: require('../../../assets/images/dudu.png'),
    variation: 'Green, L',
    rating: 4.8,
    brand: 'US Fashion',
    price: 46,
    oldPrice: 65,
    quantity: 1,
  },
];

export default function CheckoutScreen() {
  const totalPrice = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );
  return (
    <View className="bg-white flex-1 px-4">
      {/* Header */}
      <View className="flex-row items-center py-4">
        <TouchableOpacity>
          {/* <Icon name="arrow-back-ios" size={24} color="#333" /> */}
        </TouchableOpacity>
        <Text className="text-xl font-semibold mx-auto">Checkout</Text>
      </View>

      {/* Delivery Address */}
      <View className="flex-row items-center mb-3 mt-2">
        {/* <Icon name="location-on" size={22} color="#222" style={{ marginRight: 8 }} /> */}
        <Text className="text-lg font-semibold">Delivery Address</Text>
      </View>
      <View className="flex-row mb-5">
        <View className="flex-1 bg-white rounded-lg border border-blue-300 p-3 mr-3">
          <Text className="text-base font-semibold mb-1">Address</Text>
          <Text className="text-sm text-gray-700">{address.name}</Text>
          <Text className="text-sm text-gray-700">{address.street}</Text>
          <Text className="text-sm text-gray-700">{address.mobile}</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-white rounded-lg border border-gray-300 items-center justify-center">
          {/* <Icon name="add" size={28} color="#888" /> */}
        </TouchableOpacity>
      </View>

      {/* Shopping List */}
        <ScrollView className="flex-grow">

      <Text className="text-lg font-semibold mb-3">Shopping List</Text>
      {products.map(product => (
        <View
          key={product.id}
          className="bg-white rounded-xl mb-4 shadow-sm border border-gray-100"
        >
          <View className="flex-row items-center p-3">
            <Image
              source={product.image}
              className="w-20 h-20 rounded-lg mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-base font-bold mb-1">{product.name}</Text>
              <Text className="text-sm text-gray-600 mb-1">
                Variation: {product.variation}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-yellow-500 text-base mr-1">★</Text>
                <Text className="text-base font-medium mr-1">
                  {product.rating}
                </Text>
                <Text className="text-gray-500 text-sm">{product.brand}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-lg text-blue-600 font-bold mr-3">
                  ${product.price.toFixed(2)}
                </Text>
                <Text className="text-base text-gray-400 line-through">
                  ${product.oldPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row justify-between items-center bg-gray-50 px-4 py-2 rounded-b-xl">
            <Text className="text-base font-bold">
              Total ({product.quantity}) :
            </Text>
            <Text className="text-base font-bold">
              ${(product.price * product.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
       </ScrollView>

   <View className="bg-gray-50 px-4 py-6 border-t border-gray-200"> 
  {/* Increased py-6 adds more vertical padding, pushing button up */}
  <View className="flex-row justify-between mb-4">
    <Text className="text-base font-bold">Total Price :</Text>
    <Text className="text-base font-bold">${totalPrice.toFixed(2)}</Text>
  </View>

  <TouchableOpacity
    onPress={() => { /* handler */ }}
    activeOpacity={0.8}
    className="bg-blue-500 rounded-2xl flex-row items-center justify-center px-4 py-3 shadow-2xl w-full"
    style={{ shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
  >
    <Text className="text-white font-semibold text-base mr-2">
      Place Order
    </Text>
    {/* <Image
      source={require('../../../assets/navIcons/check.png')}
      className="w-5 h-5 tint-white"
      style={{ tintColor: 'white' }}
    /> */}
  </TouchableOpacity>
</View>

</View>



  );
}
