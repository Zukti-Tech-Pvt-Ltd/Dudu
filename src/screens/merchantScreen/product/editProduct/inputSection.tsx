import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Platform, PermissionsAndroid } from 'react-native';

export enum CategoryType {
  DELIVERY = 'Delivery',
  SHOP = 'Shop',
  GAMES = 'Games',
  FOOD = 'Food',
  JOB = 'Job',
  HOME = 'Home',
  LIHAMOTO = 'LiHaMoto',
  BUYSELL = 'BuySell',
}

// --- Helper Functions ---
export const normalizeUri = (uri?: string) => {
  if (!uri) return '';
  if (uri.startsWith('content://')) return uri;
  if (!uri.startsWith('file://') && !uri.startsWith('http'))
    return 'file://' + uri;
  return uri;
};

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return granted['android.permission.CAMERA'] === 'granted';
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return (
        granted['android.permission.CAMERA'] === 'granted' &&
        granted['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
      );
    }
  }
  return true;
};

// --- Theme Helper ---
export const getColors = (isDarkMode: boolean) => ({
  screenBg: isDarkMode ? '#171717' : '#f5f5f5',
  cardBg: isDarkMode ? '#262626' : '#ffffff',
  textPrimary: isDarkMode ? '#ffffff' : '#111827',
  textSecondary: isDarkMode ? '#a3a3a3' : '#4b5563',
  inputBg: isDarkMode ? '#404040' : '#f3f4f6',
  inputText: isDarkMode ? '#ffffff' : '#000000',
  placeholder: isDarkMode ? '#a3a3a3' : '#9ca3af',
  iconColor: isDarkMode ? '#d4d4d4' : '#6b7280',
  border: isDarkMode ? '#404040' : '#e5e7eb',
});
const Label = ({ text, colors }: { text: string; colors: any }) => (
  <Text style={{ color: colors.textSecondary }} className="font-semibold mb-2">
    {text}
  </Text>
);

export const InputSection = ({ form, setForm, colors }: any) => {
  const update = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <View style={{ padding: 20 }}>
      <Label text="Product Name *" colors={colors} />
      <TextInput
        placeholder="Enter product name"
        value={form.name}
        onChangeText={t => update('name', t)}
        placeholderTextColor={colors.placeholder}
        style={{
          backgroundColor: colors.inputBg,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          color: colors.inputText,
        }}
      />

      <Label text="Category *" colors={colors} />
      <View
        style={{
          borderRadius: 10,
          backgroundColor: colors.inputBg,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Picker
          selectedValue={form.category}
          onValueChange={t => update('category', t)}
          dropdownIconColor={colors.textPrimary}
          style={{ color: colors.textPrimary }}
        >
          <Picker.Item
            label="Select category..."
            value=""
            style={{
              color: colors.textSecondary,
              backgroundColor: colors.cardBg,
            }}
          />
          {Object.values(CategoryType).map(c => (
            <Picker.Item
              key={c}
              label={c}
              value={c}
              style={{
                color: colors.textPrimary,
                backgroundColor: colors.cardBg,
              }}
            />
          ))}
        </Picker>
      </View>

      <Label text="Description *" colors={colors} />
      <TextInput
        placeholder="Enter description"
        value={form.description}
        onChangeText={t => update('description', t)}
        multiline
        placeholderTextColor={colors.placeholder}
        style={{
          backgroundColor: colors.inputBg,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          height: 100,
          color: colors.inputText,
          textAlignVertical: 'top',
        }}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        {['price', 'rate', 'count'].map(field => (
          <View key={field} style={{ flex: 1 }}>
            <Label
              text={`${field.charAt(0).toUpperCase() + field.slice(1)} *`}
              colors={colors}
            />
            <TextInput
              placeholder="0"
              value={form[field]}
              onChangeText={t => update(field, t)}
              keyboardType="numeric"
              placeholderTextColor={colors.placeholder}
              style={{
                backgroundColor: colors.inputBg,
                padding: 10,
                borderRadius: 10,
                color: colors.inputText,
              }}
            />
          </View>
        ))}
      </View>

      <Label text="Type" colors={colors} />
      <TextInput
        placeholder="Enter type (optional)"
        value={form.type}
        onChangeText={t => update('type', t)}
        placeholderTextColor={colors.placeholder}
        style={{
          backgroundColor: colors.inputBg,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          color: colors.inputText,
        }}
      />
    </View>
  );
};
