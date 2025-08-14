import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';

import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabase/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './header';
// import { getRandomProducts, getVideo } from '../../api/homeApi';
import { SvgUri } from 'react-native-svg';
import { FeaturedVideo } from './video';
import PayScreen from '../pay/pay';
import OrdersScreen from '../order/order';
import { getAllServices } from '../../api/services/serviceApi';
import { API_BASE_URL } from '@env';
import TwoByTwoGrid from './featureProducts';
// import TwoByTwoGrid from './featureProducts';

export default function Home() {
  const [servies, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureProduct, setFeatureProduct] = useState<any[]>([]);
  const [fetchVideo, setFetchVideo] = useState<any[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string };
    category: { categoryId: string; categoryName: string };
    GoogleMaps: undefined;
    DetailScreen: { productId: string; productName: string; tableName: string };
  };

  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
  >;

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );
  const getItems = async () => {
    try {
      const data = await getAllServices();
      setServices(data.data); // because your API returns { status, data }
      return data.data;
    } catch (error) {
      console.log('API_BASE_URL-=-=-=-===-=-==-=errrrrorrr==-');

      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation<HomeNavigationProp>();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header />,
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('GoogleMaps')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require('../../../assets/navIcons/notification.png')}
            style={{
              width: 20,
              height: 20,
              resizeMode: 'contain',
              marginRight: 12,
            }}
          />
        </Pressable>
      ),
    });

    getItems().then(res => setServices(res ?? []));
    // getRandomProducts().then(res => setFeatureProduct(res ?? []));
    // const fetchVideos = async () => {
    //   setLoading(true);
    //   const videos = await getVideo();
    //   setFetchVideo(videos);
    //   setLoading(false);
    // };
    // fetchVideos();
  }, []);

  const windowWidth = Dimensions.get('window').width;
  const itemWidth = (windowWidth - 40) / 2; // 20 padding each side
  console.log('servies', servies);
  const renderItems = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('category', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <View className="flex-col items-center justify-center p-3.5">
        <View className="shadow-lg rounded-full bg-gray-100 overflow-hidden p-[1px] w-[65px] h-[65px] flex items-center justify-center">
          <Image
              source={{ uri: `${API_BASE_URL}/${item.image.replace(/^\/+/, '')}` }}
            
            className="w-[110px] h-[110px]"
            resizeMode="cover"
          />
        </View>

        <Text className="mt-0 font-semibold text-black dark:text-white text-center">
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderFeatureProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('DetailScreen', {
          productId: item.id,
          productName: item.name,
          tableName: item.table,
        })
      }
      activeOpacity={0.7}
    >
      <View
        className="m-2 bg-white rounded-xl shadow-md items-center p-0"
        style={{ width: itemWidth, height: 160 }}
      >
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: '100%',
            height: 100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            resizeMode: 'cover',
          }}
        />
        <View
          style={{
            width: '100%',
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text className="font-semibold text-black dark:text-white text-center">
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex-1`}
    >
      <Pressable
        className="mx-2 -mt-5 mb-3 p-2 rounded-lg border border-gray-300 bg-white flex-row items-center"
        onPress={() => navigation.navigate('SearchScreen', { query: '' })}
      >
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
          Search services...
        </Text>
      </Pressable>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text
          className={`text-lg font-bold ml-3 pl-3 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Services
        </Text>
        <FlatList
          data={servies}
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

        {/* <FeaturedVideo /> */}

        {/* <OrdersScreen /> */}
      </ScrollView>
    </SafeAreaView>
  );
}
