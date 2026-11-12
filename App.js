import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import FavoriteScreen from './screens/FavoriteScreen';

const MyTabs = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#05A081' },
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#05A081',
        }}
      >
        <MyTabs.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home Screen',
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" color={color} size={size} />,
          }}
        />
        <MyTabs.Screen
          name="Favorites"
          component={FavoriteScreen}
          options={{
            title: 'Favorite Screen',
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="heart" color={color} size={size} solid />,
          }}
        />
      </MyTabs.Navigator>
    </NavigationContainer>
  );
}