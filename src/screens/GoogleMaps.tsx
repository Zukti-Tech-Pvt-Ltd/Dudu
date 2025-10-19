import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

const destination = {
  latitude: 27.671044042129285,
  longitude: 85.28435232901992,
};

export default function MapsScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [tenantArray, setTenantArray] = useState<
    Array<{
      latitude: number;
      longitude: number;
      title: string;
      description: string;
    }>
  >([]);

  const [markersList, setMarkersList] = useState<
    Array<{
      latitude: number;
      longitude: number;
      title: string;
      description: string;
    }>
  >([]);
  const [isMapReady, setIsMapReady] = useState(false);

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
              title: 'Your Location',
              description: 'Current location',
            },
          ]);
        },
        error => {
          console.error('Error getting location', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );

      // Existing tenant data fetch
      try {
        const response = await getTenant();
        const tenants = response.data;
        const firstTenant = tenants[0];

        const mappedTenants = tenants.map((item: any) => ({
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          title: item.name,
          description: item.address,
        }));
        setTenantArray(mappedTenants);
        //  Move map camera to user's location if map is ready
        if (mapRef.current && isMapReady) {
          mapRef.current.animateToRegion({
            latitude: firstTenant.latitude,
            longitude: firstTenant.longitude,
            latitudeDelta: 0.11,
            longitudeDelta: 0.11,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataAndLocation();
  }, [isMapReady]);

  const MyCustomCallOut = () => (
    <View>
      <Text>Driver</Text>
    </View>
  );

  return (
    <View className="flex-1  bg-transparent ">
      {/* Autocomplete positioned absolutely on top */}
      <View className="absolute top-8 w-full z-10 px-5">
        <GooglePlacesAutocomplete
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
          }}
          onPress={(data, details = null) => {
            if (!details?.geometry?.location) {
              console.warn('Missing geometry details!');
              return;
            }

            const location = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              // Prefer formatted_address or name for title/description
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
                title: location.address,
                description: 'Selected location',
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

      {/* Map takes full space */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject} // ✅ covers full screen
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={() => setIsMapReady(true)} // <-- map is ready
      >
        {tenantArray.map((coord, index) => (
          <Marker
            key={index}
            draggable
            coordinate={{
              latitude: coord.latitude,
              longitude: coord.longitude,
            }}
            image={require('../../assets/icons/house.png')}
            onDragEnd={e => console.log({ x: e.nativeEvent.coordinate })}
          >
            <Callout>
              <MyCustomCallOut />
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
            title={marker.title}
            description={marker.description}
            image={
      marker.title === 'Your Location'
        ? require('../../assets/icons/map.png') // your custom icon for user location
        : require('../../assets/icons/map.png') // default icon for other markers
    }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteWrapper: {
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: 1,
  },
});
