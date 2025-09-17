import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, TouchableOpacity, Dimensions } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { getRandomProducts } from '../../api/homeApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { createThumbnail } from 'react-native-create-thumbnail';

type Product = {
   id: number;
  image: string;
  video: string;
  name: string;
  category: string;
  description: string;
  order: number;
  price: number;
  rate: number;
  count: number;
  createdAt: string;
  table:string
};


type HoldToPlayVideoProps = {
  thumbnail: string;
  label: string;
  videoUri: string;
  productId: number;
  productName: string;
  tableName: string;
  isPlaying: boolean;
  onPlay: (id: number) => void;
};


type RootStackParamList = {
  TwoByTwoGrid: { categoryId: string; categoryName: string };
  DetailScreen: { productId: number; productName: string; tableName: string };
};

type CategoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TwoByTwoGrid'>;

const DEFAULT_VIDEO = require("../../../assets/images/butterfly.mp4");
const windowWidth = Dimensions.get('window').width;
const cardMargin = 12;
const cardWidth = (windowWidth - cardMargin * 3) / 2; // two cards per row with margins
const videoHeight = cardWidth * (19 / 16); // slightly taller than 16:9

const HoldToPlayVideo = ({
  thumbnail,
  label,
  videoUri,
  productId,
  productName,
  tableName,
  isPlaying,
  onPlay,
}: HoldToPlayVideoProps) => {
  
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const videoRef = useRef<VideoRef>(null);
  const navigation = useNavigation<CategoryNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);

  // const normalizedImage = thumbnail.startsWith('/')
  //   ? thumbnail.slice(1)
  //   : thumbnail;
  // const imageUri = `${API_BASE_URL}/${normalizedImage}`;
  console.log('videoUri================', videoUri);
   const normalizedVideo = thumbnail.startsWith('/')
    ? videoUri.slice(1)
    : videoUri;
  const video = `${API_BASE_URL}/${normalizedVideo}`;

  useEffect(() => {
    const fetchThumbnail = async () => {
      const uri = await getThumbnail(video);
      setThumbnailUri(uri);
    };
    fetchThumbnail();
  }, [video]);

  const getThumbnail = async (videoUri: string) => {
    try {
      const response = await createThumbnail({
        url: videoUri,
        timeStamp: 1000,
      });
      return response.path;
    } catch (e) {
      console.error('Error creating thumbnail:', e);
      return null;
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (!isPlaying) {
          onPlay(productId);
        }
        navigation.navigate('DetailScreen', {
          productId,
          productName,
          tableName,
        });
      }}
      className="rounded-2xl mb-4 overflow-hidden items-center
                 bg-white dark:bg-gray-800
                 shadow-md dark:shadow-black/50"
      style={{ width: cardWidth }}
    >
      <View
        className="w-full rounded-t-2xl overflow-hidden bg-gray-200 relative"
        style={{ height: videoHeight }}
      >
        {isPlaying ? (
          <Video
            ref={(ref) => {
              videoRef.current = ref;
            }}
            source={{ uri: video }}
            className="w-full h-full"
            paused={!isPlaying}
            resizeMode="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            repeat
            muted
            controls={false}
          />
        ) : (
          <Image
            source={thumbnailUri ? { uri: thumbnailUri } : undefined}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
        
        {isPlaying && isLoading && (
          <View className="absolute inset-0 justify-center items-center bg-black">
            <Text className="text-white text-sm">Loading...</Text>
          </View>
        )}

        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPressIn={() => {
            onPlay(productId);
            videoRef.current?.seek?.(0);
          }}
          // onPressOut={() => onPlay(null)} // optional: stop video on press out
        />
      </View>
      <View className="py-2 w-full items-center">
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize text-center mt-1">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function TwoByTwoGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    getRandomProducts().then((res) => setProducts(res?.data ?? []));
  }, []);

  const gridProducts = products.slice(0, 6);
console.log('gridProducts========',gridProducts)
  const handlePlay = (id: number) => {
    // If the same video is pressed while playing, pause it, else play new one
    setPlayingId((current) => (current === id ? null : id));
  };
  return (
    <View
      className="flex-1 justify-center
                    bg-gray-50 dark:bg-gray-900
                    px-4 py-6"
    >
      <View className="flex-row mb-4 justify-between">
        {gridProducts.slice(0, 2).map((p) => (
          <HoldToPlayVideo
            key={p.id}
            thumbnail={`${p.image}`}
            label={p.name}
            videoUri={p.video}
            productId={p.id}
            productName={p.name}
            tableName={p.table}
            isPlaying={playingId === p.id}
            onPlay={handlePlay}
          />
        ))}
      </View>
      <View className="flex-row mb-4 justify-between">
        {gridProducts.slice(2, 4).map((p) => (
          <HoldToPlayVideo
            key={p.id}
            thumbnail={`${p.image}`}
            label={p.name}
            videoUri={p.video}
            productId={p.id}
            productName={p.name}
            tableName={p.table}
            isPlaying={playingId === p.id}
            onPlay={handlePlay}
          />
        ))}
      </View>
      <View className="flex-row justify-between">
        {gridProducts.slice(4, 6).map((p) => (
          <HoldToPlayVideo
            key={p.id}
            thumbnail={`${p.image}`}
            label={p.name}
            videoUri={p.video}
            productId={p.id}
            productName={p.name}
            tableName={p.table}
            isPlaying={playingId === p.id}
            onPlay={handlePlay}
          />
        ))}
      </View>
    </View>
  );
}
