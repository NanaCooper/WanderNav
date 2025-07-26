import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Image,
  Dimensions, // Assuming you might use this
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
// Removed useFocusEffect as it's not strictly needed for the core functionality here

// --- Animated Pressable ---
const PRESSED_SCALE_VALUE = 0.98;
const AnimatedPressable = ({ onPress, style, children, pressableStyle }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleValue, { toValue: PRESSED_SCALE_VALUE, friction: 7, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={pressableStyle} android_ripple={{ color: 'rgba(0,0,0,0.1)' }}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  avatar?: string;
}

const GroupMessagingScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey there! How is everyone doing?', sender: 'other', timestamp: '10:30 AM', avatar: 'https://placeimg.com/50/50/people/1' },
    { id: '2', text: 'Doing great! Just working on this cool app. ✨', sender: 'me', timestamp: '10:31 AM' },
    { id: '3', text: 'Nice! The new UI looks amazing. Keep it up!', sender: 'other', timestamp: '10:32 AM', avatar: 'https://placeimg.com/50/50/people/2' },
    { id: '4', text: 'Thanks! Trying to give it that premium feel. 😎', sender: 'me', timestamp: '10:33 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Store animation values in a ref, mapping by message ID for stability
  const messageAnimValues = useRef<{[id: string]: Animated.Value}>({});

  // Initialize animation values for existing messages
  useEffect(() => {
    messages.forEach(msg => {
      if (!messageAnimValues.current[msg.id]) {
        messageAnimValues.current[msg.id] = new Animated.Value(1); // Start as visible
      }
    });
  }, []); // Run once on mount for initial messages

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);


  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    const newMessageId = String(Date.now());
    const newMessage: Message = {
      id: newMessageId,
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Initialize animation value for the new message BEFORE adding it to state
    // Start it at 0 (invisible/translated) to animate in
    messageAnimValues.current[newMessageId] = new Animated.Value(0);

    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Animate the new message in
    Animated.timing(messageAnimValues.current[newMessageId], {
      toValue: 1, // Animate to visible/normal position
      duration: 300,
      useNativeDriver: true, // Safe for opacity and transform
    }).start();

    setInputText('');
  };

  const renderMessage = (message: Message) => {
    const isMyMessage = message.sender === 'me';

    // Get the animation value for this message, default to fully visible if somehow not found
    const animValue = messageAnimValues.current[message.id] || new Animated.Value(1);

    const messageOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1], // Start more transparent
    });
    const messageTranslateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0], // Start further down
    });

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
          {
            opacity: messageOpacity,
            transform: [{ translateY: messageTranslateY }],
          },
        ]}
      >
        {!isMyMessage && message.avatar && (
            <Image source={{ uri: message.avatar }} style={styles.avatar} />
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{message.text}</Text>
          <Text style={isMyMessage ? styles.myTimestamp : styles.otherTimestamp}>{message.timestamp}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? (Dimensions.get('window').height > 800 ? 90 : 70) : 0}
    >
      <Stack.Screen options={{ title: 'Group Chat' }} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(message => renderMessage(message))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={THEME.TEXT_SECONDARY}
          multiline
        />
        <AnimatedPressable onPress={handleSend} style={styles.sendButton} pressableStyle={{ padding: 5 }}>
          <Ionicons name="send" size={24} color={THEME.BACKGROUND_WHITE} />
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND_LIGHT,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR,
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: THEME.ACCENT_COLOR,
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: THEME.BACKGROUND_WHITE,
    borderBottomLeftRadius: 5,
  },
  // Adjusted text styles for better contrast
  myMessageText: {
    fontSize: 16,
    color: THEME.BACKGROUND_WHITE, // Assuming accent color is dark enough
  },
  otherMessageText: {
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
  },
  myTimestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)', // Lighter for dark accent bubble
    textAlign: 'right',
    marginTop: 4,
  },
  otherTimestamp: {
    fontSize: 10,
    color: THEME.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.BORDER_COLOR,
    backgroundColor: THEME.BACKGROUND_WHITE,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: THEME.BACKGROUND_LIGHT,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: THEME.PRIMARY_BRAND_COLOR,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GroupMessagingScreen;