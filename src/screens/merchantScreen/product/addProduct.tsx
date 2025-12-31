import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '@env';
import { createProduct } from '../../../api/merchantOrder/merchantProductApi';
import { Camera, Video } from 'lucide-react-native';
import { createThumbnail } from 'react-native-create-thumbnail';
import { Picker } from '@react-native-picker/picker';
import apiAuth from '../../../api/indexAuth';
export enum categoryType {
  DELIVERY = 'Delivery',
  SHOP = 'Shop',
  GAMES = 'Games',
  FOOD = 'Food',
  JOB = 'Job',
  HOME = 'Home',
  LIHAMOTO = 'LiHaMoto',
  BUYSELL = 'BuySell',
}
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestCameraPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    return granted['android.permission.CAMERA'] === 'granted';
  }
  return true;
}

export default function ProductCreateScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');
  const [count, setCount] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';
  const [images, setImages] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const normalizeUri = (uri: string) => {
    if (uri.startsWith('content://')) {
      return uri; // Thumbnail library now supports content:// only on some devices
    }
    if (!uri.startsWith('file://')) {
      return 'file://' + uri;
    }
    return uri;
  };

  // -----------------------------
  // Image Selection (Gallery)
  // -----------------------------
  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 10, // allow multiple
    };
    const result = await launchImageLibrary(options);
    if (!result.didCancel && result.assets?.length) {
      setImages(prev => [...prev, ...result.assets!]);
    }
  };

  // -----------------------------
  // Image Capture (Camera)
  // -----------------------------
  const captureImage = async () => {
    const ok = await requestCameraPermission();
    if (!ok) {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }

    const result = await launchCamera({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      setImages(prev => [...prev, result.assets![0]]);
    }
  };

  // -----------------------------
  // Video Selection (Gallery)
  // -----------------------------
  const pickVideo = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'video' });

      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      // Normalize for Android
      const videoUri = normalizeUri(asset.uri);

      const thumb = await createThumbnail({
        url: videoUri,
        timeStamp: 1000,
      });

      setVideo({
        uri: videoUri,
        type: asset.type || 'video/mp4',
        fileName: asset.fileName || 'video.mp4',
        thumbnail: thumb.path,
      });
    } catch (err) {
      console.log('Thumbnail Error:', err);
    }
  };

  // -----------------------------
  // Video Capture (Camera)
  // -----------------------------
  const captureVideo = async () => {
    const result = await launchCamera({ mediaType: 'video' });
    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const videoUri = normalizeUri(asset.uri);

    const thumb = await createThumbnail({
      url: videoUri,
      timeStamp: 1000,
    });

    setVideo({
      uri: videoUri,
      fileName: asset.fileName || 'video.mp4',
      thumbnail: thumb.path,
    });
  };
  const handleSubmit = async () => {
    if (!name || !description || !price || !rate || !count || !category) {
      return Alert.alert('Missing fields', 'Please fill all required fields.');
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('rate', rate);
      formData.append('count', count);
      formData.append('category', category);
      if (type) formData.append('type', type);

      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('image', {
            uri: normalizeUri(image.uri),
            type: image.type || 'image/jpeg',
            name: image.fileName || `photo_${index}.jpg`,
          } as any);
        });
      }

      if (video) {
        formData.append('video', {
          uri: normalizeUri(video.uri),
          type: video.type || 'video/mp4',
          name: video.fileName || 'video.mp4',
        } as any);
      }

      console.log('FormData contents:', (formData as any)._parts);

      // Call your API function
      const response = await createProduct(formData);

      setLoading(false);
      Alert.alert('Success', 'Product created successfully!');
      navigation.goBack();
    } catch (err: any) {
      setLoading(false);
      console.log('API Error:', err.message || err);
      Alert.alert('Error', err.message || 'Failed to create product.');
    }
  };

  return (
    <ScrollView
      className={`flex-1 p-5 ${isDarkMode ? 'bg-neutral-900' : 'bg-gray-50'}`}
      showsVerticalScrollIndicator={false}
    >
      {/* FORM CARD */}
      <View
        className={`p-5 rounded-2xl mb-6 ${
          isDarkMode ? 'bg-[#1b1b1b]' : 'bg-white'
        } shadow-sm`}
        style={{ elevation: 3 }}
      >
        {/* Name */}
        <Text className="font-semibold mb-2 text-gray-700">Product Name *</Text>
        <TextInput
          className={`rounded-xl px-4 py-3 mb-4 ${
            isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
          }`}
          placeholder="Enter product name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Category */}
        <Text className="font-semibold mb-2 text-gray-700">Category *</Text>
        <View
          className="border rounded-xl bg-gray-100 mb-4 justify-center"
          style={{ height: 55 }}
        >
          <Picker
            selectedValue={category}
            onValueChange={itemValue => setCategory(itemValue)}
            mode="dropdown"
            dropdownIconColor="#000"
            style={{ width: '100%', height: 55 }}
          >
            <Picker.Item label="Select category..." value="" />
            <Picker.Item label="Delivery" value={categoryType.DELIVERY} />
            <Picker.Item label="Shop" value={categoryType.SHOP} />
            <Picker.Item label="Games" value={categoryType.GAMES} />
            <Picker.Item label="Food" value={categoryType.FOOD} />
            <Picker.Item label="Job" value={categoryType.JOB} />
            <Picker.Item label="Home" value={categoryType.HOME} />
            <Picker.Item label="LiHaMoto" value={categoryType.LIHAMOTO} />
            <Picker.Item label="BuySell" value={categoryType.BUYSELL} />
          </Picker>
        </View>

        {/* Description */}
        <Text className="font-semibold mt-4 mb-2 text-gray-700">
          Description *
        </Text>
        <TextInput
          className={`rounded-xl px-4 py-3 mb-4 ${
            isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
          }`}
          placeholder="Write product description..."
          placeholderTextColor="#999"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* 3 Columns */}
        <View className="flex-row gap-4 mt-2">
          {/* Price */}
          <View className="flex-1">
            <Text className="font-semibold mb-2 text-gray-700">Price *</Text>
            <TextInput
              className={`rounded-xl px-3 py-3 ${
                isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
              }`}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Rate */}
          <View className="flex-1">
            <Text className="font-semibold mb-2 text-gray-700">Rate *</Text>
            <TextInput
              className={`rounded-xl px-3 py-3 ${
                isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
              }`}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={rate}
              onChangeText={setRate}
            />
          </View>

          {/* Count */}
          <View className="flex-1">
            <Text className="font-semibold mb-2 text-gray-700">Count *</Text>
            <TextInput
              className={`rounded-xl px-3 py-3 ${
                isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
              }`}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={count}
              onChangeText={setCount}
            />
          </View>
        </View>

        {/* Type */}
        <Text className="font-semibold mt-4 mb-2 text-gray-700">
          Type (optional)
        </Text>
        <TextInput
          className={`rounded-xl px-4 py-3 mb-2 ${
            isDarkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100'
          }`}
          placeholder="Enter type"
          placeholderTextColor="#999"
          value={type}
          onChangeText={setType}
        />
      </View>

      {/* IMAGE CARD */}
      <View
        className={`p-5 rounded-2xl mb-6 ${
          isDarkMode ? 'bg-[#1b1b1b]' : 'bg-white'
        } shadow-sm`}
        style={{ elevation: 3 }}
      >
        <Text className="font-semibold text-lg mb-3 text-gray-700">
          Product Image
        </Text>

        {images.length === 0 ? (
          <TouchableOpacity
            onPress={pickImage}
            className={`h-36 rounded-xl items-center justify-center ${
              isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'
            }`}
          >
            <Camera size={40} color="#777" />
            <Text className="text-sm mt-2 text-gray-500">Tap to upload</Text>
            <Text
              className="text-sm mt-1
             text-gray-500"
            >
              First image is the thumbnail
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Thumbnail */}
            <Image
              source={{ uri: images[0].uri }}
              className="w-full h-40 rounded-xl"
              resizeMode="cover"
            />

            {/* Gallery images */}
            {images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
              >
                {images.slice(1).map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img.uri }}
                    className="w-20 h-20 rounded-lg mr-2"
                  />
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* Buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={pickImage}
            className="flex-1 p-3 bg-blue-600 rounded-xl"
          >
            <Text className="text-center text-white font-semibold">
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={captureImage}
            className="p-3 rounded-xl bg-gray-300"
          >
            <Camera size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* VIDEO CARD */}
      <View
        className={`p-5 rounded-2xl mb-6 ${
          isDarkMode ? 'bg-[#1b1b1b]' : 'bg-white'
        } shadow-sm`}
        style={{ elevation: 3 }}
      >
        <Text className="font-semibold text-lg mb-3 text-gray-700">
          Product Video
        </Text>

        {!video ? (
          <TouchableOpacity
            onPress={pickVideo}
            className={`h-36 rounded-xl items-center justify-center ${
              isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'
            }`}
          >
            <Video size={42} color="#777" />
            <Text className="text-sm mt-2 text-gray-500">Tap to upload</Text>
          </TouchableOpacity>
        ) : (
          <Image
            source={{ uri: video.thumbnail }}
            className="w-full h-40 rounded-xl mt-1"
            resizeMode="contain"
          />
        )}

        {/* Buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={pickVideo}
            className="flex-1 p-3 bg-blue-600 rounded-xl"
          >
            <Text className="text-center text-white font-semibold">
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={captureVideo}
            className="p-3 rounded-xl bg-gray-300"
          >
            <Video size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`p-4 rounded-2xl mb-10 ${
          loading ? 'bg-gray-400' : 'bg-black'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white text-lg font-semibold">
            Create Product
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
