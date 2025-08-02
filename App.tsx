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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import { View, Text, StatusBar, useColorScheme, Pressable, Alert } from 'react-native';

// export default function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     // <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-4">
//     //   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

//     //   <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
//     //     Welcome to NativeWind!
//     //   </Text>

//     //   <Text className="text-base text-gray-700 dark:text-gray-300 mb-8 text-center">
//     //     This is a simple UI styled with Tailwind utilities in React Native.
//     //   </Text>

//     //   <Pressable
//     //     className="bg-blue-600 px-6 py-3 rounded-full"
//     //     onPress={() => Alert.alert('Button Pressed!')}
//     //   >
//     //     <Text className="text-white text-lg font-semibold">Press Me</Text>
//     //   </Pressable>
//     // </View>
//         <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-4">
//           <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//           <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
//             Welcome to NativeWind!
//           </Text>
//           <Text className="text-base text-gray-700 dark:text-gray-300 mb-8 text-center">
//             This is a simple UI styled with Tailwind utilities in React Native.
//           </Text>
//           <Pressable
//             className="bg-purple-500 px-6 py-3 rounded-full"
//             onPress={() =>Alert.alert('Button Pressed!')}
//           >
//             <Text className="text-white text-lg font-semibold">Go to Google Maps</Text>
//           </Pressable>
//         </View>
//   );
// }
