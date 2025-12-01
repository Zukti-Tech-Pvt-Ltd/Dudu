// import React, { useContext } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
// } from "react-native";
// import LogoutButton from "./logoutButton";
// import { AuthContext } from "../../helper/authContext";

// export default function ProfileScreen({ navigation }: any) {
//   const { isLoggedIn, token } = useContext(AuthContext);

//   let username = "User";
//   let email = "sadhubasnet@gmail.com";
//   let phone = "+1 (555) 123-4567";

//   if (token) {
//     try {
//       const decoded: any = JSON.parse(
//         atob(token.split(".")[1]) // decode jwt payload
//       );
//       username = decoded.username || username;
//       email = decoded.email || email;
//       phone = decoded.phone || phone;
//     } catch {
//       // invalid token, fallback values
//     }
//   }

//   if (!isLoggedIn) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <Image
//           source={require("../../../assets/images/user.png")}
//           className="w-20 h-20 rounded-full mb-4 bg-gray-200"
//         />
//         <Text className="font-bold text-lg text-gray-900 mb-2">
//           Welcome, Guest
//         </Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Login")}
//           className="bg-blue-500 px-6 py-3 rounded-lg"
//         >
//           <Text className="text-white font-medium text-base">Login</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 bg-white px-4">
//       {/* Profile Card */}
//       <View className="flex-row items-center bg-white rounded-2xl p-4 shadow mb-3">
//         <Image
//           source={require("../../../assets/images/girl.png")}
//           className="w-14 h-14 rounded-full mr-3 bg-gray-200"
//         />
//         <View className="flex-1">
//           <Text className="font-bold text-lg text-gray-900">{username}</Text>
//           <Text className="text-gray-600 text-sm">{email}</Text>
//           <Text className="text-gray-600 text-sm">{phone}</Text>
//         </View>
//         <TouchableOpacity className="bg-blue-50 px-3 py-1 rounded-lg">
//           <Text className="text-blue-600 font-medium text-base">Edit</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Summary Cards */}
//       <View className="flex-row justify-between mb-4">
//         {/* example summary cards */}
//         <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
//           <Text className="font-bold text-base text-gray-900 mb-1">24</Text>
//           <Text className="text-gray-500 text-xs">Total Orders</Text>
//         </View>
//         <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
//           <Text className="font-bold text-base text-gray-900 mb-1">$1,240</Text>
//           <Text className="text-gray-500 text-xs">Total Spent</Text>
//         </View>
//         <View className="bg-white rounded-xl flex-1 mx-1 px-2 py-3 items-center shadow">
//           <Text className="font-bold text-base text-gray-900 mb-1">4.8</Text>
//           <Text className="text-gray-500 text-xs">Rating</Text>
//         </View>
//       </View>

//       {/* Account Actions */}
//       <View className="bg-white rounded-2xl shadow mb-3">
//         {/* your AccountAction components */}
//       </View>

//       {/* Sign Out Button */}
//       <View className="mt-8 mb-10 items-center">
//         <LogoutButton />
//       </View>
//     </ScrollView>
//   );
// }
