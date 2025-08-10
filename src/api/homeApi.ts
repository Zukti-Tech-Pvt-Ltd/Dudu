import { useState } from 'react';
import { supabase } from '../../supabase/supabase';

// Utility to pick n random elements from an array
function getRandomElements(arr: any[], n: number | undefined) {
  if (!Array.isArray(arr)) return [];
  // Shuffle and take first n
  return arr
    .map(val => ({ val, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ val }) => val)
    .slice(0, n);
}

export const getRandomProducts = async () => {
  // Double quote for "Li Ha Moto" table (space-sensitive)
  const [foodResult, shopResult, lihaResult] = await Promise.all([
    supabase.from('Food').select('*'),
    supabase.from('Shop').select('*'),
    supabase.from('Li Ha Moto').select('*'),
  ]);

  // Optional: log errors
  if (foodResult.error) console.error('Food error', foodResult.error);
  if (shopResult.error) console.error('Shop error', shopResult.error);
  if (lihaResult.error) console.error('Li Ha Moto error', lihaResult.error);
  const food = (foodResult.data || []).map(item=>({...item,table:'Food'}));
  const shop = (shopResult.data || []).map(item=>({...item,table:'Shop'}));
  const liha = (lihaResult.data || []).map(item=>({...item,table:'Li Ha Moto'}));

  // Pick 2 random items from each dataset

  // Combine all as a single array (for flat display)
  return [...getRandomElements(food, 2),
    ...getRandomElements(shop, 2),
    ...getRandomElements(liha, 2),
    ];
};

export const getVideo = async () => {
  let { data: video, error } = await supabase.from('advertise').select('*');
  if (error) {
    console.error('Error fetching video:', error);
    return [];
  }
  return video ?? [];
};
