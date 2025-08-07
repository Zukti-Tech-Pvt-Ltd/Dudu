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
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabase/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Video from 'react-native-video';

import { SvgUri } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './header';
import { getRandomProducts, getVideo } from '../../api/homeApi';
import  { FeaturedVideo } from './video';

export default function Home() {
  const [servies, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureProduct, setFeatureProduct] = useState<any[]>([]);
  const [fetchVideo, setFetchVideo] = useState<any[]>([]);
  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string }; // example target screen with params
    category: { categoryId: string; categoryName: string }; // category expects param categoryId
    GoogleMaps: undefined;
    DetailScreen: { productId: string; productName: string };
    // other screens...
  };
  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
  >;

  const scrollRef = useRef<ScrollView>(null);
  useFocusEffect(
    React.useCallback(() => {
      // Reset scroll to top when screen is focused
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );
  const getItems = async () => {
    setLoading(true);
    let { data: Services, error } = await supabase.from('Services').select('*');
    const sortedService =
      Services?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
    setLoading(false);
    return sortedService;
  };

  const navigation = useNavigation<HomeNavigationProp>();

  useEffect(() => {
      console.log('servies', servies);

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
    const fetchVideos = async () => {
      setLoading(true);
      const videos = await getVideo();
      setFetchVideo(videos);
      setLoading(false);
    };

    fetchVideos(); // const randomProduct = async () => {
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
    <TouchableOpacity
             onPress={() => navigation.navigate('DetailScreen',{
            productId: item.id,
            productName: item.name,
          })}

    activeOpacity={0.7}
  >
    <View
      className="m-2 bg-white rounded-xl shadow-md items-center p-0 -ml-1 mr-2.5"
      style={{ width: 185, height: 160 }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{
          width: '100%', // Let the image scale to the container
          height: 100, // Remains as specified
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
  // const renderVideo = ({ item }: { item: any }) => (
  //   <View
  //     style={{
  //       width: '100%',
  //       height: 200,
  //       marginBottom: 20,
  //       backgroundColor: 'black',
  //     }}
  //   >
  //     <Video
  //       source={{ uri: item.video }} // or your video URL
  //       style={{ width: '100%', height: '100%' }}
  //       controls={true}
  //       resizeMode="contain"
  //       paused={false}
  //       repeat={true}
  //       onBuffer={e => console.log('Buffering:', e)}
  //       onError={e => console.error('Video Error:', e)}
  //     />
  //   </View>
  // );
  console.log('renderFeatureProduct', featureProduct);
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
      <ScrollView ref={scrollRef}>
        <Text className=" text-black dark:text-white text-lg font-bold ml-3 pl-3">
          Services
        </Text>

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
        ></FlatList>
        {/* <HorizontalVideos videos={fetchVideo} /> */}
<FeaturedVideo />


        <Text className="text-black dark:text-white text-lg font-bold ml-3 pl-3 mt-6">
          Featured Products
        </Text>
        <FlatList
          data={featureProduct}
          keyExtractor={item =>
            'big' + (item.id?.toString() ?? Math.random().toString())
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
