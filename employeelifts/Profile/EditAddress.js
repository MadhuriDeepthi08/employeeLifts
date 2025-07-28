import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

const EditAddress = ({ navigation, route }) => {
  const address = useMemo(
    () => route.params?.address || {},
    [route.params?.address],
  );
  const employeeId = route.params?.employeeId; // ✅ Get employeeId from route params

  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [region, setRegion] = useState(null);
  const [addressType, setAddressType] = useState(null);
  const [addressDescription, SetAddressDescription] = useState(null);
  const [visibleDropdown, setVisibleDropdown] = useState(null);

  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [regionList, setRegionList] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  // ✅ Fetch states once
  useEffect(() => {
    axios
      .get('http://10.0.2.2:5000/api/states')
      .then(res => setStateList(res.data || []))
      .catch(err => console.error('Error fetching states:', err.message));
  }, []);

  // ✅ Fetch cities when state changes
  useEffect(() => {
    if (!selectedStateId) return;
    axios
      .get(`http://10.0.2.2:5000/api/cities/${selectedStateId}`)
      .then(res => setCityList(Array.isArray(res.data) ? res.data : [res.data]))
      .catch(err => console.error('Error fetching cities:', err.message));
  }, [selectedStateId]);

  // ✅ Fetch regions when city changes
  useEffect(() => {
    if (!selectedCityId) return;
    axios
      .get(`http://10.0.2.2:5000/api/regions/${selectedCityId}`)
      .then(res =>
        setRegionList(Array.isArray(res.data) ? res.data : [res.data]),
      )
      .catch(err => console.error('Error fetching regions:', err.message));
  }, [selectedCityId]);

  // ✅ Set initial values
  useEffect(() => {
    if (address) {
      setState(address.state_name || '');
      setCity(address.city_name || '');
      setRegion(address.region_name || '');
      setAddressType(address.address_type || '');
      SetAddressDescription(address.address);
      setSelectedStateId(address.state_id);
      setSelectedCityId(address.city_id);
      setSelectedRegionId(address.region_id);
    }
  }, [address]);

  const validationSchema = Yup.object().shape({
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    region: Yup.string().required('Region is required'),
    addressType: Yup.string().required('Address type is required'),
    addressDescription: Yup.string().required('Address is required'),
  });

  // ✅ Update API
  const handleSubmit = async values => {
    try {
      await axios.put(`http://10.0.2.2:5000/api/address/${employeeId}`, {
        state_id: selectedStateId,
        city_id: selectedCityId,
        region_id: selectedRegionId,
        address_type: values.addressType,
        address: values.addressDescription,
      });
      Alert.alert('Success', 'Address updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update address',
      );
    }
  };

  const handleSelect = (type, value, setFieldValue) => {
    if (type === 'state') {
      setState(value);
      setFieldValue('state', value);
      const selected = stateList.find(item => item.state_name === value);
      setSelectedStateId(selected?.state_id);
      setCity(null);
      setRegion(null);
      setFieldValue('city', '');
      setFieldValue('region', '');
    } else if (type === 'city') {
      setCity(value);
      setFieldValue('city', value);
      const selected = cityList.find(item => item.city_name === value);
      setSelectedCityId(selected?.city_id);
      setRegion(null);
      setFieldValue('region', '');
    } else if (type === 'region') {
      setRegion(value);
      setFieldValue('region', value);
      const selected = regionList.find(item => item.region_name === value);
      setSelectedRegionId(selected?.region_id);
    } else if (type === 'addressType') {
      setAddressType(value);
      setFieldValue('addressType', value);
    } else if (type === 'addressDescription') {
      SetAddressDescription(value);
      setFieldValue('addressDescription', value);
    }
    setVisibleDropdown(null);
  };

  const Dropdown = ({ label, selected, onPress }) => (
    <TouchableOpacity style={styles.dropdown} onPress={onPress}>
      <Text style={styles.dropdownText}>{selected || `Select ${label}`}</Text>
      <Icon name="arrow-drop-down" fontWeight="bold" size={24} color="black" />
    </TouchableOpacity>
  );

  const ModalSelector = ({ visible, options, onSelect, onClose }) => (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <Formik
      enableReinitialize
      initialValues={{
        state: state || '',
        city: city || '',
        region: region || '',
        addressType: addressType || '',
        addressDescription: addressDescription || '',
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, errors, touched, setFieldValue, setFieldTouched }) => (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Address</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Dropdown
              label="State"
              selected={state}
              onPress={() => {
                setVisibleDropdown('state');
                setFieldTouched('state', true);
              }}
            />
            {touched.state && errors.state && (
              <Text style={styles.errorText}>{errors.state}</Text>
            )}

            <Dropdown
              label="City"
              selected={city}
              onPress={() => {
                setVisibleDropdown('city');
                setFieldTouched('city', true);
              }}
            />
            {touched.city && errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}

            <Dropdown
              label="Region"
              selected={region}
              onPress={() => {
                setVisibleDropdown('region');
                setFieldTouched('region', true);
              }}
            />
            {touched.region && errors.region && (
              <Text style={styles.errorText}>{errors.region}</Text>
            )}

            <TextInput
              style={[
                styles.textInput,
                {
                  fontSize: 18,
                  fontWeight: '600',
                  backgroundColor: '#069b7C',
                  borderRadius: 10,
                  color: 'black',
                },
              ]}
              placeholder=" Address type"
              placeholderTextColor="black"
              value={addressType}
              onChangeText={text => {
                setAddressType(text);
                setFieldValue('addressType', text);
              }}
              onBlur={() => setFieldTouched('addressType', true)}
            />
            {touched.addressType && errors.addressType && (
              <Text style={styles.errorText}>{errors.addressType}</Text>
            )}

            <TextInput
              style={[
                styles.textInput,
                {
                  fontSize: 20,
                  borderRadius: 10,
                  marginTop: 40,
                  fontWeight: 'bold',
                  backgroundColor: '#069b7C',
                  color: 'black',
                },
              ]}
              placeholder="Address "
              placeholderTextColor="black"
              value={addressDescription}
              onChangeText={text => {
                SetAddressDescription(text);
                setFieldValue('addressDescription', text);
              }}
              onBlur={() => setFieldTouched('addressDescription', true)}
            />
            {touched.addressDescription && errors.addressDescription && (
              <Text style={styles.errorText}>{errors.addressDescription}</Text>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Update Address</Text>
            </TouchableOpacity>

            {visibleDropdown === 'state' && (
              <ModalSelector
                visible
                options={stateList.map(item => item.state_name)}
                onSelect={item => handleSelect('state', item, setFieldValue)}
                onClose={() => setVisibleDropdown(null)}
              />
            )}
            {visibleDropdown === 'city' && (
              <ModalSelector
                visible
                options={cityList.map(item => item.city_name)}
                onSelect={item => handleSelect('city', item, setFieldValue)}
                onClose={() => setVisibleDropdown(null)}
              />
            )}
            {visibleDropdown === 'region' && (
              <ModalSelector
                visible
                options={regionList.map(item => item.region_name)}
                onSelect={item => handleSelect('region', item, setFieldValue)}
                onClose={() => setVisibleDropdown(null)}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { marginTop: 20, padding: 20 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#069b7C',
    borderColor: '#CCC',
    padding: 12,
    borderRadius: 15,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#069b7C',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 24 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  dropdownText: { fontSize: 18, color: '#000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, maxHeight: '60%' },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  optionText: { fontSize: 18 },
  submitBtn: {
    backgroundColor: '#069b7C',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  submitText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10 },
});

export default EditAddress;
