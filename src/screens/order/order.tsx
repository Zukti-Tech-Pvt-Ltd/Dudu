// import React from 'react'
// import { Text, View } from 'react-native'
// export default function OrdersScreen({ navigation }: any) {

//   return (
//  <View>
//       <Text>CartScreen</Text>
//     </View>  )
// }
import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Icon name="home" size={60} color="#2563eb" />
    </View>
  );
}
