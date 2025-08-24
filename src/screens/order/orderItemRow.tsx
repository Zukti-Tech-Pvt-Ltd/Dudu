import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrderItemRow({ item }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>Product #{item.productId}</Text>
      <Text style={styles.qty}>Qty: {item.quantity}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  name: { flex: 2, fontSize: 15 },
  qty: { flex: 1, fontSize: 15 },
  price: { flex: 1, fontWeight: 'bold' },
});
