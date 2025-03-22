import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import React from 'react'
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const handleSignIn = (values) => {
    console.log('Sign in values:', values);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Sign In</Text>

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
              style={styles.forgotButton}
            >
              Forgot password?
            </Button>
          </View>
        )}
      </Formik>
    </SafeAreaView>
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
  }
})