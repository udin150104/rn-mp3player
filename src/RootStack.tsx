import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import HomeScreen from './screens/HomeScreen';
import MusicScreen from './screens/MusicScreen';
import TabComponents from './components/TabComponents';

const Tab = createBottomTabNavigator();

const RootStack = () => (
  <MusicPlayerProvider>
    <NavigationContainer>
      <Tab.Navigator tabBar={(props) => <TabComponents {...props} />}>
        <Tab.Screen name="Home" component={HomeScreen} options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} size={30} color={focused ? '#1a1a1aff' : '#bdbdbdff'} />
          ),
        }} />
        <Tab.Screen name="Music" component={MusicScreen} options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'headset' : 'headset-outline'} size={30} color={focused ? '#1a1a1aff' : '#bdbdbdff'} />
          ),
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  </MusicPlayerProvider>
);

export default RootStack;
