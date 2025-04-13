import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const translateY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    const duration = 800;
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 2,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.container}
      >
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "/placeholder.svg?height=120&width=120" }}
              style={styles.logo}
            />
            <Animated.Text
              style={[
                styles.appName,
                { transform: [{ translateY: translateY }] },
              ]}
            >
              ChatWave
            </Animated.Text>
            <Text style={styles.tagline}>Connect with friends, anywhere</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/SignIn")}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/RegisterScreen")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{" "}
              <Text style={styles.link}>Terms of Service</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.08,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b5998",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
  },
  secondaryButtonText: {
    color: "white",
  },
  forgotPassword: {
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 10,
    fontSize: 14,
  },
  footer: {
    width: "80%",
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    fontSize: 12,
  },
  link: {
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.8)",
  },
});
