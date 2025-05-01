import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";

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

  // Simple header title component
  const HeaderTitle = ({ title }: { title: string }) => (
    <Text style={styles.headerTitle}>{title}</Text>
  );

  return (
    <Tabs
      initialRouteName="Profile"
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        // Enable headers for all tabs
        headerShown: true,
        // Style the header
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
        headerTitleAlign: "center",
        // Use custom header title component
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
        name="Notifications"
        options={{
          title: "Notifications",
          headerTitle: "Notifications",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="notifications"
              size={28}
              color={color}
              onPress={() => router.push("/Notifications")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Chats"
        options={{
          title: "Chats",
          headerTitle: "Chats",
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
