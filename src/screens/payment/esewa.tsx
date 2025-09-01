import CryptoJS from 'crypto-js';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

function generateSignature(secretKey: string, signedFieldNames: string[], data: any) {
  const signedData = signedFieldNames
    .map(field => `${field}=${data[field]}`)
    .join(',');
  console.log('Signed Data:', signedData);
  const hash = CryptoJS.HmacSHA256(signedData, secretKey);
  return CryptoJS.enc.Base64.stringify(hash);
}

type RootStackParamList = { ESewaTestPayment: undefined };

const ESewaTestPayment = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Unique transaction UUID
  const transactionUuid = `txn_${Date.now()}`;

  // Payment parameters
  const amount = '10'; // base amount
  const taxAmount = '10';
  const productServiceCharge = '10';
  const productDeliveryCharge = '10';

  // Calculate total amount (must match sum of all)
  const totalAmount = (
    Number(amount) +
    Number(taxAmount) +
    Number(productServiceCharge) +
    Number(productDeliveryCharge)
  ).toString();

  const productCode = 'EPAYTEST';

  // URLs
  const successUrl = 'https://developer.esewa.com.np/success';
  const failureUrl = 'https://developer.esewa.com.np/failure';

  // Signed fields for signature generation (in correct order)
  const signedFieldNamesArr = ['total_amount', 'transaction_uuid', 'product_code'];

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

  // Compose signed_field_names string
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
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html: formHtml }}
        onNavigationStateChange={navState => {  
          const url = navState.url;
          console.log('Navigated to:', url);

          if (url.startsWith(successUrl)) {
            Alert.alert('Payment Success');
            navigation.goBack();
          } else if (url.startsWith(failureUrl)) {
            Alert.alert('Payment Failed');
            console.log('Failure redirect URL:', url);
            navigation.goBack();
          }
        }}
        startInLoadingState
      />
    </View>
  );
};

export default ESewaTestPayment;
