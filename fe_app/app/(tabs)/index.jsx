import { useEffect } from "react";
import { useRouter, Redirect } from "expo-router";

export default function IndexScreen() {
  // This screen automatically redirects to the Profile tab
  return <Redirect href="/(tabs)/Profile" />;
}

