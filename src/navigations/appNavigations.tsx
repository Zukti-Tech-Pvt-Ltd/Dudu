import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ImageSourcePropType, Platform } from 'react-native';

// import HomeScreen from '../screens/home/test';
import SearchScreen from '../screens/search/search';
import PayScreen from '../screens/pay/pay';
import CartScreen from '../screens/cart/cart';
import OrdersScreen from '../screens/order/order';
import ProfileScreen from '../screens/profile/proflie';
import { Image } from 'react-native';
import home from '../screens/home/home';
import Home from '../screens/home/home';
import Category from '../screens/category/category';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../helper/authContext';
import { useContext } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import DeliveryHubScreen from '../screens/deliveryScreen/deliveryhome';
import { useColorScheme } from 'react-native';
import DeliveryMapsScreen from '../screens/deliveryGoogleMap';
import OrderList from '../screens/merchantScreen/order';
import ProductScreen from '../screens/merchantScreen/product/product';
import OrderTodayScreen from '../screens/order/orderToday';

const Tab = createBottomTabNavigator();
type RouteName =
  | 'home'
  | 'tasks'
  | 'map'
  | 'category'
  | 'pay'
  | 'cart'
  | 'order'
  | 'profile'
  | 'shop';
const icons: Record<RouteName, ImageSourcePropType> = {
  home: require('../../assets/navIcons/home.png'),
  tasks: require('../../assets/navIcons/tasks.png'),
  map: require('../../assets/navIcons/pin.png'),
  category: require('../../assets/navIcons/category.png'),
  pay: require('../../assets/navIcons/wallet.png'),
  cart: require('../../assets/navIcons/cart.png'),
  order: require('../../assets/navIcons/orders.png'),
  profile: require('../../assets/navIcons/profile.png'),
  shop: require('../../assets/images/shop.png'),
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const { isLoggedIn, token } = useContext(AuthContext);
  if (token) {
    const decoded = jwtDecode<JwtPayload & { exp?: number; userType?: string }>(
      token!,
    );
    console.log('decoded!!!!!!!!!!!!!!!!!', decoded);
    if (decoded.userType === 'delivery') {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: {
              height: 40 + (Platform.OS === 'android' ? insets.bottom : 0),
              backgroundColor: isDark ? '#000' : '#fff',
              borderTopColor: isDark ? '#333' : '#ddd',
            },
            tabBarActiveTintColor: isDark ? '#60a5fa' : '#2563eb', // blue but lighter in dark mode
            tabBarInactiveTintColor: isDark ? '#888' : 'gray',
            tabBarIcon: ({ focused, size }) => {
              const imageSource = icons[route.name as RouteName];
              return (
                <Image
                  source={imageSource}
                  style={{
                    width: size,
                    height: size,
                    tintColor: focused ? '#2563eb' : 'gray',
                    resizeMode: 'contain',
                  }}
                />
              );
            },
          })}
        >
          <Tab.Screen
            name="tasks"
            component={DeliveryHubScreen}
            options={{
              title: 'Tasks',

              headerShown: true,
              headerStyle: {
                height: 90,
              },
              headerTitleStyle: {
                fontSize: 20,
              },
            }}
          />

          <Tab.Screen
            name="profile"
            component={ProfileScreen}
            options={{ title: 'Profile', headerShown: true }}
          />
        </Tab.Navigator>
      );
    }
    if (decoded.userType === 'merchant') {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: {
              height: 40 + (Platform.OS === 'android' ? insets.bottom : 0),
              backgroundColor: isDark ? '#000' : '#fff',
              borderTopColor: isDark ? '#333' : '#ddd',
            },
            tabBarActiveTintColor: isDark ? '#60a5fa' : '#2563eb', // blue but lighter in dark mode
            tabBarInactiveTintColor: isDark ? '#888' : 'gray',
            tabBarIcon: ({ focused, size }) => {
              const imageSource = icons[route.name as RouteName];
              return (
                <Image
                  source={imageSource}
                  style={{
                    width: size,
                    height: size,
                    tintColor: focused ? '#2563eb' : 'gray',
                    resizeMode: 'contain',
                  }}
                />
              );
            },
          })}
        >
          <Tab.Screen
            name="order"
            component={OrderList}
            options={{
              title: 'Orders',

              headerShown: true,
              headerStyle: {
                height: 90,
              },
              headerTitleStyle: {
                fontSize: 20,
              },
            }}
          />
          <Tab.Screen
            name="shop"
            component={ProductScreen}
            options={{
              title: 'Product',

              headerShown: true,
              headerStyle: {
                height: 90,
              },
              headerTitleStyle: {
                fontSize: 20,
              },
            }}
          />

          <Tab.Screen
            name="profile"
            component={ProfileScreen}
            options={{ title: 'Profile', headerShown: true }}
          />
        </Tab.Navigator>
      );
    }
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 50 + (Platform.OS === 'android' ? insets.bottom : 0),
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, size }) => {
          const imageSource = icons[route.name as RouteName];
          return (
            <Image
              source={imageSource}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#2563eb' : 'gray',
                resizeMode: 'contain',
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={Home}
        options={{ title: 'Home', headerShown: true }}
      />
      {/* <Tab.Screen name="search" component={SearchScreen} /> */}

      <Tab.Screen
        name="category"
        component={Category} // single Category screen
        options={{ title: 'Category', headerShown: true }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('category', {
              categoryId: '12',

              categoryName: 'All',
            });
          },
        })}
      />
      {/* <Tab.Screen
        name="pay"
        component={PayScreen}
        options={{ title: 'Pay', headerShown: true }}
      /> */}
      <Tab.Screen
        name="cart"
        component={CartScreen}
        options={{ title: 'Cart', headerShown: true }}
      />
      <Tab.Screen
        name="order"
        component={OrderTodayScreen}
        options={{ title: 'Order' }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: true }}
      />
    </Tab.Navigator>
  );
}
