//
import React from 'react';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapsScreen from './src/GoogleMaps';
import HomeScreen from './src/screens/home/test';
import MainTabs from './src/navigations/appNavigations';
import { useColorScheme } from 'react-native';
import SearchScreen from './src/screens/search/search';

const Stack = createNativeStackNavigator();

export default function App() {
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
        <Stack.Screen name="maintab" component={MainTabs}  options={{ headerTitle: () => null }}
 />

        <Stack.Screen
          name="GoogleMaps"
          component={MapsScreen}
          options={{ title: 'Google Maps' }}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{ title: 'SearchScreen' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

