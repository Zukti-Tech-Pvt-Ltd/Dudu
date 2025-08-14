import { useState } from 'react';
import { supabase } from '../../supabase/supabase';
import { getRandomFood } from './serviceList/foodApi';
import { getRandomLihamoto } from './serviceList/lihamotoApi';
import { getRandomShop } from './serviceList/shopApi';
interface ApiResponse<T> {
  status: string;
  data: T[];
}
interface ServiceItem {
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
  createdAt: string;
}
export const getRandomProducts = async () => {
  const foodResult: ApiResponse<ServiceItem> = await getRandomFood();
  const shopResult: ApiResponse<ServiceItem> = await getRandomShop();
  const lihaResult: ApiResponse<ServiceItem> = await getRandomLihamoto();

  const food = (foodResult.data || []).map((item: ServiceItem) => ({
    ...item,
    table: 'Food',
  }));
  const shop = (shopResult.data || []).map((item: ServiceItem) => ({
    ...item,
    table: 'Shop',
  }));
  const liha = (lihaResult.data || []).map((item: ServiceItem) => ({
    ...item,
    table: 'Li Ha Moto',
  }));

  // Pick 2 random items from each dataset

  // Combine all as a single array (for flat display)
  return [...food, ...shop, ...liha];
};

export const getVideo = async () => {
  let { data: video, error } = await supabase.from('advertise').select('*');
  if (error) {
    console.error('Error fetching video:', error);
    return [];
  }
  return video ?? [];
};
