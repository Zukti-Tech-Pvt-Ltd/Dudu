// import { Linking } from 'react-native';
// import { GOOGLE_API_KEY } from '@env';

// // --- Types ---
// export interface Rider {
//   id: number;
//   username: string;
//   email: string | null;
//   distance?: number;
// }

// export interface AcceptedRider {
//   id: number;
//   partnerId: number;
//   lat: number;
//   lng: number;
//   __partner__?: { username: string };
// }

// // --- Helpers ---
// export const openMap = (lat: number, lng: number) => {
//   const url = `https://www.google.com/maps?q=${lat},${lng}`;
//   Linking.openURL(url);
// };

// export const getDistanceFromLatLonInKm = (
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number,
// ) => {
//   const toRad = (deg: number) => (deg * Math.PI) / 180;
//   const R = 6371; // Radius of the earth in km
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// export const googleReverseGeocode = async (lat: number, lng: number) => {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status === 'OK' && data.results.length > 0) {
//       return data.results[0].formatted_address;
//     }
//     return 'Unknown location';
//   } catch (error) {
//     return 'Unknown location';
//   }
// };
