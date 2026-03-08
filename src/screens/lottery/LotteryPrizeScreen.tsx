import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions, // <-- Import Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { API_BASE_URL } from '@env';

// Get screen width to calculate the right edge
const { width } = Dimensions.get('window');

export default function LotteryPrizeScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const prize = route.params?.prize;

  // --- CONFETTI STATE ---
  const [shootCount, setShootCount] = useState(0);

  // Automatically trigger a new confetti explosion every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShootCount(prev => prev + 1);
    }, 2500); // 2500ms = 2.5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Format the image URL correctly
  const imageUrl = prize?.image ? `${API_BASE_URL}/${prize.image}` : null;

  // Determine which side to shoot from based on whether the count is even or odd
  const isLeftSide = shootCount % 2 === 0;
  const confettiOrigin = isLeftSide
    ? { x: -10, y: 0 } // Left side
    : { x: width + 10, y: 0 }; // Right side

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Back Button */}
      <TouchableOpacity
        className="absolute top-12 left-5 z-50 p-2 bg-gray-100 dark:bg-neutral-800 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-gray-800 dark:text-gray-200 font-bold px-2">
          ← Back
        </Text>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center p-6 mt-10">
        <Text className="text-4xl font-black text-yellow-500 mb-2 text-center">
          JACKPOT!
        </Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
          You are the lucky winner of this amazing prize.
        </Text>

        {/* Prize Card */}
        <View className="bg-gray-50 dark:bg-neutral-800 w-full rounded-3xl p-5 shadow-xl items-center border border-gray-100 dark:border-neutral-700">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-64 rounded-2xl mb-5 bg-gray-200 dark:bg-neutral-700"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 rounded-2xl mb-5 bg-gray-200 dark:bg-neutral-700 items-center justify-center">
              <Text className="text-gray-400">No Image</Text>
            </View>
          )}

          <Text className="text-3xl font-bold text-black dark:text-white text-center mb-2">
            {prize?.name || 'Mystery Prize'}
          </Text>

          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-4 leading-6">
            {prize?.description || 'A special reward just for you.'}
          </Text>

          <View className="bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-full">
            <Text className="text-green-600 dark:text-green-400 font-extrabold text-xl">
              Value: Rs. {prize?.price || '0'}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTINUOUS FIREWORKS! */}
      <ConfettiCannon
        key={shootCount} // <-- Changing the key forces the component to remount and re-fire
        count={100} // Lowered slightly to 100 so continuous firing doesn't lag the phone
        origin={confettiOrigin}
        autoStart={true}
        fadeOut={true}
        fallSpeed={3500} // Slightly slower fall so the previous burst is still visible
      />
    </SafeAreaView>
  );
}
