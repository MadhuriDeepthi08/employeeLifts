import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  navigation,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const EditProfile = ({ navigation }) => {
  const [initialValues, setInitialValues] = React.useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const res = await axios.get(
          `http://10.0.2.2:5000/api/employee/${userId}`,
        );
        const data = res.data;
        setInitialValues({
          name: data?.name || '',
          phone: data?.phone || '',
          email: data?.email || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async values => {
    try {
      const userId = await AsyncStorage.getItem('user');
      await axios.put(`http://10.0.2.2:5000/api/employee/${userId}`, values);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Something went wrong while updating.');
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCircle}>
          <Text style={styles.initials}>
            {initialValues.name
              ? initialValues.name.charAt(0).toUpperCase()
              : 'N'}
          </Text>
        </View>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSave}
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
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder="Name"
                  placeholderTextColor={'black'}
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                <TextInput
                  style={styles.input}
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  placeholder="Phone Number"
                  placeholderTextColor={'black'}
                  keyboardType="phone-pad"
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <TextInput
                  style={styles.input}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Email"
                  placeholderTextColor={'black'}
                  keyboardType="email-address"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  handleSubmit();
                  navigation.navigate('profile');
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,

    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#069b7C',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#069b7C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  initials: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',

    marginBottom: 10,
  },
  input: {
    backgroundColor: '#069b7C',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginHorizontal: 30,
    borderRadius: 15,
    marginTop: 40,

    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#069b7C',
    paddingHorizontal: 80,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontsize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default EditProfile;
