import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ChangeAddress = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (userId) {
          const res = await axios.get(
            `http://10.0.2.2:5000/api/address/employee/${userId}`,
          );
          setAddresses(res.data.list);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error.message);
      }
    };
    fetchAddresses();
  }, [userId]);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Address</Text>
      </View>
      {addresses.map((address, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditAddress', { address })}
          >
            <Icon name="create-outline" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.infoBlock}>
            <Text style={styles.boldLabel}>State:</Text>
            <Text style={styles.value}>{address.state_name}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.boldLabel}>City:</Text>
            <Text style={styles.value}>{address.city_name}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.boldLabel}>Region:</Text>
            <Text style={styles.value}>{address.region_name}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.boldLabel}>Property Type:</Text>
            <Text style={styles.value}>{address.address_type}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.boldLabel}>Property:</Text>
            <Text style={styles.value}>{address.address}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#3EB489',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,

    marginHorizontal: 20,
  },
  boldLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginRight: 60,
  },
});
export default ChangeAddress;
