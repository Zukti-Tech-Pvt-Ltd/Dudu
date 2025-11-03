import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Keyboard,
  Image,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingViewBase,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  Region,
} from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AuthContext } from '../helper/authContext';

const destination = {
  latitude: 27.671044042129285,
  longitude: 85.28435232901992,
};
const { width, height } = Dimensions.get('window');

export default function DeliveryMapsScreen() {
  type DeliveryMapsScreenParamsList = {
    map: {
      lat?: number;
      long?: number;
      name?: string;
      address?: string;
      image?: string[];
    };
  };

  type DeliveryMapsScreenRouteProp = RouteProp<DeliveryMapsScreenParamsList, 'map'>;
  const route = useRoute<DeliveryMapsScreenRouteProp>();
  const searchRef = useRef<any>(null);

  const { lat = 0 } = route.params ?? {};
  const { long = 0 } = route.params ?? {};
  const { name = '' } = route.params ?? {};
  const { address = '' } = route.params ?? {};
  const { image = [] } = route.params ?? {};
  const mapRef = useRef<MapView | null>(null);
  const activeMarkerRef = useRef<any>(null); // 👈 Add this

  const slideAnim = useRef(new Animated.Value(height)).current;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const handleLoadStart = (uri: string) => {
    setLoadingImages(prev => ({ ...prev, [uri]: true }));
  };

  const handleLoadEnd = (uri: string) => {
    setLoadingImages(prev => ({ ...prev, [uri]: false }));
  };
  console.log('latitudelongitude', lat, long, name, address, image);
  console.log('image======', route.params);
  const [tenantArray, setTenantArray] = useState<
    Array<{
      latitude: number;
      longitude: number;
      name: string;
      address: string;
      image: string[];
    }>
  >([]);
  const [isMapAnimating, setIsMapAnimating] = useState(false);

  const moveToTargetRegion = (targetRegion: Region) => {
    if (mapRef.current) {
      setIsMapAnimating(true); // start loading
      mapRef.current.animateToRegion(targetRegion, 1500); // smooth animation (1.5s)

      // Simulate end of animation (since animateToRegion has no callback)
      setTimeout(() => {
        setIsMapAnimating(false); // stop loading
      }, 1500);
    }
  };
  const [selectedTenant, setSelectedTenant] = useState<{
    name: string;
    address: string;
    image: string[];
  } | null>(null);
  const [markersList, setMarkersList] = useState<
    Array<{
      latitude: number;
      longitude: number;
      name: string;
      address: string;
    }>
  >([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const { isLoggedIn, token, setToken } = useContext(AuthContext);

  const closePopup = () => {
    if (activeMarkerRef.current && activeMarkerRef.current.hideCallout) {
      activeMarkerRef.current.hideCallout();
    }
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTenant(null);
    });
  };
  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Image
          source={require('../../assets/images/user.png')}
          className="w-20 h-20 rounded-full mb-4 bg-gray-200"
        />
        <Text className="font-bold text-lg text-gray-900 mb-2">
          please login in first
        </Text>
      </View>
    );
  }
  useEffect(() => {
    if (selectedTenant) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTenant]);
  // Trigger camera move when map is ready and initialCoord exists
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS permissions handled differently at app level
    };

    const fetchDataAndLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          // Optionally add a marker for user's location
          setMarkersList(prev => [
            ...prev,
            {
              latitude,
              longitude,
              name: 'Your Location',
              address: 'Current location',
            },
          ]);
        },
        error => {
          console.error('Error getting location', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );

  

    fetchDataAndLocation()
    }
  }, []);

  const MyCustomCallOut = (cord: { name: string; address: string }) => (
    <View>
      <Text>{cord.name}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setTimeout(() => searchRef.current?.blur(), 100); // 👈 delay helps
      }}
    >
      <View className="flex-1  bg-transparent ">
        {/* Autocomplete positioned absolutely on top */}
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
            currentLocation={false}
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
              key: 'AIzaSyB8Pg3Bm6cqXX_oeQN3HHQdRaU2YRPX5oU',
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

              setMarkersList(prev => [
                ...prev,
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  name: location.address,
                  address: 'Selected location',
                },
              ]);

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
        {isMapAnimating && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <ActivityIndicator size={20} color="#3B82F6" />
            <Text
              style={{ color: '#3b82f6', marginTop: 10, fontWeight: '600' }}
            >
              Centering map...
            </Text>
          </View>
        )}
        {/* Map takes full space */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={() => setIsMapAnimating(false)}
          style={StyleSheet.absoluteFillObject} 
          initialRegion={{
            latitude: destination.latitude,
            longitude: destination.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onMapReady={() => setIsMapReady(true)} 
        >
          {tenantArray.map((coord, index) => (
            <Marker
              key={index}
              draggable
              ref={ref => {
                if (selectedTenant?.name === coord.name) {
                  activeMarkerRef.current = ref; // save reference of selected marker
                  console.log('ref', activeMarkerRef);
                }
              }}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              image={require('../../assets/icons/house.png')}
              onDragEnd={e => console.log({ x: e.nativeEvent.coordinate })}
              onPress={e => {
                setSelectedTenant(coord);
              }} // 👈 opens modal
            >
              <Callout>
                <MyCustomCallOut name={coord.name} address={coord.address} />
              </Callout>
            </Marker>
          ))}

          {markersList.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.name}
              description={marker.address}
              {...(marker.name === 'Your Location' && {
                image: require('../../assets/icons/map.png'),
              })}
            />
          ))}
        </MapView>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 15,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
