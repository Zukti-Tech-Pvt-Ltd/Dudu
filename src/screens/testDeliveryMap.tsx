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
  FlatList,
  ActivityIndicator,
  useColorScheme,
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
import { API_BASE_URL } from '@env';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import { AuthContext } from '../helper/authContext';

// Default coordinates (e.g., center of Nepal)
const destination = {
  latitude: 27.671044042129285,
  longitude: 85.28435232901992,
};
const { width, height } = Dimensions.get('window');

export default function workingmap() {
  type MapsScreenParamsList = {
    map: {};
  };

  type MapsScreenRouteProp = RouteProp<MapsScreenParamsList, 'map'>;
  const route = useRoute<MapsScreenRouteProp>();
  const searchRef = useRef<any>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const mapRef = useRef<MapView | null>(null);
  const activeMarkerRef = useRef<any>(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

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

  // Initialize to true to show the loader immediately on mount/focus
  const [isMapAnimating, setIsMapAnimating] = useState(true);

  const moveToTargetRegion = (targetRegion: Region) => {
    if (mapRef.current) {
      setIsMapAnimating(true); // start loading
      mapRef.current.animateToRegion(targetRegion, 1500); // smooth animation (1.5s)

      // Simulate end of animation (since animateToRegion has no callback)
      setTimeout(() => {
        // This setTimeout is the fallback, MapView's onRegionChangeComplete is the main mechanism
        setIsMapAnimating(false); // stop loading
      }, 1500);
    }
  };
  const [searchedLocation, setSearchedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
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
  const [hasCenteredToUser, setHasCenteredToUser] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const closePopup = () => {
    if (activeMarkerRef.current && activeMarkerRef.current.hideCallout) {
      activeMarkerRef.current.hideCallout();
    }
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {});
  };
  if (!isLoggedIn) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <Image
          source={require('../../assets/images/user.png')}
          className={`w-20 h-20 rounded-full mb-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />

        <Text
          className={`font-bold text-lg mb-2 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Please login first
        </Text>

        <Text
          className={`text-base mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          You must be logged in to use Maps.
        </Text>

        {/* Go Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className={`px-5 py-2 rounded-full ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-medium ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  useEffect(() => {
    if (!isFocused) return;

    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    const fetchUserLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        setIsMapAnimating(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const location = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setUserLocation(location);

          // Add user marker
          setMarkersList(prev => {
            if (!prev.find(m => m.name === 'Your Location')) {
              return [
                ...prev,
                {
                  latitude,
                  longitude,
                  name: 'Your Location',
                  address: 'Current location',
                },
              ];
            }
            return prev;
          });

          // Animate map once
          if (mapRef.current && !hasCenteredToUser) {
            mapRef.current.animateToRegion({
              ...location,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setHasCenteredToUser(true);
          }
          setMapRegion(location); // <-- center map here

          setIsMapAnimating(false);
        },
        error => {
          console.error('Error getting location', error);
          setIsMapAnimating(false);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 },
      );
    };

    fetchUserLocation();
  }, [isFocused]);

  const MyCustomCallOut = (cord: { name: string; address: string }) => (
    <View>
      <Text className="font-bold">{cord.name}</Text>
      <Text className="text-xs text-gray-500">{cord.address}</Text>
    </View>
  );

  return (
    // ✅ FIX: Removed TouchableWithoutFeedback wrapper to prevent search blur conflict
    <View className="flex-1 bg-transparent ">
      {/* Autocomplete positioned absolutely on top */}
      <View className="absolute top-8 w-full z-10 px-5">
        <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Where to?"
          fetchDetails={true}
          debounce={200}
          enablePoweredByContainer={false}
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
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
              elevation: 5,
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
              elevation: 3,
            },
          }}
          query={{
            key: 'AIzaSyAhdGhZ6oWVPsUH6fzvDiPe_TgCsCKisJs', // <-- Replace with your actual key
            language: 'en',
            types: 'geocode',
            components: 'country:np',
          }}
          onPress={(data, details = null) => {
            Keyboard.dismiss();
            if (!details?.geometry?.location) {
              console.warn('Missing geometry details!');
              return;
            }

            const location = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              address:
                details.formatted_address ||
                details.name ||
                data.description ||
                'Unknown location',
            };
            setSearchedLocation(location);

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
          <Text style={{ color: '#3b82f6', marginTop: 10, fontWeight: '600' }}>
            Centering map...
          </Text>
        </View>
      )}
      {/* Map takes full space */}
      {mapRegion ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion} // <-- use user location
          showsUserLocation={true}
        >
          {/* User marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="You are here"
              image={require('../../assets/icons/map.png')}
            />
          )}

          {/* Searched location */}
          {searchedLocation && (
            <Marker
              coordinate={{
                latitude: searchedLocation.latitude,
                longitude: searchedLocation.longitude,
              }}
              title="Selected Location"
              description={searchedLocation.address}
              image={require('../../assets/icons/marker.png')}
            />
          )}
        </MapView>
      ) : (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Kept your original styles for reference, though most are replaced by Tailwind/className
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
