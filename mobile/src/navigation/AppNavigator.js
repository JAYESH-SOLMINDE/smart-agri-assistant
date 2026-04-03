// AppNavigator.js — Controls which screen shows when
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DiseaseScreen from '../screens/DiseaseScreen';
import IrrigationScreen from '../screens/IrrigationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Screens shown when NOT logged in
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

// Screens shown AFTER login (bottom tab bar)
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#2D6A4F',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0', height: 60 },
                tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
                headerStyle: { backgroundColor: '#2D6A4F' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }}
            />
            <Tab.Screen
                name="Disease"
                component={DiseaseScreen}
                options={{ title: 'Disease', tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} /> }}
            />
            <Tab.Screen
                name="Irrigation"
                component={IrrigationScreen}
                options={{ title: 'Irrigation', tabBarIcon: ({ color }) => <TabIcon icon="💧" color={color} /> }}
            />
        </Tab.Navigator>
    );
}

// Simple emoji tab icon
const TabIcon = ({ icon }) => (
    <Text style={{ fontSize: 20 }}>{icon}</Text>
);
import { Text } from 'react-native';

// Root navigator — decides Auth or Main
export default function AppNavigator() {
    const { isLoggedIn } = useSelector((s) => s.auth);
    return (
        <NavigationContainer>
            {isLoggedIn ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}