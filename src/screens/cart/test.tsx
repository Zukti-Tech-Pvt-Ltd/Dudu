
// // import React from 'react'
// // import { Text, View } from 'react-native'

// // export default function CartScreen({ navigation }: any) {
// //   return (
// //  <View>
// //       <Text>CartScreen</Text>
// //     </View>  )
// // }

// import React, { useState, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from "react-native";
// import Video from "react-native-video";

// const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// const videoList = [
//   { id: 1, uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
//   { id: 2, uri: "https://www.w3schools.com/html/movie.mp4" },
//   { id: 3, uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
//   { id: 4, uri: "https://www.w3schools.com/html/movie.mp4" },
//   { id: 5, uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
//   { id: 6, uri: "https://www.w3schools.com/html/movie.mp4" },
// ];

// export default function CartScreen() {
//   const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
//   const positions = useRef<{ [key: number]: { x: number; y: number } }>({}).current;

//   const videoHeight = screenHeight * 0.4; // smaller height for grid
//   const videoWidth = screenWidth / 2; // two per row

//   const handleLayout = (index: number, x: number, y: number) => {
//     positions[index] = { x, y };
//   };

//   const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const scrollY = event.nativeEvent.contentOffset.y;
//     const screenCenterY = scrollY + screenHeight / 2;

//     let closestIndex: number | null = null;
//     let smallestDistance = Infinity;

//     Object.keys(positions).forEach((key) => {
//       const idx = parseInt(key);
//       const { y } = positions[idx];
//       const videoCenterY = y + videoHeight / 2;
//       const distance = Math.abs(videoCenterY - screenCenterY);

//       if (distance < smallestDistance) {
//         smallestDistance = distance;
//         closestIndex = idx;
//       }
//     });

//     if (closestIndex !== null) {
//       const rowIndex = Math.floor(closestIndex / 2); // find which row
//       const firstInRow = rowIndex * 2;
//       const secondInRow = firstInRow + 1;
//       setVisibleIndices([firstInRow, secondInRow]);
//     }
//   };

//   return (
//     <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
//       <View style={styles.gridContainer}>
//         {videoList.map((item, index) => {
//           const isPlaying = visibleIndices.includes(index);
//           return (
//             <View
//               key={item.id}
//               style={[
//                 styles.videoWrapper,
//                 { width: videoWidth, height: videoHeight },
//                 isPlaying && styles.playingHighlight,
//               ]}
//               onLayout={(e) => {
//                 const { x, y } = e.nativeEvent.layout;
//                 handleLayout(index, x, y);
//               }}
//             >
//               <Video
//                 source={{ uri: item.uri }}
//                 style={styles.video}
//                 resizeMode="cover"
//                 repeat
//                 paused={!isPlaying}
//               />
//             </View>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   gridContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   videoWrapper: {
//     backgroundColor: "#000",
//     borderWidth: 2,
//     borderColor: "transparent",
//   },
//   playingHighlight: {
//     borderColor: "lime",
//   },
//   video: {
//     width: "100%",
//     height: "100%",
//   },
// });
