import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Authentication/Login';
import Dashboard from './Tickets/Dashboard';
import EventsCalendar from './Calendar/Calendar';
import ViewTickets from './Tickets/ViewTicket';
import EditTicket from './Tickets/EditTicket';
import EventsOverview from './Events/Events';
import ProfileScreen from './Profile/Profile';
import OTPScreen from './Authentication/Otp';
import ForgotPassword from './Authentication/ForgotPassword';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="EventsOverview" component={EventsOverview} />
        <Stack.Screen name="EventsCalendar" component={EventsCalendar} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="EditTicket" component={EditTicket} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ViewTickets" component={ViewTickets} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
