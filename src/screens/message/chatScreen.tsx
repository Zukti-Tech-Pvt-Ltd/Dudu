import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import { connectSocket } from '../../helper/socket';
import { decodeToken } from '../../api/indexAuth';
import { getUser } from '../../api/userApi';
import { getMessage } from '../../api/messageApi/messageApi';

export default function ChatScreen({ route, navigation }: any) {
  const { receiverId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  // Use Ref to keep the socket instance stable
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

          const [history, userRes] = await Promise.all([
            getMessage(myId, receiverId),
            getUser(receiverId)
          ]);

          setMessages(history || []);
          if (userRes?.status === 'success') setUserDetails(userRes.data);

          // JOIN ROOM
          const roomName = `chat_${[myId, Number(receiverId)].sort((a, b) => a - b).join('_')}`;
          socket.emit('joinChat', { room: roomName });
          console.log("Joined Room:", roomName);
        }
      } catch (err) {
        console.error('Init Error:', err);
      } finally {
        setFetching(false);
      }
    };

    initData();

    // LISTENER
    socket.on('newChatMessage', (msg: any) => {
      console.log("New Message Received:", msg.content);
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('newChatMessage');
    };
  }, [receiverId]);

  const handleSend = () => {
    if (inputText.trim().length === 0 || !currentUserId) return;
    socketRef.current.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: Number(receiverId),
      content: inputText.trim(),
    });
    setInputText('');
  };

  const renderMessage = ({ item }: any) => {
    const isMine = Number(item.senderId || item.senderid) === currentUserId;
    return (
      <View className={`my-2 p-3 rounded-2xl max-w-[80%] ${isMine ? 'self-end bg-blue-600 rounded-tr-none' : 'self-start bg-gray-200 dark:bg-neutral-800 rounded-tl-none'}`}>
        <Text className={isMine ? 'text-white' : 'text-black dark:text-white'}>{item.content}</Text>
      </View>
    );
  };

  if (fetching) return <ActivityIndicator size="large" className="flex-1" />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-neutral-900" keyboardVerticalOffset={90}>
      <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800 mt-10">
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" size={28} /></TouchableOpacity>
        <Text className="ml-3 text-lg font-bold">{userDetails?.username || 'Chat'}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View className="flex-row items-center p-4 border-t border-gray-100 dark:border-neutral-800 mb-5">
        <TextInput className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 mr-3 dark:text-white" placeholder="Message..." value={inputText} onChangeText={setInputText} />
        <TouchableOpacity onPress={handleSend} className="bg-blue-600 p-3 rounded-full"><Send color="white" size={20} /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}