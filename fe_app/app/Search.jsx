import { StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, List, Avatar, Button } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import useGlobal from "@/global";
import { debounce } from "lodash";
import { address } from "@/api";
import { useRouter } from "expo-router";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useGlobal((state) => state.searchResults);
  const searchUsers = useGlobal((state) => state.searchUsers);
  const requestConnect = useGlobal((state) => state.requestConnect);

  const debouncedSearch = useCallback(
    debounce((text) => {
      searchUsers(text);
    }, 300),
    [searchUsers]
  );

  const handleSearchChange = (text) => {
    console.log("searching ", text);
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleConnect = (user) => {
    console.log("connecting to ", user);
    requestConnect(user.username);
  };

  const formattedImageUrl = (url) => {
    return url ? `http://${address}${url}` : null;
  };

  return (
    <SafeAreaView>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color="black"
          style={{ maxWidth: 40, marginLeft: 20 }}
          onPress={() => router.back()}
        />
        <Searchbar
          placeholder="Search users"
          value={searchQuery}
          onChangeText={handleSearchChange}
          iconColor="grey"
          style={{
            marginLeft: 20,
            marginRight: 20,
            flex: 1,
          }}
        />
      </View>

      {searchQuery && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          {searchResults.map((result) => (
            <List.Item
              key={result.username}
              title={
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.resultName}>{result.name}</Text>
                </View>
              }
              description={
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.resultUsername}>@{result.username}</Text>
                  <MaterialIcons
                    name="lens"
                    size={16}
                    color={result.status === "Online" ? "#122482" : "red"}
                    style={{ alignSelf: "center", marginRight: 12 }}
                  />
                </View>
              }
              left={(props) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar.Image
                    {...props}
                    size={40}
                    source={{ uri: formattedImageUrl(result.thumbnail) }}
                  />
                </View>
              )}
              right={(props) => (
                <Button
                  {...props}
                  mode="contained"
                  buttonColor="#1F8382"
                  onPress={() => handleConnect(result)}
                >
                  Connect
                </Button>
              )}
              style={styles.searchResultItem}
              titleStyle={styles.resultName}
              descriptionStyle={styles.resultUsername}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchResultsContainer: {
    marginTop: 12,
  },
  searchResultItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultUsername: {
    fontSize: 14,
    color: "#666",
  },
});
