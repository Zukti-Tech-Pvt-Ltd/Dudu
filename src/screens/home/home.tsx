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
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabase/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './header';
import { getRandomProducts, getVideo } from '../../api/homeApi';
import { SvgUri } from 'react-native-svg';
import { FeaturedVideo } from './video';
import PayScreen from '../pay/pay';
import OrdersScreen from '../order/order';

export default function Home() {
  const [servies, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureProduct, setFeatureProduct] = useState<any[]>([]);
  const [fetchVideo, setFetchVideo] = useState<any[]>([]);

  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string };
    category: { categoryId: string; categoryName: string };
    GoogleMaps: undefined;
    DetailScreen: { productId: string; productName: string };
  };

  type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const getItems = async () => {
    setLoading(true);
    let { data: Services, error } = await supabase.from('Services').select('*');
    const sortedService = Services?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
    setLoading(false);
    return sortedService;
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
    getRandomProducts().then(res => setFeatureProduct(res ?? []));
    const fetchVideos = async () => {
      setLoading(true);
      const videos = await getVideo();
      setFetchVideo(videos);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const windowWidth = Dimensions.get('window').width;
  const itemWidth = (windowWidth - 40) / 2; // 20 padding each side

  const renderItems = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('category', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <View className="flex-col items-center justify-center p-4">
        <View className="shadow-lg rounded-full bg-white p-1">
          <SvgUri uri={item.image} width={50} height={50} fill="#3b82f6" />
        </View>
        <Text className="ml-3 font-semibold text-black dark:text-white text-center">
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
  <SafeAreaView style={{ flex: 1 }}>
    <Pressable
      className="mx-2 -mt-5 mb-3 p-2 rounded-lg border border-gray-300 bg-white flex-row items-center"
      onPress={() => navigation.navigate('SearchScreen', { query: '' })}
    >
      <Text className="text-gray-400">Search services...</Text>
    </Pressable>

    <FlatList
      ListHeaderComponent={
        <>
          <Text className="text-black dark:text-white text-lg font-bold ml-3 pl-3">Services</Text>
          <FlatList
            data={servies}
            keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
            renderItem={renderItems}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          <FeaturedVideo />
          <OrdersScreen />

          <Text className="text-black dark:text-white text-lg font-bold ml-3 pl-3 mt-6">
            Featured Products
          </Text>
        </>
      }
      data={featureProduct}
      keyExtractor={item => 'big' + (item.id?.toString() ?? Math.random().toString())}
      renderItem={renderFeatureProduct}
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingBottom: 40,
      }}
    />
  </SafeAreaView>
);

}
