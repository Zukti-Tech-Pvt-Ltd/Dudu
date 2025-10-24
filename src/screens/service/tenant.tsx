import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { createTenant, getTenant } from '../../api/tenantApi';

type Place = {
  id: string;
  placeName: string;
  location: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  image: string[];
};

type RootStackParamList = {
  MapsScreenTenants: {
    placeName: string;
    location: string;
    phoneNumber: string;
    latitude?: number;
    longitude?: number;
  };
  TenantScreen: undefined;
  MapsScreen: {
    lat?: number;
    long?: number;
    name?: string;
    address?: string;
    image?: string[];
  };
};
export default function TenantScreen() {
  type HomeNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'TenantScreen'
  >;
  const navigation = useNavigation<HomeNavigationProp>();

  const [placeName, setPlaceName] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTenant();
      const tenantArray = response.data; // Extract the array here

      if (Array.isArray(tenantArray)) {
        const mapped = tenantArray.map((item: any) => ({
          id: item.id,
          placeName: item.name,
          location: item.address,
          phoneNumber: item.phoneNumber,
          latitude: item.latitude,
          longitude: item.longitude,
          image: item.__tenantImages__?.map((img: any) => img.image) || [],
        }));
        console.log('mapped tenants', mapped);
        setPlaces(mapped);
      } else {
        setPlaces([]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch tenants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchData(); // Reload data every time this screen comes into focus
    }
  }, [isFocused]);
  console.log('places', places);

  const addPlace = async () => {
    if (placeName && location && phoneNumber) {
      try {
        setLoading(true);
        // console.log('responsewwwwwwwwwwwwwwwwwww', response);
        await fetchData(); // refresh data from API

        // const newPlace: Place = {
        //   id: response.id,
        //   placeName: response.name,
        //   location: response.address,
        //   phoneNumber: response.phoneNumber,
        // };
        // setPlaces(current => [newPlace, ...current]);
        setPlaceName('');
        setLocation('');
        setPhoneNumber('');
        setModalVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to add place');
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Validation', 'Please fill in all fields.');
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <View
        className="bg-white py-4 px-4 mb-5 flex-row items-center justify-between"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        {/* Left Section - Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 mt-4 -ml-3 items-center justify-center"
          >
            <Image
              source={require('../../../assets/navIcons/left-arrow.png')}
              style={{ width: 16, height: 16, tintColor: '#000000' }}
            />
          </TouchableOpacity>

          <Text className="text-xl font-semibold ml-2 mt-4 text-black">
            Add Homes
          </Text>
        </View>

        {/* Right Section - Add Button */}
        <Pressable
          className=" mt-3 w-15 h-15 rounded-full justify-center items-center shadow-md"
          onPress={() => setModalVisible(true)}
          android_ripple={{ color: '#1D4ED8' }}
          accessibilityLabel="Add a new place"
        >
          <Text className="text-black text-3xl font-extrabold leading-none">
            +
          </Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={places}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-3xl  p-5 mb-5 shadow-lg flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-2xl text-blue-900 mb-2">
                {item.placeName}
              </Text>
              <Text className="text-blue-700 mb-1">
                Location: {item.location}
              </Text>
              <Text className="text-blue-700">Phone: {item.phoneNumber}</Text>
            </View>
            <Pressable
              className="ml-4 bg-blue-500 rounded-full w-12 h-12 justify-center items-center"
              onPress={() => {
                setModalVisible(false);
                console.log('yukessssssssssss', item.image);
                navigation.navigate('MapsScreen', {
                  lat: item.latitude,
                  long: item.longitude,
                  name: item.placeName,
                  address: item.location,
                  image: item.image,
                });
              }}
            >
              <Image
                source={require('../../../assets/navIcons/pin.png')}
                style={{
                  tintColor: 'white',
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
              />
              {/* Or use an icon: <Icon name="map-marker" size={28} color="#3b82f6" /> */}
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-blue-300 mt-20 text-lg italic">
            No places added yet.
          </Text>
        }
      />
      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {/* Floating Plus Button */}
      <Pressable
        className="absolute bottom-4 right-2 bg-blue-500 rounded-full w-14 h-14  shadow-2xl justify-center items-center"
        onPress={() => setModalVisible(true)}
        android_ripple={{ color: '#1D4ED8' }}
        accessibilityLabel="Add a new place"
      >
        <Text className="text-white text-5xl font-extrabold leading-none">
          +
        </Text>
      </Pressable>

      {/* Modal for Add Place Form */}
      <Modal
        animationType="slide" // Changed from "fade" to "slide" for bottom-up animation
        transparent={true} // Keep transparent true to avoid default white background overlay
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss(); // Optional: dismiss keyboard on touch outside
            setModalVisible(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end px-6" // Align modal content at bottom, no bg color here
          >
            <View className="bg-white rounded-t-3xl p-8 shadow-xl">
              <Text className="text-3xl font-extrabold mb-6 text-blue-900 text-center">
                Add a Place
              </Text>

              <TextInput
                className="bg-blue-50 border border-blue-300 rounded-2xl px-5 py-4 mb-5 text-lg text-blue-900"
                placeholder="Place Name"
                value={placeName}
                onChangeText={setPlaceName}
                keyboardType="default"
                placeholderTextColor="#93C5FD"
                autoFocus
              />
              <TextInput
                className="bg-blue-50 border border-blue-300 rounded-2xl px-5 py-4 mb-5 text-lg text-blue-900"
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
                keyboardType="default"
                placeholderTextColor="#93C5FD"
              />
              <TextInput
                className="bg-blue-50 border border-blue-300 rounded-2xl px-5 py-4 mb-8 text-lg text-blue-900"
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#93C5FD"
              />

              <View className="flex-row justify-center">
                <Pressable
                  className={`rounded-2xl py-3 px-4 shadow-md ${
                    placeName && location && phoneNumber
                      ? 'bg-blue-100'
                      : 'bg-gray-300 opacity-50'
                  }`}
                  onPress={() => {
                    if (!placeName || !location || !phoneNumber) {
                      Alert.alert(
                        'Incomplete Form',
                        'Please fill in all fields before marking the location.',
                      );
                      return;
                    }
                    setModalVisible(false);
                    navigation.navigate('MapsScreenTenants', {
                      placeName: placeName,
                      location: location,
                      phoneNumber: phoneNumber,
                    });
                  }}
                >
                  <Text
                    className={`font-semibold text-lg text-center ${
                      placeName && location && phoneNumber
                        ? 'text-blue-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {' '}
                    Mark Location
                  </Text>
                </Pressable>

                {/* <Pressable
                  className="bg-blue-500 rounded-2xl py-3 px-10 shadow-md"
                  onPress={addPlace}
                >
                  <Text className="text-white font-semibold text-lg text-center">
                    Add
                  </Text>
                </Pressable> */}
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
