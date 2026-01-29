import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
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

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#f9fafb',
    textPrimary: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#9ca3af' : 'gray',
    inputBg: isDarkMode ? '#262626' : '#e5e7eb',
    inputText: isDarkMode ? '#ffffff' : '#000000',
    border: isDarkMode ? '#404040' : '#e5e7eb',
    iconTint: isDarkMode ? '#ffffff' : '#000000',
    placeholder: isDarkMode ? '#a1a1aa' : '#6b7280',
  };

  const route = useRoute<SearchRouteProp>();
  const navigation = useNavigation<SearchNavigationProp>();

  const [searchText, setSearchText] = useState(route.params.query || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        backgroundColor: colors.screenBg,
        paddingBottom: insets.bottom || 10,
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      {/* Search bar */}
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Image
            source={require('../../../assets/navIcons/left-arrow.png')}
            style={{
              width: 25,
              height: 25,
              resizeMode: 'contain',
              marginRight: 12,
              tintColor: colors.iconTint,
            }}
          />
        </Pressable>
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: colors.inputBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            color: colors.inputText,
          }}
          placeholder="Search for products..."
          placeholderTextColor={colors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={true}
          selectionColor={isDarkMode ? '#60a5fa' : '#2563eb'}
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
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: colors.textSecondary,
            }}
          >
            {loading ? 'Searching...' : 'No results found'}
          </Text>
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Legacy styles preserved if needed, though mostly using inline dynamic styles now
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
