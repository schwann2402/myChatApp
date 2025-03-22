import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { TextInput, HelperText, Button, Text, Modal, Portal, Provider as PaperProvider } from 'react-native-paper'
import { Avatar } from 'react-native-paper';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
  avatar: Yup.string()
    .required('Please select an avatar')
});

const avatars = [
  { icon: 'emoticon', color: '#FF5252' },
  { icon: 'emoticon-cool', color: '#7C4DFF' },
  { icon: 'emoticon-excited', color: '#FF9800' },
  { icon: 'emoticon-happy', color: '#4CAF50' },
  { icon: 'emoticon-neutral', color: '#2196F3' },
  { icon: 'cat', color: '#9C27B0' },
  { icon: 'dog', color: '#795548' },
  { icon: 'duck', color: '#FFC107' },
  { icon: 'penguin', color: '#607D8B' },
  { icon: 'rabbit', color: '#E91E63' }
];

const RegisterScreen = () => {
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
  const selectAvatar = (avatar, setFieldValue) => {
    setSelectedAvatar(avatar);
    setFieldValue('avatar', JSON.stringify(avatar));
    setAvatarModalVisible(false);
  };
  const handleRegister = (values) => {
    console.log('Register values:', values);
  };
  
  return (
    <PaperProvider>
      <Formik 
        initialValues={{ name: '', email: '', password: '', confirmPassword: '', avatar: '' }} 
        validationSchema={RegisterSchema} 
        onSubmit={handleRegister}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty, setFieldValue }) => (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Text style={styles.title} variant="headlineSmall">Start using ChatWave now!</Text>
              
              <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                {selectedAvatar ? (
                  <Avatar.Icon 
                    size={100} 
                    style={styles.avatar} 
                    icon={selectedAvatar.icon}
                    color="white"
                    backgroundColor={selectedAvatar.color}
                  />
                ) : (
                  <Avatar.Icon 
                    size={100} 
                    style={styles.avatar} 
                    icon="cat"
                    color="white"
                    backgroundColor="#9C27B0"
                  />
                )}
                <Text style={styles.avatarText}>Tap to select avatar</Text>
              </TouchableOpacity>
              
              {touched.avatar && errors.avatar && (
                <HelperText type="error">{errors.avatar}</HelperText>
              )}
              
              <TextInput
                label="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                mode="outlined"
                style={styles.input}
                error={touched.name && errors.name}
              />
              {touched.name && errors.name && (
                <HelperText type="error">{errors.name}</HelperText>
              )}    
              
              <TextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
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
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry={true}
                mode="outlined"
                style={styles.input}
                error={touched.password && errors.password}
                textContentType='oneTimeCode'
              />
              {touched.password && errors.password && (
                <HelperText type="error">{errors.password}</HelperText>
              )}

              <TextInput
              label="Confirm Password"
              secureTextEntry={true}
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              mode="outlined"
              style={styles.input}
              error={touched.confirmPassword && errors.confirmPassword}
              textContentType='oneTimeCode'
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
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
  },
  avatar: {
    marginBottom: 10,
    marginLeft: 10,
  },
  avatarText: {
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarOption: {
    margin: 10,
  }
})