import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import useGlobal from "@/global";
import { address } from "@/api";
import { useRouter } from "expo-router";

const FriendItem = ({ item }) => {
  const { name, thumbnail, status } = item?.friend || {};
  const { preview, updated } = item;
  const router = useRouter();
  const formattedImageUrl = (url) => {
    return url ? `http://${address}${url}` : null;
  };

  const formatTime = (date) => {
    if (!date || date === null) return "";
    const now = new Date();
    const s = Math.abs(now - new Date(date)) / 1000;
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
  };

  return (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => {
        router.push({
          pathname: "/(tabs)/Chats",
          params: { friend: JSON.stringify(item?.friend), id: item?.id },
        });
      }}
    >
      <View style={styles.avatarContainer}>
        {thumbnail ? (
          <Image
            source={{ uri: formattedImageUrl(thumbnail) }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name?.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.friendInfo}>
        <View style={styles.statusContainer}>
          <Text style={styles.friendName}>{name}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {preview}
          </Text>
          <Text style={styles.lastMessageTime}>{formatTime(updated)}</Text>
        </View>
      </View>

      <MaterialIcons name="arrow-forward-ios" size={20} color="#757575" />
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MaterialIcons name="people-outline" size={48} color="#757575" />
    <Text style={styles.emptyStateText}>No friends yet</Text>
    <Text style={styles.emptyStateSubtext}>
      Start connecting with people by searching and sending friend requests
    </Text>
  </View>
);

export default function Friends() {
  const getFriends = useGlobal((state) => state.getFriends);
  const user = useGlobal((state) => state.user);
  const friendsList = useGlobal((state) => state.friendsList);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    getFriends(user.username);
  }, [getFriends, user.username]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getFriends(user.username);
    setRefreshing(false);
  }, [getFriends, user.username]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Friends</Text>
      <Text style={styles.headerSubtitle}>
        {friendsList?.length || 0} friends
      </Text>
    </View>
  );

  return (
    <FlatList
      data={friendsList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FriendItem item={item} onPress={() => {}} />}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={EmptyState}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#757575",
  },
  friendInfo: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "space-between",
  },
  friendStatus: {
    fontSize: 12,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    color: "#666",
  },
});
