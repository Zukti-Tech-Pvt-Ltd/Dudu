import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import Video from 'react-native-video';

const windowWidth = Dimensions.get('window').width;

const data = [
  {
    image: require('../../../assets/images/electronic-products-regulations-singapore.jpg'),
    video: require('../../../assets/images/9940-221773846_small.mp4'),
  },
  {
    image: require('../../../assets/images/electronics-1.png'),
    video: require('../../../assets/images/dog.mp4'),
  },
  {
    image: require('../../../assets/images/Untitled design (5).png'),
    video: require('../../../assets/images/flower.mp4'),
  },
  {
    image: require('../../../assets/images/Untitled design (4).png'),
    video: require('../../../assets/images/street.mp4'),
  },
];

export default function PayScreen() {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number | null>(null);
  const [videosLoaded, setVideosLoaded] = useState<{ [key: number]: boolean }>({});
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentVisibleIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
  });

  const onVideoLoad = (index: number) => {
    setVideosLoaded(prev => ({ ...prev, [index]: true }));
  };

  // 👇 Force FlatList to update visibility check on layout
  const handleLayout = () => {
    if (flatListRef.current) {
      flatListRef.current.recordInteraction(); // triggers re-evaluation of visible items
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      onLayout={handleLayout}
      data={data}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => {
        const isVisible = currentVisibleIndex === index;
        const videoLoaded = videosLoaded[index] === true;

        return (
          <View style={styles.mediaContainer}>
            <Image source={item.image} style={styles.media} resizeMode="cover" />
            {isVisible && (
              <>
                {!videoLoaded && (
                  <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
                )}
                <Video
                  source={item.video}
                  style={[
                    styles.media,
                    styles.videoOverlay,
                    { opacity: videoLoaded ? 1 : 0 },
                  ]}
                  paused={!isVisible}
                  resizeMode="cover"
                  repeat
                  muted
                  controls={false}
                  disableFocus={true}
                  fullscreen={false}
                  onLoad={() => onVideoLoad(index)}
                />
              </>
            )}
          </View>
        );
      }}
      pagingEnabled={false}
      showsVerticalScrollIndicator={true}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      contentContainerStyle={{ paddingVertical: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    height: 300,
    width: windowWidth * 0.9,
    marginVertical: 10,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loader: {
    position: 'absolute',
    zIndex: 10,
  },
});