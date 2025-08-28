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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Install this package if not already

const { height } = Dimensions.get('window');

type buyNowPopupProps = {
  onClose: () => void;
  count: number;
  name: string;
  image: string;
};
type RootStackParamList = {
  BuyNowPopup: {};
  CheckoutScreen: {};
};
type checkOutNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BuyNowPopup'
>;
export default function BuyNowPopup({
  onClose,
  count,
  name,
  image,
}: buyNowPopupProps) {
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
          backgroundColor: 'rgba(0,0,0,0.25)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={closePopup} />
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl p-5 items-center"
        >
          <Image
            source={{ uri: `${API_BASE_URL}/${image}` }}
            className="w-full h-48 rounded-b-3xl mb-5"
            resizeMode="cover"
          />
          <Text className="text-lg mb-2">{name}</Text>
          <View className="flex-row items-center mb-6">
            <Text className="text-lg font-bold mr-2">Quantity :</Text>
            <Text className="text-lg">{count}</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              closePopup();
              navigation.navigate('CheckoutScreen', {});
            }}
            className="bg-blue-500 px-10 py-3 rounded-full"
          >
            <Text className="text-white text-center">Buy</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}
