import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {
  useRoute,
  RouteProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { getRandomProducts } from '../../api/homeApi';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';
import { getByCategory } from '../../api/serviceList/productApi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 3) / 2; // Two columns with margin

type BottomTabParamList = {
  category: { categoryId: string; categoryName: string };
  DetailScreen: { productId: string };
};
type CategoryNavigationProp = NativeStackNavigationProp<
  BottomTabParamList,
  'category'
>;
type CategoryRouteProp = RouteProp<BottomTabParamList, 'category'>;

export default function Category() {
  const navigation = useNavigation<CategoryNavigationProp>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const route = useRoute<CategoryRouteProp>();
  var { categoryId, categoryName } = route.params;

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDark ? '#171717' : '#f3f4f6', // Neutral 900 vs Gray 100
    cardBg: isDark ? '#262626' : '#ffffff', // Neutral 800 vs White
    textPrimary: isDark ? '#ffffff' : '#111827',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    chipBg: isDark ? '#262626' : '#e5e7eb', // Dark chip vs Light chip
    chipActive: '#3b82f6', // Blue 500
    border: isDark ? '#404040' : 'transparent', // Subtle border for cards in dark mode
    price: isDark ? '#60a5fa' : '#2563eb', // Light Blue vs Blue
  };

  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<FlatList<any>>(null);
  const [selected, setSelected] = useState('');

  const filters = [
    { label: 'All' },
    { label: 'Food' },
    { label: 'LiHaMoto' },
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
    }, []),
  );

  const getItems = async () => {
    let { data, error } = await getByCategory(selected);
    if (error) return [];
    return data || [];
  };

  useEffect(() => {
    setSelected(categoryName);
  }, [categoryName]);

  useEffect(() => {
    setLoading(true);
    setFood([]); // Clear old data immediately

    if (!selected) return;

    if (selected === 'All') {
      getRandomProducts()
        .then(res => {
          setFood(res?.data ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      getItems()
        .then(res => {
          setFood(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selected]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFirstColumn = index % 2 === 0;
    const hasImage =
      typeof item?.image === 'string' && item.image.trim() !== '';

    const normalizedThumb = hasImage ? item.image.replace(/^\/+/, '') : null;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('DetailScreen', {
            productId: item.id,
          });
        }}
        activeOpacity={0.7}
      >
        <View
          className="rounded-2xl mb-2 mr-2"
          style={{
            width: CARD_WIDTH,
            backgroundColor: colors.cardBg,
            borderRadius: 16,
            // Shadow for Light Mode
            shadowColor: '#000',
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: isDark ? 0 : 2,
            // Border for Dark Mode (visibility)
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
            marginBottom: CARD_MARGIN,
            marginLeft: isFirstColumn ? CARD_MARGIN : CARD_MARGIN / 2,
            marginRight: isFirstColumn ? CARD_MARGIN / 2 : CARD_MARGIN,
          }}
        >
          <Image
            source={
              normalizedThumb
                ? { uri: `${API_BASE_URL}/${normalizedThumb}` }
                : require('../../../assets/images/photo.png')
            }
            style={{
              width: '100%',
              height: 110,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              resizeMode: 'cover',
              backgroundColor: isDark ? '#404040' : '#e5e7eb', // Placeholder bg
            }}
          />
          <View className="px-3 pb-4 pt-3">
            <Text
              numberOfLines={2}
              style={{
                fontWeight: '700',
                fontSize: 16,
                marginBottom: 4,
                color: colors.textPrimary,
              }}
            >
              {item.name}
            </Text>

            {/* Rating Row */}
            <View className="flex-row items-center mb-1.5">
              <Image
                source={require('../../../assets/navIcons/star.png')}
                style={{ width: 16, height: 16, tintColor: '#fcc419' }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 13,
                  color: colors.textPrimary,
                }}
              >
                {item.rate}
              </Text>

              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                ({item.count})
              </Text>
            </View>

            {/* Price */}
            <View className="flex-row items-center justify-between">
              <Text
                style={{ color: colors.price }}
                className="font-bold text-[15px]"
              >
                Rs.{item.price ?? 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      <View className="m-1">
        {/* Filter Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 mb-2 px-0.5"
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {filters.map((filter, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSelected(filter.label);
              }}
              className="px-[18px] h-9 mr-2 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  selected === filter.label ? colors.chipActive : colors.chipBg,
              }}
            >
              <Text
                className="font-medium text-lg"
                style={{
                  color:
                    selected === filter.label ? '#fff' : colors.textPrimary,
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
            <ActivityIndicator size="large" color={colors.chipActive} />
          </View>
        ) : (
          <FlatList
            ref={scrollRef}
            data={food}
            keyExtractor={(item, index) => `prod-${item.id}-${index}`}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
            }}
            contentContainerStyle={{
              paddingRight: CARD_MARGIN,
            }}
            ListEmptyComponent={() => (
              <View className="items-center mt-10">
                <Image
                  source={require('../../../assets/navIcons/empty.png')}
                  style={{
                    width: 80,
                    height: 80,
                    marginBottom: 12,
                    tintColor: colors.textSecondary,
                  }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
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
