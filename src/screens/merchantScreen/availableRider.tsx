import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  AssignOrderToRider,
  getAllRider,
  getRiderWhoAccepted,
  rejectOrderToRider,
} from '../../api/merchantOrder/orderApi';
import { GOOGLE_API_KEY } from '@env';
import { Order } from './order';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../hooks/useFCM';
interface Rider {
  id: number;
  username: string;
  email: string | null;
  distance?: number;
}

interface Rider {
  id: number;
  username: string;
  email: string | null;
}

interface AcceptedRider {
  id: number;
  partnerId: number;
  lat: number;
  lng: number;
  __partner__?: { username: string };
}

type RootStackParamList = {
  AvaliableRidersScreen: { order: Order };
};

type OrderDetailRouteProp = RouteProp<
  RootStackParamList,
  'AvaliableRidersScreen'
>;
export const openMap = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  Linking.openURL(url);
};
export const openMapWithPlace = (placeName: string) => {
  const encoded = encodeURIComponent(placeName);
  const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  Linking.openURL(url);
};
// Calculate distance in km between two coordinates
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// GOOGLE REVERSE GEOCODE
export const googleReverseGeocode = async (lat: number, lng: number) => {
  try {
    const API_KEY = GOOGLE_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

    console.log('📡 Fetching:', url);

    const response = await fetch(url);
    const text = await response.text();

    // console.log('🔍 RAW GOOGLE RESPONSE:', text);

    // If Google returned HTML → API key restriction / not enabled / billing issue
    if (text.trim().startsWith('<')) {
      console.log('❌ Google returned HTML. API key issue.');
      return 'Google API error (HTML response). Check API Key / Restrictions.';
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.log('❌ JSON Parse Error:', jsonError);
      return 'Google API response invalid.';
    }

    // Successful result
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.log('⚠ Google returned error:', data.status);
      return 'Unknown location';
    }
  } catch (error) {
    console.log('❌ Google reverse geocoding error:', error);
    return 'Unknown location';
  }
};
export default function AvaliableRidersScreen() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [accepted, setAccepted] = useState<AcceptedRider[]>([]);
  const [locations, setLocations] = useState<Record<number, string>>({});
  const [sellerlocations, setSellerLocations] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const route = useRoute<OrderDetailRouteProp>();
  const { order } = route.params;
  // const [userLocation, setUserLocation] = useState<{
  //   latitude: number;
  //   longitude: number;
  // } | null>(null);

  const [uniqueKey, setUniqueKey] = useState('');
  // useEffect(() => {
  //   (async () => {
  //     const hasPermission = await requestLocationPermission();
  //     if (!hasPermission) return;
  //     const location = await getCurrentLocation();
  //     setUserLocation(location);
  //   })();
  // }, []);
  // Fetch all riders
  // const fetchRiders = async () => {
  //   setLoading(true);
  //   try {
  //     const data = await getAllRider(); // backend returns { data: [...], uniqueKey: 'xxx' }
  //     if (Array.isArray(data.data)) setRiders(data.data);

  //     if (data.uniqueKey) setUniqueKey(data.uniqueKey); // triggers fetchAcceptedRiders
  //   } catch (err) {
  //     Alert.alert('Error', 'Something went wrong');
  //   }
  //   setLoading(false);
  // };

  // Fetch accepted riders
  const fetchAcceptedRiders = async () => {
    try {
      const data = await getRiderWhoAccepted(uniqueKey);
      setAccepted(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load initial data
  // useEffect(() => {
  //   fetchRiders();
  //   // fetchAcceptedRiders();
  // }, []);
  useEffect(() => {
    const getLocationAndFetchRiders = async () => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setLoading(false);
          return;
        }

        const location = await getCurrentLocation();
        if (!location) {
          Alert.alert('Error', 'Could not get user location');
          setLoading(false);
          return;
        }

        setSellerLocations(location);

        const sellerAddress = await googleReverseGeocode(
          location.latitude,
          location.longitude,
        );
        console.log('Seller location >>>', sellerAddress);

        const data = await getAllRider(location.latitude, location.longitude);
        if (Array.isArray(data.data)) setRiders(data.data);
        if (data.uniqueKey) setUniqueKey(data.uniqueKey);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Something went wrong while fetching data');
      } finally {
        setLoading(false); // done loading in all cases
      }
    };

    getLocationAndFetchRiders();
  }, []);

  useEffect(() => {
    if (uniqueKey) {
      fetchAcceptedRiders();
      const interval = setInterval(fetchAcceptedRiders, 3000);
      return () => clearInterval(interval);
    }
  }, [uniqueKey]);

  // Load addresses for accepted riders
  useEffect(() => {
    const loadLocations = async () => {
      const promises = accepted.map(async a => {
        const address = await googleReverseGeocode(a.lat, a.lng);
        return { id: a.partnerId, address };
      });

      const results = await Promise.all(promises);

      const newLocations: Record<number, string> = {};
      results.forEach(r => {
        newLocations[r.id] = r.address;
      });

      setLocations(newLocations);
    };

    if (accepted.length > 0) {
      loadLocations();
    }
  }, [accepted]);

  const isAccepted = (riderId: number) => {
    return accepted.some(item => item.partnerId === riderId);
  };
  useEffect(() => {
    if (!sellerlocations || accepted.length === 0) return;

    setRiders(prevRiders => {
      const updated = prevRiders.map(rider => {
        const match = accepted.find(a => a.partnerId === rider.id);

        if (!match) return { ...rider, distance: undefined };

        const distance = getDistanceFromLatLonInKm(
          sellerlocations.latitude,
          sellerlocations.longitude,
          match.lat,
          match.lng,
        );

        return { ...rider, distance };
      });

      // 🔥 SORT BY DISTANCE (ASCENDING)
      updated.sort((a, b) => {
        if (a.distance == null) return 1; // non-accepted riders go down
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });

      return updated;
    });
  }, [accepted, sellerlocations]);

  const handlePress = (rider: Rider) => {
    const acceptedStatus = isAccepted(rider.id);

    const matchedLocation = accepted.find(a => a.partnerId === rider.id);

    if (!acceptedStatus) {
      // Rider is NOT accepted
      Alert.alert(
        'Rider Detail',
        `ID: ${rider.id}\nUsername: ${rider.username}\nEmail: ${
          rider.email ?? 'No email'
        }`,
      );
      return;
    }

    // Rider has accepted
    Alert.alert(
      'Accepted Rider',
      `ID: ${rider.id}
        Username: ${rider.username}
        Email: ${rider.email ?? 'No email'}
        Location: ${locations[rider.id] ?? 'Loading...'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View on Map',
          onPress: () => {
            if (matchedLocation)
              openMap(matchedLocation.lat, matchedLocation.lng);
          },
        },
        {
          text: 'Assign Order',
          onPress: async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;
            const address = await googleReverseGeocode(
              sellerlocations!.latitude,
              sellerlocations!.longitude,
            );

            await AssignOrderToRider(
              rider.id,
              order.id,
              sellerlocations!.latitude,
              sellerlocations!.longitude,
              address,
            );
            await rejectOrderToRider(rider.id, uniqueKey);
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 p-4 bg-white">
      {loading && (
        <Text className="text-center mb-2 text-gray-600">Loading...</Text>
      )}

      <FlatList
        data={riders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const acceptedStatus = isAccepted(item.id);
          const matchedLocation = accepted.find(a => a.partnerId === item.id);

          return (
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View className="flex-row justify-between items-center p-3 border-b border-gray-300">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {item.username}
                  </Text>

                  <Text className="text-sm text-gray-600">
                    {item.email || 'No email'}
                  </Text>

                  {acceptedStatus && locations[item.id] && (
                    <>
                      <Text className="text-sm text-green-600 mt-1">
                        📍 {locations[item.id]}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        🚗{' '}
                        {item.distance != null
                          ? `${item.distance.toFixed(2)} km away`
                          : 'Calculating distance...'}
                      </Text>
                    </>
                  )}
                </View>

                {acceptedStatus && (
                  <View className="w-4 h-4 rounded-full bg-green-500" />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() =>
          !loading ? (
            <View className="flex-1 justify-center items-center bg-white">
              <Text className="text-gray-600 text-lg">
                Loading location & riders...
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
