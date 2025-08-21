import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox'; // or your preferred checkbox
import { styled } from 'nativewind';
import { getCart } from '../../api/serviceList/cartApi';
import { API_BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledImage = styled(Image);

type Item = {
  id: string;
  img: any;
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

// const cartData: CartGroup[] = [
//   {
//     shop: 'MUST BUY',
//     items: [
//       {
//         id: 'item1',
//         img: require('../../../assets/images/user.png'),
//         name: 'Vintage T-9 Hair Trimmer Battery Removable For Male Plastic Body',
//         extra: 'No Brand, Quantity:1 pc',
//         ends: 'Ends at Aug 21 23:59:59',
//         price: 249,
//         oldPrice: 1500,
//         qty: 1,
//       },
//       {
//         id: 'it31',
//         img: require('../../../assets/images/user.png'),
//         name: 'Vintage T-9 Hair Trimmer Battery Removable For Male Plastic Body',
//         extra: 'No Brand, Quantity:1 pc',
//         ends: 'Ends at Aug 21 23:59:59',
//         price: 249,
//         oldPrice: 1500,
//         qty: 1,
//       },
//     ],
//   },
//   {
//     shop: 'Kushal CD Cassette Store',
//     items: [
//       {
//         id: 'item2',
//         img: require('../../../assets/images/user.png'),
//         name: 'Dual Band 600Mbps USB Wi-Fi Adapter, 2.4G/5G Wireless Network Card, USB...',
//         extra: 'No Brand, Color Family:Black',
//         price: 899,
//         oldPrice: 1345,
//         qty: 1,
//       },
//     ],
//   },
//   {
//     shop: 'Masala Beads',
//     items: [
//       {
//         id: 'item3',
//         img: require('../../../assets/images/user.png'),
//         name: 'Masala Beads Winter Woolen Knitted Fashion Scarf Double-sided Smiley Face',
//         extra: 'Color Family:Red',
//         left: 3,
//         price: 980,
//         qty: 1,
//       },
//     ],
//   },
//   {
//     shop: 'Aarusi Center',
//     items: [
//       {
//         id: 'item4',
//         img: require('../../../assets/images/user.png'),
//         name: 'Double Sided Winter Fur Earmuffs For Girls',
//         extra: 'Color Family:Multicolor',
//         price: 690,
//         qty: 3,
//       },
//     ],
//   },
// ];

export default function CartScreen() {
  const [loading, setLoading] = useState<boolean>(false);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [cartData, setCartData] = useState<CartGroup[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  useEffect(() => {
    
    if (cartData && cartData.length > 0) {
      const qtys = cartData.reduce((prev: Record<string, number>, group) => {
        group.items.forEach(item => {
          prev[item.id] = item.qty;
        });
        return prev;
      }, {});
      setQuantities(qtys);
    }
  }, [cartData]);

  // const [quantities, setQuantities] = useState<Record<string, number>>(
  //   cartData.reduce((prev: Record<string, number>, group) => {
  //     group.items.forEach(item => (prev[item.id] = item.qty));
  //     return prev;
  //   }, {}),
  // );
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      if (response && response.data) {
        setCartData(response.data);
      } else {
        setCartData([]);
      }
    } catch (err) {
      console.error(err);
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
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
      // Only update the selected state for this item
      const updated = { ...prev, [itemId]: value };

      // Check if all items under this shop are now selected
      const shopShouldBeSelected = items.every(item =>
        item.id === itemId ? value : !!updated[item.id],
      );

      // Shop checkbox reflects all items: checked only if all are checked
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
        updated[item.id] = value; // select/deselect ALL items under this shop
      });
      return updated;
    });
  }

  // Subtotal calculation
  const subtotal = Object.entries(quantities).reduce((sum, [id, qty]) => {
    // Find the item and its group
    for (const group of cartData) {
      const item = group.items.find(i => i.id === id);
      console.log('seleced', selected);
      // Only add to subtotal if this item is selected
      if (item && selected[id]) {
        return sum + item.price * qty;
      }
    }
    return sum;
  }, 0);

  return (
    <StyledView className="flex-1">
      {loading ? (
  <StyledText className="text-center py-6 text-gray-500">Loading cart...</StyledText>
) : (
      <ScrollView className="flex-1 py-3 px-3">
        {cartData.map((group, idx) => (
          <StyledView
            key={group.shop}
            className="bg-white rounded-2xl mb-4 p-3 shadow"
          >
            {/* Store/Group Title */}
            <StyledView className="flex-row items-center mb-2">
              <Checkbox
                value={!!selected[group.shop]}
                onValueChange={val =>
                  handleShopSelect(group.shop, group.items, val)
                }
              />
              <StyledImage
                source={require('../../../assets/images/shop.png')} // Replace with your icon path
                className="ml-2 w-4 h-4"
                style={{ marginTop: 1 }} // fine-tune vertical alignment if needed
              />
              <StyledText className=" px-1 font-semibold text-base">
                {group.shop}
              </StyledText>
              {/* Arrow/icon can go here */}
            </StyledView>
            {group.items.map(item => {
              const normalizedImage = item.img.startsWith('/')
                ? item.img.slice(1)
                : item.img;

              const imageUri = `${API_BASE_URL}/${normalizedImage}`;
              return (
                <StyledView key={item.id} className="flex-row py-2 ">
                  <Checkbox
                    className="mt-4 mr-2" // Add margin-top to move it downward
                    value={!!selected[item.id]}
                    onValueChange={val =>
                      handleItemSelect(group.shop, group.items, item.id, val)
                    }
                  />
                  <StyledImage
                    source={{ uri: imageUri }}
                    className="w-14 h-14 rounded mr-3  bg-gray-200"
                  />
                  <StyledView className="flex-1">
                    <StyledText className="font-medium text-gray-900">
                      {item.name}
                    </StyledText>
                    <StyledText className="text-gray-500 text-xs">
                      {item.extra}
                    </StyledText>
                    {item.ends && (
                      <StyledText className="text-xs text-orange-600">
                        {item.ends}
                      </StyledText>
                    )}
                    {item.left && (
                      <StyledText className="text-xs text-rose-500">
                        {item.left} item(s) left
                      </StyledText>
                    )}
                    <StyledView className="flex-row mt-1 items-center">
                      <StyledText
                        style={{ color: '#3b82f6' }}
                        className=" text-base font-bold"
                      >
                        Rs. {item.price}
                      </StyledText>
                      {item.oldPrice && (
                        <StyledText className="text-gray-400 text-xs line-through ml-2">
                          Rs. {item.oldPrice}
                        </StyledText>
                      )}
                    </StyledView>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <StyledTouchable
                      onPress={() => handleQtyChange(item.id, -1)}
                      className="w-6 h-6 items-center justify-center bg-gray-200 rounded"
                    >
                      <StyledText>-</StyledText>
                    </StyledTouchable>
                    <StyledText className="mx-2">
                      {quantities[item.id]}
                    </StyledText>
                    <StyledTouchable
                      onPress={() => handleQtyChange(item.id, 1)}
                      className="w-6 h-6 items-center justify-center bg-gray-200 rounded"
                    >
                      <StyledText>+</StyledText>
                    </StyledTouchable>
                  </StyledView>
                </StyledView>
              );
            })}
          </StyledView>
        ))}

        {/* Subtotal, Checkout */}
        <StyledView className="flex-row items-center justify-between my-4">
          <StyledText className="text-base font-bold">
            Subtotal:{' '}
            <StyledText style={{ color: '#3b82f6' }}>Rs. {subtotal}</StyledText>
          </StyledText>
          <StyledText className="text-base font-medium text-gray-600">
            Shipping Fee:{' '}
            <StyledText style={{ color: '#3b82f6' }}>Rs. 0</StyledText>
          </StyledText>
        </StyledView>
        <StyledTouchable
          style={{ backgroundColor: '#3b82f6' }}
          className="w-full py-4 rounded-xl items-center mb-6"
        >
          <StyledText className="text-white text-lg font-bold">
            Check Out
          </StyledText>
        </StyledTouchable>
      </ScrollView>
)}
    </StyledView>
  );
}
