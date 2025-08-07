import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // or your icon library
import { supabase } from '../../supabase/supabase';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { getRandomProducts } from '../api/homeApi';

type BottomTabParamList = {
  category: { categoryId: string; categoryName: string };
};

type CategoryRouteProp = RouteProp<BottomTabParamList, 'category'>;

export default function Category() {
  const route = useRoute<CategoryRouteProp>();
  const { categoryId, categoryName } = route.params;
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<FlatList<any>>(null);
  const [selected, setSelected] = useState('All');
  const [name, setName] = useState(categoryName);

  const filters = [
    { label: 'All' },
    { label: 'Food' },
    { label: 'Job' },
    { label: 'Delivery' },
    { label: 'Home' },
    { label: 'Buy/Sell' },

    { label: 'Li Ha Moto' },

    { label: 'Shop' },

    { label: 'Games' },
  ];
  useFocusEffect(
    React.useCallback(() => {
      // Reset scroll to top when screen is focused
      scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, []),
  );
  console.log("categoryName",categoryName)
  console.log("categoryId",categoryId)

  const getItems = async () => {
  let { data, error } = await supabase
    .from(categoryName)
    .select('*')
    // .eq('service_id', categoryId);
  if (error) {
    console.log('Supabase error:', error);
    return [];
  }
  return data || [];
};

  useEffect(() => {
    setLoading(true);

    if (categoryName=='category') {
      getRandomProducts()
        .then(res => {setFood(res);setLoading(false)})
        .finally(() => setLoading(false));
    } else
      getItems()
        .then(res => {setFood(res);setLoading(false)})
        .finally(() => setLoading(false));
    // }
        console.log('========services  =======', food);

  }, [categoryId, categoryName]);

  // Dummy rating data for illustration. Replace with actual rating from your data if possible.

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View className="flex-1 bg-white rounded-2xl shadow-md m-2">
        {/* Product Image */}
        <Image
          source={{ uri: item.image_url }}
          className="w-250 h-24 rounded-t-2xl"
          style={{ resizeMode: 'cover' }}
        />
        {/* Product Info */}
        <View className="p-3 pb-4">
          <Text
            className="font-semibold text-black text-base mb-1"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center mb-2">
            <Image
              source={require('../../assets/navIcons/star.png')}
              className="w-4 h-4 tint-yellow-400"
            />
            <Text className="ml-1 text-sm text-black font-medium">
              {item.rate}
            </Text>
            <Text className="ml-1 text-xs text-gray-500">({item.count})</Text>
          </View>
          <View className="flex-row items-center justify-between mt-auto">
            <Text className="text-blue-600 font-bold text-base">
              ${item.price ?? 'N/A'}
            </Text>
            <TouchableOpacity className="bg-blue-500 rounded-full p-2">
              {/* <Icon name="plus" size={18} color="#fff" /> */}
              <Image
                source={require('../../assets/navIcons/plus.png')}
                className="w-3 h-3 tint-yellow-400"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Top search/filter + products found
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Search Bar, can be made interactive if needed */}
      <View className="flex-row items-center mt-4 mx-4 bg-white rounded-xl px-4">
        <Image
          source={require('../../assets/navIcons/search.png')}
          className="w-4 h-4 tint-yellow-400"
        />
        <TextInput
          className="flex-1 h-10 pl-2 text-base"
          placeholder="Search for products..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-3 mt-4 mb-1 text-gray-700"
        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {filters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelected(filter.label)}
            className={`px-6 h-9 mr-2 rounded-full flex items-center justify-center ${
              selected === filter.label
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Text
              className={`font-medium ${
                selected === filter.label ? 'text-white' : 'text-gray-600'
              }text-lg mb-[-1px]`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <FlatList
        ref={scrollRef}
        data={food}
        keyExtractor={item => `prod-${item.id}`}
        renderItem={renderItem}
        numColumns={2}
        contentContainerClassName="px-2 pb-10"
        columnWrapperClassName="justify-between"
      />
    </SafeAreaView>
  );
}
