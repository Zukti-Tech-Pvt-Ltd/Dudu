import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  RefreshControl,
  Modal,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import Checkbox from 'expo-checkbox';
import { styled } from 'nativewind';
import { deleteCart, getCart } from '../../api/cartApi';
import { API_BASE_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../helper/authContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledImage = styled(Image);

type Item = {
  id: string;
  img: any;
  productId: string;
  name: string;
  extra: string;
  price: number;
  qty: number;
  ends?: string;
  left?: number;
  oldPrice?: number;
};

type CartGroup = {
  shop: string;
  items: Item[];
};
type RootStackParamList = {
  Cart: undefined;
  DetailScreen: { productId: string; productName: string; tableName: string };
  CheckoutScreen: {
    selectedItems: { id: string; quantity: number; price: number }[];
  };
};
type cartNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Theme constants
  const themeBackgroundColor = isDark ? '#171717' : '#f3f4f6'; // neutral-900 vs gray-100
  const themeCardColor = isDark ? '#262626' : '#ffffff'; // neutral-800 vs white
  const themeTextColor = isDark ? '#ffffff' : '#111827';
  const themeIconTint = isDark ? '#ffffff' : '#374151';

  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [cartData, setCartData] = useState<CartGroup[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { isLoggedIn, token } = useContext(AuthContext);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // --- CUSTOM MODAL STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined,
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };
  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Image
          source={require('../../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200 dark:bg-neutral-800"
        />
        <Text className="font-bold text-lg text-gray-900 dark:text-gray-100">
          Please login first
        </Text>
      </View>
    );
  }

  useEffect(() => {
    if (cartData && cartData.length > 0) {
      const qtys = cartData.reduce((prev: Record<string, number>, group) => {
        group.items.forEach(item => {
          prev[item.id] = 1;
        });
        return prev;
      }, {});
      setQuantities(qtys);
    }
  }, [cartData]);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await getCart();
      setCartData(response?.data ?? []);
    } catch (err) {
      console.error(err);
      setCartData([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities(qty => ({
      ...qty,
      [id]: Math.max(1, (qty[id] || 1) + delta),
    }));
  };

  const handleItemSelect = (
    shop: string,
    items: { id: string }[],
    itemId: string,
    value: boolean,
  ) => {
    setSelected(prev => {
      const updated = { ...prev, [itemId]: value };
      const shopShouldBeSelected = items.every(item =>
        item.id === itemId ? value : !!updated[item.id],
      );
      updated[shop] = shopShouldBeSelected;
      return updated;
    });
  };

  function handleShopSelect(
    shop: string,
    items: { id: string }[],
    value: boolean,
  ) {
    setSelected(prev => {
      const updated = { ...prev, [shop]: value };
      items.forEach(item => {
        updated[item.id] = value;
      });
      return updated;
    });
  }

  const selectedItems = cartData.flatMap(group =>
    group.items
      .filter(item => selected[item.id])
      .map(item => ({
        id: item.productId,
        quantity: quantities[item.id] ?? item.qty,
        price: item.price,
      })),
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showStatus(
        'error',
        'Selection Required',
        'Please select at least one item to checkout.',
      );
      return;
    }
    navigation.navigate('CheckoutScreen', {
      selectedItems,
    });
  };

  const navigation = useNavigation<cartNavigationProp>();

  // Subtotal calculation
  const subtotal = Object.entries(quantities).reduce((sum, [id, qty]) => {
    for (const group of cartData) {
      const item = group.items.find(i => i.id === id);
      if (item && selected[id]) {
        return sum + item.price * qty;
      }
    }
    return sum;
  }, 0);

  const handleDeleteItem = async (id: string, name: string) => {
    try {
      setLoading(true);
      await deleteCart(id);
      setCartData(prev =>
        prev
          .map(group => ({
            ...group,
            items: group.items.filter(item => item.id !== id),
          }))
          .filter(group => group.items.length > 0),
      );
    } catch (error) {
      showStatus('error', 'Delete Failed', 'Failed to remove item from cart.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setSelectedItemId(null);
      }}
    >
      <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-900">
        {/* Main ScrollView */}
        <ScrollView
          className="flex-1 py-3 px-3"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchData(false);
                setRefreshing(false);
              }}
              tintColor={isDark ? '#fff' : '#000'}
              colors={['#3b82f6']}
            />
          }
        >
          {cartData.map((group, idx) => (
            <StyledView
              key={group.shop}
              // Card: White in light, Neutral-800 in dark
              className="rounded-2xl mb-4 p-3 shadow-sm bg-white dark:bg-neutral-800"
              style={{
                shadowColor: isDark ? '#000' : '#000',
                shadowOpacity: isDark ? 0.3 : 0.1,
              }}
            >
              {/* Shop Header */}
              <StyledView className="flex-row items-center mb-2">
                <Checkbox
                  value={!!selected[group.shop]}
                  onValueChange={val =>
                    handleShopSelect(group.shop, group.items, val)
                  }
                  color={isDark ? '#3b82f6' : undefined}
                />

                <StyledImage
                  source={require('../../../assets/images/shop.png')}
                  className="ml-2 w-4 h-4"
                  style={{
                    marginTop: 1,
                    tintColor: themeIconTint,
                  }}
                />

                <StyledText className="px-1 font-semibold text-base text-gray-900 dark:text-gray-100">
                  {group.shop}
                </StyledText>
              </StyledView>

              {group.items.map(item => {
                const normalizedImage = item.img ? item.img : '';

                return (
                  <Swipeable
                    key={item.id}
                    renderRightActions={() => (
                      <StyledTouchable
                        onPress={() => handleDeleteItem(item.id, item.name)}
                        className="bg-red-500 justify-center items-center w-20 rounded-r-2xl"
                      >
                        <Text className="text-white font-bold">Delete</Text>
                      </StyledTouchable>
                    )}
                  >
                    <StyledView className="flex-row py-0 bg-white dark:bg-neutral-800">
                      <Checkbox
                        className="mt-4 mr-2"
                        value={!!selected[item.id]}
                        onValueChange={val =>
                          handleItemSelect(
                            group.shop,
                            group.items,
                            item.id,
                            val,
                          )
                        }
                        color={isDark ? '#3b82f6' : undefined}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      />

                      <StyledTouchable
                        onPress={() =>
                          navigation.navigate('DetailScreen', {
                            productId: '',
                            productName: item.name,
                            tableName: '',
                          })
                        }
                        className="flex-row items-center flex-1"
                      >
                        <StyledImage
                          source={
                            normalizedImage
                              ? { uri: `${API_BASE_URL}/${normalizedImage}` }
                              : require('../../../assets/images/photo.png')
                          }
                          // Added dark:bg-neutral-700
                          className="w-14 h-14 rounded mr-2 bg-gray-200 dark:bg-neutral-700"
                        />
                        <StyledView className="flex-1">
                          <StyledText className="font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </StyledText>
                          <StyledText className="text-xs text-gray-500 dark:text-gray-400">
                            {item.extra}
                          </StyledText>
                          {item.ends && (
                            <StyledText className="text-xs text-orange-600 dark:text-orange-400">
                              {item.ends}
                            </StyledText>
                          )}
                          {item.left && (
                            <StyledText className="text-xs text-rose-500 dark:text-rose-400">
                              {item.left} item(s) left
                            </StyledText>
                          )}
                          <StyledView className="flex-row mt-1 items-center">
                            <StyledText
                              style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}
                              className="text-base font-bold"
                            >
                              Rs. {item.price}
                            </StyledText>
                            {item.oldPrice && (
                              <StyledText className="text-xs line-through ml-2 text-gray-400 dark:text-gray-600">
                                Rs. {item.oldPrice}
                              </StyledText>
                            )}
                          </StyledView>
                        </StyledView>
                      </StyledTouchable>

                      <StyledView className="flex-row items-center">
                        <StyledTouchable
                          onPress={() => handleQtyChange(item.id, -1)}
                          className="w-6 h-6 items-center justify-center rounded bg-gray-200 dark:bg-neutral-700"
                        >
                          <StyledText className="text-gray-900 dark:text-white">
                            -
                          </StyledText>
                        </StyledTouchable>

                        <StyledText className="mx-2 text-gray-900 dark:text-white">
                          {quantities[item.id]}
                        </StyledText>

                        <StyledTouchable
                          onPress={() => handleQtyChange(item.id, 1)}
                          className="w-6 h-6 items-center justify-center rounded bg-gray-200 dark:bg-neutral-700"
                        >
                          <StyledText className="text-gray-900 dark:text-white">
                            +
                          </StyledText>
                        </StyledTouchable>
                      </StyledView>
                    </StyledView>
                  </Swipeable>
                );
              })}
            </StyledView>
          ))}
        </ScrollView>

        {/* Checkout & Subtotal */}
        {cartData.length === 0 ? (
          <StyledText className="text-center py-6 text-gray-500 dark:text-gray-400">
            Your cart is empty
          </StyledText>
        ) : (
          <StyledView className="px-4 pb-4 bg-gray-100 dark:bg-neutral-900">
            <StyledView className=" my-2">
              <StyledText className="text-base font-bold text-gray-900 dark:text-white">
                Subtotal:{' '}
                <StyledText style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                  Rs. {subtotal}
                </StyledText>
              </StyledText>
            </StyledView>
            <StyledTouchable
              style={{ backgroundColor: '#3b82f6' }}
              className="w-full py-4 rounded-xl items-center mb-1 shadow-lg"
              onPress={handleCheckout}
            >
              <StyledText className="text-white text-lg font-bold">
                CheckOut
              </StyledText>
            </StyledTouchable>
          </StyledView>
        )}

        {/* Loading overlay */}
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(255,255,255,0.55)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator
              size="large"
              color={isDark ? '#60a5fa' : '#2563eb'}
            />
          </View>
        )}
        {/* --- CUSTOM STATUS MODAL --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={statusModal.visible}
          onRequestClose={() =>
            setStatusModal(prev => ({ ...prev, visible: false }))
          }
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-xl items-center">
              {/* Dynamic Icon */}
              <View
                className={`p-4 rounded-full mb-4 ${
                  statusModal.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : statusModal.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                {statusModal.type === 'success' && (
                  <CheckCircle size={32} color="#16a34a" />
                )}
                {statusModal.type === 'error' && (
                  <AlertCircle size={32} color="#ef4444" />
                )}
                {statusModal.type === 'info' && (
                  <Info size={32} color="#3b82f6" />
                )}
              </View>

              {/* Content */}
              <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {statusModal.title}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">
                {statusModal.message}
              </Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setStatusModal(prev => ({ ...prev, visible: false }));
                  if (statusModal.onClose) {
                    statusModal.onClose();
                  }
                }}
                className={`w-full py-3.5 rounded-2xl ${
                  statusModal.type === 'success'
                    ? 'bg-green-500'
                    : statusModal.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
              >
                <Text className="text-white font-bold text-center text-lg">
                  Okay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </StyledView>
    </TouchableWithoutFeedback>
  );
}
