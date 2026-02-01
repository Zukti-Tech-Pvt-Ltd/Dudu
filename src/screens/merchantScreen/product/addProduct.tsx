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
  StatusBar,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { createProduct } from '../../../api/merchantOrder/merchantProductApi';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Info,
  Video,
} from 'lucide-react-native';
import { createThumbnail } from 'react-native-create-thumbnail';
import { Picker } from '@react-native-picker/picker';
import { Video as VideoCompressor } from 'react-native-compressor';
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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#f9fafb',
    cardBg: isDarkMode ? '#262626' : '#ffffff',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#a3a3a3' : '#4b5563',
    inputBg: isDarkMode ? '#404040' : '#f3f4f6',
    inputText: isDarkMode ? '#ffffff' : '#000000',
    placeholder: isDarkMode ? '#a3a3a3' : '#9ca3af',
    iconColor: isDarkMode ? '#d4d4d4' : '#6b7280',
    border: isDarkMode ? '#404040' : '#e5e7eb',
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');
  const [count, setCount] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const [images, setImages] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // --- CUSTOM ALERT STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });
  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
  ) => {
    setStatusModal({ visible: true, type, title, message });
  };
  const normalizeUri = (uri: string) => {
    if (!uri) return '';
    if (Platform.OS === 'android') {
      // Ensure it starts with file:// if it's a local path and not a content:// path
      if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
        return `file://${uri}`;
      }
    }
    return uri;
  };

  // -----------------------------
  // Image Selection (Gallery)
  // -----------------------------
  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 10,
      quality: 0.6, // <--- Add this (60% quality)
      maxWidth: 800, // Smaller width is usually enough for mobile
      maxHeight: 800,
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
      showStatus(
        'error',
        'Permission Denied',
        'Camera access is required to take photos.',
      );
      return;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.6, // <--- Add this
      maxWidth: 800, // Smaller width is usually enough for mobile
      maxHeight: 800,
    });
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
      if (result.didCancel || !result.assets?.[0]?.uri) return;

      setLoading(true); // Show spinner during compression

      // --- COMPRESS ON PHONE ---
      const compressedUri = await VideoCompressor.compress(
        result.assets[0].uri,
        {
          compressionMethod: 'manual',
          maxSize: 720,
          bitrate: 2000000, // 2Mbps is plenty for mobile
        },
      );

      const videoUri = normalizeUri(compressedUri);
      const thumb = await createThumbnail({ url: videoUri, timeStamp: 1000 });

      setVideo({
        uri: videoUri,
        type: 'video/mp4',
        fileName: 'compressed_video.mp4',
        thumbnail: thumb.path,
      });
    } catch (err) {
      showStatus('error', 'Video Error', 'Failed to compress video.');
      console.log('Video Compression Error:', err);
    } finally {
      setLoading(false);
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
      showStatus('error', 'Missing Fields', 'Please fill all required fields.');
      return;
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
          // Generate a fallback name if fileName is missing
          const extension = image.type ? image.type.split('/')[1] : 'jpg';
          const fileName =
            image.fileName || `photo_${index}_${Date.now()}.${extension}`;

          formData.append('image', {
            uri: normalizeUri(image.uri),
            type: image.type || 'image/jpeg',
            name: fileName,
          } as any);
        });
      }

      // 2. Improved Video Handling
      if (video && video.uri) {
        const videoName = video.fileName || `video_${Date.now()}.mp4`;

        formData.append('video', {
          uri: normalizeUri(video.uri),
          type: video.type || 'video/mp4',
          name: videoName,
        } as any);
      }

      const response = await createProduct(formData);

      setLoading(false);
      showStatus(
        'success',
        'Product Created',
        'Your product has been successfully added to the marketplace!',
      );
      // navigation.goBack();
    } catch (err: any) {
      setLoading(false);
      console.log('API Error:', err.message || err);
      showStatus(
        'error',
        'Submission Failed',
        err.message || 'Failed to create product. Please try again.',
      );
    }
  };

  const Label = ({ text }: { text: string }) => (
    <Text
      style={{ color: colors.textSecondary }}
      className="font-semibold mb-2"
    >
      {text}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* FORM CARD */}
        <View
          style={{ backgroundColor: colors.cardBg, elevation: 3 }}
          className="p-5 rounded-2xl mb-6 shadow-sm"
        >
          {/* Name */}
          <Label text="Product Name *" />
          <TextInput
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
            }}
            className="rounded-xl px-4 py-3 mb-4"
            placeholder="Enter product name"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
          />

          {/* Category */}
          <Label text="Category *" />
          <View
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="rounded-xl mb-4 justify-center"
          >
            <Picker
              selectedValue={category}
              onValueChange={itemValue => setCategory(itemValue)}
              mode="dropdown"
              dropdownIconColor={colors.textPrimary}
              style={{ color: colors.textPrimary }}
            >
              <Picker.Item
                label="Select category..."
                value=""
                style={{ color: colors.textSecondary }}
              />
              <Picker.Item
                label="Delivery"
                value={categoryType.DELIVERY}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="Shop"
                value={categoryType.SHOP}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="Games"
                value={categoryType.GAMES}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="Food"
                value={categoryType.FOOD}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="Job"
                value={categoryType.JOB}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="Home"
                value={categoryType.HOME}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="LiHaMoto"
                value={categoryType.LIHAMOTO}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
              <Picker.Item
                label="BuySell"
                value={categoryType.BUYSELL}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.cardBg,
                }}
              />
            </Picker>
          </View>

          {/* Description */}
          <Label text="Description *" />
          <TextInput
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
            }}
            className="rounded-xl px-4 py-3 mb-4"
            placeholder="Write product description..."
            placeholderTextColor={colors.placeholder}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {/* 3 Columns */}
          <View className="flex-row gap-4 mt-2">
            {/* Price */}
            <View className="flex-1">
              <Label text="Price *" />
              <TextInput
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                }}
                className="rounded-xl px-3 py-3"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            {/* Rate */}
            <View className="flex-1">
              <Label text="Rate *" />
              <TextInput
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                }}
                className="rounded-xl px-3 py-3"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
            </View>

            {/* Count */}
            <View className="flex-1">
              <Label text="Count *" />
              <TextInput
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                }}
                className="rounded-xl px-3 py-3"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={count}
                onChangeText={setCount}
              />
            </View>
          </View>

          {/* Type */}
          <View className="mt-4">
            <Label text="Type (optional)" />
            <TextInput
              style={{
                backgroundColor: colors.inputBg,
                color: colors.inputText,
              }}
              className="rounded-xl px-4 py-3 mb-2"
              placeholder="Enter type"
              placeholderTextColor={colors.placeholder}
              value={type}
              onChangeText={setType}
            />
          </View>
        </View>

        {/* IMAGE CARD */}
        <View
          style={{ backgroundColor: colors.cardBg, elevation: 3 }}
          className="p-5 rounded-2xl mb-6 shadow-sm"
        >
          <Text
            style={{ color: colors.textPrimary }}
            className="font-semibold text-lg mb-3"
          >
            Product Image
          </Text>

          {images.length === 0 ? (
            <TouchableOpacity
              onPress={pickImage}
              style={{ backgroundColor: colors.inputBg }}
              className="h-36 rounded-xl items-center justify-center"
            >
              <Camera size={40} color={colors.iconColor} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm mt-2"
              >
                Tap to upload
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm mt-1"
              >
                First image is the thumbnail
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Thumbnail */}
              <Image
                source={{ uri: images[0].uri }}
                className="w-full h-40 rounded-xl bg-gray-200"
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
                      className="w-20 h-20 rounded-lg mr-2 bg-gray-200"
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
              style={{ backgroundColor: colors.inputBg }}
              className="p-3 rounded-xl border border-gray-300 dark:border-neutral-600"
            >
              <Camera size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* VIDEO CARD */}
        <View
          style={{ backgroundColor: colors.cardBg, elevation: 3 }}
          className="p-5 rounded-2xl mb-6 shadow-sm"
        >
          <Text
            style={{ color: colors.textPrimary }}
            className="font-semibold text-lg mb-3"
          >
            Product Video
          </Text>

          {!video ? (
            <TouchableOpacity
              onPress={pickVideo}
              style={{ backgroundColor: colors.inputBg }}
              className="h-36 rounded-xl items-center justify-center"
            >
              <Video size={42} color={colors.iconColor} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm mt-2"
              >
                Tap to upload
              </Text>
            </TouchableOpacity>
          ) : (
            <Image
              source={{ uri: video.thumbnail }}
              className="w-full h-40 rounded-xl mt-1 bg-gray-200"
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
              style={{ backgroundColor: colors.inputBg }}
              className="p-3 rounded-xl border border-gray-300 dark:border-neutral-600"
            >
              <Video size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading
              ? colors.textSecondary
              : isDarkMode
              ? '#ffffff'
              : '#000000',
          }}
          className="p-4 rounded-2xl mb-10"
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
              className="text-center text-lg font-semibold"
            >
              Create Product
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModal.visible}
        onRequestClose={() =>
          setStatusModal(prev => ({ ...prev, visible: false }))
        }
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-xl items-center">
            {/* Dynamic Icon */}
            <View
              className={`p-4 rounded-full mb-4 ${
                statusModal.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : statusModal.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              {statusModal.type === 'success' && (
                <CheckCircle size={32} color="#16a34a" />
              )}
              {statusModal.type === 'error' && (
                <AlertCircle size={32} color="#ef4444" />
              )}
              {statusModal.type === 'info' && (
                <Info size={32} color="#3b82f6" />
              )}
            </View>

            {/* Content */}
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {statusModal.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">
              {statusModal.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setStatusModal(prev => ({ ...prev, visible: false }));
                // If it was a success message, navigate back after closing
                if (statusModal.type === 'success') {
                  navigation.goBack();
                }
              }}
              className={`w-full py-3.5 rounded-2xl ${
                statusModal.type === 'success'
                  ? 'bg-green-500'
                  : statusModal.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                Okay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
