import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { khaltiPayment } from '../../api/khaltiApi';

type RootStackParamList = { KhaltiPayment: undefined };

const KhaltiPayment = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [khaltiCheckoutUrl, setKhaltiCheckoutUrl] = useState<string | null>(
    null,
  );

  const publicKey = '1d37c096e1694b70a779bf601c63f88e';
  const returnUrl = 'https://example.com/payment-callback'; // Valid URL for return

  useEffect(() => {
    async function fetchPidx() {
      try {
        const response = await khaltiPayment();
        const pidx = response.pidx;
        console.log('Pidx:', pidx);
        // payment_url: 'https://test-pay.khalti.com/?pidx=SqE2cSn7S88mLYS3ofSjZg',
        const checkoutUrl = `https://test-pay.khalti.com/?pidx=${pidx}`;

        // const checkoutUrl = `https://pay.khalti.com/api/v2/epayment/page?pidx=${pidx}&public_key=${publicKey}&return_url=${encodeURIComponent(returnUrl)}`;
        setKhaltiCheckoutUrl(checkoutUrl); // <--- This line is essential
      } catch (error) {
        console.error('Error fetching Pidx:', error);
        Alert.alert('Error', 'Failed to initiate Khalti payment');
        navigation.goBack();
      }
    }

    fetchPidx();
  }, []);

  if (!khaltiCheckoutUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5C2D91" />
      </View>
    );
  }

  return (
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
              ? url.split('status=')[1].split('&')[0]
              : null;
            if (status === 'Completed') {
              console.log('Return URL completed:', url);

              Alert.alert('Payment Success', 'Your payment was successful.');
            } else if (status === 'User canceled') {
              console.log('Return URL cancelled:', url);

              Alert.alert(
                'Payment Cancelled',
                'You have cancelled the payment.',
              );
            } else {
              console.log('Return URL failed:', url);

              Alert.alert('Payment Failed', 'Payment was not successful.');
            }
            navigation.goBack(); // Close payment screen or navigate elsewhere
          }
        }}
        startInLoadingState
      />
    </View>
  );
};

export default KhaltiPayment;
