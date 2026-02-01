import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  Text,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { khaltiPayment } from '../../api/khaltiApi';
import { decodeToken } from '../../api/indexAuth';
import {
  API_BASE_URL,
  KHALTI_CHECKOUT_URL,
  KHALTI_PUBLIC_KEY,
  KHALTI_TEST_PUBLIC_KEY,
} from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

type RootStackParamList = {
  KhaltiPayment: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
    orderId: number[];
  };
  maintab: undefined;
};
type khaltiNavigationProp = RouteProp<RootStackParamList, 'KhaltiPayment'>;

const KhaltiPayment = () => {
  const insets = useSafeAreaInsets();

  // Always call hooks at the top, unconditionally
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<khaltiNavigationProp>();
  const [claim, setClaim] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [khaltiCheckoutUrl, setKhaltiCheckoutUrl] = useState<string | null>(
    null,
  );
  // --- CUSTOM MODAL STATE ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: undefined as (() => void) | undefined, // Callback for navigation
  });

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setStatusModal({ visible: true, type, title, message, onClose });
  };
  const { selectedItems } = route.params;
  const { totalPrice } = route.params;
  const { orderId } = route.params;

  const publicKey = KHALTI_TEST_PUBLIC_KEY; //test public key
  // const publicKey = KHALTI_PUBLIC_KEY; //live public key

  const returnUrl = `${API_BASE_URL}/`; // Valid URL for return

  useEffect(() => {
    async function fetchClaim() {
      const decoded = await decodeToken();
      setClaim(decoded);
    }
    fetchClaim();
  }, []);

  useEffect(() => {
    if (!claim) return; // Wait for claim to be loaded
    console.log(
      'checkoutUrl!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      KHALTI_CHECKOUT_URL,
    );
    async function fetchPidx() {
      try {
        console.log('selectedItems', selectedItems);
        console.log('claim', claim);
        const priceInRs = totalPrice;
        const response = await khaltiPayment(
          selectedItems,
          claim?.userId,
          priceInRs,
          orderId,
        );
        const pidx = response.pidx;

        // const checkoutUrl = `https://test-pay.khalti.com/?pidx=${pidx}`;
        console.log('Pidx received:', pidx);
        const checkoutUrl = `${KHALTI_CHECKOUT_URL}?pidx=${pidx}`; //live Khalti
        console.log('checkoutUrl', checkoutUrl);
        setKhaltiCheckoutUrl(checkoutUrl);
      } catch (error) {
        console.error('Error fetching Pidx:', error);
        showStatus('error', 'Error', 'Failed to initiate Khalti payment', () =>
          navigation.goBack(),
        );
      }
    }
    fetchPidx();
  }, [claim, selectedItems, navigation]);

  const successUrl = `${API_BASE_URL}/api/payment/get/khalti/success/${claim?.userId}/${selectedItems}/${totalPrice}`;
  const failureUrl = `${API_BASE_URL}/api/payment/failure/get/khalti/failure/${claim?.userId}/${selectedItems}/${totalPrice}`;
  if (!khaltiCheckoutUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5C2D91" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingBottom: insets.bottom || 10, // ensures content never goes behind navbar
      }}
    >
      <View style={{ flex: 1 }}>
        {/* {loading && (
        <ActivityIndicator
          size="large"
          color="#5C2D91"
          style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1 }}
        />
      )} */}
        <WebView
          source={{ uri: khaltiCheckoutUrl }}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={navState => {
            const url = navState.url;
            if (url.startsWith(returnUrl)) {
              console.log('Return URL reached:', url);
              const status = url.includes('status=')
                ? decodeURIComponent(
                    url.split('status=')[1].split('&')[0].replace(/\+/g, '%20'),
                  )
                : null;
              // Define the navigation action (Reset to Main Tab)
              const handleCompletion = () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'maintab' }],
                });
              };
              if (status === 'Completed') {
                // successUrl;
                console.log('Return URL completed:', url);

                showStatus(
                  'success',
                  'Payment Success',
                  'Your payment was successful.',
                  handleCompletion,
                );
              } else if (status === 'User canceled') {
                console.log('Return URL cancelled:', url);
                // failureUrl;
                showStatus(
                  'error',
                  'Payment Cancelled',
                  'You have cancelled the payment.',
                  handleCompletion,
                );
              } else {
                console.log('Return URL failed:', url);

                showStatus(
                  'error',
                  'Payment Failed',
                  'Payment was not successful.',
                  handleCompletion,
                ); // failureUrl;
              }
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
                // Trigger the callback (Navigation) if it exists
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

export default KhaltiPayment;
