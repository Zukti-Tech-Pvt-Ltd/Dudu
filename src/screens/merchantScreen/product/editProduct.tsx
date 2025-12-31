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
import { Video as VideoIcon, X, Check } from 'lucide-react-native';
import {
  deleteImage,
  deleteVideo,
  getAllImagePerProduct,
} from '../../../api/serviceList/productApi';
import { ProductImage } from '../../productDetail/productDetail';
import VideoPlayer from 'react-native-video';

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
  console.log('images', images);
  // State to track the selected thumbnail
  const [thumbnail, setThumbnail] = useState<any>(
    product.image
      ? { uri: `${API_BASE_URL}/${product.image}`, fromServer: true }
      : null,
  );
  console.log('imthumbnailages', thumbnail);

  const [video, setVideo] = useState<any>(product.video ?? null);
  const [loading, setLoading] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<any[]>([]);
  const [videoToDelete, setVideoToDelete] = useState<any[]>([]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

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
      Alert.alert('Permission required', 'Please allow camera/storage access.');
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
    console.log('videolololololo', video);
    console.log('productIdlolololo', productId);
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
    const res = await launchImageLibrary({ mediaType: 'video' });
    if (res.didCancel || !res.assets?.[0]?.uri) return;
    const uri = normalizeUri(res.assets[0].uri);
    try {
      const thumb = await createThumbnail({ url: uri, timeStamp: 1000 });
      setVideo({ ...res.assets[0], uri, thumbnail: thumb.path });
    } catch (e) {
      setVideo({ ...res.assets[0], uri });
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
      return Alert.alert('Missing fields', 'Please fill all required fields.');
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('name', String(name));
      formData.append('description', String(description));
      formData.append('price', String(price));
      formData.append('rate', String(rate));
      formData.append('count', String(count));
      formData.append('category', String(category));
      formData.append(
        'thumbNail',
        String(thumbnail.uri.replace(/^https?:\/\/[^/]+\//, '')),
      );
      if (type) formData.append('type', String(type));

      let imgCount = 0;

      // 1. Append selected Thumbnail FIRST (if it's a new local image)
      // This ensures the backend uses it as the main image
      if (
        thumbnail &&
        !thumbnail.fromServer &&
        thumbnail.uri &&
        !thumbnail.uri.includes('http')
      ) {
        const file = {
          uri: normalizeUri(thumbnail.uri),
          type: thumbnail.type || 'image/jpeg',
          name: thumbnail.fileName || `thumbnail.jpg`,
        };
        formData.append('image', file as any);
        imgCount++;
      }

      // 2. Append remaining images
      (images ?? []).forEach((image, index) => {
        // Skip if this image is the thumbnail we just appended
        if (thumbnail && image.uri === thumbnail.uri && !thumbnail.fromServer)
          return;

        if (!image.fromServer && image.uri && !image.uri.includes('http')) {
          const file = {
            uri: normalizeUri(image.uri),
            type: image.type || 'image/jpeg',
            name: image.fileName || `photo_${index}.jpg`,
          };
          formData.append('image', file as any);
          imgCount++;
        }
      });
      console.log(
        'thumbnail appended',
        thumbnail.uri.replace(/^https?:\/\/[^/]+\//, ''),
      );
      console.log(
        `Appended ${imgCount} new images to FormData (Thumbnail first)`,
      );

      // Append Video
      if (
        video &&
        typeof video !== 'string' &&
        video.uri &&
        !video.uri.includes('http')
      ) {
        const file = {
          uri: normalizeUri(video.uri),
          type: video.type || 'video/mp4',
          name: video.fileName || 'video.mp4',
        };
        formData.append('video', file as any);
      }

      console.log('Submitting Product Edit with fetch...');
      await editProduct(product.id, formData);

      // Handle deletions
      if (imagesToDelete.length > 0) {
        for (const img of imagesToDelete) {
          if (img?.id) {
            await deleteImage({ imageId: Number(img.id) });
          } else if (img?.uri) {
            let relativePath = img.uri;
            if (relativePath.includes(API_BASE_URL)) {
              relativePath = relativePath.split(API_BASE_URL)[1];
            } else if (relativePath.startsWith('http')) {
              relativePath = img.uri.replace(/^https?:\/\/[^/]+\//, '');
            }
            if (relativePath && relativePath.startsWith('/')) {
              relativePath = relativePath.substring(1);
            }
            if (relativePath) {
              await deleteImage({ imageUrl: relativePath });
            }
          }
        }
      }

      setImagesToDelete([]);
      setLoading(false);
      Alert.alert('Success', 'Product updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Error updating product', err);
      setLoading(false);
      Alert.alert('Error', err.message || 'Failed to update product.');
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
      }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={{ padding: 20, flex: 1 }}
        onPress={() => setSelectedImageIndex(null)}
      >
        <Text style={{ fontWeight: '600', marginBottom: 5 }}>
          Product Name *
        </Text>
        <TextInput
          placeholder="Enter product name"
          value={name}
          onChangeText={setName}
          style={{
            backgroundColor: isDarkMode ? '#222' : '#fff',
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
            color: isDarkMode ? '#fff' : '#000',
          }}
        />

        <Text style={{ fontWeight: '600', marginBottom: 5 }}>Category *</Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: isDarkMode ? '#222' : '#fff',
            marginBottom: 10,
          }}
        >
          <Picker selectedValue={category} onValueChange={setCategory}>
            <Picker.Item label="Select category..." value="" />
            {Object.values(CategoryType).map(c => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: '600', marginBottom: 5 }}>
          Description *
        </Text>
        <TextInput
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{
            backgroundColor: isDarkMode ? '#222' : '#fff',
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
            height: 100,
            color: isDarkMode ? '#fff' : '#000',
            textAlignVertical: 'top',
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Price *</Text>
            <TextInput
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={{
                backgroundColor: isDarkMode ? '#222' : '#fff',
                padding: 10,
                borderRadius: 10,
                color: isDarkMode ? '#fff' : '#000',
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Rate *</Text>
            <TextInput
              placeholder="0"
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              style={{
                backgroundColor: isDarkMode ? '#222' : '#fff',
                padding: 10,
                borderRadius: 10,
                color: isDarkMode ? '#fff' : '#000',
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Count *</Text>
            <TextInput
              placeholder="0"
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
              style={{
                backgroundColor: isDarkMode ? '#222' : '#fff',
                padding: 10,
                borderRadius: 10,
                color: isDarkMode ? '#fff' : '#000',
              }}
            />
          </View>
        </View>

        <Text style={{ fontWeight: '600', marginBottom: 5 }}>Type</Text>
        <TextInput
          placeholder="Enter type (optional)"
          value={type}
          onChangeText={setType}
          style={{
            backgroundColor: isDarkMode ? '#222' : '#fff',
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
            color: isDarkMode ? '#fff' : '#000',
          }}
        />

        {/* --- IMAGES SECTION --- */}
        <Text style={{ fontWeight: '600', marginBottom: 5 }}>
          Product Images
        </Text>
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
                // 1. Long Press triggers delete mode
                onLongPress={() => setSelectedImageIndex(index)}
                // 2. Normal Press selects as thumbnail (unless in delete mode)
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
                  borderRadius: 12, // slightly larger to contain border
                }}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    opacity: selectedImageIndex === index ? 0.7 : 1,
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

                {/* 3. Close Button (Only visible if index matches) */}
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
            <Text style={{ color: '#fff', textAlign: 'center' }}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={captureImage}
            style={{ padding: 10, borderRadius: 10, backgroundColor: '#ccc' }}
          >
            <VideoIcon size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* --- NEW THUMBNAIL PREVIEW SECTION --- */}
        {thumbnail && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: '600', marginBottom: 5 }}>
              Selected Thumbnail
            </Text>
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              This image will be shown as the main cover. Tap an image above to
              change.
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
                  borderColor: '#ddd',
                }}
              />
            </View>
          </View>
        )}

        {/* --- VIDEO SECTION --- */}
        <Text style={{ fontWeight: '600', marginBottom: 5 }}>
          Product Video
        </Text>
        {video ? (
          <View style={{ marginBottom: 10 }}>
            <VideoPlayer
              source={{
                uri:
                  typeof video === 'string'
                    ? `${API_BASE_URL}/${video}`
                    : video.uri,
              }}
              style={{ width: '100%', height: 200, borderRadius: 10 }}
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
              backgroundColor: isDarkMode ? '#222' : '#eee',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            <VideoIcon size={40} color="#777" />
            <Text style={{ color: '#777', marginTop: 5 }}>Tap to upload</Text>
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
            <Text style={{ color: '#fff', textAlign: 'center' }}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={captureVideo}
            style={{ padding: 10, borderRadius: 10, backgroundColor: '#ccc' }}
          >
            <VideoIcon size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#aaa' : '#000',
            padding: 15,
            borderRadius: 15,
            marginBottom: 30,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}
            >
              Update Product
            </Text>
          )}
        </TouchableOpacity>
      </Pressable>
    </ScrollView>
  );
}
