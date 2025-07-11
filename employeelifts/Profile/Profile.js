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
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
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
  const [activeTab, setActiveTab] = useState('profile');

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.get(
        `http://10.0.2.2:5000/api/employee/${userId}`,
      );
      setUserData(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStates = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5000/api/states');
      setStates(res.data);
    } catch (err) {
      console.log('Failed to fetch states', err);
    }
  };

  const fetchCities = async stateId => {
    try {
      const res = await axios.get(`http://10.0.2.2:5000/api/cities/${stateId}`);
      setCities(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.log('Failed to fetch cities', err);
    }
  };

  const fetchRegions = async cityId => {
    try {
      const res = await axios.get(`http://10.0.2.2:5000/api/regions/${cityId}`);
      setRegions(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.log('Failed to fetch regions', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchStates();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData?.state_id) fetchCities(userData.state_id);
    if (userData?.city_id) fetchRegions(userData.city_id);
  }, [userData]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <>
      <View style={{ flex: 1 }}>
        <View style={styles.title}>
          <Text style={styles.ticketNumber}>Admin Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          style={{ flex: 1, marginTop: 56, marginBottom: 60 }}
        >
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'profile' && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab('profile')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'profile' && styles.activeTabButtonText,
                ]}
              >
                Update Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'address' && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab('address')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'address' && styles.activeTabButtonText,
                ]}
              >
                Update Address
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
                  await axios.put(
                    `http://10.0.2.2:5000/api/employee/${userData.employee_id}`,
                    values,
                  );
                  Alert.alert('Success', 'Profile updated');
                  fetchUserData();
                } catch (err) {
                  Alert.alert(
                    'Error',
                    err.response?.data?.message || 'Failed to update profile',
                  );
                }
              }}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    placeholder="Name"
                  />
                  {errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    placeholder="Email"
                  />
                  {errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    placeholder="Phone"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <Text style={styles.error}>{errors.phone}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                  >
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
                    `http://10.0.2.2:5000/api/address/${userData.employee_id}`,
                    {
                      address: values.address,
                      state_id: values.state_id,
                      city_id: values.city_id,
                      region_id: values.region_id,
                    },
                  );
                  Alert.alert('Success', res.data.message || 'Address updated');
                  fetchUserData();
                } catch (err) {
                  Alert.alert(
                    'Error',
                    err.response?.data?.message || 'Failed to update address',
                  );
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
                    style={styles.addressInput}
                    value={values.address}
                    onChangeText={handleChange('address')}
                    placeholder="Address"
                    multiline
                    numberOfLines={3}
                  />

                  {errors.address && (
                    <Text style={styles.error}>{errors.address}</Text>
                  )}

                  <Picker
                    selectedValue={values.state_id}
                    onValueChange={value => {
                      setFieldValue('state_id', value);
                      setFieldValue('city_id', '');
                      setFieldValue('region_id', '');
                      fetchCities(value);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select State" value="" />
                    {states.map(s => (
                      <Picker.Item
                        label={s.state_name}
                        value={s.state_id}
                        key={s.state_id}
                      />
                    ))}
                  </Picker>
                  {errors.state_id && (
                    <Text style={styles.error}>{errors.state_id}</Text>
                  )}

                  <Picker
                    selectedValue={values.city_id}
                    onValueChange={value => {
                      setFieldValue('city_id', value);
                      setFieldValue('region_id', '');
                      fetchRegions(value);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select City" value="" />
                    {cities.map(c => (
                      <Picker.Item
                        label={c.city_name}
                        value={c.city_id}
                        key={c.city_id}
                      />
                    ))}
                  </Picker>
                  {errors.city_id && (
                    <Text style={styles.error}>{errors.city_id}</Text>
                  )}

                  <Picker
                    selectedValue={values.region_id}
                    onValueChange={value => setFieldValue('region_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Area" value="" />
                    {regions.map(r => (
                      <Picker.Item
                        label={r.region_name}
                        value={r.region_id}
                        key={r.region_id}
                      />
                    ))}
                  </Picker>
                  {errors.region_id && (
                    <Text style={styles.error}>{errors.region_id}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Update Address</Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <FontAwesome name="home" size={30} color="#888" />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('EventsCalendar')}
          >
            <Ionicons name="calendar" size={30} color="#888" />
            <Text style={styles.navText}>EventsCalendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('EventsOverview')}
          >
            <MaterialIcons name="event" size={30} color="#888" />
            <Text style={styles.navText}>Events overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <FontAwesome name="user" size={30} color="#3EB489" />
            <Text style={styles.navText}>profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
  },

  ticketNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#3EB489',
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    color: '#888',
    fontsize: 14,
    fontWeight: 'bold',
    padding: 10,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'android' ? 0 : 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: 'black',
    fontsize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    marginLeft: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#00bdaa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
    minWidth: 200,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: '#00bdaa',
  },

  tabButtonText: {
    fontWeight: 'bold',
    color: '#888',
    fontSize: 14,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default ProfileScreen;
