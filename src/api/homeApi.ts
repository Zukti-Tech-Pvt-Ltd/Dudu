import { supabase } from "../../supabase/supabase";

export const getRandomProducts = async () => {
  const [{ data: food }, { data: shop }, { data: liha }] = await Promise.all([
    supabase.from('Food').select('*').order('RANDOM()', { ascending: true }).limit(2),
    supabase.from('Shop').select('*').order('RANDOM()', { ascending: true }).limit(2),
    supabase.from('Li Ha Moto').select('*').order('RANDOM()', { ascending: true }).limit(2),
  ]);
  // Return as a single flat array or object as needed
  return [...(food || []), ...(shop || []), ...(liha || [])];
};
