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
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { createTenant, deleteTenant, getTenant } from '../../api/tenantApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@env';

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
  const insets = useSafeAreaInsets(); // detects notch + gesture area space

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
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedLocation, setIsFocusedLocation] = useState(false);
  const [isFocusedPhone, setIsFocusedPhone] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
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

  const handleDeletePlace = (id: string, name: string) => {
    Alert.alert('Delete Place', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            deleteTenant(id);
            setPlaces(prev => prev.filter(place => place.id !== id));
            setSelectedItemId(null);
            Alert.alert('Success', 'Place deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete place');
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f9fafb', // same as your gradient top color
        paddingBottom: insets.bottom || 10, // ensures content never goes behind navbar
      }}
    >
      <View className="flex-1 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <View
          className="bg-white py-4 px-4 mb-2 flex-row items-center justify-between"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 1,
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
            <Pressable
              onLongPress={() => setSelectedItemId(item.id)}
              onPress={() => {
                if (selectedItemId) {
                  setSelectedItemId(null);
                } else {
                  setSelectedPlace(item);
                  setEditModalVisible(true);
                }
              }}
            >
              <View className="bg-white rounded-3xl  p-5 mb-5 shadow-lg flex-row items-center justify-between">
                <View>
                  <Text className="font-bold text-2xl text-blue-900 mb-2">
                    {item.placeName}
                  </Text>
                  <Text className="text-blue-700 mb-1">
                    Location: {item.location}
                  </Text>
                  <Text className="text-blue-700">
                    Phone: {item.phoneNumber}
                  </Text>
                </View>

                <Pressable
                  className="ml-4 bg-blue-500 rounded-full w-12 h-12 justify-center items-center"
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedItemId(null);

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
              {/* Close/Delete Button - Shows on top-right when item is selected */}
              {selectedItemId === item.id && (
                <TouchableOpacity
                  className="absolute -top--2 -right-1 bg-red-500 rounded-full w-8 h-8 justify-center items-center shadow-lg z-10"
                  onPress={() => handleDeletePlace(item.id, item.placeName)}
                >
                  <Text className="text-white text-lg font-bold">×</Text>
                </TouchableOpacity>
              )}
            </Pressable>
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
        <Modal
          animationType="slide" // Changed from "fade" to "slide" for bottom-up animation
          transparent={true} // Keep transparent true to avoid default white background overlay
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              if (keyboardVisible) {
                Keyboard.dismiss(); // only dismiss keyboard
              } else {
                setEditModalVisible(false); // only close modal
              }
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="flex-1 justify-end px-6" // Align modal content at bottom, no bg color here
            >
              <View className="bg-white rounded-t-3xl p-2 shadow-xl">
                <Text className="text-3xl font-extrabold mb-6 text-blue-900 text-center">
                  Edit Place
                </Text>
                {selectedPlace?.image && selectedPlace.image.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    className="mb-6"
                  >
                    {selectedPlace.image.map(
                      (imgPath: string, index: number) => (
                        <Image
                          key={index}
                          source={{ uri: `${API_BASE_URL}/${imgPath}` }} // adjust base URL
                          className="w-28 h-28 rounded-2xl mr-3 border border-blue-300"
                          resizeMode="cover"
                        />
                      ),
                    )}
                  </ScrollView>
                )}
                <View className="mb-6">
                  {
                    <Text className="absolute -ml-4 -top-5 left-5 bg-white px-2 text-blue-500 text-md font-semibold z-10">
                      Place Name:
                    </Text>
                  }

                  <TextInput
                    className={`bg-blue-50 border ${
                      isFocusedName ? 'border-blue-500' : 'border-blue-300'
                    } rounded-2xl px-5 py-4 text-lg text-blue-900`}
                    placeholder={selectedPlace?.placeName}
                    placeholderTextColor="#93C5FD"
                    value={placeName}
                    onChangeText={setPlaceName}
                    onFocus={() => setIsFocusedName(true)}
                    onBlur={() => setIsFocusedName(false)}
                  />
                </View>
                <View className="mb-6">
                  {
                    <Text className="absolute -ml-4 -top-5 left-5 bg-white px-2 text-blue-500 text-md font-semibold z-10">
                      Location:
                    </Text>
                  }
                  <TextInput
                    className={`bg-blue-50 border ${
                      isFocusedLocation ? 'border-blue-500' : 'border-blue-300'
                    } rounded-2xl px-5 py-4 text-lg text-blue-900`}
                    placeholder={selectedPlace?.location}
                    value={location}
                    onChangeText={setLocation}
                    keyboardType="default"
                    placeholderTextColor="#93C5FD"
                    onFocus={() => setIsFocusedLocation(true)}
                    onBlur={() => setIsFocusedLocation(false)}
                  />
                </View>
                <View className="mb-4">
                  {/* Floating label */}
                  {
                    <Text className="absolute -ml-4 -top-5 left-5 bg-white px-2 text-blue-500 text-md font-semibold z-10">
                      Phone Number:
                    </Text>
                  }
                  <TextInput
                    className={`bg-blue-50 border ${
                      isFocusedPhone ? 'border-blue-500' : 'border-blue-300'
                    } rounded-2xl px-5 py-4 text-lg text-blue-900`}
                    placeholder={selectedPlace?.phoneNumber}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholderTextColor="#93C5FD"
                    onFocus={() => setIsFocusedPhone(true)}
                    onBlur={() => setIsFocusedPhone(false)}
                  />
                </View>

                <View className="flex-row justify-center">
                  <Pressable
                    className={`rounded-2xl py-3 px-4 shadow-md
                      bg-blue-400
                    `}
                    onPress={() => {
                      console.log('selectedPlace', selectedPlace);

                      setEditModalVisible(false);
                    }}
                  >
                    <Text
                      className={`font-semibold text-lg text-center
                      text-black
                      `}
                    >
                      {' '}
                      Done
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
        {/* Modal for Add Place Form */}
        <Modal
          animationType="slide" // Changed from "fade" to "slide" for bottom-up animation
          transparent={true} // Keep transparent true to avoid default white background overlay
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              if (keyboardVisible) {
                Keyboard.dismiss(); // only dismiss keyboard
              } else {
                setModalVisible(false); // only close modal
              }
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
    </SafeAreaView>
  );
}
