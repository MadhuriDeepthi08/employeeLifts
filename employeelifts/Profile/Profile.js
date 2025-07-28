import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Font from 'react-native-vector-icons/FontAwesome5';
import Icons from 'react-native-vector-icons/MaterialIcons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({});
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(
            `http://10.0.2.2:5000/api/employee/${userId}`,
          );
          const Data = res.data;
          setProfile(Data);
        } catch (error) {
          console.error('Failed to fetch profile:', error.message);
        }
      };

      fetchProfile();
    }
  }, [userId]);
  const handleLogout = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/auth/logout`);

      if (response.status === 200) {
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('userName');

        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.error || 'Error logging out');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Error logging out');
    }
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -250,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleNavigation = screen => {
    closeMenu();
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => console.log('Menu pressed')}>
          <Icon name="menu" size={28} color="#FFF" />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={openMenu}>
          <Icon name="menu" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Profile</Text>
      </View>

      <ScrollView>
        <View style={styles.body}>
          <View style={styles.profilecircle}>
            <Text style={styles.profileInitial}>{profile.name}</Text>
            <Text style={styles.profileInitial}>{profile.phone}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="person" size={24} color="#069b7c" />
            <Text style={styles.itemText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Password')}
          >
            <Icon name="lock-closed" size={24} color="#069b7c" />
            <Text style={styles.itemText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('EditAddress')}
          >
            <Icon name="location-outline" size={24} color="#069b7c" />
            <Text style={styles.itemText}>Edit Address</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color="#069b7c" />
            <Text style={styles.itemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Icon name="home" size={30} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Assets')}
        >
          <Font name="suitcase" size={30} color="#888" />
          <Text style={styles.navText}>Assets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Icon name="add-circle" size={30} color="#888" />
          <Text style={styles.navText}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('subscription')}
        >
          <Icons name="currency-rupee" size={30} color="#888" />
          <Text style={styles.navText}>Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfilePage')}
        >
          <Font name="user" size={30} color="#3EB489" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
      {/* Slide Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeMenu}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.menu,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {[
              { label: 'ForgotPassword', screen: 'ForgotPassword' },

              { label: ' EditProfile', screen: 'EditProfile' },

              { label: ' ChangeAddress', screen: 'ChangeAddress' },

              { label: 'EditTickets', screen: 'EditTickets' },
              { label: ' EditAddress', screen: 'EditAddress' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#069b7c',
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

  body: {
    alignItems: 'center',
    marginTop: 20,
  },

  profilecircle: {
    marginTop: 30,
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#069b7c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginHorizontal: 70,
    borderColor: '#fff',
  },

  card: {
    backgroundColor: '#e0f7f5',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    width: 300,
  },

  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },

  content: {
    marginTop: 80,
    paddingHorizontal: 50,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 30,

    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  itemText: {
    fontSize: 18,
    marginLeft: 20,
    color: 'black',
    fontWeight: 'bold',
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000077',
    flexDirection: 'row',
  },
  menu: {
    width: 250,
    backgroundColor: '#FFF',
    padding: 20,
    height: '100%',
  },

  menuItem: { paddingVertical: 20, paddingHorizontal: 20 },
  menuText: { fontSize: 18, color: 'black', fontWeight: 'bold' },
});

export default ProfileScreen;
