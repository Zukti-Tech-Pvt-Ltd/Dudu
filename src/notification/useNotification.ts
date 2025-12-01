import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../helper/authContext';

export const useNotification = () => {
  const { setFcmToken } = useContext(AuthContext);

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
      console.log('token--=-=-=-=-=', token);
      setFcmToken(token);
    } catch (error) {
      console.log('error in fetching token', error);
    }
  };
  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);
};
