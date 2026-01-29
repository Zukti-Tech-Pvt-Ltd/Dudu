// import React, { useState, useEffect, useMemo } from 'react';
// import { View, Text, FlatList, useColorScheme, StatusBar } from 'react-native';
// import { useRoute } from '@react-navigation/native';

// import {
//   Rider,
//   AcceptedRider,
//   getDistanceFromLatLonInKm,
//   googleReverseGeocode,
//   openMap,
// } from './riderUtils'; // Import from Part 1
// import {
//   getCurrentLocation,
//   requestLocationPermission,
// } from '../../../hooks/useFCM';
// import {
//   AssignOrderToRider,
//   getAllRider,
//   getRiderWhoAccepted,
//   rejectOrderToRider,
// } from '../../../api/merchantOrder/orderApi';
// import { AssignModal, RiderListItem, StatusModal } from './riderComponents';

// export default function AvaliableRidersScreen() {
//   const colorScheme = useColorScheme();
//   const isDarkMode = colorScheme === 'dark';
//   const { order } = useRoute<any>().params;

//   // --- Dynamic Colors ---
//   const colors = {
//     screenBg: isDarkMode ? '#171717' : '#ffffff',
//     cardBg: isDarkMode ? '#262626' : '#ffffff',
//     textPrimary: isDarkMode ? '#ffffff' : '#111827',
//     textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
//     inputBg: isDarkMode ? '#404040' : '#f3f4f6',
//     border: isDarkMode ? '#404040' : '#e5e7eb',
//     iconColor: isDarkMode ? '#d1d5db' : '#6b7280',
//   };

//   // --- State ---
//   const [riders, setRiders] = useState<Rider[]>([]);
//   const [accepted, setAccepted] = useState<AcceptedRider[]>([]);
//   const [locations, setLocations] = useState<Record<number, string>>({});
//   const [sellerLocation, setSellerLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [uniqueKey, setUniqueKey] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Modals
//   const [assignModal, setAssignModal] = useState({
//     visible: false,
//     rider: null as Rider | null,
//     assigning: false,
//   });
//   const [statusModal, setStatusModal] = useState({
//     visible: false,
//     type: 'info',
//     title: '',
//     message: '',
//   });

//   const showAlert = (
//     title: string,
//     message: string,
//     type: 'success' | 'error' | 'info' = 'info',
//   ) => {
//     setStatusModal({ visible: true, title, message, type });
//   };

//   // --- 1. Initial Fetch (Permission -> Location -> Riders) ---
//   useEffect(() => {
//     const init = async () => {
//       setLoading(true);
//       try {
//         const hasPermission = await requestLocationPermission();
//         if (!hasPermission)
//           return showAlert('Permission', 'Location required', 'error');

//         const loc = await getCurrentLocation();
//         if (!loc) return showAlert('Error', 'Location unavailable', 'error');

//         setSellerLocation(loc);
//         const data = await getAllRider(loc.latitude, loc.longitude);
//         if (Array.isArray(data.data)) setRiders(data.data);
//         if (data.uniqueKey) setUniqueKey(data.uniqueKey);
//       } catch (e) {
//         showAlert('Error', 'Failed to fetch riders', 'error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   // --- 2. Polling Accepted Riders ---
//   useEffect(() => {
//     if (!uniqueKey) return;
//     const fetchAccepted = async () => {
//       try {
//         const data = await getRiderWhoAccepted(uniqueKey);
//         setAccepted(data || []);
//       } catch (e) {
//         console.error(e);
//       }
//     };
//     fetchAccepted();
//     const interval = setInterval(fetchAccepted, 3000);
//     return () => clearInterval(interval);
//   }, [uniqueKey]);

//   // --- 3. Resolve Addresses for Accepted Riders ---
//   useEffect(() => {
//     if (accepted.length === 0) return;
//     const resolve = async () => {
//       const newLocs: Record<number, string> = {};
//       await Promise.all(
//         accepted.map(async a => {
//           newLocs[a.partnerId] = await googleReverseGeocode(a.lat, a.lng);
//         }),
//       );
//       setLocations(newLocs);
//     };
//     resolve();
//   }, [accepted]);

