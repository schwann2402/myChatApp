import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'
import { TextInput, Button, HelperText, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '@/api';
import utils from '@/utils'
import useGlobal from '@/global';
import { useRouter } from 'expo-router';

const SignInSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const [username, setUsername] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const login = useGlobal(state => state.login);
  const initialized = useGlobal(state => state.initialized);
  const router = useRouter();
  
  const handleResetPassword = () => {
    if (validateEmail(email)) {
      console.log('Reset password for:', email);
      setModalVisible(false);
    }
  };
  
  const handleSignIn = (values) => {
    api.post('/chat/signin/', values)
      .then(response => {
        const tokens = {
          access: response.data.access,
          refresh: response.data.refresh
        }
        const credentials = {
          username: values.username,
          password: values.password
        }
        login(credentials, response.data.user, tokens);
        router.replace('/(tabs)/Home');
      })
      .catch(error => {
        console.error('Sign in error:', error);
      });
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Sign In</Text>
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Text>Forgot your password?</Text>
            <TextInput 
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
              }}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
            >
              Reset Password
            </Button>
          </Modal>
        </Portal>
        <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleSignIn}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                mode="outlined"
                style={styles.input}
                error={touched.username && errors.username}
                autoCapitalize="none"
              />
              {touched.username && errors.username && (
                <HelperText type="error">{errors.username}</HelperText>
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
              />
              {touched.password && errors.password && (
                <HelperText type="error">{errors.password}</HelperText>
              )}
            </View>

            <Button
              disabled={!(isValid && dirty)}
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setModalVisible(true);
              }}
              style={styles.forgotButton}
            >
              Forgot password?
            </Button>
          </View>
        )}
      </Formik>
    </SafeAreaView>
    </PaperProvider>
  )
}

export default SignIn

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: 300,
    borderRadius: 20,
    marginBottom: 5,
  },
  button: {
    width: 300,
    borderRadius: 20,
    marginTop: 10,
    paddingVertical: 5,
  },
  forgotButton: {
    marginTop: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 20,
    alignItems: 'center',
  }
})