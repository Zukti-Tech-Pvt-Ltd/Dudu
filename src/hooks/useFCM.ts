import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { useContext, useEffect } from 'react';
import { createRider } from '../api/deliveryApi';
import { AuthContext } from '../helper/authContext';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import Geolocation from '@react-native-community/geolocation';
import {
  openMap,
  openMapWithPlace,
} from '../screens/merchantScreen/availableRider';
interface GeolocationResponse {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}
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
const useFCM = () => {
  const { token } = useContext(AuthContext);
  useEffect(() => {
    if (!token) return;

    const decoded = jwtDecode<JwtPayload & { userId: number }>(token);

    const handleNotification = async (remoteMessage: any) => {
      const title = remoteMessage.notification?.title;
      const body = remoteMessage.notification?.body;
      const uniqueKey = remoteMessage.data?.uniqueKey;
      const merchantlat = remoteMessage.data?.lat;
      const merchantlng = remoteMessage.data?.lng;

      if (body === 'You are selected for the delivery') {
        Alert.alert(title ?? 'Notification', body ?? '', [
          {
            text: 'Okay',
            onPress: () => {
              console.log('Okay pressed');
            },
          },
        ]);
      }

      if (body === 'Order was given to a different rider.') {
        Alert.alert(title ?? 'Notification', body ?? '', [
          {
            text: 'Okay',
            onPress: () => {
              console.log('Okay pressed');
            },
          },
        ]);
      }

      if (title === 'Hello Merchant') {
        Alert.alert(
          remoteMessage.notification?.title ?? 'Notification',
          remoteMessage.notification?.body ?? '',

          [
            {
              text: 'Okay',
              onPress: async () => {
                console.log('Oay pressed');
              },
            },
          ],
        );
      }
      if (body === 'Are you avaibale for delivery?') {
        Alert.alert(
          remoteMessage.notification?.title ?? 'Notification',
          remoteMessage.notification?.body ?? '',
          [
            {
              text: 'View on Map',
              onPress: () => {
                if (merchantlat && merchantlng) {
                  openMap(merchantlat, merchantlng);
                } else {
                  Alert.alert('No location found');
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'OK',
              onPress: async () => {
                try {
                  const hasPermission = await requestLocationPermission();
                  if (!hasPermission) return;

                  const { latitude, longitude } = await getCurrentLocation();
                  await createRider(
                    decoded.userId,
                    longitude,
                    latitude,
                    uniqueKey,
                  );
                } catch (error) {
                  console.error('Error creating rider:', error);
                  Alert.alert(
                    'Error',
                    `Failed to get location or create rider.${error}`,
                  );
                }
              },
            },
          ],
        );
      }

      // if (body === 'Are you avaibale for delivery?') {
      //   Alert.alert(
      //     remoteMessage.notification?.title ?? 'Notification',
      //     `${remoteMessage.notification?.body ?? ''}\nPickup Location: ${
      //       merchantLocation ?? ''
      //     }`,
      //     [
      //       { text: 'Cancel', style: 'cancel' },
      //       {
      //         text: 'OK',
      //         onPress: async () => {
      //           try {
      //             const hasPermission = await requestLocationPermission();
      //             if (!hasPermission) return;

      //             const { latitude, longitude } = await getCurrentLocation();
      //             await createRider(
      //               decoded.userId,
      //               longitude,
      //               latitude,
      //               uniqueKey,
      //             );
      //           } catch (error) {
      //             console.error('Error creating rider:', error);
      //             Alert.alert(
      //               'Error',
      //               `Failed to get location or create rider.${error}`,
      //             );
      //           }
      //         },
      //       },
      //     ],
      //   );
      // }
    };

    // Foreground
    const unsubscribe = messaging().onMessage(handleNotification);

    // Background (app open)
    const unsubscribeBg =
      messaging().onNotificationOpenedApp(handleNotification);

    // App opened from quit state
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
};

export default useFCM;
