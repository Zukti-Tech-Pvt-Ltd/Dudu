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
  Dimensions,
} from 'react-native';
import { supabase } from '../../supabase/supabase';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { getRandomProducts } from '../api/homeApi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 3) / 2; // Two columns with margin

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

  const filters = [
    { label: 'All' },
    { label: 'Food' },
    { label: 'Li Ha Moto' },
    { label: 'Shop' },
    { label: 'Job' },
    { label: 'Delivery' },
    { label: 'Home' },
    { label: 'Buy/Sell' },
    { label: 'Games' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  const getItems = async () => {
    let { data, error } = await supabase.from(selected).select('*');
    if (error) return [];
    return data || [];
  };

  useEffect(() => {
    setLoading(true);
    if (selected === 'All') {
      getRandomProducts()
        .then((res) => {
          setFood(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      getItems()
        .then((res) => {
          setFood(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [categoryId, categoryName, selected]);

const renderItem = ({ item, index }: { item: any; index: number }) => {
          const isFirstColumn = index % 2 === 0;

    return (

    
    <View
      className="bg-white rounded-2xl mb-2 mr-2"
      style={{
        width: CARD_WIDTH,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#888',
        shadowOpacity: 0.13,
        shadowRadius: 12,
        marginBottom: CARD_MARGIN,
        marginRight: isFirstColumn ? CARD_MARGIN : 0, // space between cols
        marginLeft: isFirstColumn ? 0 : CARD_MARGIN,  // second col: left gap
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{
          width: '100%',
          height: 110,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          resizeMode: 'cover',
        }}
      />
      <View className="px-3 pb-4 pt-3">
        <Text
          className="font-bold text-gray-900 text-base mb-1"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Rating Row */}
        <View className="flex-row items-center mb-1.5">
          <Image
            source={require('../../assets/navIcons/star.png')}
            style={{ width: 16, height: 16, tintColor: '#fcc419' }}
          />
          <Text className="ml-1 text-[13px] font-semibold text-gray-800">
            {item.rate}
          </Text>
          <Text className="ml-1 text-xs text-gray-500">
            ({item.count})
          </Text>
        </View>

        {/* Price + Add button */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[#2563eb] font-bold text-[15px]">
            ${item.price ?? 'N/A'}
          </Text>
          <TouchableOpacity
            className="rounded-full items-center justify-center"
            style={{
              backgroundColor: '#2563eb',
              padding: 7,
            }}
          >
            <Image
              source={require('../../assets/navIcons/plus.png')}
              style={{ width: 16, height: 16, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    )
};

  return (
    <SafeAreaView className="flex-1 bg-[#f3f4f6]">
      {/* Search + Filter */}
      <View className="m-1.5">
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-11">
          <Image
            source={require('../../assets/navIcons/search.png')}
            style={{ width: 16, height: 16, tintColor: '#fcc419' }}
          />
          <TextInput
            className="flex-1 h-10 pl-2 text-[15px]"
            placeholder="Search for products..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filter Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 mb-2 px-0.5"
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {filters.map((filter, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelected(filter.label)}
              className={`px-[18px] h-9 mr-2 rounded-full items-center justify-center ${
                selected === filter.label ? '' : ''
              }`}
              style={{
                backgroundColor:
                  selected === filter.label ? '#2563eb' : '#e0e7ef',
              }}
            >
              <Text
                className="font-medium text-lg"
                style={{
                  color:
                    selected === filter.label ? 'white' : '#374151',
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={scrollRef}
            data={food}
            keyExtractor={(item) => `prod-${item.id}`}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
            }}
            contentContainerStyle={{
  paddingLeft: CARD_MARGIN,   // left padding stays the same
  paddingRight: CARD_MARGIN * , // extra space on the right
}}
            ListEmptyComponent={() => (
              <View className="items-center mt-10">
                <Image
                  source={require('../../assets/navIcons/empty.png')}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                />
                <Text className="text-gray-500 text-base">
                  No products found
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
