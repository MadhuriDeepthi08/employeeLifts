import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FormatStatusTrackerData from './FormatStatusTrackerData';
import AddConversation from './Conversation';

const ViewTickets = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ticketId = route.params?.ticketId;

  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const fetchTicket = useCallback(async () => {
    if (!userId || !ticketId) return;
    try {
      const response = await axios.get(
        `http://10.0.2.2:5000/api/tickets/${ticketId}`,
      );
      setTicket(response.data.list);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      Alert.alert('Error', 'Unable to load ticket');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [ticketId, userId, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchTicket();
    }, [fetchTicket]),
  );

  const handleMediaOpen = fileName => {
    const url = `https://your-cdn-domain.com/${fileName}`;
    Linking.openURL(url);
  };

  if (loading || !ticket) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }
  const openMap = (address, city, state) => {
    const query = encodeURIComponent(`${address}, ${city}, ${state}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {ticket.status_tracker && (
          <View style={styles.card}>
            <FormatStatusTrackerData trackingData={ticket.status_tracker} />
          </View>
        )}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.customerName}>{ticket.customer_name}</Text>
            <View style={styles.badgeNew}>
              <Text style={styles.badgeText}>{ticket.status_name}</Text>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.Text}>
              {ticket.category_name}, {ticket.created_at?.split('T')[0]}
            </Text>
            <TouchableOpacity
              onPress={() =>
                openMap(ticket.address, ticket.city_name, ticket.state_name)
              }
            >
              <Text style={styles.Text}>
                {ticket.address}, {ticket.city_name}, {ticket.state_name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openMap(ticket.address, ticket.city_name, ticket.state_name)
              }
              style={styles.viewMapButton}
            >
              <Text style={styles.viewMapText}>
                View Location on Google Maps
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRowContainer}>
            <Text
              style={styles.phoneText}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {ticket.customer_phone}
            </Text>

            <Text
              style={styles.emailText}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {ticket.customer_email}
            </Text>

            <Text
              style={styles.descriptionText}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {ticket.description}
            </Text>
          </View>
          {ticket.customer_reject_reason && (
            <Text style={styles.subText}>
              Reject: {ticket.customer_reject_reason}
            </Text>
          )}
          {ticket.pending_reason && (
            <Text style={styles.subText}>Pending: {ticket.pending_reason}</Text>
          )}
          {ticket.feedback && (
            <Text style={styles.subText}> Feedback: {ticket.feedback}</Text>
          )}
          {ticket.rating && (
            <Text style={styles.subText}> Rating: {ticket.rating}/5</Text>
          )}
        </View>

        <View style={styles.cards}>
          <AddConversation
            user={{ userId }}
            data={ticket}
            customerComments={ticket?.customer_comments}
            fetchData={fetchTicket}
          />
        </View>

        <View style={styles.Media}>
          <Text style={styles.sectionTitle}>Media</Text>
          {ticket?.multimedia?.length ? (
            <FlatList
              data={ticket.multimedia}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleMediaOpen(item.file_name)}
                >
                  {item.file_type === 'Photo' ? (
                    <Image
                      source={{
                        uri: `https://your-cdn-domain.com/${item.file_name}`,
                      }}
                      style={styles.media}
                    />
                  ) : (
                    <Text style={styles.video}>[Video] {item.file_name}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.info}>No Media Available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#3EB489',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    zIndex: 999,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  scrollContent: { padding: 12, paddingBottom: 30, paddingTop: 70 },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 10,
  },
  badgeNew: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  infoRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    minWidth: 0,
    flexShrink: 1,
  },
  emailText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#3EB489',
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    minWidth: 0,
    flexShrink: 1,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 12,
  },
  Text: {
    fontSize: 13,
    color: '#444',
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f9fbe7',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  cards: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    elevation: 2,
  },
  Media: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 25,
    elevation: 2,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 20,
    color: 'black',
  },
  info: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  media: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
  },
  video: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginRight: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  subText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  viewMapButton: {
    marginTop: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginHorizontal: 10,
  },
  viewMapText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default ViewTickets;
