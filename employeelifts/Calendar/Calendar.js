import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Calendar as BigCalendar } from 'react-native-big-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState('month');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem('userId');
        const response = await axios.get(
          `http://10.0.2.2:5000/api/tickets/employee/${userId}`,
        );
        const tickets = response.data?.list || [];

        const mapped = tickets
          .filter(t => t.employee_arrival_date)
          .map(ticket => {
            const start = new Date(ticket.employee_arrival_date);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            return {
              title: `${ticket.customer_name} (${ticket.category_name})`,
              start,
              end,
              ticket,
              ticket_id: ticket.ticket_id,
            };
          });

        setEvents(mapped);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventPress = event => {
    navigation.navigate('ViewTickets', { ticketId: event.ticket_id });
  };

  const goToToday = () => setDate(new Date());

  const goToPrevious = () => {
    const newDate =
      mode === 'month'
        ? dayjs(date).subtract(1, 'month')
        : mode === 'week'
        ? dayjs(date).subtract(1, 'week')
        : dayjs(date).subtract(1, 'day');
    setDate(newDate.toDate());
  };

  const goToNext = () => {
    const newDate =
      mode === 'month'
        ? dayjs(date).add(1, 'month')
        : mode === 'week'
        ? dayjs(date).add(1, 'week')
        : dayjs(date).add(1, 'day');
    setDate(newDate.toDate());
  };

  const formatDateHeader = () => {
    if (mode === 'month') return dayjs(date).format('MMMM YYYY');
    if (mode === 'week') {
      const start = dayjs(date).startOf('week');
      const end = dayjs(date).endOf('week');
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    }
    return dayjs(date).format('dddd, MMMM D, YYYY');
  };

  const groupedEvents = events.reduce((acc, evt) => {
    const dateKey = dayjs(evt.start).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(evt);
    return acc;
  }, {});

  return (
    <>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Events Calendar</Text>
      </View>

      <GestureHandlerRootView style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={goToPrevious} style={styles.navButton}>
              <Text style={styles.navText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNext} style={styles.navButton}>
              <Text style={styles.navText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.dateText}>{formatDateHeader()}</Text>
          </View>

          <View style={styles.modeRow}>
            {['month', 'week', 'day', 'agenda'].map(view => (
              <TouchableOpacity
                key={view}
                style={[
                  styles.viewButton,
                  mode === view && styles.viewButtonActive,
                ]}
                onPress={() => setMode(view)}
              >
                <Text
                  style={[
                    styles.viewText,
                    mode === view && styles.viewTextActive,
                  ]}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#00bdaa" />
          </View>
        ) : mode === 'agenda' ? (
          <ScrollView>
            {Object.keys(groupedEvents)
              .sort()
              .map(date => (
                <View key={date} style={styles.agendaSection}>
                  <Text style={styles.agendaDate}>
                    {dayjs(date).format('dddd, MMMM D, YYYY')}
                  </Text>
                  {groupedEvents[date].map((evt, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.agendaCard}
                      onPress={() => handleEventPress(evt)}
                    >
                      <Text style={styles.agendaTime}>
                        {dayjs(evt.start).format('h:mm A')}
                      </Text>
                      <Text style={styles.agendaTitle}>{evt.title}</Text>
                      <Text style={styles.agendaLocation}>
                        {evt.ticket.address}, {evt.ticket.city_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
          </ScrollView>
        ) : (
          <BigCalendar
            events={events}
            height={680}
            mode={mode}
            date={date}
            onPressEvent={handleEventPress}
            swipeEnabled
            eventCellStyle={{
              backgroundColor: '#00bdaa',
              borderRadius: 6,
            }}
          />
        )}
      </GestureHandlerRootView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <FontAwesome name="home" size={30} color="#888" />
          <Text style={styles.navTexts}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EventsCalendar')}
        >
          <Ionicons name="calendar" size={30} color="#3Eb489" />
          <Text style={styles.navTexts}>EventsCalendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EventsOverview')}
        >
          <MaterialIcons name="event" size={30} color="#888" />
          <Text style={styles.navTexts}>Events overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <FontAwesome name="user" size={30} color="#888" />
          <Text style={styles.navTexts}>profile</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EventsCalendar;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  navButton: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  topHeader: {
    backgroundColor: '#3EB489',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  navText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3EB489',
  },
  todayButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  titleRow: {
    alignItems: 'center',

    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 6,
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 6,
  },
  viewButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  viewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  viewTextActive: {
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaSection: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  agendaDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  agendaCard: {
    backgroundColor: '#fefefe',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  agendaTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 2,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  agendaLocation: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 2,
  },
  ticketNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  title: {
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
  navTexts: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
