import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, Text, FlatList, View, Image, TextInput, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // or your icon library
import { supabase } from '../../supabase/supabase';
import { useRoute, RouteProp } from '@react-navigation/native';

type BottomTabParamList = {
  category: { categoryId: string; categoryName: string };
};

type CategoryRouteProp = RouteProp<BottomTabParamList, 'category'>;

export default function Category() {
  const route = useRoute<CategoryRouteProp>();
  const { categoryId, categoryName } = route.params;
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getItems = async () => {
      setLoading(true);
      let { data: food_products, error } = await supabase
        .from('food_products')
        .select('*')
        .eq('service_id', categoryId);
      setLoading(false);
      setFood(food_products || []);
    };
    getItems();
  }, [categoryId]);

  // Dummy rating data for illustration. Replace with actual rating from your data if possible.
  const getRating = (item: any) => ({ rate: (item.rating || 4.5), count: (item.rating_count || 120) });

const renderItem = ({ item }: { item: any }) => {
  const { rate, count } = getRating(item);
  return (
    <View className="flex-1 bg-white rounded-2xl shadow-md m-2" >
      {/* Product Image */}
      <Image
        source={{ uri: item.image_url }}
        className="w-250 h-24 rounded-t-2xl"
        style={{ resizeMode: 'cover' }}
      />
      {/* Product Info */}
      <View className="p-3 pb-4">
        <Text className="font-semibold text-black text-base mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Icon name="star" size={16} color="#facc15" />
          <Text className="ml-1 text-sm text-black font-medium">{rate}</Text>
          <Text className="ml-1 text-xs text-gray-500">({count})</Text>
        </View>
        <View className="flex-row items-center justify-between mt-auto">
          <Text className="text-blue-600 font-bold text-base">${item.price ?? 'N/A'}</Text>
          <TouchableOpacity className="bg-blue-500 rounded-full p-2">
            <Icon name="plus" size={18} color="#fff" />
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
        <Icon name="magnify" size={22} color="#9ca3af" />
        <TextInput
          className="flex-1 h-10 pl-2 text-base"
          placeholder="Search for products..."
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity>
          <Icon name="filter-variant" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Result Count */}
      <Text className="mx-4 mt-4 mb-2 text-base text-gray-700">{food.length} products found</Text>

      {/* Product Grid */}
      <FlatList
        data={food}
        keyExtractor={item => `prod-${item.id}`}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-2 pb-10"
        columnWrapperClassName="justify-between"
      />
    </SafeAreaView>
  );
}
