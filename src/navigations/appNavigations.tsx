import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ImageSourcePropType } from 'react-native';


import HomeScreen from '../screens/home/test';
import SearchScreen from '../screens/search/search';
import PayScreen from '../screens/pay/pay';
import CartScreen from '../screens/cart/cart';
import OrdersScreen from '../screens/order/order';
import ProfileScreen from '../screens/profile/proflie';
import { Image } from 'react-native';
import home from '../screens/home/home';
import Home from '../screens/home/home';
const Tab = createBottomTabNavigator();
type RouteName='home'|'search'|'pay'|'cart'|'order'|'profile';
const icons:Record<RouteName,ImageSourcePropType>={
  home:require('../../assets/navIcons/home.png'),
  search:require('../../assets/navIcons/search.png'),
  pay:require('../../assets/navIcons/wallet.png'),
  cart:require('../../assets/navIcons/cart.png'),
  order:require('../../assets/navIcons/orders.png'),
  profile:require('../../assets/navIcons/profile.png'),
}

export default function MainTabs() {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: { height: 65 }, 
          tabBarIcon: ({ focused, size }) => { 
            const imageSource=icons[route.name as RouteName];
            return(
              <Image
              source={imageSource}
              style={{
                width:size,
                height:size,
                tintColor: focused ? '#2563eb' : 'gray',
                resizeMode:'contain'
              }}
            />

            )

          
          }

        })}
      >
        <Tab.Screen name="home" component={Home} options={{title:"Home",headerShown: true}} />
        {/* <Tab.Screen name="search" component={SearchScreen} /> */}
                <Tab.Screen name="search" component={HomeScreen} options={{title:"Search",headerShown: true}}/>

        <Tab.Screen name="pay" component={PayScreen}options={{title:"Pay",headerShown: true}} />
        <Tab.Screen name="cart" component={CartScreen} options={{title:"Cart",headerShown: true}}/>
        <Tab.Screen name="order" component={OrdersScreen} options={{title:"Order",headerShown: true}}/>
        <Tab.Screen name="profile" component={ProfileScreen} options={{title:"Profile",headerShown: true}}/>
      </Tab.Navigator>
  );
}
