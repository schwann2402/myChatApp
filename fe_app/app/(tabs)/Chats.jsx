import React, { useRef, useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Divider, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import utils from "@/utils";
import { Colors } from "@/constants/Colors";
import useGlobal from "@/global";
import { address } from "@/api";

const ChatBubble = ({ message, thumbnail, isLastMessage }) => {
  console.log("thumbnail", thumbnail);
  const formattedImageUrl = (url) => {
    return url ? `http://${address}${url}` : null;
  };
  const { text, created, is_me: isMe } = message;
  const bubbleStyle = isMe ? styles.bubbleRight : styles.bubbleLeft;
  const textStyle = isMe ? styles.textRight : styles.textLeft;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        isMe ? styles.bubbleContainerRight : styles.bubbleContainerLeft,
        { opacity: fadeAnim },
      ]}
    >
      {!isMe && (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: formattedImageUrl(thumbnail) }}
            style={styles.avatar}
          />
        </View>
      )}
      <View style={[styles.bubble, bubbleStyle]}>
        <Text style={[styles.messageText, textStyle]}>{text}</Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              isMe ? styles.timestampRight : styles.timestampLeft,
            ]}
          >
            {new Date(created).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isMe && (
            <MaterialIcons
              name={isMe ? "check" : "done-all"}
              size={14}
              color={isMe ? "#4CAF50" : "#8E8E8E"}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const DateSeparator = ({ date }) => (
  <View style={styles.dateSeparator}>
    <View style={styles.dateLine} />
    <Text style={styles.dateText}>{date}</Text>
    <View style={styles.dateLine} />
  </View>
);

const TypingIndicator = () => (
  <View style={styles.typingContainer}>
    <View style={styles.typingBubble}>
      <View style={styles.typingDot} />
      <View style={[styles.typingDot, styles.typingDotMiddle]} />
      <View style={styles.typingDot} />
    </View>
    <Text style={styles.typingText}>Typing...</Text>
  </View>
);

const ChatScreen = ({ friend, connectionId }) => {
  const insets = useSafeAreaInsets();
  const { name, thumbnail, status } = friend;
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const messageSend = useGlobal((state) => state.messageSend);
  const messagesList = useGlobal((state) => state.messagesList);
  const retrieveMessageList = useGlobal((state) => state.retrieveMessageList);

  useEffect(() => {
    retrieveMessageList(connectionId);
  }, [retrieveMessageList, connectionId]);

  console.log("messagesList", messagesList);

  const handleSend = () => {
    console.log("inputText", inputText);
    if (!inputText.trim()) return;
    const cleanedInput = inputText.replace(/\s+/g, " ");

    // const newMessage = {
    //   id: Date.now(),
    //   text: cleanedInput,
    //   sender: "me",
    //   senderName: "You",
    //   timestamp: new Date().toISOString(),
    //   status: "sent",
    // };

    // setMessages((prev) => [...prev, newMessage]);
    // setInputText("");

    // Scroll to bottom
    messageSend(connectionId, cleanedInput);
    setInputText("");
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const getRandomResponse = () => {
    const responses = [
      "That's interesting!",
      "I see what you mean.",
      "Thanks for sharing that.",
      "I hadn't thought about it that way before.",
      "That makes sense.",
      "I appreciate your perspective.",
      "Tell me more about that.",
      "How does that make you feel?",
      "What happened next?",
      "I'm glad you mentioned that.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleInputFocus = () => {
    setIsTyping(true);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleInputBlur = () => {
    setIsTyping(false);
  };

  const renderItem = ({ item, index }) => {
    const isLastMessage = index === 0;
    return (
      <ChatBubble
        message={item}
        thumbnail={friend?.thumbnail}
        isLastMessage={isLastMessage}
      />
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, marginBottom: Platform.OS === "ios" ? 60 : 10 }}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          data={messagesList?.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item.created}
          inverted
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={showTypingIndicator ? <TypingIndicator /> : null}
        />

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={handleSend}
              multiline
              numberOfLines={1}
              maxLength={500}
              placeholderTextColor="#8E8E8E"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : null,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={inputText.trim() ? "#FFFFFF" : "#8E8E8E"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default function Chats() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useEffect(() => {
    try {
      if (params.friend) {
        const friendData = JSON.parse(params.friend);

        if (friendData && friendData.name) {
          navigation.setOptions({
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{friendData.name}</Text>
                <View style={styles.statusContainer}>
                  <MaterialIcons
                    name="lens"
                    size={10}
                    color={
                      friendData.status === "Online" ? "#4CAF50" : "#9E9E9E"
                    }
                  />
                  <Text style={styles.statusText}>
                    {friendData.status || "Offline"}
                  </Text>
                </View>
              </View>
            ),
            headerRight: () => (
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <MaterialIcons name="videocam" size={24} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <MaterialIcons name="call" size={22} color="#2196F3" />
                </TouchableOpacity>
              </View>
            ),
          });
        }
      }
    } catch (error) {
      console.error("Error parsing friend data:", error);
    }
  }, [params.friend, navigation]);

  const friendData = params.friend ? JSON.parse(params.friend) : null;
  const connectionId = params?.id ? params.id : null;

  if (!friendData) {
    return null;
  }

  return <ChatScreen friend={friendData} connectionId={connectionId} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d7edf5",
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#8E8E8E",
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  bubbleContainer: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "80%",
  },
  bubbleContainerLeft: {
    alignSelf: "flex-start",
  },
  bubbleContainerRight: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: "absolute",
    left: -18,
    bottom: -15,
  },
  avatarContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginLeft: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    maxWidth: "100%",
  },
  bubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  textLeft: {
    color: "#000000",
  },
  textRight: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  timestampLeft: {
    color: "#8E8E8E",
  },
  timestampRight: {
    color: "#8E8E8E",
  },
  statusIcon: {
    marginLeft: 2,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 12,
    color: "#8E8E8E",
    marginHorizontal: 8,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginLeft: 8,
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8E8E8E",
    marginHorizontal: 2,
  },
  typingDotMiddle: {
    marginTop: -4,
  },
  typingText: {
    fontSize: 12,
    color: "#8E8E8E",
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    marginRight: 8,
  },
  input: {
    color: "#000000",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#2196F3",
  },
  scrollToBottomButton: {
    position: "absolute",
    bottom: 180,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
