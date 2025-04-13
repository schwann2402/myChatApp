import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Sample data for chat list
const SAMPLE_CHATS = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Are we still meeting tomorrow?",
    time: "10:30 AM",
    unread: 2,
    avatar: null,
  },
  {
    id: "2",
    name: "Mike Peterson",
    lastMessage: "I sent you the files you requested",
    time: "Yesterday",
    unread: 0,
    avatar: null,
  },
  {
    id: "3",
    name: "Team Chat",
    lastMessage: "David: Let's discuss this at the meeting",
    time: "Yesterday",
    unread: 5,
    avatar: null,
  },
  {
    id: "4",
    name: "Lisa Wong",
    lastMessage: "Thanks for your help!",
    time: "Monday",
    unread: 0,
    avatar: null,
  },
  {
    id: "5",
    name: "John Smith",
    lastMessage: "Can you send me the presentation?",
    time: "Monday",
    unread: 0,
    avatar: null,
  },
];

const ChatItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.chatItem} onPress={() => onPress(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Chats() {
  const router = useRouter();
  const [chats, setChats] = useState(SAMPLE_CHATS);

  const handleChatPress = (chat) => {
    console.log(`Chat pressed: ${chat.name}`);
    // Navigate to chat detail screen (to be implemented)
    // router.push(`/chat/${chat.id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={handleChatPress} />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#757575",
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
  },
  chatTime: {
    fontSize: 12,
    color: "#757575",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#757575",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#4c669f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
