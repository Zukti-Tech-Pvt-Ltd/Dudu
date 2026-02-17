//
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapsScreen from './src/screens/GoogleMaps';
import MapsScreenTenants from './src/screens/GoogleMapTenants';
import DeliveryMapsScreen from './src/screens/deliveryGoogleMap';

import MainTabs from './src/navigations/appNavigations';
import { useColorScheme } from 'react-native';
import SearchScreen from './src/screens/search/search';
import DetailScreen from './src/screens/productDetail/productDetail';
import ChatScreen from './src/screens/message/chatScreen';

import LoginScreen from './src/screens/login/login';
import SignupScreen from './src/screens/login/signUp';
import CheckoutScreen from './src/screens/checkOut/checkOutScreen';
import PaymentMethodScreen from './src/screens/payment/paymentScreen';
import ESewaTestPayment from './src/screens/payment/esewa';
import KhaltiPayment from './src/screens/payment/khalti';
import TenantScreen from './src/screens/tenant/tenant';
import ActiveDelivery from './src/screens/deliveryScreen/activeDelivery';
import CompletedDelivery from './src/screens/deliveryScreen/completeDelivery';
import DeliveryStatusScreen from './src/screens/deliveryScreen/deliveryStatusScreen';
import OrderDetail from './src/screens/merchantScreen/orderDetail';
import ProductCreateScreen from './src/screens/merchantScreen/product/addProduct';
import ProductEditScreen from './src/screens/merchantScreen/product/editProduct';

import AvaliableRidersScreen from './src/screens/merchantScreen/availableRider';
import EditProfileScreen from './src/screens/profile/editProfile';
import MessageProfileScreen from './src/screens/profile/messageProfile';

import { useNotification } from './src/notification/useNotification';
import useFCM from './src/hooks/useFCM';
import OrdersScreen from './src/screens/order/order';
import NotificationScreen from './src/screens/notificationScreen/notificationScreen';

const Stack = createNativeStackNavigator();

export function AppInner() {
  const { DeliveryRequestModal } = useFCM();
  useFCM();
  useNotification();
  const scheme = useColorScheme(); // 'dark' | 'light'

  return (
    <>
      <DeliveryRequestModal />
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // Hides the header on all screens
          }}
        >
          {/* <Stack.Screen
          name="Welcome"
          component={HomeScreen}
          options={{ headerShown: false }}
          
        /> */}
          <Stack.Screen
            name="maintab"
            component={MainTabs}
            options={{ headerTitle: () => null }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MapsScreen"
            component={MapsScreen}
            options={{ title: 'Google Maps' }}
          />
          <Stack.Screen
            name="DeliveryMapsScreen"
            component={DeliveryMapsScreen}
            options={{ title: 'Google Maps' }}
          />
          <Stack.Screen
            name="MapsScreenTenants"
            component={MapsScreenTenants}
            options={{ title: 'MapsScreenTenants' }}
          />
          <Stack.Screen
            name="DetailScreen"
            component={DetailScreen}
            options={{ title: 'Product Detail' }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ title: 'Chat Screen' }}
          />
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ title: 'SearchScreen' }}
          />
          <Stack.Screen
            name="CheckoutScreen"
            component={CheckoutScreen}
            options={{ title: 'CheckoutScreen' }}
          />
          <Stack.Screen
            name="PaymentMethodScreen"
            component={PaymentMethodScreen}
            options={{ title: 'PaymentMethodScreen' }}
          />
          <Stack.Screen
            name="ESewaTestPayment"
            component={ESewaTestPayment}
            options={{ title: 'ESewaTestPayment' }}
          />
          <Stack.Screen
            name="KhaltiPayment"
            component={KhaltiPayment}
            options={{ title: 'KhaltiPayment' }}
          />
          <Stack.Screen
            name="TenantScreen"
            component={TenantScreen}
            options={{ title: 'TenantScreen' }}
          />
          <Stack.Screen
            name="ActiveDelivery"
            component={ActiveDelivery}
            options={{ title: 'ActiveDelivery' }}
          />
          <Stack.Screen
            name="CompletedDelivery"
            component={CompletedDelivery}
            options={{ title: 'CompletedDelivery' }}
          />
          <Stack.Screen
            name="DeliveryStatusScreen"
            component={DeliveryStatusScreen}
            options={{ title: 'DeliveryStatusScreen' }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetail}
            options={{ title: 'OrderDetail' }}
          />
          <Stack.Screen
            name="ProductCreateScreen"
            component={ProductCreateScreen}
            options={{ title: 'AddProduct', headerShown: true }}
          />
          <Stack.Screen
            name="AvaliableRidersScreen"
            component={AvaliableRidersScreen}
            options={{ title: 'Available Riders', headerShown: true }}
          />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
            options={{ title: 'Edit Profile', headerShown: true }}
          />
          <Stack.Screen
            name="MessageProfileScreen"
            component={MessageProfileScreen}
            options={{ title: 'Message Profile', headerShown: true }}
          />
          <Stack.Screen
            name="ProductEditScreen"
            component={ProductEditScreen}
            options={{ title: 'Edit Product', headerShown: true }}
          />
          <Stack.Screen
            name="OrdersScreen"
            component={OrdersScreen}
            options={{ title: 'Order ' }}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
            options={{ title: 'NotificationScreen ', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
// useEffect(() => {
//   const handleUrl = event => {
//     const url = event.url;
//     if (url.startsWith('myapp://payment-success')) {
//       Alert.alert('Payment Success', `URL: ${url}`);
//       // Parse and navigate or update state accordingly
//     } else if (url.startsWith('myapp://payment-failure')) {
//       Alert.alert('Payment Failed', `URL: ${url}`);
//     }
//   };

//   // Listen for deep link events
//   // Linking.addEventListener('url', handleUrl);

//   // Handle app launch from deep link
//   Linking.getInitialURL().then(url => {
//     if (url) handleUrl({ url });
//   });
//   const subscription = Linking.addListener('url', handleUrl);
//   return () => {
//     subscription.remove();
//   };
// }, []);
