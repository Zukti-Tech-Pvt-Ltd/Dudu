import React, { useState, useEffect, useRef } from 'react';
import {
View,
Text,
Image,
Pressable,
TouchableOpacity,
Dimensions,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getRandomProducts } from '../api/homeApi';


type Product = {
id: string;
image_url: string;
name: string;
table: string;
};


type HoldToPlayVideoProps = {
thumbnail: string;
label: string;
videoUri: string;
productId: string;
productName: string;
tableName: string;
};


type RootStackParamList = {
TwoByTwoGrid: { categoryId: string; categoryName: string };
DetailScreen: { productId: string; productName: string; tableName: string };
};


type CategoryNavigationProp = NativeStackNavigationProp<
RootStackParamList,
'TwoByTwoGrid'
>;


// const DEFAULT_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';
const DEFAULT_VIDEO = require('../../../assets/images/butterfly.mp4');
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
}: HoldToPlayVideoProps) => {
const [isPlaying, setIsPlaying] = useState(false);
const videoRef = useRef<VideoRef>(null);
const navigation = useNavigation<CategoryNavigationProp>();
const [isLoading, setIsLoading] = useState(true);
const source = typeof videoUri === 'number' ? videoUri : { uri: videoUri };


return (
<TouchableOpacity
activeOpacity={0.7}
onPress={() =>
navigation.navigate('DetailScreen', {
productId,
productName,
tableName,
})
}
className="rounded-2xl mb-4 overflow-hidden items-center
bg-white dark:bg-gray-800
shadow-md dark:shadow-black/50"
style={{ width: cardWidth }}
>
<View
className="w-full rounded-t-2xl overflow-hidden bg-black relative"
style={{ height: videoHeight }}
>
<Video
ref={ref => {
videoRef.current = ref;
}}
source={source}
className="w-full h-full"
paused={!isPlaying}
resizeMode="cover"
onLoadStart={() => setIsLoading(true)}
onLoad={() => setIsLoading(false)}
repeat
muted
controls={false}
/>
{/* Thumbnail overlay when not playing */}
{!isPlaying && (
<Image
source={{ uri: thumbnail }}
className="absolute top-0 left-0 w-full h-full"
resizeMode="cover"
/>
)}


{/* 🔹 Full opaque overlay while loading */}
{isPlaying && isLoading && (
<View className="absolute inset-0 justify-center items-center bg-black">
<Text className="text-white text-sm">Loading...</Text>
{/* Or ActivityIndicator */}
{/* <ActivityIndicator size="large" color="#fff" /> */}
</View>
)}


{isPlaying && isLoading && (
<View className="absolute inset-0 justify-center items-center bg-black">
{/* You can put an ActivityIndicator or text here */}
{/* <ActivityIndicator size="large" color="#fff" /> */}
<Text className="text-white text-sm">Loading...</Text>
</View>
)}


<Pressable
className="absolute top-0 left-0 right-0 bottom-0"
onPressIn={() => {
videoRef.current?.seek?.(0);
setIsPlaying(true);
}}
onPressOut={() => setIsPlaying(false)}
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


useEffect(() => {
getRandomProducts().then(res => setProducts(res ?? []));
}, []);


const gridProducts = products.slice(0, 6);


return (
<View
className="flex-1 justify-center
bg-gray-50 dark:bg-gray-900
px-4 py-6"
>
<View className="flex-row mb-4 justify-between">
{gridProducts.slice(0, 2).map(p => (
<HoldToPlayVideo
key={p.id}
thumbnail={p.image_url}
label={p.name}
videoUri={DEFAULT_VIDEO}
productId={p.id}
productName={p.name}
tableName={p.table}
/>
))}
</View>
<View className="flex-row mb-4 justify-between">
{gridProducts.slice(2, 4).map(p => (
<HoldToPlayVideo
key={p.id}
thumbnail={p.image_url}
label={p.name}
videoUri={DEFAULT_VIDEO}
productId={p.id}
productName={p.name}
tableName={p.table}
/>
))}
</View>
<View className="flex-row justify-between">
{gridProducts.slice(4, 6).map(p => (
<HoldToPlayVideo
key={p.id}
thumbnail={p.image_url}
label={p.name}
videoUri={DEFAULT_VIDEO}
productId={p.id}
productName={p.name}
tableName={p.table}
/>
))}
</View>
</View>
);
}