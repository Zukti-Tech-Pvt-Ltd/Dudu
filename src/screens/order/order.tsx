import React, { useEffect, useState } from 'react';
import {  ScrollView, ActivityIndicator, Text } from 'react-native';
import {  getAllOrders } from '../../api/orderApi';
import OrderCard from './orderCard';

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  createdAt: string;
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

export default function OrdersScreen() {
const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;
  if (!orders.length) return <Text>No orders found.</Text>;

  return (
    <ScrollView>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ScrollView>
  );
}
