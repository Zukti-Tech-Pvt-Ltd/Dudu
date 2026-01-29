// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   ActivityIndicator,
// } from 'react-native';
// import {
//   CheckCircle,
//   User,
//   MapPin,
//   Navigation,
//   AlertCircle,
//   Info,
// } from 'lucide-react-native';
// import { Rider } from './riderUtils'; // Import types

// // --- Rider List Item ---
// export const RiderListItem = ({
//   item,
//   isAccepted,
//   location,
//   distance,
//   onPress,
//   colors,
// }: any) => (
//   <TouchableOpacity onPress={onPress}>
//     <View
//       style={{ borderBottomColor: colors.border }}
//       className="flex-row justify-between items-center p-4 border-b"
//     >
//       <View>
//         <Text
//           style={{ color: colors.textPrimary }}
//           className="text-lg font-semibold"
//         >
//           {item.username}
//         </Text>
//         <Text style={{ color: colors.textSecondary }} className="text-sm">
//           {item.email || 'No email'}
//         </Text>
//         {isAccepted && location && (
//           <>
//             <Text className="text-sm text-green-600 dark:text-green-400 mt-1">
//               📍 {location}
//             </Text>
//             <Text style={{ color: colors.textSecondary }} className="text-sm">
//               🚗{' '}
//               {distance != null
//                 ? `${distance.toFixed(2)} km away`
//                 : 'Calculating...'}
//             </Text>
//           </>
//         )}
//       </View>
//       {isAccepted && <View className="w-4 h-4 rounded-full bg-green-500" />}
//     </View>
//   </TouchableOpacity>
// );

// // --- Assign Modal ---
// export const AssignModal = ({
//   visible,
//   onClose,
//   rider,
//   location,
//   loading,
//   onConfirm,
//   onMap,
//   colors,
// }: any) => {
//   if (!visible) return null;
//   return (
//     <Modal
//       animationType="fade"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 bg-black/60 justify-center items-center px-4">
//         <View
//           style={{ backgroundColor: colors.cardBg }}
//           className="w-full rounded-3xl p-6 shadow-2xl"
//         >
//           <View className="items-center mb-5">
//             <View className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-3">
//               <CheckCircle size={32} color="#16a34a" strokeWidth={2.5} />
//             </View>
//             <Text
//               style={{ color: colors.textPrimary }}
//               className="text-xl font-bold text-center"
//             >
//               Accept Rider?
//             </Text>
//             <Text
//               style={{ color: colors.textSecondary }}
//               className="text-center mt-1"
//             >
//               Are you sure you want to assign order to {rider?.username}?
//             </Text>
//           </View>

//           <View
//             style={{ backgroundColor: colors.inputBg }}
//             className="p-4 rounded-xl mb-6 space-y-2"
//           >
//             <View className="flex-row items-center">
//               <User size={18} color={colors.iconColor} />
//               <Text
//                 style={{ color: colors.textPrimary }}
//                 className="ml-2 font-semibold"
//               >
//                 {rider?.username}
//               </Text>
//             </View>
//             <View className="flex-row items-center mt-2">
//               <MapPin size={18} color={colors.iconColor} />
//               <Text
//                 style={{ color: colors.textSecondary }}
//                 className="ml-2 text-xs flex-1"
//                 numberOfLines={2}
//               >
//                 {location ?? 'Loading...'}
//               </Text>
//             </View>
//           </View>

//           <View className="gap-3">
//             <TouchableOpacity
//               onPress={onConfirm}
//               disabled={loading}
//               className="w-full bg-green-600 py-4 rounded-2xl flex-row justify-center items-center"
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text className="text-white font-bold text-lg">
//                   Confirm & Assign
//                 </Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={onMap}
//               style={{ borderColor: colors.border }}
//               className="w-full border py-4 rounded-2xl flex-row justify-center items-center"
//             >
//               <Navigation
//                 size={20}
//                 color={colors.textPrimary}
//                 style={{ marginRight: 8 }}
//               />
//               <Text
//                 style={{ color: colors.textPrimary }}
//                 className="font-bold text-lg"
//               >
//                 View on Map
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={onClose} className="py-2 mt-1">
//               <Text className="text-gray-400 font-semibold text-center">
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // --- Generic Status Modal ---
// export const StatusModal = ({
//   visible,
//   type,
//   title,
//   message,
//   onClose,
//   colors,
// }: any) => {
//   if (!visible) return null;
//   const isSuccess = type === 'success';
//   const isError = type === 'error';

//   return (
//     <Modal
//       animationType="fade"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 bg-black/60 justify-center items-center px-6">
//         <View
//           style={{ backgroundColor: colors.cardBg }}
//           className="w-full rounded-3xl p-6 shadow-xl items-center"
//         >
//           <View
//             className={`p-4 rounded-full mb-4 ${
//               isSuccess
//                 ? 'bg-green-100 dark:bg-green-900/30'
//                 : isError
//                 ? 'bg-red-100 dark:bg-red-900/30'
//                 : 'bg-blue-100 dark:bg-blue-900/30'
//             }`}
//           >
//             {isSuccess ? (
//               <CheckCircle size={32} color="#16a34a" />
//             ) : isError ? (
//               <AlertCircle size={32} color="#ef4444" />
//             ) : (
//               <Info size={32} color="#3b82f6" />
//             )}
//           </View>
//           <Text
//             style={{ color: colors.textPrimary }}
//             className="text-xl font-bold text-center mb-2"
//           >
//             {title}
//           </Text>
//           <Text
//             style={{ color: colors.textSecondary }}
//             className="text-center mb-6 leading-5"
//           >
//             {message}
//           </Text>
//           <TouchableOpacity
//             onPress={onClose}
//             className={`w-full py-3.5 rounded-2xl ${
//               isSuccess
//                 ? 'bg-green-500'
//                 : isError
//                 ? 'bg-red-500'
//                 : 'bg-blue-500'
//             }`}
//           >
//             <Text className="text-white font-bold text-center text-lg">
//               Okay
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };
