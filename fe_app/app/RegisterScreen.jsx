import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  TextInput,
  HelperText,
  Button,
  Text,
  Modal,
  Portal,
  Provider as PaperProvider,
} from "react-native-paper";
import { Avatar } from "react-native-paper";
import api from "@/api";
import utils from "@/utils";
import useGlobal from "@/global";

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password"), null], "Passwords do not match"),
  avatar: Yup.string().required("Please select an avatar"),
});

const avatars = [
  { icon: "emoticon", color: "#FF5252" },
  { icon: "emoticon-cool", color: "#7C4DFF" },
  { icon: "emoticon-excited", color: "#FF9800" },
  { icon: "emoticon-happy", color: "#4CAF50" },
  { icon: "emoticon-neutral", color: "#2196F3" },
  { icon: "cat", color: "#9C27B0" },
  { icon: "dog", color: "#795548" },
  { icon: "duck", color: "#FFC107" },
  { icon: "penguin", color: "#607D8B" },
  { icon: "rabbit", color: "#E91E63" },
];

const RegisterScreen = () => {
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const login = useGlobal((state) => state.login);

  const handleRegister = (values) => {
    console.log("Register values:", values);
    api
      .post("/chat/signup/", values)
      .then((response) => {
        utils.log("Register response:", response);
        login(response.data);
      })
      .catch((error) => {
        console.error("Register error:", error);
      });
  };

  return (
    <PaperProvider>
      <Formik
        initialValues={{
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleRegister}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          dirty,
          setFieldValue,
        }) => (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Text style={styles.title} variant="headlineSmall">
                Start using ChatWave now!
              </Text>

              <TextInput
                label="Username"
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                mode="outlined"
                style={styles.input}
                error={touched.username && errors.username}
                autoCapitalize="none"
              />
              {touched.username && errors.username && (
                <HelperText type="error">{errors.username}</HelperText>
              )}

              <TextInput
                label="First Name"
                value={values.first_name}
                onChangeText={handleChange("first_name")}
                onBlur={handleBlur("first_name")}
                mode="outlined"
                style={styles.input}
                error={touched.first_name && errors.first_name}
              />
              {touched.first_name && errors.first_name && (
                <HelperText type="error">{errors.first_name}</HelperText>
              )}
              <TextInput
                label="Last Name"
                value={values.last_name}
                onChangeText={handleChange("last_name")}
                onBlur={handleBlur("last_name")}
                mode="outlined"
                style={styles.input}
                error={touched.last_name && errors.last_name}
              />
              {touched.last_name && errors.last_name && (
                <HelperText type="error">{errors.last_name}</HelperText>
              )}
              <TextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                mode="outlined"
                style={styles.input}
                error={touched.email && errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <HelperText type="error">{errors.email}</HelperText>
              )}

              <TextInput
                label="Password"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry={true}
                mode="outlined"
                style={styles.input}
                error={touched.password && errors.password}
                textContentType="oneTimeCode"
              />
              {touched.password && errors.password && (
                <HelperText type="error">{errors.password}</HelperText>
              )}

              <TextInput
                label="Confirm Password"
                secureTextEntry={true}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                mode="outlined"
                style={styles.input}
                error={touched.confirmPassword && errors.confirmPassword}
                textContentType="oneTimeCode"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <HelperText type="error">{errors.confirmPassword}</HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                disabled={!(isValid && dirty)}
              >
                Register
              </Button>

              <Portal>
                <Modal
                  visible={avatarModalVisible}
                  onDismiss={() => setAvatarModalVisible(false)}
                  contentContainerStyle={styles.modalContent}
                >
                  <Text style={styles.modalTitle}>Choose an Avatar</Text>

                  <View style={styles.avatarGrid}>
                    {avatars.map((avatar, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => selectAvatar(avatar, setFieldValue)}
                        style={styles.avatarOption}
                      >
                        <Avatar.Icon
                          size={60}
                          icon={avatar.icon}
                          color="white"
                          backgroundColor={avatar.color}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Button
                    mode="text"
                    onPress={() => setAvatarModalVisible(false)}
                  >
                    Cancel
                  </Button>
                </Modal>
              </Portal>
            </View>
          </ScrollView>
        )}
      </Formik>
    </PaperProvider>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
  },
  avatar: {
    marginBottom: 10,
    marginLeft: 10,
  },
  avatarText: {
    marginBottom: 20,
    color: "#666",
    textAlign: "center",
  },
  input: {
    width: "100%",
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: "100%",
    paddingVertical: 5,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarOption: {
    margin: 10,
  },
});
