import React from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  useColorScheme,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function HomeScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1f2937' : '#f9fafb'}
      />

      <LinearGradient
        colors={isDarkMode ? ['#0f172a', '#1e293b'] : ['#f3f4f6', '#e0e7ff']}
        className="flex-1 items-center justify-center p-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Optional Logo or Image on top */}
        <Image
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          className="w-24 h-24 mb-8 rounded-full shadow-lg"
          resizeMode="contain"
        />

        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg">
          <Text className="text-4xl font-extrabold text-purple-700 dark:text-purple-400 mb-4 text-center">
            Welcome to Dudu!
          </Text>

          <Text className="text-lg text-gray-700 dark:text-gray-300 mb-10 text-center leading-relaxed">
            All Products
          </Text>

          <Pressable
            className="bg-purple-600 dark:bg-purple-500 rounded-full py-4 shadow-md active:bg-purple-700 dark:active:bg-purple-600"
            onPress={() => navigation.navigate('GoogleMaps')}
            android_ripple={{ color: '#7c3aed' }}
          >
            <Text className="text-white text-xl font-semibold tracking-wide text-center">
              Go to Google Maps
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </>
  );
}
