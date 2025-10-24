import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Region,
  MapPressEvent,
} from 'react-native-maps';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createTenant, createTenantImage, editTenant } from '../api/tenantApi';
import { launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';

export default function MapsScreenTenants() {
  type MapTabParamsList = {
    mapDetail: {
      placeName: string;
      location: string;
      phoneNumber: string;
      latitude: number;
      longitude: number;
    };
  };
  type MapRouteProp = RouteProp<MapTabParamsList, 'mapDetail'>;
  const route = useRoute<MapRouteProp>();
  const { placeName, location, phoneNumber, latitude, longitude } =
    route.params;
  console.log('routeparams', route.params);
  const navigation = useNavigation();
  const mapRef = useRef<MapView | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = parseInt(Platform.Version as unknown as string, 10);

        if (apiLevel >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photo Access Permission',
              message: 'App needs access to your photos to select images',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to select photos',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const pickImageFromGallery = async () => {
    const options = {
      mediaType: 'photo' as const,
      selectionLimit: 0,
    };
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      console.warn('Storage permission denied');
      return;
    }

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uris = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri !== undefined) as string[];
        setSelectedImages(prev => [...prev, ...uris]);
      } else {
        console.warn('No assets returned from image picker');
      }
    });
  };

  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 27.671044042129285,
    longitude: 85.28435232901992,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isDone, SetIsDone] = useState(false);

  const [markingMode, setMarkingMode] = useState(false); // Are we marking?
  const uploadImages = async () => {
    try {
      const tenantResponse = await createTenant(
        placeName,
        phoneNumber,
        location,
        marker?.latitude,
        marker?.longitude,
      );
      console.log('Tenant created:', tenantResponse);
      const formData = new FormData();
      formData.append('tenantId', tenantResponse?.data?.id);
      selectedImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        const file = {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any;
        formData.append('image', file);
      });
      const imageResponse = await createTenantImage(formData);
      console.log('Tenant images uploaded:', imageResponse);

      navigation.goBack();
    } catch (err) {
      console.error('Error editing tenant:', err);
    }
  };
  // Handler for tap

  const handleMapPress = (event: MapPressEvent) => {
    if (markingMode) {
      const coordinate = event.nativeEvent.coordinate;
      setMarker({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      setMarkingMode(false); // Finish marking, switch UI state
    }
  };
  const { height } = Dimensions.get('window');

  const slideAnim = useRef(new Animated.Value(height)).current;

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      SetIsDone(false); // Hide the modal when animation finishes
    });
  };
  useEffect(() => {
    if (isDone) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isDone]);
  const handleDonePress = async () => {
    console.log('Marker set at:', marker);
    console.log('Done pressed', isDone);
    if (!marker) {
      console.warn('No marker set');
      return;
    }
    SetIsDone(true);
  };
  const handleCancelPress = () => {
    setMarker(null);
    setMarkingMode(true); // allow user to mark again
  };
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={r => setRegion(r)}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {marker && (
          <Marker
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={'Selected Location'}
            description={'Your marked place'}
          />
        )}
      </MapView>

      {/* Floating Bottom Button for mark/done */}
      {!marker && !markingMode && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.markButton}
            onPress={() => setMarkingMode(true)}
          >
            <Text style={styles.buttonText}>Mark Location</Text>
          </Pressable>
        </View>
      )}
      {markingMode && (
        <View style={styles.buttonContainer}>
          <Text style={styles.infoText}>
            Tap on the map to select your location
          </Text>
        </View>
      )}
      {marker && !markingMode && (
        <View style={styles.doubleButtonContainer}>
          <Pressable style={styles.cancelButton} onPress={handleCancelPress}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.doneButton} onPress={handleDonePress}>
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      )}
      <Modal visible={isDone} transparent animationType="slide">
        <SafeAreaView
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 3,
            right: 3,
            bottom: 0,
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={closePopup} />
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              alignItems: 'center',
            }}
          >
            {/* Display selected images */}
            <FlatList
              data={selectedImages}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 10 }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                  resizeMode="cover"
                />
              )}
            />
            {selectedImages.length > 0 ? (
              <TouchableOpacity
                style={{
                  backgroundColor: '#3b82f6',
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 10, // Add this for gap

                  marginBottom: 10,
                  width: '100%',
                }}
                onPress={uploadImages}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Upload
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: '#3b82f6',
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 10, // Add this for gap

                  marginBottom: 10,
                  width: '100%',
                }}
                onPress={pickImageFromGallery}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Add Idmage
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  doubleButtonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    alignSelf: 'center',
  },
  button2Container: {
    position: 'absolute',
    paddingRight: 250,
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  markButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  infoText: {
    backgroundColor: '#fff',
    color: '#1e40af',
    fontWeight: 'bold',
    fontSize: 15,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    marginTop: 10,
  },
});
