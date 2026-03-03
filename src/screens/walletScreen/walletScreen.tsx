import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    useColorScheme,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';

type RootStackParamList = {
    WalletScreen: undefined; // Usually top-up doesn't need incoming params
    ESewaTestPayment: {
        selectedItems: { id: string; quantity: number; price: number }[];
        totalPrice: number;
        orderId: number[];
    };
    khaltiTopUp: {
        totalPrice: number;
    };
};

const PREDEFINED_AMOUNTS = ['100', '500', '1000', '2000'];

export default function WalletScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Dark Mode Logic
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const themeBackgroundColor = isDarkMode ? '#171717' : '#f9fafb';

    // State
    const [amount, setAmount] = useState<string>('');
    const [selectedMethod, setSelectedMethod] = useState<'khalti' | 'esewa' | null>(null);

    const handleProceed = () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 10) {
            Alert.alert('Invalid Amount', 'Please enter an amount of at least Rs. 10.');
            return;
        }

        if (!selectedMethod) {
            Alert.alert('Select Method', 'Please select a payment method to proceed.');
            return;
        }

        // Prepare params for the payment screens. 
        // Since it's a top-up, items and orderId are empty.
        const paymentParams = {
            totalPrice: numAmount,
        };

        if (selectedMethod === 'esewa') {
            // navigation.navigate('ESewaTestPayment', paymentParams);
        } else if (selectedMethod === 'khalti') {
            navigation.navigate('khaltiTopUp', paymentParams);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-gray-50 dark:bg-neutral-900"
            style={{
                backgroundColor: themeBackgroundColor,
                paddingBottom: insets.bottom || 10,
            }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="flex-1 bg-white dark:bg-neutral-900">

                    {/* Header */}
                    <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
                            <ChevronLeft size={28} color={isDarkMode ? '#ffffff' : '#000000'} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-black dark:text-white">
                            Top Up Wallet
                        </Text>
                    </View>

                    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900" keyboardShouldPersistTaps="handled">

                        {/* Amount Input Section */}
                        <View className="bg-white dark:bg-neutral-800 p-6 mt-4 mx-4 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 items-center">
                            <Text className="text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                Enter Amount
                            </Text>
                            <View className="flex-row items-center justify-center">
                                <Text className="text-3xl font-bold text-gray-800 dark:text-gray-200 mr-2">
                                    Rs.
                                </Text>
                                <TextInput
                                    className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 min-w-[100px] text-center p-0"
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={isDarkMode ? '#475569' : '#cbd5e1'}
                                    value={amount}
                                    onChangeText={setAmount}
                                    maxLength={6}
                                />
                            </View>

                            {/* Quick Select Chips */}
                            <View className="flex-row flex-wrap justify-center mt-6 gap-3">
                                {PREDEFINED_AMOUNTS.map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        onPress={() => setAmount(val)}
                                        className={`px-5 py-2 rounded-full border ${amount === val
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-transparent border-gray-300 dark:border-neutral-600'
                                            }`}
                                    >
                                        <Text
                                            className={`font-semibold ${amount === val
                                                ? 'text-white'
                                                : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            +{val}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <Text className="px-5 pb-2 pt-8 text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                            Select Payment Method
                        </Text>

                        {/* Khalti */}
                        <TouchableOpacity
                            onPress={() => setSelectedMethod('khalti')}
                            activeOpacity={0.8}
                            className={`bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-2 rounded-2xl flex-row items-center border ${selectedMethod === 'khalti'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-neutral-700'
                                } shadow-sm`}
                        >
                            <Image
                                source={require('../../../assets/images/khalti.png')}
                                className="w-10 h-10 mr-4 rounded-lg"
                                resizeMode="contain"
                            />
                            <View className="flex-1">
                                <Text className="font-bold text-base text-black dark:text-white">
                                    Khalti
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    Pay via Khalti Wallet
                                </Text>
                            </View>
                            {selectedMethod === 'khalti' ? (
                                <CheckCircle2 size={24} color="#3b82f6" />
                            ) : (
                                <Circle size={24} color={isDarkMode ? '#52525b' : '#cbd5e1'} />
                            )}
                        </TouchableOpacity>

                        {/* eSewa */}
                        <TouchableOpacity
                            onPress={() => setSelectedMethod('esewa')}
                            activeOpacity={0.8}
                            className={`bg-white dark:bg-neutral-800 px-5 py-4 mx-4 my-2 rounded-2xl flex-row items-center border ${selectedMethod === 'esewa'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-neutral-700'
                                } shadow-sm`}
                        >
                            <Image
                                source={require('../../../assets/images/esewa.png')}
                                className="w-10 h-10 mr-4 rounded-lg"
                                resizeMode="contain"
                            />
                            <View className="flex-1">
                                <Text className="font-bold text-base text-black dark:text-white">
                                    eSewa
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    Pay via eSewa Mobile Wallet
                                </Text>
                            </View>
                            {selectedMethod === 'esewa' ? (
                                <CheckCircle2 size={24} color="#3b82f6" />
                            ) : (
                                <Circle size={24} color={isDarkMode ? '#52525b' : '#cbd5e1'} />
                            )}
                        </TouchableOpacity>

                        <View className="h-10" />
                    </ScrollView>

                    {/* Footer Section - Proceed Button */}
                    <View className="bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 px-5 pt-4 pb-2">
                        <TouchableOpacity
                            onPress={handleProceed}
                            disabled={!amount || parseFloat(amount) <= 0 || !selectedMethod}
                            className={`py-4 rounded-2xl items-center shadow-md ${amount && parseFloat(amount) > 0 && selectedMethod
                                ? 'bg-blue-600'
                                : 'bg-gray-300 dark:bg-neutral-700'
                                }`}
                        >
                            <Text className={`font-bold text-lg ${amount && parseFloat(amount) > 0 && selectedMethod
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                Proceed to Pay {amount ? `Rs. ${amount}` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}