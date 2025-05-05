import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import utils from "@/utils";
import { Colors } from "@/constants/Colors";

const ChatScreen = ({ friend }) => {
  const { name, thumbnail, status } = friend;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  // Initialize with some sample messages
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        text: "Hello! How are you?",
        sender: "other",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        text: "I'm good, thanks! How about you?",
        sender: "me",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(initialMessages);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender === "me" ? styles.messageRight : styles.messageLeft,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTimestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        inverted
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={handleSend}
        multiline
        numberOfLines={4}
        maxLength={200}
      />
    </SafeAreaView>
  );
};

export default function Chats() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      if (params.friend) {
        const friendData = JSON.parse(params.friend);

        if (friendData && friendData.name) {
          navigation.setOptions({
            headerTitle: friendData.name,
          });
        }
      }
    } catch (error) {
      console.error("Error parsing friend data:", error);
    }
  }, [params.friend, navigation]);

  const friendData = params.friend ? JSON.parse(params.friend) : null;

  if (!friendData) {
    return null;
  }

  return <ChatScreen friend={friendData} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 16,
    borderRadius: 20,
    padding: 12,
  },
  messageLeft: {
    backgroundColor: Colors.receivedBackground,
    alignSelf: "flex-start",
  },
  messageRight: {
    backgroundColor: Colors.sentBackground,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  messageText: {
    color: Colors.sentText,
    fontSize: 16,
    marginBottom: 4,
  },
  messageTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
    backgroundColor: Colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "blue",
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: Colors.card,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    top: 0,
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadText: {
    color: Colors.inputBackground,
    fontSize: 12,
    fontWeight: "bold",
  },
});
