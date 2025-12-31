import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { API_BASE_URL } from '@env';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const carouselHeight = 300; // main screen carousel height

interface ProductImageCarouselProps {
  allImages: string[];
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  allImages,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const modalFlatListRef = useRef<FlatList>(null);
  console.log('allImages in carousel', allImages);
  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Handle Android Back Button
  useEffect(() => {
    const backAction = () => {
      if (modalVisible) {
        closeModal();
        return true; // prevent default back behavior
      }
      return false; // allow default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [modalVisible]);

  return (
    <View className="relative">
      <FlatList
        ref={flatListRef}
        data={allImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(index)}
          >
            <View
              style={{
                width: screenWidth,
                height: carouselHeight,
                borderBottomLeftRadius: 48,
                borderBottomRightRadius: 48,
                overflow: 'hidden',
              }}
            >
              <Image
                source={
                  item
                    ? { uri: `${API_BASE_URL}/${item}` }
                    : require('../../../assets/images/photo.png')
                }
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotContainer}>
        {allImages.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: activeIndex === index ? '#007AFF' : '#ccc',
            }}
          />
        ))}
      </View>

      {/* Fullscreen Modal */}
      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          {/* Close Button */}
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={{ color: 'white', fontSize: 28 }}>×</Text>
          </TouchableOpacity>

          <FlatList
            ref={modalFlatListRef}
            data={allImages}
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
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.modalImageWrapper}>
                <Image
                  source={
                    item
                      ? { uri: `${API_BASE_URL}/${item}` }
                      : require('../../../assets/images/photo.png')
                  }
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dot indicators for fullscreen */}
          <View style={[styles.dotContainer, { bottom: 30 }]}>
            {allImages.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: activeIndex === index ? '#007AFF' : '#ccc',
                }}
              />
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dotContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageWrapper: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
});

export default ProductImageCarousel;
