import { useRoute, RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

type BottomTabParamList = {
  category: { categoryId: string };
};

type CategoryRouteProp = RouteProp<BottomTabParamList, 'category'>;

export default function Category() {
  const route = useRoute<CategoryRouteProp>();
  const { categoryId } = route.params;

  // Use categoryId to fetch or filter category-specific data

  return (
    <View>
      <Text>Showing products for category: {categoryId}</Text>
      {/* render filtered list */}
    </View>
  );
}
