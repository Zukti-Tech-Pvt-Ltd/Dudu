import React, { useContext, useEffect, useState } from 'react';
import {  ScrollView, ActivityIndicator, Text, TouchableOpacity, View, Image } from 'react-native';
import {  getAllOrders } from '../../api/orderApi';
import OrderCard from './orderCard';
import { AuthContext } from '../../helper/authContext';
type Product = {
  id: number;
  image: string;
  video: string;
  name: string;
  category: string;
  description: string;
  order: number;
  price: number;
  rate: number;
  count: number;
  type?: string | null;
  createdAt: string;
  
};
type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  createdAt: string;
  __product__: Product;

};

type Order = {
  id: number;
  userId: number;
  status: string;
  price: string;
  createdAt: string;
  estimatedDeliveryDate: string;
  __orderItems__: OrderItem[];
};
const filters = [
    { label: 'All Orders' },
        { label: 'OrderPlaced' },
    { label: 'Pending' },
    { label: 'Confirmed' },
    { label: 'Shipped' },
    { label: 'Delivered' },

  ];

export default function OrdersScreen() {
  const { isLoggedIn } = useContext(AuthContext); 
  console.log("isloginIN",isLoggedIn)
const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
          console.log(';;;;;;;')

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
const filterParam = selected === 'All Orders' ? '' : selected;

        const data = await getAllOrders(filterParam);
        setOrders(data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    })();
  }, [selected]);

          console.log('........')



  if (!isLoggedIn) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <Image
            source={require('../../../assets/images/user.png')}
            className="w-20 h-20 rounded-full mb-4 bg-gray-200"
          />
          <Text className="font-bold text-lg text-gray-900 mb-2">
            please login in first
          </Text>
        </View>
      );
    }
  if (loading)
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );


  return (
    <ScrollView>
       <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 7, marginVertical: 8}}
    >
      <View style={{ flexDirection: 'row' }}>
      {filters.map((filter, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelected(filter.label);
                    }}
                    className={`px-[10px] h-9 mr-2 rounded-full items-center justify-center `}
                    style={{
                      backgroundColor:
                        selected === filter.label ? '#2563eb' : '#e0e7ef',
                    }}
                  >
                    <Text
                      className="font-medium text-lg"
                      style={{
                        color: selected === filter.label ? 'white' : '#374151',
                      }}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                </View>
        </ScrollView>

      {orders.length ===0 ?(
        <Text className="text-center text-gray-500">No orders found.</Text>
      ):(
         orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))
      )
      }

    </ScrollView>
  );
}
