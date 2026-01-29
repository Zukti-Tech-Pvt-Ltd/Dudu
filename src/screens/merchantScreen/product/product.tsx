import React, { useEffect, useState } from 'react';
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
  StatusBar,
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

  // Dynamic Theme Colors
  const colors = {
    background: isDarkMode ? '#171717' : '#f2f2f2', // Neutral 900 vs Light Gray
    card: isDarkMode ? '#262626' : '#ffffff', // Neutral 800 vs White
    textPrimary: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#a3a3a3' : 'gray', // Neutral 400
    inputBg: isDarkMode ? '#404040' : '#f1f1f1', // Neutral 700
    placeholder: isDarkMode ? '#a3a3a3' : '#888',
    borderColor: isDarkMode ? '#404040' : '#e5e5e5',
  };

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // 🔹 Fetch products
  const getProducts = async () => {
    try {
      const res = await getAllMerchantproduct();
      // console.log('API RESPONSE:', res);

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

  // 🔹 Refresh when screen is focused
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
          backgroundColor: colors.card,
          padding: 15,
          marginVertical: 8,
          marginHorizontal: 10,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          // Shadow/Border logic
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.borderColor,
        }}
        activeOpacity={0.7}
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
            backgroundColor: isDarkMode ? '#404040' : '#f0f0f0', // Placeholder bg
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}
          >
            Rs. {item.price}{' '}
            <Text style={{ fontSize: 12 }}>| Stock: {item.count}</Text>
          </Text>
          <Text
            style={{ fontSize: 13, marginTop: 3, color: colors.textSecondary }}
          >
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
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // 🔹 Main UI
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* Search Bar */}
      <View
        style={{
          padding: 12,
          backgroundColor: colors.card,
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: colors.borderColor,
        }}
      >
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search product..."
          placeholderTextColor={colors.placeholder}
          style={{
            backgroundColor: colors.inputBg,
            padding: 12,
            borderRadius: 10,
            fontSize: 15,
            color: colors.textPrimary,
          }}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for FAB
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary} // Spinner color iOS
            colors={['#2563eb']} // Spinner color Android
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: colors.textSecondary }}>
              No products found
            </Text>
          </View>
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Plus size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
