import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
const requestUserPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log('You can use the location');
  } else {
    console.log('location permission denied');
  }
};

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('token', token);
  } catch (error) {
    console.log('error in fetching token', error);
  }
};
export const useNotification = () => {
  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);
};
