import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ESewaTestPayment() {
  const amount = 385;
  const orderId = 'order1234';

  const successURL = 'myapp://payment-success';
  const failureURL = 'myapp://payment-failure';

//   const paymentUrl = `https://uat.esewa.com.np/epay/main?amt=${amount}&pdc=0&psc=0&txAmt=0&tAmt=${amount}&pid=${orderId}&su=${encodeURIComponent(
//     successURL,
//   )}&fu=${encodeURIComponent(failureURL)}&scd=EPAYTEST`;
const paymentUrl = `https://esewa.com.np/epay/main?amt=${amount}&pdc=0&psc=0&txAmt=0&tAmt=${amount}&pid=${orderId}&su=${encodeURIComponent(
  successURL,
)}&fu=${encodeURIComponent(failureURL)}&scd=EPAYTEST`;


  return (
    <WebView
      source={{ uri: paymentUrl }}
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      )}
      onNavigationStateChange={(navState: any) => {
        if (navState.url.startsWith(successURL)) {
          // Handle payment success (navigate/update UI)
        } else if (navState.url.startsWith(failureURL)) {
          // Handle payment failure
        }
      }}
    />
  );
}
