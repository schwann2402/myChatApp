import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'
import { TextInput, Button, HelperText, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';

const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const handleResetPassword = () => {
    if (validateEmail(email)) {
      console.log('Reset password for:', email);
      setModalVisible(false);
    }
  };
  
  const handleSignIn = (values) => {
    console.log('Sign in values:', values);
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
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
            />
            {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              disabled={!email || !!emailError}
            >
              Reset Password
            </Button>
          </Modal>
        </Portal>
        <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleSignIn}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
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