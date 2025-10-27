import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getByLetter } from '../../api/searchApi';

type RootStackParamList = {
  search: { query: string };
  DetailScreen: { productId: string; productName: string; tableName: string };
};

type SearchRouteProp = RouteProp<RootStackParamList, 'search'>;
type SearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'search'
>;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();

  const route = useRoute<SearchRouteProp>();
  const navigation = useNavigation<SearchNavigationProp>();

  const [searchText, setSearchText] = useState(route.params.query || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (searchText.trim() === '') {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await getByLetter(searchText.charAt(0).toUpperCase());
      setResults(data || []);
      setLoading(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const handleSelect = (item: any) => {
    navigation.navigate('DetailScreen', {
      productId: '',
      productName: item.name,
      tableName: '',
    });
  };

  return (
    <SafeAreaView
  edges={['top', 'bottom']}
  style={{
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingBottom: insets.bottom || 10,
  }}
>
  {/* Search bar */}
  <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
<Pressable onPress={() => navigation.goBack()}>
      <Image
        source={require('../../../assets/navIcons/left-arrow.png')}
        style={{
          width: 25,
          height: 25,
          resizeMode: 'contain',
          marginRight: 12,
        }}
      />
    </Pressable>
    <TextInput
      ref={inputRef}
      style={{
        flex: 1,
        height: 40,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 10,
      }}
      placeholder="Search for products..."
      value={searchText}
      onChangeText={setSearchText}
      autoFocus={true}
    />
  </View>

  {/* Results */}
  <FlatList
    data={results}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={{
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <Text>{item.name}</Text>
      </TouchableOpacity>
    )}
    ListEmptyComponent={() => (
      <Text
        style={{
          textAlign: 'center',
          marginTop: 20,
          color: 'gray',
        }}
      >
        No results found
      </Text>
    )}
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingHorizontal: 16 }}
  />
</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
