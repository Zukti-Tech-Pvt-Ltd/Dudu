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
  Image,
  Alert,
  Keyboard, // 1. IMPORT KEYBOARD
} from 'react-native';
import { Send, ChevronLeft, X } from 'lucide-react-native';
import { connectSocket } from '../../helper/socket';
import apiAuth, { decodeToken } from '../../api/indexAuth';
import { getUser } from '../../api/userApi';
import { getMessage, createMessage } from '../../api/messageApi/messageApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@env';

export default function ChatScreen({ route, navigation }: any) {
  const { receiverId, product } = route.params || {};

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  const [productPreview, setProductPreview] = useState<any>(null);

  // PAGINATION STATES
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 2. STATE TO TRACK ANDROID KEYBOARD HEIGHT
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const socketRef = useRef(connectSocket());
  const flatListRef = useRef<FlatList>(null);
  const MAX_LENGTH = 500;

  useEffect(() => {
    if (product) {
      setProductPreview(product);
    }
  }, [product]);

  // 3. KEYBOARD LISTENER EFFECT
  useEffect(() => {
    // Listen for keyboard opening
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, e => {
      // Only set height for Android to use our manual spacer
      if (Platform.OS === 'android') {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });

    // Listen for keyboard closing
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'android') {
        setKeyboardHeight(0);
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const initData = async () => {
      setFetching(true);
      try {
        const decoded = await decodeToken();
        if (decoded?.userId) {
          const myId = Number(decoded.userId);
          setCurrentUserId(myId);

          const [history, userRes] = await Promise.all([
            getMessage(myId, receiverId, 1),
            getUser(receiverId),
          ]);
          setMessages(history || []);
          if (history && history.length < 20) setHasMore(false);
          if (userRes?.status === 'success') setUserDetails(userRes.data);

          const roomName = `chat_${[myId, Number(receiverId)]
            .sort((a, b) => a - b)
            .join('_')}`;

          socket.emit('joinChat', { room: roomName });
        }
      } catch (err) {
        console.error('Init Error:', err);
      } finally {
        setFetching(false);
      }
    };
    initData();

    socket.on('newChatMessage', (msg: any) => {
      setMessages(prev => {
        if (prev.find(m => String(m.id) === String(msg.id))) return prev;
        return [msg, ...prev];
      });
    });

    return () => {
      socket.off('newChatMessage');
    };
  }, [receiverId]);

  const handleSendProduct = async () => {
    if (!productPreview || !currentUserId) return;

    try {
      const imageUrl =
        typeof productPreview.image === 'string' ? productPreview.image : '';

      const productContextMessage = `Hi, I'm interested in this product:
📦 ${productPreview.name}
💰 Price: Rs.${productPreview.price}
🆔 ID: ${productPreview.id}
${imageUrl ? `Image: ${imageUrl}` : ''}`;

      const response = await createMessage(
        productContextMessage,
        Number(receiverId),
      );

      if (response.status === 'success') {
        setProductPreview(null);
      }
    } catch (err) {
      console.error('Failed to send product details:', err);
    }
  };

  const handleSend = async () => {
    const trimmedMsg = inputText.trim();
    if (trimmedMsg.length === 0 || !currentUserId) return;

    if (trimmedMsg.length > MAX_LENGTH) {
      Alert.alert(
        'Message too long',
        `Please limit your message to ${MAX_LENGTH} characters.`,
      );
      return;
    }

    const messageContent = trimmedMsg;
    setInputText('');

    try {
      const response = await createMessage(messageContent, Number(receiverId));
      if (response.status !== 'success') {
        console.error('API reported failure:', response);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
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
          const existingIds = new Set(prev.map(m => m.id));
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

  const getImageUrl = (rawPath: string) => {
    if (!rawPath) return null;
    if (rawPath.startsWith('http')) return rawPath;
    const baseUrl = API_BASE_URL || apiAuth.defaults.baseURL || '';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = rawPath.replace(/^\//, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const renderMessage = ({ item }: any) => {
    const isMine = Number(item.senderId || item.senderid) === currentUserId;

    const imageTag = 'Image: ';
    const hasImage = item.content && item.content.includes(imageTag);
    let displayContent = item.content;
    let imageUrl = null;

    if (hasImage) {
      const parts = item.content.split(imageTag);
      displayContent = parts[0].trim();
      imageUrl = getImageUrl(parts[1]?.trim());
    }

    return (
      <View
        className={`my-1 p-3 rounded-2xl max-w-[85%] ${isMine
            ? 'self-end bg-blue-600 rounded-tr-none'
            : 'self-start bg-gray-200 dark:bg-neutral-800 rounded-tl-none'
          }`}
      >
        <Text className={isMine ? 'text-white' : 'text-black dark:text-white'}>
          {displayContent}
        </Text>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            className="mt-2 rounded-lg bg-gray-300 dark:bg-gray-700"
            style={{ width: 200, height: 150 }}
            resizeMode="cover"
          />
        )}
        <Text
          className={`text-[9px] mt-1 ${isMine ? 'text-blue-100 text-right' : 'text-gray-500'
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
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* 4. KEYBOARD AVOIDING VIEW (Now only handles iOS) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft color={isDarkMode ? '#FFF' : '#000'} size={28} />
            </TouchableOpacity>
            <View className="ml-3">
              <Text className="text-lg font-bold dark:text-white">
                {userDetails?.username || 'Chat'}
              </Text>
              <Text
                className={`text-xs ${userDetails?.isOnline ? 'text-green-500' : 'text-gray-400'
                  }`}
              >
                {userDetails?.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Chat Area */}
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            renderItem={renderMessage}
            keyExtractor={item => item.id?.toString()}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.3}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" className="my-2" />
              ) : null
            }
          />

          {/* Input Section */}
          <View className="bg-white dark:bg-neutral-900">
            {/* PRODUCT PREVIEW */}
            {productPreview && (
              <View className="mx-4 mb-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 flex-row items-center shadow-sm">
                {productPreview.image ? (
                  <Image
                    source={{
                      uri:
                        getImageUrl(productPreview.image) ||
                        productPreview.image,
                    }}
                    className="w-12 h-12 rounded-lg bg-gray-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center">
                    <Text className="text-xs">No Img</Text>
                  </View>
                )}

                <View className="flex-1 ml-3">
                  <Text
                    numberOfLines={1}
                    className="font-bold text-gray-800 dark:text-white"
                  >
                    {productPreview.name}
                  </Text>
                  <Text className="text-blue-500 font-semibold text-xs">
                    Rs. {productPreview.price}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setProductPreview(null)}
                    className="p-2 bg-gray-200 dark:bg-neutral-700 rounded-full"
                  >
                    <X size={16} color={isDarkMode ? '#FFF' : '#000'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendProduct}
                    className="bg-blue-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white text-xs font-bold">Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* INPUT FIELD */}
            <View
              className="flex-row items-center px-4 pt-2 border-t border-gray-100 dark:border-neutral-800"
              style={{
                // FIX: Apply insets.bottom to Android when keyboard is closed. 
                // Remove it when keyboard opens so it sits flush with the keyboard.
                paddingBottom:
                  Platform.OS === 'android' && keyboardHeight > 0
                    ? 10
                    : insets.bottom + 10,
              }}
            >
              <View className="flex-1 mr-3">
                <TextInput
                  className="bg-gray-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 dark:text-white"
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  style={{ maxHeight: 100 }}
                  maxLength={MAX_LENGTH}
                />
                <Text className="text-[10px] text-gray-400 text-right mt-1 mr-1">
                  {inputText.length}/{MAX_LENGTH}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim()}
                className={`p-3 rounded-full mb-4 ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <Send color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 5. THE MAGIC ANDROID SPACER */}
      {Platform.OS === 'android' && <View style={{ height: keyboardHeight }} />}
    </View>
  );
}
