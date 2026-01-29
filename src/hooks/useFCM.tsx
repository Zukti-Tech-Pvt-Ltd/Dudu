import messaging from '@react-native-firebase/messaging';
import {
  PermissionsAndroid,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { createRider } from '../api/deliveryApi';
import { AuthContext } from '../helper/authContext';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import Geolocation from '@react-native-community/geolocation';
import { openMap } from '../screens/merchantScreen/availableRider';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
} from 'lucide-react-native';
import { orderReceivedByUser } from '../api/orderApi';

// --- 1. HELPER FUNCTIONS ---

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      async err => {
        if (err.code === 3 || err.code === 2) {
          Geolocation.getCurrentPosition(
            pos =>
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            reject,
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 1000 },
          );
        } else {
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 1000 },
    );
  });

// --- 2. TYPES ---
type ModalType = 'DELIVERY_REQUEST' | 'SUCCESS' | 'ERROR' | 'INFO' | 'CONFIRM';

interface ModalConfig {
  visible: boolean;
  type: ModalType;
  title: string;
  body: string;
  data?: any; // To store coordinates, uniqueKeys, etc.
  onConfirm?: () => Promise<void> | void; // Custom action for "Yes" or "Okay" buttons
}

// --- 3. MAIN HOOK ---

const useFCM = () => {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Unified Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: 'INFO',
    title: '',
    body: '',
    data: null,
  });

  // Helper to close modal
  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  // Helper to show generic alert
  const showModernAlert = (
    title: string,
    body: string,
    type: ModalType = 'INFO',
    onConfirm?: () => void,
  ) => {
    setModalConfig({
      visible: true,
      type,
      title,
      body,
      onConfirm,
    });
  };

  useEffect(() => {
    if (!token) return;

    const decoded = jwtDecode<JwtPayload & { userId: number }>(token);

    const handleNotification = async (remoteMessage: any) => {
      const title = remoteMessage.notification?.title;
      const body = remoteMessage.notification?.body;
      const uniqueKey = remoteMessage.data?.uniqueKey;
      const orderId = remoteMessage.data?.orderId;
      const merchantlat = remoteMessage.data?.lat
        ? parseFloat(remoteMessage.data.lat)
        : undefined;
      const merchantlng = remoteMessage.data?.lng
        ? parseFloat(remoteMessage.data.lng)
        : undefined;

      // 1. DELIVERY REQUEST (The Complex One)
      if (body === 'Are you avaibale for delivery?') {
        setModalConfig({
          visible: true,
          type: 'DELIVERY_REQUEST',
          title: title ?? 'New Delivery Request',
          body: body ?? 'A merchant is looking for a rider nearby.',
          data: {
            merchantLat: merchantlat,
            merchantLng: merchantlng,
            uniqueKey: uniqueKey,
            userId: decoded.userId,
          },
        });
        return;
      }

      // 2. SUCCESS MESSAGES
      if (body === 'You are selected for the delivery') {
        showModernAlert(title ?? 'Success', body, 'SUCCESS');
        return;
      }

      // 3. INFO/WARNING MESSAGES
      if (body === 'Order was given to a different rider.') {
        showModernAlert(title ?? 'Notification', body, 'INFO');
        return;
      }

      // 4. GENERAL INFO
      if (title === 'Hello Merchant') {
        showModernAlert(title ?? 'Notification', body ?? '', 'SUCCESS');
        return;
      }

      // 5. CONFIRMATION (Is order delivered?)
      if (title === 'Is the order delivered') {
        // Extract orderId safely
        const orderId = remoteMessage.data?.order;

        showModernAlert(title, body ?? '', 'CONFIRM', async () => {
          // 👇 THIS LOGIC RUNS WHEN USER PRESSES "YES"
          try {
            console.log('User confirmed order delivery');

            let idToProcess = orderId;
            // Parse if it's a JSON string
            try {
              const parsed = JSON.parse(orderId);
              if (parsed?.id) idToProcess = parsed.id;
            } catch (e) {}

            if (idToProcess) {
              await orderReceivedByUser(idToProcess); // Call API here
              closeModal();
              setTimeout(
                () =>
                  showModernAlert(
                    'Success',
                    'Order marked as received!',
                    'SUCCESS',
                  ),
                300,
              );
            } else {
              console.warn('No order ID found');
              closeModal();
            }
          } catch (error) {
            console.error(error);
            closeModal();
            setTimeout(
              () =>
                showModernAlert('Error', 'Failed to update status', 'ERROR'),
              300,
            );
          }
        });
        return;
      }
    };

    const unsubscribe = messaging().onMessage(handleNotification);
    const unsubscribeBg =
      messaging().onNotificationOpenedApp(handleNotification);

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) handleNotification(remoteMessage);
      });

    return () => {
      unsubscribe();
      unsubscribeBg();
    };
  }, [token]);

  // --- ACCEPT LOGIC (For Delivery Request) ---
  const handleAcceptDelivery = async () => {
    const data = modalConfig.data;
    if (!data || !data.userId || !data.uniqueKey) return;

    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      const { latitude, longitude } = await getCurrentLocation();

      await createRider(data.userId, longitude, latitude, data.uniqueKey);

      closeModal();
      // Optionally show success modal afterwards
      // showModernAlert('Success', 'You accepted the request!', 'SUCCESS');
    } catch (error) {
      console.error('Error creating rider:', error);
      closeModal();
      // Show Error Modal instead of Alert
      setTimeout(() => {
        showModernAlert('Error', `Failed to accept: ${error}`, 'ERROR');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. THE CUSTOM UI COMPONENT ---
  const DeliveryRequestModal = () => {
    // Determine Icon based on Type
    const getIcon = () => {
      switch (modalConfig.type) {
        case 'DELIVERY_REQUEST':
          return <MapPin size={32} color="#3B82F6" strokeWidth={2.5} />;
        case 'SUCCESS':
          return <CheckCircle size={32} color="#10B981" strokeWidth={2.5} />;
        case 'ERROR':
          return <AlertCircle size={32} color="#EF4444" strokeWidth={2.5} />;
        case 'CONFIRM':
          return <HelpCircle size={32} color="#F59E0B" strokeWidth={2.5} />;
        default:
          return <Info size={32} color="#6B7280" strokeWidth={2.5} />;
      }
    };

    // Determine Header Color based on Type
    const getHeaderBg = () => {
      switch (modalConfig.type) {
        case 'DELIVERY_REQUEST':
          return 'bg-blue-100';
        case 'SUCCESS':
          return 'bg-green-100';
        case 'ERROR':
          return 'bg-red-100';
        case 'CONFIRM':
          return 'bg-yellow-100';
        default:
          return 'bg-gray-100';
      }
    };

    // Main Button Color
    const getBtnColor = () => {
      switch (modalConfig.type) {
        case 'SUCCESS':
          return 'bg-green-500';
        case 'ERROR':
          return 'bg-red-500';
        case 'CONFIRM':
          return 'bg-yellow-500';
        default: // DELIVERY_REQUEST and INFO
          return 'bg-blue-500';
      }
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfig.visible}
        onRequestClose={closeModal}
      >
        {/* Dark Overlay */}
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          {/* Modern White Card */}
          <View className="bg-white w-full rounded-3xl p-6 shadow-2xl">
            {/* Header Icon & Text */}
            <View className="items-center mb-6">
              <View className={`${getHeaderBg()} p-4 rounded-full mb-4`}>
                {getIcon()}
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                {modalConfig.title}
              </Text>
              <Text className="text-gray-500 text-center px-4 leading-5">
                {modalConfig.body}
              </Text>
            </View>

            {/* Action Buttons Area */}
            <View className="gap-3 w-full">
              {/* === CASE 1: DELIVERY REQUEST UI === */}
              {modalConfig.type === 'DELIVERY_REQUEST' && (
                <>
                  <TouchableOpacity
                    onPress={handleAcceptDelivery}
                    disabled={isLoading}
                    style={{ width: '100%' }}
                    className="bg-blue-500 py-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-200"
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text
                        className="text-white font-bold text-lg text-center"
                        numberOfLines={1}
                      >
                        Accept Delivery
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (
                        modalConfig.data?.merchantLat &&
                        modalConfig.data?.merchantLng
                      ) {
                        openMap(
                          modalConfig.data.merchantLat,
                          modalConfig.data.merchantLng,
                        );
                      } else {
                        // Show error modal over this one? Or simple toggle
                        closeModal();
                        setTimeout(
                          () =>
                            showModernAlert(
                              'Location Error',
                              'Location unavailable',
                              'ERROR',
                            ),
                          300,
                        );
                      }
                    }}
                    style={{ width: '100%' }}
                    className="bg-blue-50 py-4 rounded-2xl border border-blue-100 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-blue-600 font-bold text-center text-lg">
                      View on Map
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeModal}
                    className="py-3 mt-1 self-center"
                  >
                    <Text className="text-gray-400 font-semibold text-center">
                      No, thanks
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* === CASE 2: CONFIRMATION UI (Yes/No) === */}
              {modalConfig.type === 'CONFIRM' && (
                <View className="flex-row gap-3 w-full">
                  {/* NO BUTTON */}
                  <TouchableOpacity
                    onPress={closeModal}
                    disabled={isLoading} // Disable if processing
                    className={`flex-1 bg-gray-100 py-4 rounded-2xl items-center justify-center ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                  >
                    <Text className="text-gray-600 font-bold text-lg">No</Text>
                  </TouchableOpacity>

                  {/* YES BUTTON */}
                  <TouchableOpacity
                    disabled={isLoading} // Prevent double-tap
                    onPress={async () => {
                      if (modalConfig.onConfirm) {
                        setIsLoading(true); // 1. Start Spinner
                        try {
                          // 2. Wait for the API logic passed from handleNotification
                          await modalConfig.onConfirm();
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setIsLoading(false); // 3. Stop Spinner
                        }
                      } else {
                        closeModal();
                      }
                    }}
                    className="flex-1 bg-yellow-500 py-4 rounded-2xl items-center justify-center shadow-md shadow-yellow-200"
                  >
                    {/* Show Spinner or Text */}
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-lg">Yes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* === CASE 3: STANDARD UI (Okay Button) for Info/Success/Error === */}
              {(modalConfig.type === 'INFO' ||
                modalConfig.type === 'SUCCESS' ||
                modalConfig.type === 'ERROR') && (
                <TouchableOpacity
                  onPress={() => {
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                    closeModal();
                  }}
                  style={{ width: '100%' }}
                  className={`${getBtnColor()} py-4 rounded-2xl items-center justify-center shadow-md`}
                >
                  <Text className="text-white font-bold text-lg">Okay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return { DeliveryRequestModal };
};

export default useFCM;
