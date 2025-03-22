import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="WelcomeScreen"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color }) => <MaterialIcons name="logout" size={28} color={color} />,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="SignIn"
        options={{
         title: 'Sign In',
         tabBarIcon: ({ color }) => <MaterialIcons name="login" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
