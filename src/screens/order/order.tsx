import React, { useRef, useState, memo } from 'react';
import {
  FlatList,
  View,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';

const windowWidth = Dimensions.get('window').width;
const ITEM_MARGIN = 10;
const NUM_COLUMNS = 2;
const PADDING_HORIZONTAL = ITEM_MARGIN;
const ITEM_HEIGHT = 150;

type DataItem = {
  image: any;
  video: any;
};

const data: DataItem[] = [
  {
    image: require('../../../assets/images/electronic-products-regulations-singapore.jpg'),
    video: require('../../../assets/images/9940-221773846_small.mp4'),
  },
  {
    image: require('../../../assets/images/electronics-1.png'),
    video: require('../../../assets/images/dog.mp4'),
  },
  {
    image: require('../../../assets/images/naco.png'),
    video: require('../../../assets/images/flower.mp4'),
  },
  {
    image: require('../../../assets/images/sal.png'),
    video: require('../../../assets/images/street.mp4'),
  },
];

// Custom start time in seconds for each video
const videoStartTimes: { [key: number]: number } = {
  0: 2,
  1: 5,
  2: 0,
  3: 3,
};

const itemWidth =
  (windowWidth - PADDING_HORIZONTAL * 2 - ITEM_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

type VideoItemProps = {
  item: DataItem;
  index: number;
  isVisible: boolean;
  videoLoaded: boolean;
  isLastInRow: boolean;
  onVideoLoad: (index: number) => void;
  videoRefs: React.MutableRefObject<{ [key: number]: VideoRef | null }>;
};

const VideoItem = memo(
  ({
    item,
    index,
    isVisible,
    videoLoaded,
    isLastInRow,
    onVideoLoad,
    videoRefs,
  }: VideoItemProps) => {
    return (
      <View
        style={[
          styles.mediaContainer,
          {
            width: itemWidth,
            marginRight: isLastInRow ? 0 : ITEM_MARGIN,
          },
        ]}
      >
        <Image source={item.image} style={styles.media} resizeMode="cover" />

        {!videoLoaded && isVisible && (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        )}

        <Video
          ref={(ref) => {
            videoRefs.current[index] = ref;
          }}
          source={item.video}
          style={[
            styles.media,
            styles.videoOverlay,
            { opacity: isVisible && videoLoaded ? 1 : 0 },
          ]}
          paused={!isVisible}
          resizeMode="cover"
          repeat
          muted
          controls={false}
          disableFocus={true}
          fullscreen={false}
          onLoad={() => onVideoLoad(index)}
          bufferConfig={{
            minBufferMs: 5000,
            maxBufferMs: 15000,
            bufferForPlaybackMs: 1500,
            bufferForPlaybackAfterRebufferMs: 3000,
          }}
        />
      </View>
    );
  }
);

export default function OrdersScreen() {
  const [videosLoaded, setVideosLoaded] = useState<{ [key: number]: boolean }>({});
  const [currentVisibleIndices, setCurrentVisibleIndices] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList<DataItem>>(null);
  const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});

  // Include current, previous, and next video indices as "visible" for preloading
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const indices = new Set<number>();
      viewableItems.forEach((item) => {
        if (item.index !== null && item.isViewable) {
          indices.add(item.index);
          if (item.index > 0) indices.add(item.index - 1);
          if (item.index < data.length - 1) indices.add(item.index + 1);
        }
      });
      setCurrentVisibleIndices(indices);
    }
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100, // your requested 100% visibility threshold
  });

  const onVideoLoad = (index: number) => {
    setVideosLoaded((prev) => ({ ...prev, [index]: true }));
    const ref = videoRefs.current[index];
    const seekTime = videoStartTimes[index] ?? 0;
    if (ref && typeof seekTime === 'number') {
      ref.seek(seekTime);
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      keyExtractor={(_, index) => index.toString()}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={{ justifyContent: 'flex-start' }}
      contentContainerStyle={{
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingVertical: 100,
      }}
      renderItem={({ item, index }) => {
        const isLastInRow = (index + 3) % NUM_COLUMNS === 0;
        const isVisible = currentVisibleIndices.has(index);
        const videoLoaded = videosLoaded[index] === true;

        return (
          <VideoItem
            item={item}
            index={index}
            isVisible={isVisible}
            videoLoaded={videoLoaded}
            isLastInRow={isLastInRow}
            onVideoLoad={onVideoLoad}
            videoRefs={videoRefs}
          />
        );
      }}
      pagingEnabled={false}
      showsVerticalScrollIndicator={true}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      scrollEventThrottle={16}
      windowSize={5}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    height: ITEM_HEIGHT,
    marginBottom: ITEM_MARGIN,
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
