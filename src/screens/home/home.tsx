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
  PanResponder,
  Animated,
  Dimensions, // <-- IMPORTED DIMENSIONS
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './header';
import { getAllServices } from '../../api/services/serviceApi';
import { API_BASE_URL } from '@env';
import TwoByTwoGrid from './featureProducts';
import { decodeToken } from '../../api/indexAuth';
import { connectSocket } from '../../helper/socket';
import { getnotification } from '../../api/notificationApi';
import { getWinner } from '../../api/lottery/lotteryApi';

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claims, setClaims] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [hasWonLottery, setHasWonLottery] = useState(false); // The Master Switch
  const [showLotteryPopup, setShowLotteryPopup] = useState(true);
  const [showLotteryIcon, setShowLotteryIcon] = useState(false);
  const [lotteryPrize, setLotteryPrize] = useState<any>(null); // To store the won item

  const insets = useSafeAreaInsets();

  // --- DRAG LOGIC WITH STRICT BOUNDARIES ---
  const pan = useRef(new Animated.ValueXY()).current;
  const currentPanValue = useRef({ x: 0, y: 0 }); // Tracks real-time position
  const panOffset = useRef({ x: 0, y: 0 }); // Tracks where a drag started

  // Check if the user is a lottery winner
  useEffect(() => {
    const checkWinner = async () => {
      try {
        const response = await getWinner();

        // Handle standard axios response where data is inside response.data
        const winnersList = response?.data || response;

        // If the array has items, they won! Turn everything on.
        if (Array.isArray(winnersList) && winnersList.length > 0) {
          setLotteryPrize(winnersList[0]);
          setHasWonLottery(true); // Turns on the lottery feature
          setShowLotteryPopup(true); // Shows the modal first
        }
      } catch (error) {
        console.error('Error checking lottery winner:', error);
      }
    };

    checkWinner();
  }, []);

  // 1. Reliably track the animation value without using private _value
  useEffect(() => {
    const listener = pan.addListener(value => {
      currentPanValue.current = value;
    });
    return () => pan.removeListener(listener);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPanValue.current.x,
          y: currentPanValue.current.y,
        });
        pan.setValue({ x: 0, y: 0 });

        panOffset.current = {
          x: currentPanValue.current.x,
          y: currentPanValue.current.y,
        };
      },
      onPanResponderMove: (evt, gestureState) => {
        const { width, height } = Dimensions.get('window');

        let nextX = gestureState.dx;
        let nextY = gestureState.dy;

        const absoluteX = panOffset.current.x + nextX;
        const absoluteY = panOffset.current.y + nextY;

        // 🛑 THE FIX: RESPONSIVE INVISIBLE WALLS
        // By restricting upward travel to 60% of the screen height (height * 0.60),
        // it is physically impossible for the icon to reach your top header/title,
        // no matter what phone or screen size the user has!
        const MIN_Y = -(height * 0.58); // Max UP limit (Safely below header)
        const MAX_Y = 80; // Max DOWN limit (Safely above bottom)
        const MIN_X = -(width - 100); // Max LEFT limit
        const MAX_X = 10; // Max RIGHT limit

        // Apply Clamping
        if (absoluteY < MIN_Y) nextY = MIN_Y - panOffset.current.y;
        if (absoluteY > MAX_Y) nextY = MAX_Y - panOffset.current.y;
        if (absoluteX < MIN_X) nextX = MIN_X - panOffset.current.x;
        if (absoluteX > MAX_X) nextX = MAX_X - panOffset.current.x;

        pan.setValue({ x: nextX, y: nextY });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset(); // Merges the drag offset into the base value

        const { width } = Dimensions.get('window');

        // Match the same boundaries used in onPanResponderMove
        const MIN_X = -(width - 100); // Left edge limit
        const MAX_X = 10; // Right edge limit
        const midPoint = (MIN_X + MAX_X) / 2; // The exact center of the screen

        // Find the current position after release
        const currentX = currentPanValue.current.x;
        const currentY = currentPanValue.current.y;

        // Determine if it was dropped on the left side or the right side
        const targetX = currentX < midPoint ? MIN_X : MAX_X;

        // Spring animation to slide it smoothly to the edge
        Animated.spring(pan, {
          toValue: { x: targetX, y: currentY }, // Keep current Y, snap to new X
          useNativeDriver: false,
          friction: 6, // Controls the "bounciness" of the snap
          tension: 40, // Controls the speed of the snap
        }).start();
      },
    }),
  ).current;

  // Function to handle claiming the prize from both popup and icon
  const handleClaimPrize = () => {
    setShowLotteryPopup(false);
    setShowLotteryIcon(true); // Ensures the icon is there when they come back
    navigation.navigate('LotteryPrizeScreen', { prize: lotteryPrize });
  };

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
    LotteryPrizeScreen: { prize: any };
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

      {hasWonLottery && (
        <>
          {/* Lottery Popup */}
          {showLotteryPopup && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
              }}
            >
              {/* Changed View to TouchableOpacity to make the whole card clickable */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleClaimPrize}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl items-center w-4/5 shadow-2xl relative"
              >
                {/* --- TOP RIGHT X BUTTON --- */}
                <TouchableOpacity
                  className="absolute top-3 right-3 bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full items-center justify-center z-50"
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowLotteryPopup(false);
                    setShowLotteryIcon(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-base leading-none">
                    ✕
                  </Text>
                </TouchableOpacity>

                {/* Lottery Image */}
                <Image
                  source={require('../../../assets/images/lottery.jpg')}
                  className="w-full h-36 rounded-xl mb-4"
                  resizeMode="cover"
                />

                <Text className="text-2xl font-black text-black dark:text-white mb-1 text-center mt-2">
                  You won a lottery!
                </Text>

                {/* Show the actual prize name from the API */}
                <Text className="text-lg font-bold text-yellow-500 mb-2 text-center">
                  Prize: {lotteryPrize?.name || 'Mystery Box'}
                </Text>

                <Text className="text-sm text-gray-500 dark:text-gray-300 mb-2 text-center leading-5">
                  Tap here to claim your amazing prize right now!
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lottery Icon Floating */}
          {showLotteryIcon && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 120,
                  right: 20,
                  zIndex: 1000,
                },
                {
                  transform: [{ translateX: pan.x }, { translateY: pan.y }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={{ width: 64, height: 64 }}>
                <TouchableOpacity
                  className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex justify-center items-center shadow-lg overflow-hidden"
                  onPress={handleClaimPrize}
                  activeOpacity={0.8}
                >
                  {/* --- CONFETTI IMAGE FULLY COVERING THE CIRCLE --- */}
                  <Image
                    source={require('../../../assets/images/lottery.jpg')} // Using the main banner image
                    className="w-16 h-16 rounded-full" // Sized to fill the whole bubble and shaped to a circle
                    resizeMode="cover" // Ensure it covers the entire circle
                  />
                </TouchableOpacity>
                {/* <TouchableOpacity
                  className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full flex justify-center items-center"
                  style={{ elevation: 5, zIndex: 10 }}
                  onPress={() => setShowLotteryIcon(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-white text-xs font-bold leading-none">
                    X
                  </Text>
                </TouchableOpacity> */}
              </View>
            </Animated.View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
