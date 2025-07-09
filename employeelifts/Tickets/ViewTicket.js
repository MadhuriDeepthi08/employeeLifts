import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormatStatusTrackerData from './FormatStatusTrackerData';

const ViewTickets = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [userId, setUserId] = useState(null);

  const route = useRoute();
  const ticketId = route.params?.ticketId;

  useEffect(() => {
    const init = async () => {
      const userData = await AsyncStorage.getItem('userId');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed);
      }
    };
    init();
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `http://10.0.2.2:5000/api/tickets/${ticketId}`,
      );
      console.log(' ticjketresponseeeeeeee', response);
      setTickets([response.data.list]);
    } catch (err) {
      console.error('Error fetching ticket:', err);
    }
  }, [ticketId, userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openInMaps = address => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
    Linking.openURL(url).catch(err =>
      console.error('Failed to open maps:', err),
    );
  };

  const renderTicket = ({ item }) => (
    <>
      <View>
        {item.status_tracker && (
          <View style={styles.trackerWrapper}>
            <FormatStatusTrackerData trackingData={item.status_tracker} />
          </View>
        )}

        <View style={styles.ticketCardBox}>
          <View>
            <View style={styles.content}>
              <View style={styles.messageBox}>
                <Text style={styles.customer}>{item.customer_name}</Text>
                <Text style={styles.category}>
                  {item.category_name} On {item.created_at?.split('T')[0]}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    openInMaps(
                      `${item.address || ''}, ${item.region_name}, ${
                        item.city_name
                      }, ${item.state_name}`,
                    )
                  }
                >
                  <Text style={[styles.address]}>
                    {item.state_name}, {item.city_name}, {item.region_name}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.responseBox}>
                <View style={styles.tagsRow}>
                  <Text style={styles.tag}>{item.customer_phone}</Text>
                  <Text style={styles.tagBlue}>{item.description}</Text>
                  <Text style={styles.tagAdd}>{item.customer_email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#f9f9f9" />
        </TouchableOpacity>
        <Text style={styles.ticketNumber}>Ticket Details</Text>
      </View>
      <View style={styles.iconGroup}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="star-border" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-vert" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 100 }}
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={item => item.ticket_id.toString()}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <FontAwesome name="home" size={30} color="#3EB489" />
          <Text style={styles.navText}>Home</Text>
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
          <FontAwesome name="user" size={30} color="#888" />
          <Text style={styles.navText}>profile</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  ticketCardBox: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 10,
    padding: 12,
    elevation: 3,
    borderRadius: 10,
    borderColor: '#bbb',
    borderWidth: 1,
  },
  content: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 30,
  },

  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
  },
  ticketNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },

  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#3EB489',
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',

    alignItems: 'center',
    zIndex: 100,
  },
  messageBox: {
    marginBottom: 10,
  },
  customer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  responseBox: {
    marginTop: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#1976D2',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagBlue: {
    backgroundColor: '#D32F2F',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagAdd: {
    backgroundColor: '#3EB489',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
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

export default ViewTickets;
