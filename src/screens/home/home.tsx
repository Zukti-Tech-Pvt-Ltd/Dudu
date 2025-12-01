import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './header';
import { getAllServices } from '../../api/services/serviceApi';
import { API_BASE_URL } from '@env';
import TwoByTwoGrid from './featureProducts';
import { decodeToken } from '../../api/indexAuth';

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claims, setClaims] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const scrollRef = useRef<ScrollView>(null);

  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string };
    category: { categoryId: string; categoryName: string };
    MapsScreen: undefined;
    DeliveryMapsScreen: undefined;
    TenantScreen: undefined;
    DetailScreen: { productId: string; productName: string; tableName: string };
  };

  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
  >;
  const navigation = useNavigation<HomeNavigationProp>();

  useEffect(() => {
    const fetchClaims = async () => {
      const claim = await decodeToken();
      if (claim) setClaims(claim.userType);
    };
    fetchClaims();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const getItems = async () => {
    try {
      const data = await getAllServices();
      console.log('API services:', data.data);

      setServices(data.data || []);
      return data.data;
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getItems();
    setRefreshing(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header />,
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Pressable
            className="mr-2"
            onPress={() => navigation.navigate('SearchScreen', { query: '' })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../../assets/navIcons/search.png')}
              style={{
                width: 25,
                height: 25,
                resizeMode: 'contain',
                marginRight: 22,
              }}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('MapsScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../../assets/navIcons/notification.png')}
              style={{
                width: 25,
                height: 25,
                resizeMode: 'contain',
                marginRight: 5,
              }}
            />
          </Pressable>
        </View>
      ),
    });

    getItems();
  }, []);

  const renderItems = ({ item }: { item: any }) => {
    const rawImage = item?.image;

    const hasImage =
      typeof rawImage === 'string' &&
      rawImage.trim() !== '' &&
      rawImage !== 'null' &&
      rawImage !== 'undefined';

    const normalizedImage =
      hasImage && rawImage.startsWith('/') ? rawImage.slice(1) : rawImage;
    const imageUri = normalizedImage
      ? `${API_BASE_URL}/${normalizedImage}`
      : null;

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.name === 'Home') {
            navigation.navigate(
              claims === 'tenant' ? 'TenantScreen' : 'MapsScreen',
            );
          } else if (item.name === 'Delivery') {
            navigation.navigate('MapsScreen');
          } else {
            navigation.navigate('category', {
              categoryId: item.id,
              categoryName: item.name,
            });
          }
        }}
      >
        <View className="flex-col items-center justify-center p-3.5">
          <View
            className={`shadow-lg rounded-full overflow-hidden p-[1px] w-[65px] h-[65px] flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-[110px] h-[110px]"
                resizeMode="cover"
                onError={() => console.warn('⚠ Image load failed:', imageUri)}
              />
            ) : (
              <Image
                source={require('../../../assets/images/user.png')}
                className="w-[110px] h-[110px]"
                resizeMode="cover"
              />
            )}
          </View>
          <Text className="mt-0 font-semibold text-black dark:text-white text-center">
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex-1 -mb-1`}
      edges={['left', 'right']}
    >
      <ScrollView
        ref={scrollRef}
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        contentContainerStyle={{ paddingBottom: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <Text
          className={`text-lg font-bold ml-3 pl-3 mt-3 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Services
        </Text>
        <FlatList
          data={services}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? `index-${index}`
          }
          renderItem={renderItems}
          numColumns={4}
          scrollEnabled={false}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        <Text
          className={`text-lg font-bold ml-3 pl-3 mt-6 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Featured Products
        </Text>
        <TwoByTwoGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
