import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    useColorScheme,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Ticket, Tag, Scissors } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserCoupons } from '../../api/lottery/couponApi';
// Adjust this import path to point to your coupon API file

interface Coupon {
    id: number;
    name: string;
    discount: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
}

export default function CouponsScreen() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchCoupons = async () => {
        try {
            const response = await getUserCoupons();
            if (response && response.status === 'success' && response.data) {
                // Filter out deleted coupons just in case
                const activeCoupons = response.data.filter((c: Coupon) => !c.isDeleted);
                setCoupons(activeCoupons);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCoupons();
    };

    // Format date nicely (e.g., "Mar 13, 2026")
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderCoupon = ({ item }: { item: Coupon }) => {
        return (
            <View
                className={`mb-4 rounded-2xl flex-row overflow-hidden shadow-sm border ${item.isActive
                    ? 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                    : 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 opacity-60'
                    }`}
            >
                {/* Left Side: Icon & Details */}
                <View className="flex-1 p-5 justify-center">
                    <View className="flex-row items-center mb-2">
                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${item.isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-neutral-700'}`}>
                            <Tag size={16} color={item.isActive ? (isDarkMode ? '#60a5fa' : '#3b82f6') : '#9ca3af'} />
                        </View>
                        <Text className="font-bold text-lg text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>

                    <Text className="text-gray-500 dark:text-gray-400 text-xs ml-11">
                        Added on {formatDate(item.createdAt)}
                    </Text>

                    {!item.isActive && (
                        <Text className="text-red-500 dark:text-red-400 text-xs font-bold ml-11 mt-1">
                            Expired / Inactive
                        </Text>
                    )}
                </View>

                {/* Middle: Dashed Line Divider (Coupon Cutout Style) */}
                <View className="w-0 border-l-2 border-dashed border-gray-200 dark:border-neutral-700 my-4 relative">
                    {/* Top semi-circle cutout */}
                    <View className="absolute -top-6 -left-[11px] w-5 h-5 bg-gray-50 dark:bg-neutral-900 rounded-full" />
                    {/* Bottom semi-circle cutout */}
                    <View className="absolute -bottom-6 -left-[11px] w-5 h-5 bg-gray-50 dark:bg-neutral-900 rounded-full" />
                </View>

                {/* Right Side: Discount Amount */}
                <View className={`w-28 items-center justify-center p-4 ${item.isActive ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-100 dark:bg-neutral-800/50'}`}>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Discount
                    </Text>
                    <Text className={`text-3xl font-extrabold ${item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {item.discount}
                    </Text>
                    {/* Change 'OFF' to '%' or 'Rs.' depending on how your database handles discounts */}
                    <Text className={`text-xs font-bold mt-1 ${item.isActive ? 'text-blue-500 dark:text-blue-500' : 'text-gray-400'}`}>
                        OFF
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView
            className="flex-1 bg-gray-50 dark:bg-neutral-900"
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2 mr-2"
                >
                    <ChevronLeft size={28} color={isDarkMode ? '#ffffff' : '#000000'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    My Coupons
                </Text>
            </View>

            {/* Main Content */}
            <View className="flex-1 px-4 pt-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : coupons.length === 0 ? (
                    /* Empty State */
                    <View className="flex-1 justify-center items-center px-6">
                        <View className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-full items-center justify-center mb-6">
                            <Scissors size={40} color={isDarkMode ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                            No Coupons Yet
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-center leading-6">
                            You don't have any active discount coupons right now. Check back later for exciting offers!
                        </Text>
                    </View>
                ) : (
                    /* Coupon List */
                    <FlatList
                        data={coupons}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCoupon}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#3b82f6']}
                                tintColor={isDarkMode ? '#ffffff' : '#3b82f6'}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}