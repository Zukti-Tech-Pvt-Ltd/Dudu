import { View, Text, Image } from 'react-native';
import React from 'react';

export default function Header() {
  return (
    <View className="flex-row items-center w-full justify-start pl-0 ml-0">
 
     <Image
        source={require('../../../assets/images/dudu.png')}
        className="w-20 h-20  resize-contain"
      />
    </View>
  );
}
