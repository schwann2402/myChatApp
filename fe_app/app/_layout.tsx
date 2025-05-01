import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import useGlobal from "@/global";
import WelcomeScreen from "@/app/WelcomeScreen";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const authenticated = useGlobal((state) => state.authenticated);
  const init = useGlobal((state) => state.init);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Outfit: require("../assets/fonts/Outfit.ttf"),
  });
  const router = useRouter();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        await init();
        console.log(
          "App initialized, authenticated:",
          useGlobal.getState().authenticated
        );
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsInitializing(false);
      }
    }

    if (loaded) {
      initializeApp();
    }
  }, [loaded, init]);

  useEffect(() => {
    if (loaded && !isInitializing) {
      SplashScreen.hideAsync();
      if (!authenticated) {
        router.replace("/WelcomeScreen");
      }
    }
  }, [loaded, isInitializing, authenticated, router]);

  if (!loaded || isInitializing) {
    return null;
  }

  console.log("authenticated:", authenticated);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)/Profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WelcomeScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
