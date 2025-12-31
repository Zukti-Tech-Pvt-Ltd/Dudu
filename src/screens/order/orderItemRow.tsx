import { API_BASE_URL } from '@env';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
export default function OrderItemRow({ item }: any) {
  console.log('!!!!!!!!!!!!!!!!!!!!!item', item);
  const normalizedImage = item.__product__?.image?.startsWith('/')
    ? item.__product__.image.slice(1)
    : item.__product__?.image || '';

  const imageUri = `${API_BASE_URL}/${normalizedImage}`;

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>Product #{item.__product__.id}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.qty}>Qty: {item.quantity}</Text>
          <Text style={styles.price}>Rs:{item.price}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  image: {
    width: 55,
    height: 55,
    marginRight: 12,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  qty: {
    fontSize: 15,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
