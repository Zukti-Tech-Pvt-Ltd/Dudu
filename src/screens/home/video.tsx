import {
  ScrollView,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import React, { use, useEffect, useState } from 'react';

// export default function HorizontalVideos({ videos }: { videos: any[] }) {
//   const [playingIndex, setPlayingIndex] = useState<number | null>(null);

//   const togglePlay = (index: number) => {
//     setPlayingIndex(prev => (prev === index ? null : index));
//   };

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.scrollView}
//     >
//       {videos.map((item, index) => (
//         <View key={item.id?.toString() ?? `video-${index}`} style={styles.videoContainer}>
//          <TouchableWithoutFeedback onPress={() => togglePlay(index)}>
//  <Video
//   source={{ uri: item.video }}
//   style={styles.video}
//   paused={playingIndex !== index}
//   resizeMode="cover"
//   repeat
//   muted
//   controls={false}
//   playInBackground={false}
//   playWhenInactive={false}
//   ignoreSilentSwitch="ignore"
// />
// </TouchableWithoutFeedback>
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: {
//     paddingHorizontal: 16,
//   },
//   videoContainer: {
//     width: 300,
//     height: 180,
//     marginRight: 15,
//     backgroundColor: 'black',
//     borderRadius: 12,
//     overflow: 'hidden',
//     padding: 8, // You asked for padding on the video
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
// });

// Add this inside your Home component, wherever you'd like the video section:
export function FeaturedVideo() {
 
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <View className="w-full aspect-video bg-white rounded-xl overflow-hidden my-2 justify-center items-center">
      {/* Loader appears above video */}
      {!videoLoaded && (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          className="absolute z-10"
        />
      )}

      <Video
        source={{
          uri: 'https://mpxwwjnxgjfznxhlymaq.supabase.co/storage/v1/object/public/dudu-bucket/videos/featured/9940-221773846_small.mp4',
        }}
        className="w-full h-full"
        style={{ opacity: videoLoaded ? 1 : 0 }} // direct inline style still needed for opacity
        controls={false}
        paused={false}
        resizeMode="contain"
        repeat
        onLoad={() => setVideoLoaded(true)}
        onError={(e) => console.log('Video error:', e)}
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />
    </View>
  );
}