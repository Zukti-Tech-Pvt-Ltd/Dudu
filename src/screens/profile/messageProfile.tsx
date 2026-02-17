import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { AuthContext } from '../../helper/authContext';
import { getAllCustomerMessage } from '../../api/messageApi/messageApi';
import { getUser } from '../../api/userApi'; // Import getUser
import { User, MessageCircle, ChevronRight } from 'lucide-react-native';

export default function MessageProfileScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<Record<number, string>>({}); // Store names here

  useEffect(() => {
    if (!token) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const chatData = await getAllCustomerMessage();

        if (chatData && Array.isArray(chatData)) {
          setConversations(chatData);

          // Fetch usernames for all unique receiverIds
          const nameMap: Record<number, string> = {};
          await Promise.all(
            chatData.map(async chat => {
              try {
                const userRes = await getUser(chat.receiverId);
                if (userRes?.status === 'success') {
                  nameMap[chat.receiverId] = userRes.data.username;
                }
              } catch (err) {
                nameMap[chat.receiverId] = `User ${chat.receiverId}`;
              }
            }),
          );
          setUserNames(nameMap);
        }
      } catch (err) {
        console.error('Failed to fetch chat list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ChatScreen', { receiverId: item.receiverId })
      }
      className="flex-row items-center p-4 mx-4 my-2 bg-gray-50 dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700"
    >
      <View className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
        <User color="#2563eb" size={24} />
      </View>

      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {userNames[item.receiverId] || `User ${item.receiverId}`}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.latestMessageDate).toLocaleDateString()}
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400" numberOfLines={1}>
          Tap to view conversation
        </Text>
      </View>
      <ChevronRight color="#9ca3af" size={20} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 pt-12">
      <View className="px-6 mb-6">
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Messages
        </Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.receiverId.toString()}
        ListEmptyComponent={
          <View className="mt-20 items-center justify-center">
            <MessageCircle size={64} color="#d1d5db" />
            <Text className="text-gray-400 mt-4">No conversations found</Text>
          </View>
        }
      />
    </View>
  );
}
