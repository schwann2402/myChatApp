import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import useGlobal from "@/global";
import { Avatar } from "react-native-paper";
import { address } from "@/api";
import { useNavigation } from "@react-navigation/native";

const Requests = () => {
  const navigation = useNavigation();
  const requests = useGlobal((state) => state.requests);
  const requestAccept = useGlobal((state) => state.requestAccept);
  const handleAccept = (username) => {
    // TODO: Implement accept request functionality
    requestAccept(username);
  };

  const handleDecline = (username) => {
    // TODO: Implement decline request functionality
    console.log("Declining request from:", username);
  };

  const formattedImageUrl = (url) => {
    return url ? `http://${address}${url}` : null;
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestContent}>
        <Avatar.Image
          size={40}
          source={{ uri: formattedImageUrl(item.sender.thumbnail) }}
          style={styles.avatar}
        />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.sender.name}</Text>
          <Text style={styles.requestUsername}>@{item.sender.username}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item.sender.username)}
          >
            <MaterialIcons name="check" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(item.sender.username)}
          >
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Friend Requests</Text>
          <Text style={styles.headerSubtitle}>
            {requests?.length || 0} new requests
          </Text>
        </View>
      </View>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.sender.username}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No friend requests yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Requests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    display: "flex",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  headerContent: {
    display: "flex",
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  requestUsername: {
    fontSize: 14,
    color: "#666",
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#f44336",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
