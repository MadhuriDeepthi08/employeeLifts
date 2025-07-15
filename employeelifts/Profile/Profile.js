import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '@env';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter a valid phone number')
    .required('Phone is required'),
});

const addressValidationSchema = Yup.object({
  state_id: Yup.string().required('State is required'),
  city_id: Yup.string().required('City is required'),
  region_id: Yup.string().required('Region is required'),
  address: Yup.string().required('Address is required'),
});

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const fetchEmployeeData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.get(`${BASE_URL}/api/employee/${userId}`, {
        headers: { 'x-client-id': clientId },
      });

      const user = res.data;
      setUserData(user);
      setStates([{ state_id: user.state_id, state_name: user.state_name }]);
      setCities([{ city_id: user.city_id, city_name: user.city_name }]);
      setRegions([
        { region_id: user.region_id, region_name: user.region_name },
      ]);
    } catch (err) {
      console.error('Error fetching employee:', err);
      Alert.alert('Error', 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    const load = async () => {
      const id = await AsyncStorage.getItem('clientId');
      setClientId(id);
    };
    load();
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchEmployeeData();
    }
  }, [clientId, fetchEmployeeData]);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#00bdaa"
        style={{ marginTop: 50 }}
      />
    );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'profile' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('profile')}
          >
            <Text
              style={
                activeTab === 'profile' ? styles.activeText : styles.tabText
              }
            >
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'address' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('address')}
          >
            <Text
              style={
                activeTab === 'address' ? styles.activeText : styles.tabText
              }
            >
              Address
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'profile' && (
          <Formik
            enableReinitialize
            initialValues={{
              name: userData?.name || '',
              email: userData?.email || '',
              phone: userData?.phone || '',
            }}
            validationSchema={validationSchema}
            onSubmit={async values => {
              try {
                const userId = await AsyncStorage.getItem('userId');
                await axios.put(`${BASE_URL}/api/employee/${userId}`, values, {
                  headers: { 'x-client-id': clientId },
                });
                Alert.alert('Success', 'Profile updated');
                fetchEmployeeData();
              } catch (err) {
                console.error('Profile update error:', err);
                Alert.alert('Error', 'Failed to update profile');
              }
            }}
          >
            {({ handleChange, handleSubmit, values, errors }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phone && (
                  <Text style={styles.error}>{errors.phone}</Text>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        )}

        {activeTab === 'address' && (
          <Formik
            enableReinitialize
            initialValues={{
              address: userData?.address || '',
              state_id: userData?.state_id || '',
              city_id: userData?.city_id || '',
              region_id: userData?.region_id || '',
            }}
            validationSchema={addressValidationSchema}
            onSubmit={async values => {
              try {
                const res = await axios.put(
                  `${BASE_URL}/api/address/${userData.employee_id}`,
                  values,
                  {
                    headers: { 'x-client-id': clientId },
                  },
                );
                Alert.alert('Success', 'Address updated');
                fetchEmployeeData();
              } catch (err) {
                console.error('Address update error:', err);
                Alert.alert('Error', 'Failed to update address');
              }
            }}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldValue,
            }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={values.address}
                  onChangeText={handleChange('address')}
                  multiline
                />
                {errors.address && (
                  <Text style={styles.error}>{errors.address}</Text>
                )}

                <Picker
                  selectedValue={values.state_id}
                  onValueChange={value => setFieldValue('state_id', value)}
                >
                  {states.map(state => (
                    <Picker.Item
                      key={state.state_id}
                      label={state.state_name}
                      value={state.state_id}
                    />
                  ))}
                </Picker>
                {errors.state_id && (
                  <Text style={styles.error}>{errors.state_id}</Text>
                )}

                <Picker
                  selectedValue={values.city_id}
                  onValueChange={value => setFieldValue('city_id', value)}
                >
                  {cities.map(city => (
                    <Picker.Item
                      key={city.city_id}
                      label={city.city_name}
                      value={city.city_id}
                    />
                  ))}
                </Picker>
                {errors.city_id && (
                  <Text style={styles.error}>{errors.city_id}</Text>
                )}

                <Picker
                  selectedValue={values.region_id}
                  onValueChange={value => setFieldValue('region_id', value)}
                >
                  {regions.map(region => (
                    <Picker.Item
                      key={region.region_id}
                      label={region.region_name}
                      value={region.region_id}
                    />
                  ))}
                </Picker>
                {errors.region_id && (
                  <Text style={styles.error}>{errors.region_id}</Text>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setFieldValue('address', userData?.address || '');
                      setFieldValue('state_id', userData?.state_id || '');
                      setFieldValue('city_id', userData?.city_id || '');
                      setFieldValue('region_id', userData?.region_id || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3EB487',
    height: 56,
    paddingHorizontal: 16,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },

  updateButton: {
    flex: 1,
    backgroundColor: '#3EB487',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#bbb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f8f8f8',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#3EB487',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#3EB487',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
});

export default ProfileScreen;
