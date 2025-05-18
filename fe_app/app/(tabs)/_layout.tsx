import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, Text, StyleSheet } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;
  const router = useRouter();

  // Function to create header icons
  const HeaderIcon = ({
    name,
    onPress,
  }: {
    name: React.ComponentProps<typeof MaterialIcons>["name"];
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.headerIconButton}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <MaterialIcons name={name} size={24} color={tintColor} />
    </TouchableOpacity>
  );

  const HeaderTitle = ({ title }: { title: string }) => (
    <Text style={styles.headerTitle}>{title}</Text>
  );

  const ChatHeader = () => {
    const params = useLocalSearchParams();

    try {
      const friendData = params.friend
        ? JSON.parse(params.friend as string)
        : null;

      if (friendData && friendData.name) {
        return <HeaderTitle title={friendData.name} />;
      }
    } catch (error) {
      console.error("Error parsing friend data:", error);
    }

    return <HeaderTitle title="Chats" />;
  };

  return (
    <Tabs
      initialRouteName="Profile"
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
        headerTitleAlign: "center",
        headerTitle: ({ children }) => (
          <HeaderTitle title={children as string} />
        ),
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Chats"
        options={{
          title: "Chats",
          headerTitle: ChatHeader,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="chat" size={28} color={color} />
          ),
          headerLeft: () => (
            <HeaderIcon
              name="menu"
              onPress={() => console.log("Menu pressed")}
            />
          ),
          headerRight: () => (
            <HeaderIcon
              name="add"
              onPress={() => console.log("New chat pressed")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Friends"
        options={{
          title: "Friends",
          headerTitle: "Friends",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people-outline" size={28} color={color} />
          ),
          headerLeft: () => (
            <HeaderIcon
              name="menu"
              onPress={() => console.log("Menu pressed")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
          // Add left and right header icons
          headerLeft: () => (
            <HeaderIcon
              name="inbox"
              onPress={() => router.push("../Requests")}
            />
          ),
          headerRight: () => (
            <HeaderIcon name="search" onPress={() => router.push("/Search")} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerIconButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
});
