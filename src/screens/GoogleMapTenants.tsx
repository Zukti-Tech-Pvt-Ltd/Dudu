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
