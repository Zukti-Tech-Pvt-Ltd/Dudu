import { API_BASE_URL } from '@env';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function OrderItemRow({ item }: any) {
    

  const normalizedImage = item.__product__?.image?.startsWith('/')
  ? item.__product__.image.slice(1)
  : item.__product__?.image || '';

    

  const imageUri = `${API_BASE_URL}/${normalizedImage}`;
  
  return (  
    <View style={styles.row} className='-mb-2'>
      <Image
        source={{ uri: imageUri}}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.name}>Product #{item.productId}</Text>
      <Text style={styles.qty}>Qty: {item.quantity}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  name: { flex: 2, fontSize: 15 },
  qty: { flex: 1, fontSize: 15 },
  price: { flex: 1, fontWeight: 'bold' },
});