import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import { connectSocket } from '../../helper/socket';
import { decodeToken } from '../../api/indexAuth';
import { getUser } from '../../api/userApi';
import { getMessage, createMessage } from '../../api/messageApi/messageApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen({ route, navigation }: any) {
  const { receiverId } = route.params;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  // PAGINATION STATES
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const socketRef = useRef(connectSocket());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const socket = socketRef.current;

    const initData = async () => {
      setFetching(true);
      try {
        const decoded = await decodeToken();
        if (decoded?.userId) {
          const myId = Number(decoded.userId);
          setCurrentUserId(myId);

          // Fetch Page 1 (Initial history)
          const [history, userRes] = await Promise.all([
            getMessage(myId, receiverId, 1),
            getUser(receiverId),
          ]);

          setMessages(history || []);
          if (history && history.length < 20) setHasMore(false);
          if (userRes?.status === 'success') setUserDetails(userRes.data);

          // Room Logic: sorted to ensure consistency
          const roomName = `chat_${[myId, Number(receiverId)]
            .sort((a, b) => a - b)
            .join('_')}`;

          socket.emit('joinChat', { room: roomName });
          console.log('✅ Joined room:', roomName);
        }
      } catch (err) {
        console.error('Init Error:', err);
      } finally {
        setFetching(false);
      }
    };

    initData();

    // SOCKET LISTENER: Receives messages from Postgres Trigger -> Socket Server
    socket.on('newChatMessage', (msg: any) => {
      setMessages(prev => {
        // Robust check using String comparison to avoid type mismatches
        if (prev.find(m => String(m.id) === String(msg.id))) return prev;
        return [msg, ...prev];
      });
    });

    return () => {
      socket.off('newChatMessage');
    };
  }, [receiverId]);

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !currentUserId) return;

    const messageContent = inputText.trim();
    setInputText(''); // Optimistic UI: clear input immediately

    try {
      // POST to database. Postgres Trigger will then push via Socket.
      const response = await createMessage(messageContent, Number(receiverId));

      if (response.status !== 'success') {
        console.error('API reported failure:', response);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Optional: Restore text if failed
      // setInputText(messageContent);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !currentUserId) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const moreMessages = await getMessage(
        currentUserId,
        receiverId,
        nextPage,
      );

      if (moreMessages && moreMessages.length > 0) {
        setMessages(prev => {
          // 1. Create a Set of existing IDs for fast lookup
          const existingIds = new Set(prev.map(m => m.id));

          // 2. Only add messages that aren't already in the list
          const uniqueNewMessages = moreMessages.filter(
            (m: any) => !existingIds.has(m.id),
          );

          return [...prev, ...uniqueNewMessages];
        });

        setPage(nextPage);
        if (moreMessages.length < 20) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMine = Number(item.senderId || item.senderid) === currentUserId;
    return (
      <View
        className={`my-1 p-3 rounded-2xl max-w-[85%] ${
          isMine
            ? 'self-end bg-blue-600 rounded-tr-none'
            : 'self-start bg-gray-200 dark:bg-neutral-800 rounded-tl-none'
        }`}
      >
        <Text className={isMine ? 'text-white' : 'text-black dark:text-white'}>
          {item.content}
        </Text>
        <Text
          className={`text-[9px] mt-1 ${
            isMine ? 'text-blue-100 text-right' : 'text-gray-500'
          }`}
        >
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </View>
    );
  };

  if (fetching) return <ActivityIndicator size="large" className="flex-1" />;
  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900"
      // 3. Add top padding to the whole view to prevent header overlap
      style={{ paddingTop: insets.top }}
    >
      {/* Header - Remove the manual mt-10 since we use insets now */}
      <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={isDarkMode ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <View className="ml-3">
          <Text className="text-lg font-bold dark:text-white">
            {userDetails?.username || 'Chat'}
          </Text>
          {/* <Text
            className={`text-xs ${
              userDetails?.isOnline ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            {userDetails?.isOnline ? 'Online' : 'Offline'}
          </Text> */}
        </View>
      </View>

      {/* Chat Area - Use flex-1 to fill the middle */}
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={renderMessage}
        keyExtractor={item => item.id?.toString()}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" className="my-2" />
          ) : null
        }
      />

      {/* Input Section - Adjusted for Keyboard and System Nav Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // 4. Reduce or remove the offset if safe area is handling the bottom
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View
          className="flex-row items-center p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          // 5. Add bottom padding to account for the system navigation bar
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-3 mr-3 dark:text-white"
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`p-3 rounded-full ${
              inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
