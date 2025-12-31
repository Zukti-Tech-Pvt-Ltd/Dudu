import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllMerchantproduct } from '../../../api/merchantOrder/merchantProductApi';
import { API_BASE_URL } from '@env';
import { Plus } from 'lucide-react-native';

type RootStackParamList = {
  ProductScreen: undefined;
  ProductCreateScreen: any;
  ProductEditScreen: { product: any };
};

type addProductNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductScreen'
>;

export default function ProductScreen() {
  const navigation = useNavigation<addProductNavigationProp>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // 🔹 Fetch products
  const getProducts = async () => {
    try {
      const res = await getAllMerchantproduct();
      console.log('API RESPONSE:', res);

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
        ? res.results
        : [];

      setProducts(list);
      setFiltered(list);
    } catch (err) {
      console.log('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await getProducts();
    setRefreshing(false);
  };

  // 🔹 Refresh when screen is focused (coming back from Add Product screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getProducts();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getProducts();
  }, []);

  // 🔹 Search
  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text.trim()) {
      setFiltered(products);
      return;
    }

    const result = products.filter(item =>
      item?.name?.toLowerCase().includes(text.toLowerCase()),
    );

    setFiltered(result);
  };

  // 🔹 Render product
  const renderItem = ({ item }: any) => {
    const imageUrl = item?.image ? `${API_BASE_URL}/${item.image}` : null;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 15,
          marginVertical: 8,
          marginHorizontal: 10,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 3,
        }}
        onPress={() =>
          navigation.navigate('ProductEditScreen', { product: item })
        }
      >
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('../../../../assets/images/photo.png')
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 10,
            marginRight: 15,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
          <Text style={{ color: 'gray', fontSize: 14 }}>
            Rs. {item.price} | Stock: {item.count}
          </Text>
          <Text style={{ fontSize: 13, marginTop: 3, color: '#555' }}>
            Category: {item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 🔹 Loading UI
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔹 Main UI
  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View
        style={{
          padding: 12,
          backgroundColor: '#fff',
          elevation: 3,
        }}
      >
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search product..."
          style={{
            backgroundColor: '#f1f1f1',
            padding: 12,
            borderRadius: 10,
            fontSize: 15,
          }}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductCreateScreen')}
        className="w-16 h-16 rounded-full items-center justify-center bg-blue-600"
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          elevation: 10,
        }}
      >
        <Plus size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
