import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import haversine from 'haversine-distance';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AuthContext } from '../helper/authContext';
import { GOOGLE_API_KEY } from '@env';

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

  const route = useRoute<RouteProp<DeliveryMapsScreenParamsList, 'map'>>();

  const { lat = 27.671044042129285 } = route.params ?? {};
  const { long = 85.28435232901992 } = route.params ?? {};
  const { name = 'Destination' } = route.params ?? {};
  const { address = 'Destination address' } = route.params ?? {};
  const { image = [] } = route.params ?? {};

  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };

  const mapRef = useRef<MapView | null>(null);
  const searchRef = useRef<any>(null);

  const [markerA, setMarkerA] = useState({
    latitude: lat,
    longitude: long,
    name,
  });

  const [markerB, setMarkerB] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isMapAnimating, setIsMapAnimating] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setMarkerB({ latitude, longitude, name: 'Your Location' });

          if (mapRef.current) {
            const region = {
              latitude: (markerA.latitude + latitude) / 2,
              longitude: (markerA.longitude + longitude) / 2,
              latitudeDelta: Math.abs(markerA.latitude - latitude) * 2 || 0.05,
              longitudeDelta: Math.abs(markerA.longitude - longitude) * 2 || 0.05,
            };
            mapRef.current.animateToRegion(region, 1000);
          }
        },
        error => console.error('Error getting location', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (markerA && markerB) {
      const dist = haversine(markerA, markerB) / 1000;
      setDistance(dist);
    }
  }, [markerA, markerB]);

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Image source={require('../../assets/images/user.png')} style={styles.userImg} />
        <Text style={styles.loginText}>Please login first</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        {/* Google Search */}
        <View style={styles.searchContainer}>
       <GooglePlacesAutocomplete
  ref={searchRef}
  placeholder="Search location..."
  fetchDetails
  debounce={200}
  enablePoweredByContainer={false}
  styles={{
    textInput: styles.searchInput,
    listView: styles.listView,
  }}
  query={{
    key: GOOGLE_API_KEY,
    language: 'en',
    components: 'country:np',
  }}
  onFail={(error) => {
    console.warn('Places API error:', error);
  }}
  onNotFound={() => {
    console.warn('No results found');
  }}
  onPress={(data, details = null) => {
    if (!details?.geometry?.location) return;
    const { lat, lng } = details.geometry.location;
    setMarkerA({
      latitude: lat,
      longitude: lng,
      name: details.formatted_address || 'Selected Location',
    });
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }}
/>

        </View>

        {isMapAnimating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size={20} color="#3B82F6" />
            <Text style={{ color: '#3b82f6', marginTop: 10, fontWeight: '600' }}>Centering map...</Text>
          </View>
        )}

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: markerA.latitude,
            longitude: markerA.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {markerA && <Marker coordinate={markerA} title={markerA.name} pinColor="red" />}
          {markerB && <Marker coordinate={markerB} title={markerB.name} pinColor="blue" />}
          {markerA && markerB && (
            <Polyline coordinates={[markerA, markerB]} strokeColor="#007AFF" strokeWidth={3} />
          )}
        </MapView>

        {distance !== null && (
          <View style={styles.distanceBox}>
            <Text style={styles.distanceText}>Distance: {distance.toFixed(2)} km</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  userImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  loginText: { fontWeight: 'bold', fontSize: 18, color: '#333' },
  searchContainer: { position: 'absolute', top: 50, zIndex: 10, width: '100%', paddingHorizontal: 16 },
  searchInput: { backgroundColor: 'white', borderRadius: 10, fontSize: 16, paddingHorizontal: 10, color: '#000' },
  listView: { backgroundColor: 'white', borderRadius: 10 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  distanceBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  distanceText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
});
