//   import React, { useState, useRef } from 'react';
//   import { View, Text, StyleSheet } from 'react-native';
//   import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
//   import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
//   import { SafeAreaView } from 'react-native-safe-area-context';

//   const destination = {
//     latitude: 27.671044042129285,
//     longitude: 85.28435232901992,
//   };
// const carCoordinates = [
//   { latitude: 27.6823, longitude: 85.3202 },
//   { latitude: 27.6185, longitude: 85.3250 }, // additional coordinate
//     { latitude: 27.6712, longitude: 85.3250 }, // additional coordinate
//     { latitude: 27.6312, longitude: 85.3450 }, // additional coordinate

//   // Add more coordinates as needed
// ];

//   export default function MapsScreen() {
//     const mapRef = useRef<MapView | null>(null);
//     // const [markersList, setMarkersList] = useState([
//     //   {
//     //     latitude: 27.671044042129285,
//     //     longitude: 85.28435232901992,
//     //     title: 'hi',
//     //     description: 'Your chosen location',
//     //   },
//     //   {
//     //     latitude: 27.672165244467173,
//     //     longitude: 85.31119587711933,
//     //     title: 'Zoo',
//     //     description: 'Your chosen location',
//     //   },
//     // ]);
//       const [markersList, setMarkersList] = useState<Array<{
//         latitude: number;
//         longitude: number;
//         title: string;
//         description: string;
//       }>>([]);

//     const MyCustomCallOut = () => (
//       <View>
//         <Text>Driver</Text>
//       </View>
//     );

//     return (
//       <View className='flex-1  bg-transparent '>
//         {/* Autocomplete positioned absolutely on top */}
//       <View className="absolute top-8 w-full z-10 px-5">
//           <GooglePlacesAutocomplete
//             placeholder="Where to?"
//             fetchDetails={true}
//             debounce={200}
//             enablePoweredByContainer={true}
//             nearbyPlacesAPI="GooglePlacesSearch"
//             minLength={2}
//             timeout={10000}
//             keyboardShouldPersistTaps="handled"
//             listViewDisplayed="auto"
//             keepResultsAfterBlur={false}
//             currentLocation={false}
//             currentLocationLabel="Current location"
//             enableHighAccuracyLocation={true}
//             onFail={() => console.warn('Google Places Autocomplete failed')}
//             onNotFound={() => console.log('No results found')}
//             onTimeout={() => console.warn('Google Places request timeout')}
//             predefinedPlaces={[]}
//             predefinedPlacesAlwaysVisible={false}
//             styles={{
//               textInputContainer: {
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRadius: 20,
//                 marginHorizontal: 20,
//                 shadowColor: '#d4d4d4',
//               },
//               textInput: {
//                 backgroundColor: 'white',
//                 fontWeight: '600',
//                 fontSize: 16,
//                 marginTop: 5,
//                 width: '100%',
//                 color: '#000',
//                 paddingHorizontal: 10,
//               },
              
//               listView: {
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 shadowColor: '#d4d4d4',
//               },
//             }}
//             query={{
//               key: 'AIzaSyB8Pg3Bm6cqXX_oeQN3HHQdRaU2YRPX5oU',
//               language: 'en',
//               types: 'geocode',
//             }}
//             onPress={(data, details = null) => {
//               if (!details?.geometry?.location) {
//                 console.warn('Missing geometry details!');
//                 return;
//               }

//               const location = {
//                 latitude: details.geometry.location.lat,
//                 longitude: details.geometry.location.lng,
//                 // Prefer formatted_address or name for title/description
//                 address:
//                   details.formatted_address ||
//                   details.name ||
//                   data.description ||
//                   'Unknown location',
//               };

//               setMarkersList(prev => [
//                 ...prev,
//                 {
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                   title: location.address,
//                   description: 'Selected location',
//                 },
                
//               ]);

//               mapRef.current?.animateToRegion({
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               });
//             }}
//             GooglePlacesSearchQuery={{
//               rankby: 'distance',
//               radius: 1000,
//             }}
//             textInputProps={{
//               placeholderTextColor: 'gray',
//             }}
//           />
//         </View>
        

//         {/* Map takes full space */}
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={StyleSheet.absoluteFillObject} // ✅ covers full screen

//           initialRegion={{
//             latitude: destination.latitude,
//             longitude: destination.longitude,
//             latitudeDelta: 0.0922,
//             longitudeDelta: 0.0421,
//           }}
//           showsUserLocation={true}
//           showsMyLocationButton={true}
//         >
//           {carCoordinates.map((coord, index) => (
//       <Marker
//         key={index}
//         draggable
//         coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
//         image={require('../assets/icons/house.png')}
//         onDragEnd={e => console.log({ x: e.nativeEvent.coordinate })}
//       >
//         <Callout>
//           <MyCustomCallOut />
//         </Callout>
//       </Marker>
//     ))}

//           {markersList.map((marker, index) => (
//             <Marker
//               key={index}
//               coordinate={{
//                 latitude: marker.latitude,
//                 longitude: marker.longitude,
//               }}
//               title={marker.title}
//               description={marker.description}
//             />
//           ))}
//         </MapView>
//       </View>
//     );
//   }

//   const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   autocompleteWrapper: {
//     position: 'absolute',
//     top: 10,
//     width: '100%',
//     zIndex: 1,
//   },
// });
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Region, MapPressEvent } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

export default function MapsScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView | null>(null);

  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 27.671044042129285,
    longitude: 85.28435232901992,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markingMode, setMarkingMode] = useState(false); // Are we marking?

  // Handler for tap
  const handleMapPress = (event: MapPressEvent) => {
    if (markingMode) {
      const coordinate = event.nativeEvent.coordinate;
      setMarker({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      setMarkingMode(false); // Finish marking, switch UI state
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={r => setRegion(r)}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {marker && (
          <Marker
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={"Selected Location"}
            description={"Your marked place"}
          />
        )}
      </MapView>

      {/* Floating Bottom Button for mark/done */}
      {!marker && !markingMode && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.markButton}
            onPress={() => setMarkingMode(true)}
          >
            <Text style={styles.buttonText}>Mark Location</Text>
          </Pressable>
        </View>
      )}
      {markingMode && (
        <View style={styles.buttonContainer}>
          <Text style={styles.infoText}>Tap on the map to select your location</Text>
        </View>
      )}
      {marker && !markingMode && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  markButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  infoText: {
    backgroundColor: '#fff',
    color: '#1e40af',
    fontWeight: 'bold',
    fontSize: 15,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    marginTop: 10,
  }
});
