import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

const UserAvatar = ({
  thumbnailBase64,
  imageUrl,
  imageError,
  setImageError,
  onPress,
}) => {
  return (
    <>
      {/* Try base64 image first, then URL, then fallback */}
      {!imageError && thumbnailBase64 ? (
        // Use Image with base64 source
        <Image
          source={{ uri: thumbnailBase64 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#ccc",
          }}
          onError={() => {
            console.log("Base64 image loading error");
            setImageError(true);
          }}
        />
      ) : !imageError && imageUrl ? (
        // Use Image with URL source
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#ccc",
          }}
          onError={() => {
            console.log("Image loading error for URL:", imageUrl);
            setImageError(true);
          }}
        />
      ) : (
        // Fallback to default profile image
        <Image
          source={require("@/assets/images/profile.png")}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
          }}
        />
      )}
      <TouchableOpacity onPress={onPress} style={styles.editIconContainer}>
        <Icon source="pencil" size={20} color="white" />
      </TouchableOpacity>
    </>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2196F3",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
