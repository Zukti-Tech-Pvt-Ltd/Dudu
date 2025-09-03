import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
} from 'react-native';

type Place = {
  id: string;
  placeName: string;
  location: string;
  phoneNumber: string;
};

 type RootStackParamList = {
    
    GoogleMaps: undefined;
    TenantScreen: undefined;
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

  const addPlace = () => {
    if (placeName && location && phoneNumber) {
      const newPlace: Place = {
        id: Date.now().toString(),
        placeName,
        location,
        phoneNumber,
      };
      setPlaces(currentPlaces => [newPlace, ...currentPlaces]);
      setPlaceName('');
      setLocation('');
      setPhoneNumber('');
      setModalVisible(false);
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 via-white to-blue-50">
       <View
              className="bg-white py-4 px-4  flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-9 h-9 mt-4 -ml-3  items-center justify-center"
              >
                <Image
                  source={require('../../../assets/navIcons/left-arrow.png')}
                  style={{ width: 16, height: 16, tintColor: '#000000' }}
                />
              </TouchableOpacity>
              <Text className="text-xl font-semibold ml-1 mt-4 text-black">
                Add Homes
              </Text>
            </View>
      

      <FlatList
  contentContainerStyle={{ paddingHorizontal: 20 }}
  data={places}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <View className="bg-white rounded-3xl p-5 mb-6 shadow-lg flex-row items-center justify-between">
      <View>
        <Text className="font-bold text-2xl text-blue-900 mb-2">
          {item.placeName}
        </Text>
        <Text className="text-blue-700 mb-1">Location: {item.location}</Text>
        <Text className="text-blue-700">Phone: {item.phoneNumber}</Text>
      </View>
      <Pressable
        className="ml-4 bg-blue-500 rounded-full w-12 h-12 justify-center items-center"
        onPress={() => {
          // Add your location navigation logic here
          // Example: navigation.navigate('GoogleMaps', { ... })
          alert('Show on map!'); // Replace with actual logic
        }}
      >
       <Image
                   source={require('../../../assets/navIcons/pin.png')}
                   style={{
                    tintColor: 'white' ,
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


      {/* Floating Plus Button */}
      <Pressable
        className="absolute bottom-9 right-6 bg-blue-500 rounded-full w-14 h-14  shadow-2xl justify-center items-center"
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

              <View className="flex-row justify-between">
                <Pressable
                  className="bg-blue-100 rounded-2xl py-3 px-4 shadow-md"
                  onPress={() => {
                    setModalVisible(false)
                    navigation.navigate('GoogleMaps')}
                }
                >
                  <Text className="text-blue-700 font-semibold text-lg text-center">
                    Mark Location
                  </Text>
                </Pressable>

                <Pressable
                  className="bg-blue-500 rounded-2xl py-3 px-10 shadow-md"
                  onPress={addPlace}
                >
                  <Text className="text-white font-semibold text-lg text-center">
                    Add
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
