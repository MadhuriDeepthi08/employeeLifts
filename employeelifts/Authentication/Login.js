import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Yup from 'yup';
const Login = ({ navigation }) => {
  const handleLogin = async values => {
    try {
      const res = await axios.post(
        'http://10.0.2.2:5000/api/auth/admin/login',
        {
          email: values.email,
          password: values.password,
          rememberMe: false,
        },
      );
      console.log('resssssss', res);
      const userData = res.data.empData;

      if (res.status === 200) {
        await AsyncStorage.setItem('userId', userData.userId.toString());

        Alert.alert('Success', res?.data?.message);
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.log('erroraaaaaa', error);
      Alert.alert('Error', error.response.data.error);
    }
  };
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const Validation = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  return (
    <ImageBackground
      source={require('../Assets/bg.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <Formik
          initialValues={{
            email: 'employee@exapmle.com',
            password: 'Password123!',
          }}
          validationSchema={Validation}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Email"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                name="email"
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Password"
                placeholderTextColor="gray"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                name="password"
              />
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 7,
    marginLeft: 8,
  },
  backgroundImage: {
    flex: 1,
    opacity: 1.4,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  forgotBtn: {
    marginLeft: 'auto',
    marginBottom: 20,
  },
  forgotText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    padding: 14,
    borderColor: 'gray',
    borderWidth: 2,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  loginBtn: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 6,
  },
  loginText: {
    color: '#fff',
    fontSize: 20,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    paddingBottom: 5,
  },
});
