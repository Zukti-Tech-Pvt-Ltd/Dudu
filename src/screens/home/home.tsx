import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabase/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SvgUri } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import Header from './header';
import {  getRandomProducts } from '../../api/homeApi';

export default function Home() {
  const [servies, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureProduct, setFeatureProduct] = useState<any[]>([]);
  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string }; // example target screen with params
    category: { categoryId: string; categoryName: string }; // category expects param categoryId
    GoogleMaps: undefined;
    // other screens...
  };
  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
  >;

  const getItems = async () => {
    setLoading(true);
    let { data: Services, error } = await supabase.from('Services').select('*');
    const sortedService =
      Services?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
    setLoading(false);
    return sortedService;
  };

  // const getFeatureProduct = async () => {
  //   setLoading(true);
  //   let { data: Services, error } = await supabase
  //     .from('FeatureProduct')
  //     .select('*');
  //   const sortedService =
  //     Services?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
  //   setLoading(false);
  //   return sortedService;
  // };

  const navigation = useNavigation<HomeNavigationProp>();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header />,

      headerRight: () => (
        <Pressable
          className=""
          onPress={() => navigation.navigate('GoogleMaps')}
          // onPress={()=>navigation.navigate('Notification')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            className="pr-12"
            source={require('../../../assets/navIcons/notification.png')}
            style={{
              width: 20,
              height: 20,
              resizeMode: 'contain',
            }}
          />
        </Pressable>
      ),
    });

    getItems().then(res => setServices(res ?? []));
    getRandomProducts().then(res => setFeatureProduct(res ?? []));

    // const randomProduct = async () => {
    //   const res = await getRandomProducts();
    //   setFeatureProduct(res ?? []);
    // };
  }, []);

  console.log(servies);
  const renderItems = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('category', {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
      >
        <View className="flex-col items-center justify-center p-4">
          <View className="shadow-lg rounded-full bg-white p-1 ">
            <SvgUri uri={item.image} width={50} height={50} fill="#3b82f6" />
          </View>

          <Text className="ml-3 font-semibold text-black dark:text-white text-center">
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
  const renderFeatureProduct = ({ item }: { item: any }) => (
    <View className="flex-1 m-2 bg-white rounded-xl shadow-md p-4 items-center">
      <Image
        source={{ uri: item.image }}
        className="w-24 h-24 rounded-full shadow-lg"
      />
      <Text className="ml-3 font-semibold text-black dark:text-white text-center">
        {item.name}
      </Text>
    </View>
  );
  return (
    <SafeAreaView>
      <Pressable
        className="mx-2 -mt-5 mb-3 p-2 rounded-lg border border-gray-300 bg-white flex-row items-center"
        onPress={() =>
          navigation.navigate({ name: 'SearchScreen', params: { query: '' } })
        }
      >
        <Text className="text-gray-400">Search services...</Text>
      </Pressable>
      <ScrollView>
        <Text className=" text-black dark:text-white text-lg font-bold ml-3 pl-3">
          Services
        </Text>

        <FlatList
          data={servies}
          keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
          renderItem={renderItems}
          numColumns={4}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        ></FlatList>
        <Text className="text-black dark:text-white text-lg font-bold ml-3 pl-3 mt-6">
          Featured Products
        </Text>
        <FlatList
          data={servies}
          keyExtractor={item =>
            'big-' + (item.id?.toString() ?? Math.random().toString())
          }
          renderItem={renderFeatureProduct}
          numColumns={2}
          scrollEnabled={false} // disable individual scrolling to delegate scrolling to parent ScrollView
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 40,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