//   // --- 4. Merge Data & Calculate Distance (Memoized) ---
//   const processedRiders = useMemo(() => {
//     if (!sellerLocation) return riders;

//     return riders
//       .map(r => {
//         const match = accepted.find(a => a.partnerId === r.id);
//         let distance = undefined;

//         if (match) {
//           distance = getDistanceFromLatLonInKm(
//             sellerLocation.latitude,
//             sellerLocation.longitude,
//             match.lat,
//             match.lng,
//           );
//         }
//         return { ...r, distance, isAccepted: !!match };
//       })
//       .sort((a, b) => {
//         // Sort: Accepted first, then by distance
//         if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
//         if (a.distance == null) return 1;
//         if (b.distance == null) return -1;
//         return a.distance - b.distance;
//       });
//   }, [riders, accepted, sellerLocation]);

//   // --- Actions ---
//   const handleRiderPress = (rider: Rider) => {
//     const isAcc = accepted.some(a => a.partnerId === rider.id);
//     if (!isAcc)
//       return showAlert(
//         'Rider Detail',
//         `User: ${rider.username}\n(Waiting for acceptance)`,
//         'info',
//       );
//     setAssignModal({ visible: true, rider, assigning: false });
//   };

//   const handleAssign = async () => {
//     const rider = assignModal.rider;
//     if (!rider || !sellerLocation) return;

//     setAssignModal(prev => ({ ...prev, assigning: true }));
//     try {
//       const address = await googleReverseGeocode(
//         sellerLocation.latitude,
//         sellerLocation.longitude,
//       );
//       await AssignOrderToRider(
//         rider.id,
//         order.id,
//         sellerLocation.latitude,
//         sellerLocation.longitude,
//         address,
//       );
//       await rejectOrderToRider(rider.id, uniqueKey);

//       setAssignModal({ visible: false, rider: null, assigning: false });
//       setTimeout(() => showAlert('Success', 'Order assigned!', 'success'), 300);
//     } catch (e) {
//       showAlert('Error', 'Assignment failed', 'error');
//       setAssignModal(prev => ({ ...prev, assigning: false }));
//     }
//   };

//   const handleViewMap = () => {
//     const rider = assignModal.rider;
//     if (!rider) return;
//     const match = accepted.find(a => a.partnerId === rider.id);
//     if (match) openMap(match.lat, match.lng);
//   };

//   return (
//     <View className="flex-1 p-4" style={{ backgroundColor: colors.screenBg }}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={colors.screenBg}
//       />

//       {loading && (
//         <Text
//           style={{ color: colors.textSecondary }}
//           className="text-center mb-2"
//         >
//           Loading...
//         </Text>
//       )}

//       <FlatList
//         data={processedRiders}
//         keyExtractor={item => item.id.toString()}
//         renderItem={({ item }: any) => (
//           <RiderListItem
//             item={item}
//             isAccepted={item.isAccepted}
//             location={locations[item.id]}
//             distance={item.distance}
//             onPress={() => handleRiderPress(item)}
//             colors={colors}
//           />
//         )}
//         ListEmptyComponent={
//           !loading ? (
//             <View className="flex-1 justify-center items-center mt-10">
//               <Text style={{ color: colors.textSecondary }} className="text-lg">
//                 No riders found.
//               </Text>
//             </View>
//           ) : null
//         }
//       />

//       <AssignModal
//         visible={assignModal.visible}
//         rider={assignModal.rider}
//         location={assignModal.rider ? locations[assignModal.rider.id] : ''}
//         loading={assignModal.assigning}
//         onClose={() => setAssignModal(prev => ({ ...prev, visible: false }))}
//         onConfirm={handleAssign}
//         onMap={handleViewMap}
//         colors={colors}
//       />

//       <StatusModal
//         {...statusModal}
//         onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
//         colors={colors}
//       />
//     </View>
//   );
// }
