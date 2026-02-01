import React, { useEffect, useState } from 'react';
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
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  Modal,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import { API_BASE_URL } from '@env';
import { editProduct } from '../../../api/merchantOrder/merchantProductApi';
import { Picker } from '@react-native-picker/picker';
import {
  Video as VideoIcon,
  X,
  Check,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react-native';
import {
  deleteImage,
  deleteVideo,
  getAllImagePerProduct,
} from '../../../api/serviceList/productApi';
import { ProductImage } from '../../productDetail/productDetail';
import VideoPlayer from 'react-native-video';
import { Video as VideoCompressor } from 'react-native-compressor';

export enum CategoryType {
  DELIVERY = 'Delivery',
  SHOP = 'Shop',
  GAMES = 'Games',
  FOOD = 'Food',
  JOB = 'Job',
  HOME = 'Home',
  LIHAMOTO = 'LiHaMoto',
  BUYSELL = 'BuySell',
}

export default function ProductEditScreen({ route, navigation }: any) {
  const { product } = route.params;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#f5f5f5',
    cardBg: isDarkMode ? '#262626' : '#ffffff',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#a3a3a3' : '#4b5563',
    inputBg: isDarkMode ? '#404040' : '#f3f4f6',
    inputText: isDarkMode ? '#ffffff' : '#000000',
    placeholder: isDarkMode ? '#a3a3a3' : '#9ca3af',
    iconColor: isDarkMode ? '#d4d4d4' : '#6b7280',
    border: isDarkMode ? '#404040' : '#e5e7eb',
  };

  const [productId, setProductId] = useState(product.id);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(
    product.price ? product.price.toString() : '0',
  );
  const [rate, setRate] = useState(
    product.rate ? product.rate.toString() : '0',
  );
  const [count, setCount] = useState(
    product.count ? product.count.toString() : '0',
  );
  const [category, setCategory] = useState(product.category);
  const [type, setType] = useState(product.type || '');

  const [images, setImages] = useState<any[]>(
    product.image
      ? [{ uri: `${API_BASE_URL}/${product.image}`, fromServer: true }]
      : [],
  );

  // State to track the selected thumbnail
  const [thumbnail, setThumbnail] = useState<any>(
    product.image
      ? { uri: `${API_BASE_URL}/${product.image}`, fromServer: true }
      : null,
  );

  const [video, setVideo] = useState<any>(product.video ?? null);
  const [loading, setLoading] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<any[]>([]);
  // const [videoToDelete, setVideoToDelete] = useState<any[]>([]); // Unused

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
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
  const mapProductImagesToUri = (imgs: ProductImage[]) => {
    return imgs.map(img => ({
      uri: `${API_BASE_URL}/${img.image}`,
      id: img.id,
      fromServer: true,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (productId) {
        const res = await getAllImagePerProduct(productId);
        if (res?.status === 'success' && Array.isArray(res.data)) {
          const serverImages = mapProductImagesToUri(res.data);

          setImages(prev => {
            const currentLocalImages = prev.filter(p => !p.fromServer);
            const existingUris = new Set(currentLocalImages.map(i => i.uri));
            const newServerImages = serverImages.filter(
              i => !existingUris.has(i.uri),
            );

            const allImages = [...currentLocalImages, ...newServerImages];

            // Ensure thumbnail is set if not already
            if (!thumbnail && allImages.length > 0) {
              // Try to find one that matches product.image
              const match = allImages.find(
                img => product.image && img.uri.includes(product.image),
              );
              setThumbnail(match || allImages[0]);
            }

            return allImages;
          });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [productId, product.image]);

  const normalizeUri = (uri?: string) => {
    if (!uri) return '';
    if (uri.startsWith('content://')) return uri;
    if (!uri.startsWith('file://') && !uri.startsWith('http'))
      return 'file://' + uri;
    return uri;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        return granted['android.permission.CAMERA'] === 'granted';
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
          granted['android.permission.CAMERA'] === 'granted' &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
        );
      }
    }
    return true;
  };

  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 10,
    };
    const result = await launchImageLibrary(options);
    if (!result.didCancel && result.assets?.length) {
      setImages(prev => {
        const newImages = [...prev, ...result.assets!];
        if (!thumbnail) setThumbnail(newImages[0]);
        return newImages;
      });
    }
  };

  const captureImage = async () => {
    if (!(await requestCameraPermission())) {
      showStatus(
        'error',
        'Permission Required',
        'Please allow camera/storage access to take photos.',
      );
      return;
    }
    const result = await launchCamera({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      setImages(prev => {
        const newImages = [...prev, result.assets![0]];
        if (!thumbnail) setThumbnail(newImages[0]);
        return newImages;
      });
    }
  };

  const handleRemoveVideo = async (video: any) => {
    setVideo(null);
    deleteVideo(productId, video);
  };

  const handleRemoveImage = async (indexToRemove: number, img: any) => {
    const isRemovingThumbnail = thumbnail?.uri === img.uri;

    setImages(prev => {
      const filtered = prev.filter((_, index) => index !== indexToRemove);
      // Update thumbnail if we deleted the current one
      if (isRemovingThumbnail && filtered.length > 0) {
        setThumbnail(filtered[0]);
      } else if (filtered.length === 0) {
        setThumbnail(null);
      }
      return filtered;
    });

    setSelectedImageIndex(null);
    if (img?.id || img?.fromServer || img?.uri?.includes(API_BASE_URL)) {
      setImagesToDelete(prev => [...prev, img]);
    }
  };

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
      console.log('Video Compression Error:', err);
      showStatus('error', 'Video Error', 'Failed to compress video.');
    } finally {
      setLoading(false);
    }
  };
  const captureVideo = async () => {
    if (!(await requestCameraPermission())) return;
    const res = await launchCamera({ mediaType: 'video' });
    if (res.didCancel || !res.assets?.[0]?.uri) return;
    const uri = normalizeUri(res.assets[0].uri);
    try {
      const thumb = await createThumbnail({ url: uri, timeStamp: 1000 });
      setVideo({ ...res.assets[0], uri, thumbnail: thumb.path });
    } catch (e) {
      setVideo({ ...res.assets[0], uri });
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !rate || !count || !category) {
      showStatus('error', 'Missing Fields', 'Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Basic fields
      formData.append('name', String(name));
      formData.append('description', String(description));
      formData.append('price', String(price));
      formData.append('rate', String(rate));
      formData.append('count', String(count));
      formData.append('category', String(category));
      if (type) formData.append('type', String(type));

      // --- IMPROVED THUMBNAIL LOGIC ---
      const isNewThumbnail =
        thumbnail && !thumbnail.fromServer && !thumbnail.uri.includes('http');

      if (isNewThumbnail) {
        // 1. Tell backend to use the first file in 'image' array as cover
        formData.append('thumbNail', 'NEW_IMAGE_0');

        // 2. Append this specific file to 'image' field FIRST
        formData.append('image', {
          uri: normalizeUri(thumbnail.uri),
          type: thumbnail.type || 'image/jpeg',
          name: thumbnail.fileName || `thumbnail_${Date.now()}.jpg`,
        } as any);
      } else if (thumbnail?.fromServer) {
        // Use existing relative path from server
        const relativePath = thumbnail.uri.replace(`${API_BASE_URL}/`, '');
        formData.append('thumbNail', relativePath);
      }

      // --- REMAINING IMAGES ---
      (images ?? []).forEach((image, index) => {
        // Skip if this image is the thumbnail we already handled
        if (thumbnail && image.uri === thumbnail.uri && !thumbnail.fromServer)
          return;

        // Only upload local files
        if (!image.fromServer && image.uri && !image.uri.includes('http')) {
          formData.append('image', {
            uri: normalizeUri(image.uri),
            type: image.type || 'image/jpeg',
            name: image.fileName || `photo_${index}.jpg`,
          } as any);
        }
      });

      // --- VIDEO ---
      if (
        video &&
        typeof video !== 'string' &&
        video.uri &&
        !video.uri.includes('http')
      ) {
        formData.append('video', {
          uri: normalizeUri(video.uri),
          type: video.type || 'video/mp4',
          name: video.fileName || 'video.mp4',
        } as any);
      }

      // API Call
      await editProduct(product.id, formData);

      // Handle deletions (Existing server-side logic)
      if (imagesToDelete.length > 0) {
        for (const img of imagesToDelete) {
          if (img?.id) {
            await deleteImage({ imageId: Number(img.id) });
          } else if (img?.uri) {
            let relativePath = img.uri.replace(`${API_BASE_URL}/`, '');
            if (relativePath.startsWith('/'))
              relativePath = relativePath.substring(1);
            await deleteImage({ imageUrl: relativePath });
          }
        }
      }

      setImagesToDelete([]);
      setLoading(false);
      showStatus(
        'success',
        'Product Updated',
        'Product details updated successfully!',
      );
    } catch (err: any) {
      console.error('Error updating product', err);
      setLoading(false);
      showStatus(
        'error',
        'Update Failed',
        err.message || 'Failed to update product.',
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
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.screenBg }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.screenBg}
        />

        <Pressable
          style={{ padding: 20, flex: 1 }}
          onPress={() => setSelectedImageIndex(null)}
        >
          {/* Name */}
          <Label text="Product Name *" />
          <TextInput
            placeholder="Enter product name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.placeholder}
            style={{
              backgroundColor: colors.inputBg,
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              color: colors.inputText,
            }}
          />

          {/* Category */}
          <Label text="Category *" />
          <View
            style={{
              borderRadius: 10,
              backgroundColor: colors.inputBg,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              dropdownIconColor={colors.textPrimary}
              style={{ color: colors.textPrimary }}
            >
              <Picker.Item
                label="Select category..."
                value=""
                style={{
                  color: colors.textSecondary,
                  backgroundColor: colors.cardBg,
                }}
              />
              {Object.values(CategoryType).map(c => (
                <Picker.Item
                  key={c}
                  label={c}
                  value={c}
                  style={{
                    color: colors.textPrimary,
                    backgroundColor: colors.cardBg,
                  }}
                />
              ))}
            </Picker>
          </View>

          {/* Description */}
          <Label text="Description *" />
          <TextInput
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor={colors.placeholder}
            style={{
              backgroundColor: colors.inputBg,
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              height: 100,
              color: colors.inputText,
              textAlignVertical: 'top',
            }}
          />

          {/* 3 Columns */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Label text="Price *" />
              <TextInput
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.inputBg,
                  padding: 10,
                  borderRadius: 10,
                  color: colors.inputText,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Rate *" />
              <TextInput
                placeholder="0"
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.inputBg,
                  padding: 10,
                  borderRadius: 10,
                  color: colors.inputText,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Count *" />
              <TextInput
                placeholder="0"
                value={count}
                onChangeText={setCount}
                keyboardType="numeric"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.inputBg,
                  padding: 10,
                  borderRadius: 10,
                  color: colors.inputText,
                }}
              />
            </View>
          </View>

          {/* Type */}
          <Label text="Type" />
          <TextInput
            placeholder="Enter type (optional)"
            value={type}
            onChangeText={setType}
            placeholderTextColor={colors.placeholder}
            style={{
              backgroundColor: colors.inputBg,
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              color: colors.inputText,
            }}
          />

          {/* --- IMAGES SECTION --- */}
          <Label text="Product Images" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {images.map((img, index) => {
              const isSelected = thumbnail?.uri === img.uri;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onLongPress={() => setSelectedImageIndex(index)}
                  onPress={() => {
                    if (selectedImageIndex !== null) {
                      setSelectedImageIndex(null);
                    } else {
                      setThumbnail(img);
                    }
                  }}
                  style={{
                    marginRight: 10,
                    position: 'relative',
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#007bff',
                    borderRadius: 12,
                  }}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      opacity: selectedImageIndex === index ? 0.7 : 1,
                      backgroundColor: colors.inputBg,
                    }}
                  />

                  {/* Selection Checkmark */}
                  {isSelected && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 5,
                        backgroundColor: '#007bff',
                        borderRadius: 10,
                        padding: 2,
                      }}
                    >
                      <Check size={12} color="#fff" />
                    </View>
                  )}

                  {/* Close Button */}
                  {selectedImageIndex === index && (
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(index, img)}
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 15,
                        padding: 4,
                      }}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                flex: 1,
                backgroundColor: '#007bff',
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={captureImage}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.inputBg,
              }}
            >
              <VideoIcon size={28} color={colors.iconColor} />
            </TouchableOpacity>
          </View>

          {/* --- THUMBNAIL PREVIEW --- */}
          {thumbnail && (
            <View style={{ marginBottom: 20 }}>
              <Label text="Selected Thumbnail" />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 10,
                }}
              >
                This image will be shown as the main cover. Tap an image above
                to change.
              </Text>
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: thumbnail.uri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 10,
                    resizeMode: 'cover',
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.inputBg,
                  }}
                />
              </View>
            </View>
          )}

          {/* --- VIDEO SECTION --- */}
          <Label text="Product Video" />
          {video ? (
            <View style={{ marginBottom: 10 }}>
              <VideoPlayer
                source={{
                  uri:
                    typeof video === 'string'
                      ? `${API_BASE_URL}/${video}`
                      : video.uri,
                }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 10,
                  backgroundColor: '#000',
                }}
                resizeMode="cover"
                paused={true}
                controls={true}
              />
              <TouchableOpacity
                onPress={() => handleRemoveVideo(video)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: 5,
                  borderRadius: 20,
                }}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickVideo}
              style={{
                height: 150,
                backgroundColor: colors.inputBg,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}
            >
              <VideoIcon size={40} color={colors.iconColor} />
              <Text style={{ color: colors.textSecondary, marginTop: 5 }}>
                Tap to upload
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={pickVideo}
              style={{
                flex: 1,
                backgroundColor: '#007bff',
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={captureVideo}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.inputBg,
              }}
            >
              <VideoIcon size={28} color={colors.iconColor} />
            </TouchableOpacity>
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
              padding: 15,
              borderRadius: 15,
              marginBottom: 30,
            }}
          >
            {loading ? (
              <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
            ) : (
              <Text
                style={{
                  color: isDarkMode ? '#000000' : '#ffffff',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Update Product
              </Text>
            )}
          </TouchableOpacity>
        </Pressable>
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
              style={{
                // Styles fallback if tailwind/nativewind is not fully configured for dynamic classnames
                backgroundColor:
                  statusModal.type === 'success'
                    ? isDarkMode
                      ? '#064e3b'
                      : '#dcfce7'
                    : statusModal.type === 'error'
                    ? isDarkMode
                      ? '#7f1d1d'
                      : '#fee2e2'
                    : isDarkMode
                    ? '#1e3a8a'
                    : '#dbeafe',
                padding: 16,
                borderRadius: 9999,
                marginBottom: 16,
              }}
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
              style={{
                backgroundColor:
                  statusModal.type === 'success'
                    ? '#22c55e'
                    : statusModal.type === 'error'
                    ? '#ef4444'
                    : '#3b82f6',
                width: '100%',
                paddingVertical: 14,
                borderRadius: 16,
              }}
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
