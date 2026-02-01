import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryTaskItem } from './deliveryhome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { editDeliveryOrder } from '../../api/deliveryOrderApi';
import { AlertCircle, CheckCircle, Circle, Info } from 'lucide-react-native';

type RootStackParamList = {
  DeliveryStatusScreen: { deliveryItem: DeliveryTaskItem };
};

type deliveryStatusNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryStatusScreen'
>;

type deliveryStatusRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryStatusScreen'
>;

const STATUS_OPTIONS = ['accepted', 'picked_up', 'delivered'];

const DeliveryStatusScreen: React.FC = () => {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<deliveryStatusNavigationProp>();
  const route = useRoute<deliveryStatusRouteProp>();
  const { deliveryItem } = route.params;

  // Dynamic Theme Colors
  const colors = {
    screenBg: isDarkMode ? '#171717' : '#ffffff',
    cardBg: isDarkMode ? '#262626' : '#f9fafb',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#404040' : '#e5e7eb',
    activeBg: isDarkMode ? '#15803d' : '#dcfce7', // Green 700 vs Green 100
    activeBorder: isDarkMode ? '#22c55e' : '#16a34a',
    activeText: isDarkMode ? '#ffffff' : '#14532d',
    inactiveBg: isDarkMode ? '#262626' : '#ffffff',
  };

  const [selectedStatus, setSelectedStatus] = useState<string>(
    deliveryItem.status,
  );
  // --- CUSTOM MODAL STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined,
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };
  const handleSave = async () => {
    try {
      await editDeliveryOrder(deliveryItem.id, selectedStatus);
      // Show success modal, then navigate back on close
      showStatus(
        'success',
        'Status Updated',
        `Delivery #${deliveryItem.id} is now ${selectedStatus}`,
        () => navigation.goBack(),
      );
    } catch (error) {
      showStatus('error', 'Error', 'Failed to update delivery status');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.screenBg,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}
        >
          Delivery Status
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: colors.textPrimary,
          }}
        >
          Update Delivery Status
        </Text>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.cardBg,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            DELIVERY #{deliveryItem.id}
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              PICKUP
            </Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {deliveryItem.pickupAddress}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              DROPOFF
            </Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {deliveryItem.deliveryAddress}
            </Text>
          </View>
        </View>

        {/* Status Options */}
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 12,
            fontWeight: '600',
          }}
        >
          SELECT NEW STATUS
        </Text>

        {STATUS_OPTIONS.map(status => {
          const isSelected = selectedStatus === status;
          return (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isSelected
                  ? colors.activeBg
                  : colors.inactiveBg,
                borderColor: isSelected ? colors.activeBorder : colors.border,
                borderWidth: 1,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  color: isSelected ? colors.activeText : colors.textPrimary,
                }}
              >
                {status.replace('_', ' ')}
              </Text>

              {isSelected ? (
                <CheckCircle size={20} color={colors.activeText} />
              ) : (
                <Circle size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={{
            marginTop: 24,
            backgroundColor: '#2563eb', // Blue-600
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            Save Status
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {/* --- CUSTOM STATUS MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModal.visible}
        onRequestClose={() =>
          setStatusModal(prev => ({ ...prev, visible: false }))
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              width: '100%',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              alignItems: 'center',
            }}
          >
            {/* Dynamic Icon */}
            <View
              style={{
                padding: 16,
                borderRadius: 9999,
                marginBottom: 16,
                backgroundColor:
                  statusModal.type === 'success'
                    ? '#dcfce7' // green-100
                    : statusModal.type === 'error'
                    ? '#fee2e2' // red-100
                    : '#dbeafe', // blue-100
              }}
            >
              {statusModal.type === 'success' && (
                <CheckCircle size={32} color="#16a34a" />
              )}
              {statusModal.type === 'error' && (
                <AlertCircle size={32} color="#ef4444" />
              )}
              {statusModal.type === 'info' && (
                <Info size={32} color="#3b82f6" />
              )}
            </View>

            {/* Content */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {statusModal.title}
            </Text>
            <Text
              style={{
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              {statusModal.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setStatusModal(prev => ({ ...prev, visible: false }));
                if (statusModal.onClose) {
                  statusModal.onClose();
                }
              }}
              style={{
                width: '100%',
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor:
                  statusModal.type === 'success'
                    ? '#22c55e'
                    : statusModal.type === 'error'
                    ? '#ef4444'
                    : '#3b82f6',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 18,
                }}
              >
                Okay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeliveryStatusScreen;
