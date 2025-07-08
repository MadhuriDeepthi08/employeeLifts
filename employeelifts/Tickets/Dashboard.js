import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusTracker from './StatusTracker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const serviceReasons = [
  'Power Supply Issues',
  'Electrical Components Failure',
  'Overheating',
  'Loose or Damaged Wiring',
  'Software/Firmware Issues',
  'Physical Damage',
  'Remote Control or Interface Issues',
  'Voltage Fluctuations',
  'Spare Parts Replacement',
  'Other',
];

const Dashboard = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [serviceVisible, setServiceVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reasonForDelay, setReasonForDelay] = useState('');
  const [serviceReason, setServiceReason] = useState('');
  const [customServiceReason, setCustomServiceReason] = useState('');
  const [userId, setUserId] = useState(null);

  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [ticketStatuses, setTicketStatuses] = useState([]);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchStatusOptions = async () => {
      try {
        const res = await axios.get('http://10.0.2.2:5000/api/ticket-statuses');
        setTicketStatuses(res?.data || []);
      } catch (err) {
        console.error('Failed to fetch statuses:', err);
      }
    };

    loadUserId();
    fetchStatusOptions();
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      const endpoint =
        statusFilter === '1' || statusFilter === null
          ? `http://10.0.2.2:5000/api/tickets`
          : `http://10.0.2.2:5000/api/tickets/employee/${userId}`;

      const response = await axios.get(endpoint, {
        params: { status_id: statusFilter },
      });
      setTickets(response?.data?.list || []);
    } catch (error) {
      console.error(error);
      setTickets([]);
    }
  }, [userId, statusFilter]);

  useEffect(() => {
    if (userId) {
      fetchTickets();
    }
  }, [userId, statusFilter, fetchTickets]);

  const handleAssignToMe = async item => {
    const userStr = await AsyncStorage.getItem('userId');
    const user = JSON.parse(userStr);
    const trackerData = StatusTracker(
      item.status_tracker,
      'Engineer is Assigned',
      'In-Progress',
      2,
      user.name,
      user.name,
      user.phone || '',
    );
    const ticketData = {
      assigned_employee_id: userId,
      status_id: 2,
      priority_rank: 'High',
      status_tracker: trackerData,
      employee_arrival_date: null,
    };
    try {
      await axios.put(`http://10.0.2.2:5000/api/tickets/${item.ticket_id}`, {
        ticketData,
      });
      fetchTickets();
      Alert.alert('Success', 'Ticket assigned successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to assign ticket');
    }
  };

  const handleStartWork = async item => {
    const userStr = await AsyncStorage.getItem('userId');
    const user = JSON.parse(userStr);
    const trackerData = StatusTracker(
      item.status_tracker,
      'Work started',
      'In-Progress',
      3,
      user.name,
      item.employee_name,
      item.employee_phone,
    );
    const ticketData = {
      status_id: 3,
      status_tracker: trackerData,
    };
    try {
      await axios.put(`http://10.0.2.2:5000/api/tickets/${item.ticket_id}`, {
        ticketData,
      });
      fetchTickets();
      Alert.alert('Success', 'Work started');
    } catch (err) {
      Alert.alert('Error', 'Failed to start work');
    }
  };

  const handleSaveArrival = async () => {
    const userStr = await AsyncStorage.getItem('userId');
    const user = JSON.parse(userStr);
    const formattedDate = `${arrivalDate.toISOString().split('T')[0]}T${
      arrivalTime.toTimeString().split(' ')[0]
    }`;
    const msg = reasonForDelay
      ? `Engineer will arrive on ${arrivalDate.toDateString()} at ${
          arrivalTime.toTimeString().split(' ')[0]
        } 
          // due to ${reasonForDelay}`
      : `Engineer will arrive on ${arrivalDate.toDateString()} at ${
          arrivalTime.toTimeString().split(' ')[0]
        }`;
    const trackerData = StatusTracker(
      selectedTicket.status_tracker,
      msg,
      'Todo',
      3,
      user.name,
      selectedTicket.employee_name,
      selectedTicket.employee_phone,
    );

    const ticketData = {
      employee_arrival_date: formattedDate,
      status_tracker: trackerData,
    };
    try {
      await axios.put(
        `http://10.0.2.2:5000/api/tickets/${selectedTicket.ticket_id}`,
        { ticketData },
      );
      fetchTickets();
      setModalVisible(false);
      Alert.alert('Success', 'Arrival date updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update arrival');
    }
  };

  const handleServiceUpdate = async () => {
    const userStr = await AsyncStorage.getItem('userId');
    const user = JSON.parse(userStr);
    const reason =
      serviceReason === 'Other'
        ? customServiceReason
        : serviceReason || 'Service Update from Employee';
    const trackerData = StatusTracker(
      selectedTicket.status_tracker,
      reason,
      'In Progress',
      3,
      user.name,
      selectedTicket.employee_name,
      selectedTicket.employee_phone || '',
    );

    const ticketData = {
      status_tracker: trackerData,
      status_id: 3,
    };
    try {
      await axios.put(
        `http://10.0.2.2:5000/api/tickets/${selectedTicket.ticket_id}`,
        { ticketData },
      );
      fetchTickets();
      setServiceVisible(false);
      setServiceReason('');
      setCustomServiceReason('');
      Alert.alert('Success', 'Service updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update service');
    }
  };

  const handleEditUpdate = async () => {
    const userStr = await AsyncStorage.getItem('userId');
    const user = JSON.parse(userStr);

    let status_id = 3;
    if (editStatus === 'Done') status_id = 4;
    else if (editStatus === 'On Hold') status_id = 5;
    else if (editStatus === 'Pending') status_id = 6;

    const reasonMsg =
      editStatus === 'Done'
        ? 'Service Completed'
        : `${editStatus} - ${editReason}`;

    const trackerData = StatusTracker(
      selectedTicket.status_tracker,
      reasonMsg,
      editStatus,
      status_id,
      user.name,
      selectedTicket.employee_name,
      selectedTicket.employee_phone || '',
    );

    const ticketData = {
      status_id,
      status_tracker: trackerData,
    };

    if (editStatus === 'On Hold' || editStatus === 'Pending') {
      ticketData.pending_reason = editReason;
    }

    try {
      await axios.put(
        `http://10.0.2.2:5000/api/tickets/${selectedTicket.ticket_id}`,
        { ticketData },
      );
      fetchTickets();
      setEditVisible(false);
      setEditStatus('');
      setEditReason('');
      Alert.alert('Success', 'Ticket status updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };
  const getStatusChipStyle = status => {
    switch (status?.toLowerCase()) {
      case 'open':
        return {
          backgroundColor: '#FFD700', // bright yellow
          color: '#000000', // black text
        };
      case 'todo':
        return {
          backgroundColor: '#FF6B6B', // soft red
          color: '#FFFFFF',
        };
      case 'in-progress':
        return {
          backgroundColor: '#4D96FF', // blue
          color: '#FFFFFF',
        };
      case 'pending':
        return {
          backgroundColor: '#FFB84D', // orange
          color: '#000000',
        };
      case 'done':
        return {
          backgroundColor: '#22C55E', // green
          color: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#9CA3AF', // gray
          color: '#FFFFFF',
        };
    }
  };

  // const renderItem = ({ item }) => (
  //   <>
  //     <TouchableOpacity
  //       style={styles.ticketCard}
  //       onPress={() =>
  //         navigation.navigate('ViewTickets', { ticketId: item.ticket_id })
  //       }
  //     >
  //       <View style={styles.ticketHeader}>
  //         <View style={styles.avatar}>
  //           <Text style={styles.avatarText}>
  //             {item.customer_name?.charAt(0).toUpperCase()}
  //           </Text>
  //         </View>
  //         <View style={styles.headerInfo}>
  //           <Text style={styles.ticketTitle}>{item.customer_name}</Text>
  //           <Text style={styles.ticketDate}>
  //             {item.category_name} {item.created_at?.split('T')[0]}
  //           </Text>
  //           <Text style={styles.ticketDates}>{item.address}</Text>
  //         </View>
  //         <View style={[styles.statusChip, getStatusStyle(item.status_name)]}>
  //           <Text style={styles.statusText}>{item.status_name}</Text>
  //         </View>
  //       </View>

  //       <View style={styles.divider} />

  //       <View style={styles.buttonRow}>
  //         {item.status_id === 1 && (
  //           <TouchableOpacity
  //             style={styles.Assign}
  //             onPress={() => handleAssignToMe(item)}
  //           >
  //             <Text style={styles.buttonText}>Assign to Me</Text>
  //           </TouchableOpacity>
  //         )}
  //         {item.status_id === 2 && (
  //           <View style={styles.buttonRow}>
  //             <TouchableOpacity
  //               style={styles.actionButton}
  //               onPress={() => {
  //                 setSelectedTicket(item);
  //                 setModalVisible(true);
  //               }}
  //             >
  //               <Text style={styles.buttonText}>Arrival Date</Text>
  //             </TouchableOpacity>

  //             {item.employee_arrival_date && (
  //               <TouchableOpacity
  //                 style={styles.actionButton}
  //                 onPress={() => handleStartWork(item)}
  //               >
  //                 <Text style={styles.buttonText}>Start</Text>
  //               </TouchableOpacity>
  //             )}
  //           </View>
  //         )}
  //         {item.status_id === 3 && (
  //           <View style={styles.buttonRow}>
  //             <TouchableOpacity
  //               style={styles.actionButton}
  //               onPress={() => {
  //                 setSelectedTicket(item);
  //                 setServiceVisible(true);
  //               }}
  //             >
  //               <Text style={styles.buttonText}>Service Update</Text>
  //             </TouchableOpacity>

  //             <TouchableOpacity
  //               style={styles.actionButton}
  //               onPress={() => {
  //                 setSelectedTicket(item);
  //                 setEditVisible(true);
  //               }}
  //             >
  //               <Text style={styles.buttonText}>Edit</Text>
  //             </TouchableOpacity>
  //           </View>
  //         )}
  //       </View>
  //     </TouchableOpacity>
  //   </>
  // );

  const renderItem = ({ item }) => {
    const hasButtons =
      item.status_id === 1 || item.status_id === 2 || item.status_id === 3;

    return (
      <>
        <TouchableOpacity
          style={styles.ticketCard}
          onPress={() =>
            navigation.navigate('ViewTickets', { ticketId: item.ticket_id })
          }
        >
          <View style={styles.ticketHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.customer_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.ticketTitle}>{item.customer_name}</Text>
              <Text style={styles.ticketDate}>
                {item.category_name} {item.created_at?.split('T')[0]}
              </Text>
              <Text style={styles.ticketDates}>{item.address}</Text>
            </View>
            {(() => {
              const chipStyle = getStatusChipStyle(item.status_name);
              return (
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: chipStyle.backgroundColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: chipStyle.color }]}>
                    {item.status_name}
                  </Text>
                </View>
              );
            })()}
          </View>

          {hasButtons && <View style={styles.divider} />}

          <View style={styles.buttonRow}>
            {item.status_id === 1 && (
              <View style={{ alignItems: 'flex-end', width: '100%' }}>
                <TouchableOpacity
                  style={styles.Assign}
                  onPress={() => handleAssignToMe(item)}
                >
                  <Text style={styles.buttonText}>Assign to Me</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status_id === 2 &&
              (item.employee_arrival_date ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.arrivalButton}
                    onPress={() => {
                      setSelectedTicket(item);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Arrival Date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartWork(item)}
                  >
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <View style={{ alignItems: 'flex-end', width: '100%' }}>
                    <TouchableOpacity
                      style={styles.arrivalDateAlone}
                      onPress={() => {
                        setSelectedTicket(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.buttonText}>Arrival Date</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

            {/* {item.status_id === 2 &&
              (item.employee_arrival_date ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedTicket(item);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Arrival Date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStartWork(item)}
                  >
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <View style={{ alignItems: 'flex-end', width: '100%' }}>
                    <TouchableOpacity
                      style={styles.arrivalDateAlone}
                      onPress={() => {
                        setSelectedTicket(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.buttonText}>Arrival Date</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))} */}

            {item.status_id === 3 && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.serviceButton}
                  onPress={() => {
                    setSelectedTicket(item);
                    setServiceVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Service Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setSelectedTicket(item);
                    setEditVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#f9f9f9" />
        </TouchableOpacity>
        <Text style={styles.ticketNumber}>Dashboard</Text>
      </View>

      <View style={{ marginTop: 56 }}>
        <Text style={styles.filterLabel}> Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={value => setStatusFilter(value)}
            style={styles.picker}
            dropdownIconColor="#3EB489"
          >
            <Picker.Item label="All" value={null} />
            {ticketStatuses.map(status => (
              <Picker.Item
                key={status.status_id}
                label={status.status_name}
                value={status.status_id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.container}>
        <FlatList
          data={tickets}
          keyExtractor={item => item.ticket_id.toString()}
          renderItem={renderItem}
        />

        <View style={styles.container}>
          <FlatList
            data={tickets}
            keyExtractor={item => item.ticket_id.toString()}
            renderItem={renderItem}
          />

          <Modal visible={editVisible} transparent animationType="slide">
            <View style={styles.modalWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Update Status</Text>

                <Picker
                  selectedValue={editStatus}
                  onValueChange={val => setEditStatus(val)}
                  style={styles.input}
                >
                  <Picker.Item label="Select Status" value="" />
                  <Picker.Item label="Done" value="Done" />
                  <Picker.Item label="On Hold" value="On Hold" />
                  <Picker.Item label="Pending" value="Pending" />
                </Picker>

                {(editStatus === 'On Hold' || editStatus === 'Pending') && (
                  <TextInput
                    placeholder="Reason"
                    value={editReason}
                    onChangeText={setEditReason}
                    style={styles.input}
                  />
                )}

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleEditUpdate}
                  >
                    <Text style={styles.modalButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setEditVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Arrival Date</Text>

                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    placeholder="Select Date"
                    editable={false}
                    value={arrivalDate.toDateString()}
                    style={styles.input}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <TextInput
                    placeholder="Select Time"
                    editable={false}
                    value={arrivalTime.toTimeString().split(' ')[0]}
                    style={styles.input}
                  />
                </TouchableOpacity>

                <TextInput
                  placeholder="Reason for Delay"
                  value={reasonForDelay}
                  onChangeText={setReasonForDelay}
                  style={styles.input}
                />

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleSaveArrival}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={serviceVisible} transparent animationType="slide">
            <View style={styles.modalWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Update Service</Text>

                <Picker
                  selectedValue={serviceReason}
                  onValueChange={itemValue => setServiceReason(itemValue)}
                  style={styles.input}
                >
                  {serviceReasons.map((reason, idx) => (
                    <Picker.Item key={idx} label={reason} value={reason} />
                  ))}
                </Picker>

                {serviceReason === 'Other' && (
                  <TextInput
                    placeholder="Custom Reason"
                    value={customServiceReason}
                    onChangeText={setCustomServiceReason}
                    style={styles.input}
                  />
                )}

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleServiceUpdate}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setServiceVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {showDatePicker && (
            <DateTimePicker
              value={arrivalDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setArrivalDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={arrivalTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setArrivalTime(selectedTime);
              }}
            />
          )}
        </View>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <FontAwesome name="home" size={30} color="#3EB489" />
          <Text style={styles.navText}>home</Text>
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
  // ticketCard: {
  //   backgroundColor: '#fff',
  //   marginHorizontal: 10,
  //   marginVertical: 12,
  //   padding: 10,
  //   elevation: 10,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.35,
  //   shadowRadius: 6,
  //   borderWidth: 1.2,
  //   borderColor: '#bbb',
  // },
  ticketCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 12,
    padding: 10,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },

  divider: {
    backgroundColor: '#bbb',
    marginTop: 10,
    height: 1.5,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 30,
    height: 30,
    backgroundColor: '#3EB489',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
    marginTop: 8,
  },
  ticketDate: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ticketDates: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,

    fontWeight: 'bold',
  },

  priorityText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eee',
    borderRadius: 8,
    color: '#222',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#888',
  },
  buttonFilled: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#3EB489',

    borderRadius: 8,
    marginTop: 8,
  },

  Assign: {
    backgroundColor: '#3EB489',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    // marginRight: 10,
    marginLeft: 'auto',
  },

  arrivalDateAlone: {
    backgroundColor: '#3EB489',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    // marginRight: 10,
    marginLeft: 'auto',
    alignItems: 'center',
  },

  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  ticketNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#fff',
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
  modalButton: {
    flex: 1,
    backgroundColor: '#3EB489',
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: '#bbb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 30,
    marginHorizontal: 50,
  },

  pickerWrapper: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    overflow: 'hidden',
  },

  picker: {
    height: 48,
    width: '100%',
    color: 'black',
    paddingHorizontal: 20,
  },

  buttonRows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    gap: 10,
  },

  serviceButton: {
    flex: 1,
    backgroundColor: '#3EB489',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#B43E5A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },

  buttonTexts: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#3EB489',
    paddingVertical: 10,
    marginHorizontal: 5,

    borderRadius: 8,
    alignItems: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 12,
  },

  arrivalButton: {
    flex: 1,
    backgroundColor: '#3Eb489',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },

  startButton: {
    flex: 1,
    backgroundColor: '#B43E5A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Dashboard;
