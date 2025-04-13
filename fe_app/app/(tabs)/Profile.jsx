import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import useGlobal from "@/global";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { address } from "@/api";

const ProfileLogout = () => {
  const router = useRouter();
  const logout = useGlobal((state) => state.logout);
  return (
    <Button
      mode="contained"
      onPress={() => {
        logout();
        router.replace("/WelcomeScreen");
      }}
      style={{ marginTop: 20 }}
    >
      Logout
    </Button>
  );
};

import UserAvatar from "@/components/UserAvatar";

const ProfileImage = () => {
  const uploadThumbnail = useGlobal((state) => state.uploadThumbnail);
  const user = useGlobal((state) => state.user);
  const [imageError, setImageError] = useState(false);

  const userData = user.user || user;
  const thumbnailPath = userData?.thumbnail;
  const thumbnailBase64 = userData?.thumbnail_base64;

  const imageUrl = thumbnailPath ? `http://${address}${thumbnailPath}` : null;

  useEffect(() => {
    if (imageUrl || thumbnailBase64) {
      setImageError(false);
    }
  }, [imageUrl, thumbnailBase64]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const imageData = result.assets[0];
      uploadThumbnail(imageData);
    }
  };

  return (
    <View style={styles.avatarContainer}>
      <UserAvatar
        thumbnailBase64={thumbnailBase64}
        imageUrl={imageUrl}
        imageError={imageError}
        setImageError={setImageError}
        onPress={pickImage}
      />
    </View>
  );
};

const Profile = () => {
  const user = useGlobal((state) => state.user);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const userData = user.user || user;
  const { name, username } = userData;

  if (!name || !username) {
    return null;
  }

  const handleSettingsPress = () => {
    console.log("Settings pressed");
    // Navigate to settings or open settings modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ProfileImage />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.username}>@{username}</Text>
        <ProfileLogout />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    marginTop: 5,
    color: "#666",
  },
  image: {
    width: 200,
    height: 200,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#ccc",
  },
});
