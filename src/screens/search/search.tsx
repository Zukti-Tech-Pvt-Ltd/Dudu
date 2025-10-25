import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  search: { query: string };
};

type SearchRouteProp = RouteProp<RootStackParamList, 'search'>;
type SearchNavigationProp = NativeStackNavigationProp<RootStackParamList, 'search'>;

export default function SearchScreen() {
      const insets = useSafeAreaInsets();

  const route = useRoute<SearchRouteProp>();
  const navigation = useNavigation<SearchNavigationProp>();

  const [searchText, setSearchText] = useState(route.params.query || '');
  const [results, setResults] = useState<any[]>([]);

  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }, [])
  );

  React.useEffect(() => {
    if (searchText.trim() === '') {
      setResults([]);
      return;
    }
    const dummyResults = [
      { id: 1, name: `Result for "${searchText}"` },
      { id: 2, name: `Result for "${searchText}"` },
      { id: 3, name: `Result for "${searchText}"` },
    ];
    setResults(dummyResults);
  }, [searchText]);

  const handleSelect = (item: any) => {
    console.log('Selected item:', item);
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
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Search here..."
        value={searchText}
        onChangeText={setSearchText}
        autoFocus={false}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} style={styles.resultItem}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
            No results found
          </Text>
        )}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
