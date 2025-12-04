import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  Text,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { khaltiPayment } from '../../api/khaltiApi';
import { decodeToken } from '../../api/indexAuth';
import { API_BASE_URL, KHALTI_PUBLIC_KEY, KHALTI_TEST_PUBLIC_KEY } from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  KhaltiPayment: {
    selectedItems: { id: string; quantity: number; price: number }[];
    totalPrice: number;
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

  const { selectedItems } = route.params;
  const { totalPrice } = route.params;

  // const publicKey = KHALTI_TEST_PUBLIC_KEY; //test public key
  const publicKey = KHALTI_PUBLIC_KEY; //live public key

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

    async function fetchPidx() {
      try {
        console.log('selectedItems', selectedItems);
        console.log('claim', claim);
        const priceInRs = totalPrice;
        const response = await khaltiPayment(
          selectedItems,
          claim?.userId,
          priceInRs,
        );
        const pidx = response.pidx;
        // const checkoutUrl = `https://test-pay.khalti.com/?pidx=${pidx}`;
        const checkoutUrl = `https://pay.khalti.com/?pidx=${pidx}`; //live Khalti

        setKhaltiCheckoutUrl(checkoutUrl);
      } catch (error) {
        console.error('Error fetching Pidx:', error);
        Alert.alert('Error', 'Failed to initiate Khalti payment');
        navigation.goBack();
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
              if (status === 'Completed') {
                // successUrl;
                console.log('Return URL completed:', url);

                Alert.alert('Payment Success', 'Your payment was successful.');
              } else if (status === 'User canceled') {
                console.log('Return URL cancelled:', url);
                // failureUrl;
                Alert.alert(
                  'Payment Cancelled',
                  'You have cancelled the payment.',
                );
              } else {
                console.log('Return URL failed:', url);

                Alert.alert('Payment Failed', 'Payment was not successful.');
                // failureUrl;
              }
              navigation.reset({
                index: 0,
                routes: [{ name: 'maintab' }],
              });
            }
          }}
          startInLoadingState
        />
      </View>
    </SafeAreaView>
  );
};

export default KhaltiPayment;
