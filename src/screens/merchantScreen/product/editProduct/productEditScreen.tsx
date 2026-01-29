import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  View,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import { API_BASE_URL } from '@env';
import VideoPlayer from 'react-native-video';
import { Video as VideoIcon, X } from 'lucide-react-native';

// Import local components and utils
import {
  getColors,
  InputSection,
  normalizeUri,
  requestCameraPermission,
} from './inputSection';
import { ImageManager } from './imageManager';
import {
  deleteImage,
  deleteVideo,
  getAllImagePerProduct,
} from '../../../../api/serviceList/productApi';
import { editProduct } from '../../../../api/merchantOrder/merchantProductApi';

export default function ProductEditScreen({ route, navigation }: any) {
  const { product } = route.params;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getColors(isDarkMode);

  // --- State Management ---
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price?.toString() || '0',
    rate: product.rate?.toString() || '0',
    count: product.count?.toString() || '0',
    category: product.category,
    type: product.type || '',
  });

  const [images, setImages] = useState<any[]>(
    product.image
      ? [{ uri: `${API_BASE_URL}/${product.image}`, fromServer: true }]
      : [],
  );
  const [thumbnail, setThumbnail] = useState<any>(
    product.image
      ? { uri: `${API_BASE_URL}/${product.image}`, fromServer: true }
      : null,
  );
  const [video, setVideo] = useState<any>(product.video ?? null);
  const [imagesToDelete, setImagesToDelete] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAllImagePerProduct(product.id);
        if (res?.status === 'success' && Array.isArray(res.data)) {
          const serverImages = res.data.map((img: any) => ({
            uri: `${API_BASE_URL}/${img.image}`,
            id: img.id,
            fromServer: true,
          }));

          setImages(prev => {
            const currentLocal = prev.filter(p => !p.fromServer);
            const existingUris = new Set(currentLocal.map(i => i.uri));
            const newServer = serverImages.filter(
              (i: any) => !existingUris.has(i.uri),
            );
            const all = [...currentLocal, ...newServer];

            if (!thumbnail && all.length > 0) {
              const match = all.find(
                (img: any) => product.image && img.uri.includes(product.image),
              );
              setThumbnail(match || all[0]);
            }
            return all;
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [product.id, product.image]);

  // --- Handlers: Images ---
  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
    });
    if (!result.didCancel && result.assets?.length) {
      setImages(prev => {
        const newImgs = [...prev, ...result.assets!];
        if (!thumbnail) setThumbnail(newImgs[0]);
        return newImgs;
      });
    }
  };

  const handleCaptureImage = async () => {
    if (!(await requestCameraPermission()))
      return Alert.alert('Permission required');
    const result = await launchCamera({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      setImages(prev => {
        const newImgs = [...prev, result.assets![0]];
        if (!thumbnail) setThumbnail(newImgs[0]);
        return newImgs;
      });
    }
  };

  const handleRemoveImage = (index: number, img: any) => {
    if (thumbnail?.uri === img.uri) setThumbnail(null); // Simple reset, or find next available
    setImages(prev => prev.filter((_, i) => i !== index));
    if (img?.id || img?.fromServer || img?.uri?.includes(API_BASE_URL)) {
      setImagesToDelete(prev => [...prev, img]);
    }
  };

  // --- Handlers: Video ---
  const handleMediaVideo = async (source: 'gallery' | 'camera') => {
    if (source === 'camera' && !(await requestCameraPermission())) return;
    const fn = source === 'gallery' ? launchImageLibrary : launchCamera;

    const res = await fn({ mediaType: 'video' });
    if (res.didCancel || !res.assets?.[0]?.uri) return;
    const uri = normalizeUri(res.assets[0].uri);

    try {
      const thumb = await createThumbnail({ url: uri, timeStamp: 1000 });
      setVideo({ ...res.assets[0], uri, thumbnail: thumb.path });
    } catch {
      setVideo({ ...res.assets[0], uri });
    }
  };

  const handleRemoveVideo = () => {
    if (video) deleteVideo(product.id, video);
    setVideo(null);
  };

  // --- Submit ---
  const handleSubmit = async () => {
    const { name, description, price, rate, count, category, type } = form;
    if (!name || !description || !price || !rate || !count || !category) {
      return Alert.alert('Missing fields', 'Please fill all required fields.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key =>
        formData.append(key, form[key as keyof typeof form]),
      );

      // Thumbnail logic
      if (thumbnail) {
        formData.append(
          'thumbNail',
          String(thumbnail.uri.replace(/^https?:\/\/[^/]+\//, '')),
        );
        if (!thumbnail.fromServer && !thumbnail.uri.includes('http')) {
          formData.append('image', {
            uri: normalizeUri(thumbnail.uri),
            type: thumbnail.type || 'image/jpeg',
            name: thumbnail.fileName || `thumbnail.jpg`,
          } as any);
        }
      }

      // Remaining Images
      images.forEach((img, idx) => {
        if (thumbnail && img.uri === thumbnail.uri && !thumbnail.fromServer)
          return;
        if (!img.fromServer && !img.uri.includes('http')) {
          formData.append('image', {
            uri: normalizeUri(img.uri),
            type: img.type || 'image/jpeg',
            name: img.fileName || `photo_${idx}.jpg`,
          } as any);
        }
      });

      // Video
      if (video && typeof video !== 'string' && !video.uri.includes('http')) {
        formData.append('video', {
          uri: normalizeUri(video.uri),
          type: video.type || 'video/mp4',
          name: video.fileName || 'video.mp4',
        } as any);
      }

      await editProduct(product.id, formData);

      // Process Deletions
      for (const img of imagesToDelete) {
        if (img?.id) await deleteImage({ imageId: Number(img.id) });
      }

      Alert.alert('Success', 'Product updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.screenBg }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      {/* 1. Inputs */}
      <InputSection form={form} setForm={setForm} colors={colors} />

      {/* 2. Images */}
      <ImageManager
        images={images}
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
        onPick={handlePickImage}
        onCapture={handleCaptureImage}
        onRemove={handleRemoveImage}
        colors={colors}
      />

      {/* 3. Video */}
      <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontWeight: '600',
            marginBottom: 5,
          }}
        >
          Product Video
        </Text>
        {video ? (
          <View>
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
              onPress={handleRemoveVideo}
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
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => handleMediaVideo('gallery')}
              style={{
                flex: 1,
                backgroundColor: '#007bff',
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                Add Video (Gallery)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMediaVideo('camera')}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.inputBg,
              }}
            >
              <VideoIcon size={28} color={colors.iconColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 4. Submit */}
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
          marginHorizontal: 20,
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
    </ScrollView>
  );
}
