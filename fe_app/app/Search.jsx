import { StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import useGlobal from "@/global";
import { debounce } from "lodash";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useGlobal((state) => state.searchResults);
  const searchUsers = useGlobal((state) => state.searchUsers);

  const debouncedSearch = useCallback(
    debounce((text) => {
      searchUsers(text);
    }, 300),
    [searchUsers]
  );

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  return (
    <SafeAreaView>
      <Searchbar
        placeholder="Search users"
        value={searchQuery}
        onChangeText={handleSearchChange}
        iconColor="grey"
        style={{
          marginLeft: 20,
          marginRight: 20,
        }}
      />
      {searchQuery && searchResults && searchResults.length ? (
        <View style={styles.searchResultsContainer}>
          {searchResults.map((result) => (
            <View key={result.id} style={styles.searchResultItem}>
              <Image
                source={{ uri: result.thumbnail }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <Text>{result.name}</Text>
              <MaterialIcons
                name="lens"
                size={20}
                color={result.status === "Online" ? "#4CAF50" : "red"}
              />
            </View>
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchResultsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#f0f0f0",
  },
  searchResultItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
