import CryptoJS from 'crypto-js';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { decodeToken } from '../../api/indexAuth';
import { API_BASE_URL } from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// <--- Added Icons
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

function generateSignature(
  secretKey: string,
  signedFieldNames: string[],
  data: any,
) {
  const signedData = signedFieldNames
    .map(field => `${field}=${data[field]}`)
    .join(',');
  console.log('Signed Data:', signedData);
  const hash = CryptoJS.HmacSHA256(signedData, secretKey);
  return CryptoJS.enc.Base64.stringify(hash);
}

type RootStackParamList = {
  ESewaTestPayment: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
  };
  maintab: undefined; // Added for reset navigation
};
type esewaNavigationProp = RouteProp<RootStackParamList, 'ESewaTestPayment'>;

const ESewaTestPayment = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<esewaNavigationProp>();

  const [claim, setClaim] = useState<Record<string, any> | null>(null);

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

  useEffect(() => {
    async function fetchClaim() {
      const decoded = await decodeToken();
      setClaim(decoded);
    }
    fetchClaim();
  }, []);

  if (!claim) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { selectedItems } = route.params;
  const { totalPrice } = route.params;

  // Unique transaction UUID
  const transactionUuid = `txn_${Date.now()}`;

  // Payment parameters
  const amount = totalPrice;
  const taxAmount = '0';
  const productServiceCharge = '0';
  const productDeliveryCharge = '100';

  // Calculate total amount
  const totalAmount = (
    Number(amount) +
    Number(taxAmount) +
    Number(productServiceCharge) +
    Number(productDeliveryCharge)
  ).toString();

  const productCode = 'EPAYTEST';
  const selectedItemsParam = encodeURIComponent(JSON.stringify(selectedItems));

  // URLs
  const successUrl = `${API_BASE_URL}/api/payment/get/userId=${claim.userId}/selectedItems=${selectedItemsParam}`;
  const failureUrl = `${API_BASE_URL}/api/payment/failure/get/userId=${claim.userId}/selectedItems=${selectedItemsParam}`;

  // Signed fields for signature generation
  const signedFieldNamesArr = [
    'total_amount',
    'transaction_uuid',
    'product_code',
  ];

  // Data object for signature
  const data = {
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
  };

  // Secret key for sandbox
  const secretKey = '8gBm/:&EnhH.1/q';

  // Generate signature
  const signature = generateSignature(secretKey, signedFieldNamesArr, data);
  const signedFieldNames = signedFieldNamesArr.join(',');

  // Compose form HTML
  const formHtml = `
    <html>
      <body>
        <form id="esewaForm" method="POST" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form">
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="tax_amount" value="${taxAmount}" />
          <input type="hidden" name="total_amount" value="${totalAmount}" />
          <input type="hidden" name="transaction_uuid" value="${transactionUuid}" />
          <input type="hidden" name="product_code" value="${productCode}" />
          <input type="hidden" name="product_service_charge" value="${productServiceCharge}" />
          <input type="hidden" name="product_delivery_charge" value="${productDeliveryCharge}" />
          <input type="hidden" name="success_url" value="${successUrl}" />
          <input type="hidden" name="failure_url" value="${failureUrl}" />
          <input type="hidden" name="signed_field_names" value="${signedFieldNames}" />
          <input type="hidden" name="signature" value="${signature}" />
        </form>
        <script>document.getElementById('esewaForm').submit();</script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingBottom: insets.bottom || 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <WebView
          source={{ html: formHtml }}
          onNavigationStateChange={navState => {
            const url = navState.url;
            console.log('Navigated to:', url);

            // Handle Navigation Action
            const handleCompletion = () => {
              // Reset to home or go back depending on your flow
              navigation.reset({
                index: 0,
                routes: [{ name: 'maintab' }],
              });
            };

            if (url.startsWith(successUrl)) {
              showStatus(
                'success',
                'Payment Success',
                'Your payment was successful.',
                handleCompletion,
              );
            } else if (url.startsWith(failureUrl)) {
              showStatus(
                'error',
                'Payment Failed',
                'Payment was not successful.',
                () => navigation.goBack(), // Go back to try again
              );
            }
          }}
          startInLoadingState
        />
      </View>

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

export default ESewaTestPayment;
