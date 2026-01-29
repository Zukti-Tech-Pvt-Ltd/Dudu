import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
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
import {
  CheckCircle,
  MapPin,
  Navigation,
  User,
  AlertCircle,
  Info,
} from 'lucide-react-native';

interface Rider {
  id: number;
  username: string;
  email: string | null;
  distance?: number;
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

const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const googleReverseGeocode = async (lat: number, lng: number) => {
  try {
    const API_KEY = GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    const response = await fetch(url);
    const text = await response.text();
    if (text.trim().startsWith('<')) return 'Google API error.';
    const data = JSON.parse(text);
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return 'Unknown location';
  } catch (error) {
    return 'Unknown location';
  }
};

export default function AvaliableRidersScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

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

  // --- MODAL STATES ---
  const [uniqueKey, setUniqueKey] = useState('');

  // 1. Assign Modal State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // 2. Generic Status Modal State
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setStatusModal({ visible: true, title, message, type });
  };

  const fetchAcceptedRiders = async () => {
    try {
      const data = await getRiderWhoAccepted(uniqueKey);
      setAccepted(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const getLocationAndFetchRiders = async () => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          showAlert(
            'Permission Denied',
            'Location permission is required.',
            'error',
          );
          setLoading(false);
          return;
        }

        const location = await getCurrentLocation();
        if (!location) {
          showAlert('Error', 'Could not get user location', 'error');
          setLoading(false);
          return;
        }

        setSellerLocations(location);
        await googleReverseGeocode(location.latitude, location.longitude);

        const data = await getAllRider(location.latitude, location.longitude);
        if (Array.isArray(data.data)) setRiders(data.data);
        if (data.uniqueKey) setUniqueKey(data.uniqueKey);
      } catch (err) {
        console.error(err);
        showAlert('Error', 'Something went wrong while fetching data', 'error');
      } finally {
        setLoading(false);
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
    if (accepted.length > 0) loadLocations();
  }, [accepted]);

  const handleAssignOrder = async () => {
    if (!selectedRider) return;

    setIsAssigning(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsAssigning(false);
        return;
      }
      const address = await googleReverseGeocode(
        sellerlocations!.latitude,
        sellerlocations!.longitude,
      );

      await AssignOrderToRider(
        selectedRider.id,
        order.id,
        sellerlocations!.latitude,
        sellerlocations!.longitude,
        address,
      );

      await rejectOrderToRider(selectedRider.id, uniqueKey);

      setAssignModalVisible(false);

      setTimeout(() => {
        showAlert('Success', 'Order assigned successfully!', 'success');
      }, 300);
    } catch (error) {
      console.error(error);
      showAlert('Error', 'Failed to assign order.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

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
      updated.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
      return updated;
    });
  }, [accepted, sellerlocations]);

  const handlePress = (rider: Rider) => {
    console.log('Rider pressed:', rider);
    const acceptedStatus = isAccepted(rider.id);
    if (!acceptedStatus) {
      showAlert(
        'Rider Detail',
        `Username: ${rider.username}\nEmail: ${
          rider.email ?? 'No email'
        }\n(Waiting for acceptance)`,
        'info',
      );
      return;
    }
    setSelectedRider(rider);
    setAssignModalVisible(true);
  };

  return (
    <View className="flex-1 p-4 bg-white dark:bg-neutral-900">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#171717' : '#ffffff'}
      />

      {loading && (
        <Text className="text-center mb-2 text-gray-600 dark:text-gray-400">
          Loading...
        </Text>
      )}

      <FlatList
        data={riders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const acceptedStatus = isAccepted(item.id);
          return (
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View className="flex-row justify-between items-center p-3 border-b border-gray-200 dark:border-neutral-700">
                <View>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.username}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {item.email || 'No email'}
                  </Text>
                  {acceptedStatus && locations[item.id] && (
                    <>
                      <Text className="text-sm text-green-600 dark:text-green-400 mt-1">
                        📍 {locations[item.id]}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
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
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-600 dark:text-gray-400 text-lg">
                No riders found yet.
              </Text>
            </View>
          ) : null
        }
      />

      {/* ============================================== */}
      {/* 1. ASSIGN CONFIRMATION MODAL                   */}
      {/* ============================================== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-2xl">
            <View className="items-center mb-5">
              <View className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-3">
                <CheckCircle size={32} color="#16a34a" strokeWidth={2.5} />
              </View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                Accept Rider?
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-1">
                Are you sure you want to assign this order to{' '}
                {selectedRider?.username}?
              </Text>
            </View>

            <View className="bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-xl mb-6 space-y-2">
              <View className="flex-row items-center">
                <User size={18} color={isDarkMode ? '#d1d5db' : '#6b7280'} />
                <Text className="ml-2 text-gray-700 dark:text-gray-200 font-semibold">
                  {selectedRider?.username}
                </Text>
              </View>
              <View className="flex-row items-center mt-2">
                <MapPin size={18} color={isDarkMode ? '#d1d5db' : '#6b7280'} />
                <Text
                  className="ml-2 text-gray-600 dark:text-gray-400 text-xs flex-1"
                  numberOfLines={2}
                >
                  {selectedRider
                    ? locations[selectedRider.id] ?? 'Loading...'
                    : ''}
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                onPress={handleAssignOrder}
                disabled={isAssigning}
                className="w-full bg-green-600 py-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-green-200 dark:shadow-none"
              >
                {isAssigning ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Confirm & Assign
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (selectedRider) {
                    const matchedLocation = accepted.find(
                      a => a.partnerId === selectedRider.id,
                    );
                    if (matchedLocation)
                      openMap(matchedLocation.lat, matchedLocation.lng);
                  }
                }}
                className="w-full bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 py-4 rounded-2xl flex-row justify-center items-center"
              >
                <Navigation
                  size={20}
                  color={isDarkMode ? '#ffffff' : '#4b5563'}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-gray-700 dark:text-white font-bold text-lg">
                  View on Map
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAssignModalVisible(false)}
                className="py-2 mt-1"
              >
                <Text className="text-gray-400 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================== */}
      {/* 2. GENERIC STATUS MODAL (Success / Error / Info) */}
      {/* ============================================== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModal.visible}
        onRequestClose={() =>
          setStatusModal(prev => ({ ...prev, visible: false }))
        }
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-6 shadow-xl items-center">
            {/* Dynamic Icon */}
            <View
              className={`p-4 rounded-full mb-4 ${
                statusModal.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : statusModal.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
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
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {statusModal.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">
              {statusModal.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() =>
                setStatusModal(prev => ({ ...prev, visible: false }))
              }
              className={`w-full py-3.5 rounded-2xl ${
                statusModal.type === 'success'
                  ? 'bg-green-500'
                  : statusModal.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                Okay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
