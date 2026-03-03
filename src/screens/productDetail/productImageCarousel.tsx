import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  Text,
  BackHandler,
  Platform,
} from 'react-native';
import { API_BASE_URL } from '@env';
import VideoPlayer from 'react-native-video';
import { PlayCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProductImageCarouselProps {
  mediaItems: MediaItem[];
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  mediaItems,
}) => {
  const insets = useSafeAreaInsets();

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const modalFlatListRef = useRef<FlatList>(null);

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const openModal = (index: number) => {
    setActiveIndex(index);
    setModalIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (modalVisible) {
        closeModal();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [modalVisible]);

  const renderMedia = (
    item: MediaItem,
    index: number,
    isFullscreen: boolean,
  ) => {
    const sourceUri = item.url
      ? { uri: `${API_BASE_URL}/${item.url}` }
      : require('../../../assets/images/photo.png');

    const isActive = activeIndex === index;

    if (item.type === 'video' && item.url) {
      return (
        <View
          className={
            isFullscreen
              ? 'w-screen h-screen justify-center items-center bg-black'
              : 'w-screen h-[300px] rounded-b-[48px] overflow-hidden bg-gray-200 dark:bg-neutral-800'
          }
          // FIX 1: Add paddingBottom to push the video controls above the nav bar
          style={isFullscreen ? { paddingBottom: insets.bottom } : {}}
        >
          <VideoPlayer
            source={{ uri: `${API_BASE_URL}/${item.url}` }}
            className="w-full h-full"
            resizeMode="contain"
            paused={!isFullscreen || !isActive}
            muted={!isFullscreen || !isActive}
            controls={isFullscreen && isActive}
            repeat={true}
          />
          {!isFullscreen && (
            <View
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            >
              <PlayCircle color="white" size={48} opacity={0.8} />
            </View>
          )}
        </View>
      );
    }

    // Default to Image
    return (
      <View
        className={
          isFullscreen
            ? 'w-screen h-screen justify-center items-center bg-black'
            : 'w-screen h-[300px] rounded-b-[48px] overflow-hidden bg-gray-200 dark:bg-neutral-800'
        }
        // FIX 1 (Continued): Center images accurately considering the nav bar
        style={isFullscreen ? { paddingBottom: insets.bottom } : {}}
      >
        <Image
          source={sourceUri}
          className="w-full h-full"
          resizeMode={isFullscreen ? 'contain' : 'cover'}
        />
      </View>
    );
  };

  return (
    <View className="relative">
      <FlatList
        ref={flatListRef}
        data={mediaItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(index)}
          >
            {renderMedia(item, index, false)}
          </TouchableOpacity>
        )}
      />

      {/* Dot indicators */}
      {mediaItems.length > 1 && (
        <View className="absolute bottom-3 w-full flex-row justify-center items-center">
          {mediaItems.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${activeIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            onPress={closeModal}
            className="absolute left-2 z-50 p-1 bg-black/40 rounded-full w-10 h-10 items-center justify-center"
            style={{
              top: Platform.OS === 'android' ? (insets.top || 20) + 25 : Math.max(insets.top, 40)
            }}
          >
            <Text className="text-white text-3xl leading-none font-light -mt-1">×</Text>
          </TouchableOpacity>

          <FlatList
            ref={modalFlatListRef}
            data={mediaItems}
            horizontal
            pagingEnabled
            initialScrollIndex={modalIndex}
            onScroll={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth,
              );
              setActiveIndex(index);
            }}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => renderMedia(item, index, true)}
          />

          {/* Dot indicators for fullscreen */}
          {mediaItems.length > 1 && (
            <View
              className="absolute w-full flex-row justify-center items-center"
              // FIX 2: Push dots up slightly so they don't overlap video controls
              style={{ bottom: Math.max(insets.bottom + 60, 60) }}
            >
              {mediaItems.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${activeIndex === index ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ProductImageCarousel;