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
  useColorScheme,
  Alert,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  Region,
} from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTenant } from '../api/tenantApi';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { API_BASE_URL } from '@env';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../helper/authContext';

const destination = {
  latitude: 27.671044042129285,
  longitude: 85.28435232901992,
};
const { width, height } = Dimensions.get('window');

export default function DeliveryMapsScreen() {
  type MapsScreenParamsList = {
    map: {};
  };
  const mapRef = useRef<MapView | null>(null);
  type MapsScreenRouteProp = RouteProp<MapsScreenParamsList, 'map'>;
  const route = useRoute<MapsScreenRouteProp>();
  const searchRef = useRef<any>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const moveToTargetRegion = (targetRegion: Region) => {
    if (mapRef.current) {
      setIsMapAnimating(true); // start loading
      mapRef.current.animateToRegion(targetRegion, 1500); // smooth animation (1.5s)

      // Simulate end of animation
      setTimeout(() => {
        setIsMapAnimating(false); // stop loading
      }, 1500);
    }
  };
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
      </View>
    );
  }

  // Trigger camera move when map is ready and initialCoord exists
  useEffect(() => {
    const requestLocationPermission = async () => {
      // ... Permission logic ...
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Location permission denied');
          return false; // Return false on denial
        }
        return true;
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

          // 1. Add a marker for user's location
          setMarkersList(prev => [
            ...prev,
            {
              latitude,
              longitude,
              name: 'Your Location',
              address: 'Current location',
            },
          ]);

          // 2. Center the map on the user's location
          if (mapRef.current) {
            const newRegion: Region = {
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            moveToTargetRegion(newRegion);
          }
        },
        error => {
          // This is where your error is being logged
          console.error('Error getting location', error);
          // Optional: Show an alert to the user based on the error code
          if (error.code === 1) {
            // Permission Denied
            Alert.alert(
              'Location Error',
              'Location permission was denied. Please enable it in settings to see your position.',
            );
          }
          console.log(
            `Geolocation Error Code: ${error.code}. Message: ${error.message}`,
          );
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 },
      );
      // ... tenant fetch logic ...
    };

    if (isMapReady) {
      fetchDataAndLocation();
    }
  }, [isMapReady]);

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
            currentLocation={true}
            currentLocationLabel="Current location"
            enableHighAccuracyLocation={true}
            onFail={() => console.warn('Gooxgle Places Autocomplete failed')}
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

              setMarkersList(prev => [
                ...prev,
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  name: location.address,
                  address: 'Selected location',
                },
              ]);
              const newRegion: Region = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
              moveToTargetRegion(newRegion);
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
          showsUserLocation={true} // ✅ Displays the blue dot for user's current location
          showsMyLocationButton={true}
          onRegionChangeComplete={() => setIsMapAnimating(false)} // hides loader when map settles
          style={StyleSheet.absoluteFillObject} // ✅ covers full screen
          initialRegion={{
            latitude: destination.latitude,
            longitude: destination.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onMapReady={() => setIsMapReady(true)} // <-- map is ready
        >
          {tenantArray.map((coord, index) => (
            <Marker
              key={index}
              draggable
              ref={ref => {}}
              coordinate={{
                latitude: 0,
                longitude: 0,
              }}
            ></Marker>
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
