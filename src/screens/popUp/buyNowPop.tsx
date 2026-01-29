import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  useColorScheme, // Import useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

type buyNowPopupProps = {
  onClose: () => void;
  quantity: number;
  name: string;
  id: string;
  image: string;
  price: number;
};

type RootStackParamList = {
  BuyNowPopup: {};
  CheckoutScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
  };
};

type checkOutNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BuyNowPopup'
>;

export default function BuyNowPopup({
  onClose,
  quantity,
  name,
  id,
  image,
  price,
}: buyNowPopupProps) {
  // Detect dark mode
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const slideAnim = useRef(new Animated.Value(height)).current;
  const navigation = useNavigation<checkOutNavigationProp>();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal transparent visible animationType="none">
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)', // Slightly darker for better focus
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={closePopup} />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
          }}
          // Added dark:bg-neutral-800 for the popup background
          className="bg-white dark:bg-neutral-800 rounded-t-3xl p-5 items-center"
        >
          <Image
            source={
              image
                ? { uri: `${API_BASE_URL}/${image}` }
                : require('../../../assets/images/photo.png')
            }
            className="w-full h-48 rounded-b-3xl mb-5"
            resizeMode="cover"
          />

          {/* Added dark:text-white */}
          <Text className="text-lg mb-2 font-semibold text-black dark:text-white">
            {name}
          </Text>

          <View className="flex-row items-center mb-6">
            {/* Added dark:text-gray-300 for the label */}
            <Text className="text-lg font-bold mr-2 text-black dark:text-gray-300">
              Quantity :
            </Text>
            {/* Added dark:text-white for the value */}
            <Text className="text-lg text-black dark:text-white">
              {quantity}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              closePopup();
              navigation.navigate('CheckoutScreen', {
                selectedItems: [
                  {
                    id: id,
                    quantity: quantity,
                    price: price,
                  },
                ],
              });
            }}
            className="bg-blue-500 px-10 py-3 rounded-full shadow-lg"
          >
            <Text className="text-white text-center font-bold text-base">
              Buy
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}
