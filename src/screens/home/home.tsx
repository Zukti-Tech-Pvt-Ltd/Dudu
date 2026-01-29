import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
  StatusBar,
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
import { connectSocket } from '../../helper/socket';
import { getnotification } from '../../api/notificationApi';

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claims, setClaims] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeBackgroundColor = isDarkMode ? '#171717' : '#ffffff'; // neutral-900 vs white
  const themeHeaderColor = isDarkMode ? '#171717' : '#ffffff';
  const themeIconColor = isDarkMode ? '#ffffff' : '#000000';

  const scrollRef = useRef<ScrollView>(null);

  type RootStackParamList = {
    Home: undefined;
    SearchScreen: { query: string };
    category: { categoryId: string; categoryName: string };
    MapsScreen: undefined;
    NotificationScreen: undefined;
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

  const fetchCount = async () => {
    try {
      const response = await getnotification();
      if (response && response.data) {
        setUnreadCount(response.data.length);
      }
    } catch (err) {
      console.log('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  // Socket Listener
  useEffect(() => {
    const socket = connectSocket();

    const handleNotificationUpdate = (payload: any) => {
      fetchCount();
    };

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, []);

  const getItems = async () => {
    try {
      const data = await getAllServices();
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
    getItems();
  }, []);

  // Update Header based on Dark Mode
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: themeHeaderColor,
      },
      headerTintColor: themeIconColor, // Ensures back buttons/text are correct color
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
                tintColor: themeIconColor,
              }}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('NotificationScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../../assets/navIcons/notification.png')}
              style={{
                width: 25,
                height: 25,
                resizeMode: 'contain',
                marginRight: 5,
                tintColor: themeIconColor,
              }}
            />

            {/* Badge */}
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -5,
                  backgroundColor: '#ef4444',
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 2,
                  borderWidth: 1.5,
                  borderColor: themeHeaderColor, // Blend with header bg
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      ),
    });
  }, [isDarkMode, navigation, unreadCount, themeHeaderColor, themeIconColor]);

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
            // bg-gray-100 -> dark:bg-neutral-800
            className="shadow-lg rounded-full overflow-hidden p-[1px] w-[65px] h-[65px] flex items-center justify-center bg-gray-100 dark:bg-neutral-800"
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
                className="w-[110px] h-[110px] bg-gray-200 dark:bg-gray-600"
                resizeMode="cover"
              />
            )}
          </View>
          <Text className="mt-2 font-semibold text-center text-black dark:text-gray-200">
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#ffffff' : '#3b82f6'}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-900"
      edges={['left', 'right']}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeBackgroundColor}
      />

      <ScrollView
        ref={scrollRef}
        className="bg-white dark:bg-neutral-900"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor={isDarkMode ? '#ffffff' : '#3b82f6'}
          />
        }
      >
        <Text className="text-lg font-bold ml-3 pl-3 mt-3 text-gray-900 dark:text-white">
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

        <Text className="text-lg font-bold ml-3 pl-3 mt-6 mb-2 text-gray-900 dark:text-white">
          Featured Products
        </Text>

        {/* Ensure TwoByTwoGrid is wrapped or handles dark mode internally */}
        <TwoByTwoGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
