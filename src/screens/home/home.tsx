import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabase/supabase';

import { SvgUri } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const [servies, setServices] = useState<any[]>([]);
  const getItems = async () => {
    let { data: Services, error } = await supabase.from('Services').select('*');
    if (error) console.error('Supabase error:', error);

    return Services;
  };
    const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title:'home'
    })
    getItems().then(res => setServices(res ?? []));
  }, []);
  console.log(servies);
  const renderItems = ({ item }: { item: any }) => {
    return (
      <View className="flex-col items-center justify-center p-4">
       
        <SvgUri
          uri={item.image }
          className="w-20 h-20 rounded-full bg-blue-500"
        />
        <Text className="ml-3 font-semibold text-white text-center">
          {item.name}
        </Text>
      </View>
    );
  };
  return (
    <SafeAreaView>
       <Text className=' text-white text-lg font-bold ml-3 pl-3'>
          Services
        </Text>
      <FlatList
        data={servies}
        keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderItems}
        numColumns={3}
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }} 

      >
        <Text>home</Text>
      </FlatList>
    </SafeAreaView>
  );
}
