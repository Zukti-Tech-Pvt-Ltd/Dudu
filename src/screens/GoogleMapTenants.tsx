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
  Keyboard,
  Image,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
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
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Linking } from 'react-native';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

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
  const searchRef = useRef<any>(null);

  const mapRef = useRef<MapView | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  // --- CUSTOM MODAL STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined,
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };
  const requestStoragePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = parseInt(Platform.Version as any, 10);
        let granted;

        if (apiLevel >= 33) {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photo Access Permission',
              message: 'App needs access to your photos to select images',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            },
          );
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to select images',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            },
          );
        }

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          showStatus(
            'error',
            'Permission Denied',
            'Please allow storage/photo access to pick images from gallery.',
          );
          return false;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          // Pass openSettings as callback so "Okay" opens settings
          showStatus(
            'error',
            'Permission Required',
            'Please allow photo access from settings.',
            () => Linking.openSettings(),
          );
          return false;
        }
      }
      return true; // iOS or other platforms
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0, // multiple images
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
      showStatus(
        'error',
        'Image Picker Error',
        result.errorMessage || 'Failed to pick image',
      );
    } else if (result.assets) {
      const uris = result.assets.map(a => a.uri).filter(Boolean) as string[];
      console.log('Selected images:', uris);
      setSelectedImages(prev => [...prev, ...uris]);
    }
  };

  console.log('Selected Images===========:', selectedImages);
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
  const [loading, setLoading] = useState(false);
  const [markingMode, setMarkingMode] = useState(false); // Are we marking?
  const uploadImages = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
      // Close the upload modal first
      SetIsDone(false);
      // Show success status then go back
      showStatus(
        'success',
        'Success',
        'Tenant and images added successfully!',
        () => navigation.goBack(),
      );
    } catch (err) {
      console.error('Error editing tenant:', err);
      showStatus(
        'error',
        'Upload Failed',
        'Failed to create tenant or upload images.',
      );
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
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setTimeout(() => searchRef.current?.blur(), 100); // 👈 delay helps
      }}
    >
      <View style={styles.container}>
        <View className="absolute top-8 w-full z-10 px-5">
          <GooglePlacesAutocomplete
            ref={searchRef}
            placeholder="Where to?"
            fetchDetails={true}
            debounce={200}
            enablePoweredByContainer={true}
            nearbyPlacesAPI="GooglePlacesSearch"
            minLength={2}
            timeout={10000}
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
            keepResultsAfterBlur={false}
            currentLocation={true}
            currentLocationLabel="Current location"
            enableHighAccuracyLocation={true}
            onFail={() => console.warn('Google Places Autocomplete failed')}
            onNotFound={() => console.log('No results found')}
            onTimeout={() => console.warn('Google Places request timeout')}
            predefinedPlaces={[]}
            predefinedPlacesAlwaysVisible={false}
            styles={{
              textInputContainer: {
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                marginHorizontal: 20,
                shadowColor: '#d4d4d4',
              },
              textInput: {
                backgroundColor: 'white',
                fontWeight: '600',
                fontSize: 16,
                marginTop: 5,
                width: '100%',
                color: '#000',
                paddingHorizontal: 10,
              },

              listView: {
                backgroundColor: 'white',
                borderRadius: 10,
                shadowColor: '#d4d4d4',
              },
            }}
            query={{
              key: 'AIzaSyAhdGhZ6oWVPsUH6fzvDiPe_TgCsCKisJs',
              language: 'en',
              types: 'geocode',
              components: 'country:np',
            }}
            onPress={(data, details = null) => {
              if (!details?.geometry?.location) {
                console.warn('Missing geometry details!');
                return;
              }

              const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                // Prefer formatted_address or name for name/address
                address:
                  details.formatted_address ||
                  details.name ||
                  data.description ||
                  'Unknown location',
              };

              mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }}
            GooglePlacesSearchQuery={{
              rankby: 'distance',
              radius: 1000,
            }}
            textInputProps={{
              placeholderTextColor: 'gray',
            }}
          />
        </View>
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
              left: 10,
              right: 10,
              bottom: 10,
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
                (console.log('selectedImages', selectedImages),
                (
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
                    {loading ? (
                      <ActivityIndicator size={20} color="#fff" />
                    ) : (
                      <Text style={{ color: 'white', textAlign: 'center' }}>
                        Upload
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View>
                  <Image
                    source={require('../../assets/images/addImage.png')}
                    className="w-20 h-20  mb-4"
                  />
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
                      Add Image
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </SafeAreaView>
        </Modal>
        {/* --- CUSTOM STATUS MODAL --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={statusModal.visible}
          onRequestClose={() =>
            setStatusModal(prev => ({ ...prev, visible: false }))
          }
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                width: '100%',
                borderRadius: 24,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                alignItems: 'center',
              }}
            >
              {/* Dynamic Icon */}
              <View
                style={{
                  padding: 16,
                  borderRadius: 9999,
                  marginBottom: 16,
                  backgroundColor:
                    statusModal.type === 'success'
                      ? '#dcfce7' // green-100
                      : statusModal.type === 'error'
                      ? '#fee2e2' // red-100
                      : '#dbeafe', // blue-100
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
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {statusModal.title}
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 20,
                }}
              >
                {statusModal.message}
              </Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setStatusModal(prev => ({ ...prev, visible: false }));
                  if (statusModal.onClose) {
                    statusModal.onClose();
                  }
                }}
                style={{
                  width: '100%',
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor:
                    statusModal.type === 'success'
                      ? '#22c55e'
                      : statusModal.type === 'error'
                      ? '#ef4444'
                      : '#3b82f6',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                >
                  Okay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
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
