//
import React, { useEffect } from 'react';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapsScreen from './src/screens/GoogleMaps';
import MapsScreenTenants from './src/screens/GoogleMapTenants';
import DeliveryMapsScreen from './src/screens/deliveryGoogleMap';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MainTabs from './src/navigations/appNavigations';
import { useColorScheme, PermissionsAndroid } from 'react-native';
import SearchScreen from './src/screens/search/search';
import DetailScreen from './src/screens/productDetail/productDetail';
import LoginScreen from './src/screens/login/login';
import SignupScreen from './src/screens/login/signUp';
import { AuthProvider } from './src/helper/authContext';
import CheckoutScreen from './src/screens/checkOut/checkOutScreen';
import PaymentMethodScreen from './src/screens/payment/paymentScreen';
import ESewaTestPayment from './src/screens/payment/esewa';
import KhaltiPayment from './src/screens/payment/khalti';
import TenantScreen from './src/screens/tenant/tenant';
import ActiveDelivery from './src/screens/deliveryScreen/activeDelivery';
import CompletedDelivery from './src/screens/deliveryScreen/completeDelivery';
import DeliveryStatusScreen from './src/screens/deliveryScreen/deliveryStatusScreen';
import OrderDetail from './src/screens/merchantScreen/orderDetail';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking, Alert } from 'react-native';
import { useNotification } from './src/notification/useNotification';
import useFCM from './src/hooks/useFCM';
const Stack = createNativeStackNavigator();

function AppInner() {
  useFCM();
  useNotification();
  const scheme = useColorScheme(); // 'dark' | 'light'

  return (
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
      </Stack.Navigator>
    </NavigationContainer>
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

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppInner />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
